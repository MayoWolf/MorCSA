import { useEffect, useMemo, useState, type ReactNode } from 'react';
import PixelSprite from './components/PixelSprite';
import {
  examBlueprint,
  type FillBlank,
  frqBlueprint,
  mentorRoster,
  missions,
  type FillChallenge,
  type Mission,
  type QuizChallenge,
} from './data/course';
import {
  sectionPracticeDecks,
  type PracticeChallenge,
} from './data/practiceDecks';
import { lessonGuides } from './data/lessonGuides';
import {
  courseLevels,
  journeyUnits,
  totalJourneyMinutes,
  type CourseLevel,
  type JourneyLesson,
  type JourneyUnit,
} from './data/journey';

type QuizSelections = Record<string, string>;
type QuizSubmissions = Record<string, boolean>;
type FillInputs = Record<string, Record<string, string>>;
type FillSubmissions = Record<string, boolean>;
type MissionSubstepKind = 'brief' | 'concept' | 'boss' | 'quiz' | 'fill';
type AppPage = 'home' | 'pathway' | 'lesson';

const storageKey = 'morcsa-progress-v1';

type StoredProgress = {
  quizSelections: QuizSelections;
  quizSubmissions: QuizSubmissions;
  fillInputs: FillInputs;
  fillSubmissions: FillSubmissions;
};

type MissionSubstep = {
  id: string;
  kind: MissionSubstepKind;
  bubbleLabel: string;
  title: string;
  summary: string;
  done: boolean;
  challenge?: Mission['challenges'][number];
};

type MentorProfile = (typeof mentorRoster)[keyof typeof mentorRoster];

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeCompact(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

function readStoredProgress(): StoredProgress {
  if (typeof window === 'undefined') {
    return {
      quizSelections: {},
      quizSubmissions: {},
      fillInputs: {},
      fillSubmissions: {},
    };
  }

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      return {
        quizSelections: {},
        quizSubmissions: {},
        fillInputs: {},
        fillSubmissions: {},
      };
    }

    const parsed = JSON.parse(saved);
    return {
      quizSelections: parsed.quizSelections ?? {},
      quizSubmissions: parsed.quizSubmissions ?? {},
      fillInputs: parsed.fillInputs ?? {},
      fillSubmissions: parsed.fillSubmissions ?? {},
    };
  } catch {
    return {
      quizSelections: {},
      quizSubmissions: {},
      fillInputs: {},
      fillSubmissions: {},
    };
  }
}

function isFillBlankCorrect(
  challenge: FillChallenge,
  values: Record<string, string> | undefined,
) {
  return challenge.blanks.every((blank) => {
    const value = values?.[blank.id] ?? '';
    const accepted = [blank.answer, ...(blank.alternates ?? [])];

    return accepted.some(
      (candidate) =>
        normalizeCompact(candidate) === normalizeCompact(value) ||
        normalize(candidate) === normalize(value),
    );
  });
}

function isChallengeCorrect(
  challenge: PracticeChallenge,
  quizSelections: QuizSelections,
  fillInputs: FillInputs,
) {
  if (challenge.type === 'quiz') {
    return quizSelections[challenge.id] === challenge.answer;
  }

  return isFillBlankCorrect(challenge, fillInputs[challenge.id]);
}

function isMissionComplete(
  mission: Mission,
  quizSelections: QuizSelections,
  fillInputs: FillInputs,
) {
  return mission.challenges.every((challenge) =>
    isChallengeCorrect(challenge, quizSelections, fillInputs),
  );
}

function buildMissionSubsteps(
  mission: Mission,
  quizSelections: QuizSelections,
  fillInputs: FillInputs,
): MissionSubstep[] {
  const challengeSteps = mission.challenges.map((challenge, index) => ({
    id: challenge.id,
    kind: challenge.type,
    bubbleLabel: challenge.type === 'quiz' ? `Q${index + 1}` : 'Code',
    title: challenge.prompt,
    summary: challenge.explanation,
    done: isChallengeCorrect(challenge, quizSelections, fillInputs),
    challenge,
  })) satisfies MissionSubstep[];

  return [
    {
      id: `${mission.id}-brief`,
      kind: 'brief',
      bubbleLabel: 'Start',
      title: 'Mission Brief',
      summary: mission.story,
      done: false,
    },
    {
      id: `${mission.id}-concept`,
      kind: 'concept',
      bubbleLabel: 'Learn',
      title: 'Core Idea',
      summary: mission.lesson,
      done: false,
    },
    ...challengeSteps,
    {
      id: `${mission.id}-boss`,
      kind: 'boss',
      bubbleLabel: 'Boss',
      title: 'Boss Move',
      summary: mission.bossMove,
      done: isMissionComplete(mission, quizSelections, fillInputs),
    },
  ];
}

function getDefaultMissionSubstepId(
  mission: Mission,
  quizSelections: QuizSelections,
  fillInputs: FillInputs,
) {
  const firstIncompleteChallenge = mission.challenges.find(
    (challenge) => !isChallengeCorrect(challenge, quizSelections, fillInputs),
  );

  if (firstIncompleteChallenge) {
    return firstIncompleteChallenge.id;
  }

  return `${mission.id}-boss`;
}

function buildCodePreview(
  challenge: FillChallenge,
  values: Record<string, string>,
) {
  return challenge.snippet
    .map((line) =>
      challenge.blanks.reduce((current, blank) => {
        const filled = values[blank.id]?.trim();
        return current.replace(`__${blank.id}__`, filled && filled.length > 0 ? filled : '____');
      }, line),
    )
    .join('\n');
}

function getEditorFileName(challengeId: string) {
  const missionNumber = challengeId.match(/^m(\d+)/)?.[1] ?? 'Practice';
  return `Mission${missionNumber}.java`;
}

function getMissionById(missionId: string) {
  return missions.find((mission) => mission.id === missionId) ?? missions[0];
}

function getPracticeSectionById(sectionId: string) {
  return (
    sectionPracticeDecks.find((section) => section.id === sectionId) ??
    sectionPracticeDecks[0]
  );
}

function getLessonPracticeChallenges(lesson: JourneyLesson) {
  const section = getPracticeSectionById(lesson.practiceSectionId);
  return section.challenges.slice(
    lesson.practiceStart,
    lesson.practiceStart + lesson.practiceCount,
  );
}

function renderSyntaxSegment(segment: string, keyBase: string): ReactNode[] {
  const tokenPattern =
    /("(?:[^"\\]|\\.)*"|\/\/.*|\b(?:public|private|protected|class|static|void|int|double|boolean|String|if|else|for|while|return|new|true|false)\b|\b\d+(?:\.\d+)?\b)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;

  for (const match of segment.matchAll(tokenPattern)) {
    const token = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      nodes.push(
        <span key={`${keyBase}-plain-${matchIndex}`}>
          {segment.slice(lastIndex, start)}
        </span>,
      );
    }

    let tokenClass = 'token-keyword';
    if (token.startsWith('"')) {
      tokenClass = 'token-string';
    } else if (token.startsWith('//')) {
      tokenClass = 'token-comment';
    } else if (/^\d/.test(token)) {
      tokenClass = 'token-number';
    } else if (/^(int|double|boolean|String|void)$/.test(token)) {
      tokenClass = 'token-type';
    }

    nodes.push(
      <span className={tokenClass} key={`${keyBase}-token-${matchIndex}`}>
        {token}
      </span>,
    );
    lastIndex = start + token.length;
    matchIndex += 1;
  }

  if (lastIndex < segment.length) {
    nodes.push(
      <span key={`${keyBase}-tail`}>{segment.slice(lastIndex)}</span>,
    );
  }

  return nodes;
}

function getBlankMentorHint(blank: FillBlank, lineNumber: number, value: string) {
  const label = blank.label.toLowerCase();

  if (value.trim().length === 0) {
    return `Line ${lineNumber} still has an empty ${blank.label}. Fill that slot before you run the program again.`;
  }

  if (label.includes('method')) {
    return `Line ${lineNumber} needs the right Java method name there. Re-check which object or class should be doing the work.`;
  }

  if (label.includes('comparison operator')) {
    return `Line ${lineNumber} has the wrong comparison boundary. Decide whether the condition should include equality or not.`;
  }

  if (label.includes('operator')) {
    return `Line ${lineNumber} uses the wrong operator. Match the operator to the logic the line is trying to express.`;
  }

  if (label.includes('keyword')) {
    return `Line ${lineNumber} needs a Java keyword, not a variable name or method call.`;
  }

  if (label.includes('update')) {
    return `Line ${lineNumber} is not updating the control variable the way this loop needs.`;
  }

  if (label.includes('type') || label.includes('cast')) {
    return `Line ${lineNumber} is a type-syntax spot. Match the Java type to the kind of value being stored or returned.`;
  }

  if (label.includes('arraylist')) {
    return `Line ${lineNumber} should use an ArrayList method, not array-style syntax.`;
  }

  if (label.includes('boolean')) {
    return `Line ${lineNumber} should evaluate to a true/false idea. Re-check the boolean logic in that slot.`;
  }

  return `Line ${lineNumber} is close, but that ${blank.label} does not match the Java idea this challenge is testing.`;
}

function App() {
  const storedProgress = readStoredProgress();
  const [page, setPage] = useState<AppPage>('home');
  const [selectedLevelId, setSelectedLevelId] = useState(
    courseLevels.find((level) => level.recommended)?.id ?? courseLevels[0].id,
  );
  const allJourneyLessons = useMemo(
    () => journeyUnits.flatMap((unit) => unit.lessons),
    [],
  );
  const [selectedLessonId, setSelectedLessonId] = useState(allJourneyLessons[0].id);
  const [selectedSubstepId, setSelectedSubstepId] = useState(() =>
    getDefaultMissionSubstepId(
      getMissionById(allJourneyLessons[0].missionId),
      storedProgress.quizSelections,
      storedProgress.fillInputs,
    ),
  );
  const [quizSelections, setQuizSelections] = useState<QuizSelections>(
    storedProgress.quizSelections,
  );
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmissions>(
    storedProgress.quizSubmissions,
  );
  const [fillInputs, setFillInputs] = useState<FillInputs>(
    storedProgress.fillInputs,
  );
  const [fillSubmissions, setFillSubmissions] = useState<FillSubmissions>(
    storedProgress.fillSubmissions,
  );

  const selectedLevel =
    courseLevels.find((level) => level.id === selectedLevelId) ?? courseLevels[0];
  const selectedLesson =
    allJourneyLessons.find((lesson) => lesson.id === selectedLessonId) ??
    allJourneyLessons[0];
  const selectedUnit =
    journeyUnits.find((unit) => unit.id === selectedLesson.unitId) ?? journeyUnits[0];
  const selectedMission = getMissionById(selectedLesson.missionId);
  const selectedMentor = mentorRoster[selectedUnit.mentorKey];
  const selectedLessonGuide = lessonGuides[selectedMission.id];
  const selectedMissionSubsteps = useMemo(
    () => buildMissionSubsteps(selectedMission, quizSelections, fillInputs),
    [fillInputs, quizSelections, selectedMission],
  );
  const selectedSubstep =
    selectedMissionSubsteps.find((step) => step.id === selectedSubstepId) ??
    selectedMissionSubsteps[0];
  const activeQuizChallenge =
    selectedSubstep.kind === 'quiz' && selectedSubstep.challenge?.type === 'quiz'
      ? selectedSubstep.challenge
      : undefined;
  const activeFillChallenge =
    selectedSubstep.kind === 'fill' && selectedSubstep.challenge?.type === 'fill'
      ? selectedSubstep.challenge
      : undefined;
  const lessonPracticeChallenges = useMemo(
    () => getLessonPracticeChallenges(selectedLesson),
    [selectedLesson],
  );
  const selectedPracticeSection = getPracticeSectionById(selectedLesson.practiceSectionId);
  const selectedPracticeCorrect = lessonPracticeChallenges.filter((challenge) =>
    isChallengeCorrect(challenge, quizSelections, fillInputs),
  ).length;

  const uniqueTrackedChallenges = useMemo(() => {
    const seen = new Set<string>();
    return [
      ...missions.flatMap((mission) => mission.challenges),
      ...allJourneyLessons.flatMap((lesson) => getLessonPracticeChallenges(lesson)),
    ].filter((challenge) => {
      if (seen.has(challenge.id)) {
        return false;
      }
      seen.add(challenge.id);
      return true;
    });
  }, [allJourneyLessons]);

  const answeredCount = uniqueTrackedChallenges.filter((challenge) => {
    if (challenge.type === 'quiz') {
      return Boolean(quizSelections[challenge.id]);
    }

    return Boolean(fillSubmissions[challenge.id]);
  }).length;

  const correctCount = uniqueTrackedChallenges.filter((challenge) =>
    isChallengeCorrect(challenge, quizSelections, fillInputs),
  ).length;
  const readiness = Math.round((correctCount / uniqueTrackedChallenges.length) * 100);

  const lessonCompletion = useMemo(
    () =>
      allJourneyLessons.map((lesson) => {
        const mission = getMissionById(lesson.missionId);
        const practice = getLessonPracticeChallenges(lesson);
        const complete =
          mission.challenges.every((challenge) =>
            isChallengeCorrect(challenge, quizSelections, fillInputs),
          ) &&
          practice.every((challenge) =>
            isChallengeCorrect(challenge, quizSelections, fillInputs),
          );

        return { lesson, complete };
      }),
    [allJourneyLessons, fillInputs, quizSelections],
  );

  const completedLessons = lessonCompletion.filter((item) => item.complete).length;
  const firstIncompleteLesson = lessonCompletion.find((item) => !item.complete);
  const nextLesson = firstIncompleteLesson?.lesson ?? allJourneyLessons[allJourneyLessons.length - 1];
  const lessonIndex = allJourneyLessons.findIndex(
    (lesson) => lesson.id === selectedLesson.id,
  );
  const streak = lessonCompletion.reduce((count, item, index) => {
    if (count !== index) {
      return count;
    }
    return item.complete ? count + 1 : count;
  }, 0);
  const earnedXp = completedLessons * 120;
  const hearts = Math.max(
    1,
    5 -
      selectedMission.challenges.reduce((sum, challenge) => {
        if (challenge.type === 'quiz') {
          if (!quizSubmissions[challenge.id]) {
            return sum;
          }
          return quizSelections[challenge.id] === challenge.answer ? sum : sum + 1;
        }
        if (!fillSubmissions[challenge.id]) {
          return sum;
        }
        return isFillBlankCorrect(challenge, fillInputs[challenge.id]) ? sum : sum + 1;
      }, 0),
  );
  const gems = completedLessons * 20 + Math.round(readiness / 4);
  const currentMissionProgress = `${
    selectedMission.challenges.filter((challenge) =>
      isChallengeCorrect(challenge, quizSelections, fillInputs),
    ).length
  }/${selectedMission.challenges.length}`;

  useEffect(() => {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          quizSelections,
          quizSubmissions,
          fillInputs,
          fillSubmissions,
        }),
      );
    } catch {
      // Ignore storage failures so the UI still renders in restricted contexts.
    }
  }, [fillInputs, fillSubmissions, quizSelections, quizSubmissions]);

  useEffect(() => {
    if (!selectedMissionSubsteps.some((step) => step.id === selectedSubstepId)) {
      setSelectedSubstepId(
        getDefaultMissionSubstepId(selectedMission, quizSelections, fillInputs),
      );
    }
  }, [
    fillInputs,
    quizSelections,
    selectedMission,
    selectedMissionSubsteps,
    selectedSubstepId,
  ]);

  function openLesson(lesson: JourneyLesson) {
    setSelectedLessonId(lesson.id);
    setSelectedSubstepId(
      getDefaultMissionSubstepId(
        getMissionById(lesson.missionId),
        quizSelections,
        fillInputs,
      ),
    );
    setPage('lesson');
  }

  return (
    <div className="app-shell">
      <div className="background-sky" />
      <div className="background-hills" />
      <main className="app">
        <header className="hud-bar card">
          <div className="hud-brand">
            <div className="brand-sprite">
              <PixelSprite
                label={selectedMentor.name}
                palette={selectedMentor.palette}
                pixels={selectedMentor.pixels}
                pixelSize={7}
              />
            </div>
            <div>
              <p className="eyebrow">MorCSA</p>
              <strong>CSA Quest Path</strong>
            </div>
          </div>

          <div className="hud-stats">
            <button
              className={`hud-nav ${page === 'home' ? 'active' : ''}`}
              onClick={() => setPage('home')}
              type="button"
            >
              Home
            </button>
            <button
              className={`hud-nav ${page === 'pathway' ? 'active' : ''}`}
              onClick={() => setPage('pathway')}
              type="button"
            >
              Pathway
            </button>
            <button
              className={`hud-nav ${page === 'lesson' ? 'active' : ''}`}
              onClick={() => setPage('lesson')}
              type="button"
            >
              Lesson
            </button>
            <div className="hud-pill hearts">Hearts {hearts}/5</div>
            <div className="hud-pill streak">Streak {streak}</div>
            <div className="hud-pill xp">{earnedXp} XP</div>
            <div className="hud-pill gems">{gems} Gems</div>
          </div>
        </header>

        {page === 'home' ? (
          <>
            <section className="hero-banner card">
              <div className="hero-copy">
                <p className="eyebrow">Real course flow, not a one-page mockup</p>
                <h1>Pick a level, enter the pathway, then study each lesson on its own screen.</h1>
                <p className="hero-text">
                  MorCSA now follows a real structure: choose your route, browse the
                  four APCSA worlds, then open a dedicated lesson page with teaching,
                  IDE practice, and a targeted drill pack sized for actual study time.
                </p>

                <div className="hero-actions">
                  <button
                    className="primary-button hero-button"
                    onClick={() => setPage('pathway')}
                    type="button"
                  >
                    Enter the pathway
                  </button>
                  <div className="hero-badges">
                    <span className="pill">10-hour route</span>
                    <span className="pill">4 unit worlds</span>
                    <span className="pill">Separate lesson screens</span>
                  </div>
                </div>
              </div>

              <div className="hero-stage">
                <div className="speech-bubble">
                  <strong>{selectedMentor.name}</strong>
                  <p>
                    You should feel a difference now: home is for choosing a route,
                    pathway is for planning, and lesson is for doing the actual work.
                  </p>
                </div>

                <div className="stage-party">
                  {Object.values(mentorRoster).map((mentor) => (
                    <div className="stage-mentor" key={mentor.name}>
                      <PixelSprite
                        label={mentor.name}
                        palette={mentor.palette}
                        pixels={mentor.pixels}
                        pixelSize={10}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="summary-strip">
              <article className="card summary-card">
                <span className="summary-label">Journey progress</span>
                <strong>{completedLessons}/{allJourneyLessons.length} lessons cleared</strong>
                <div className="meter">
                  <span
                    style={{
                      width: `${Math.max(
                        Math.round((completedLessons / allJourneyLessons.length) * 100),
                        8,
                      )}%`,
                    }}
                  />
                </div>
                <p>{Math.round(totalJourneyMinutes / 60)} total hours of guided study</p>
              </article>

              <article className="card summary-card">
                <span className="summary-label">Selected route</span>
                <strong>{selectedLevel.title}</strong>
                <p>{selectedLevel.pacing}</p>
              </article>

              <article className="card summary-card">
                <span className="summary-label">Next lesson</span>
                <strong>{nextLesson.title}</strong>
                <p>{nextLesson.duration} · {nextLesson.objective}</p>
              </article>
            </section>

            <section className="level-grid">
              {courseLevels.map((level) => (
                <button
                  className={`card level-card ${
                    selectedLevel.id === level.id ? 'active' : ''
                  }`}
                  key={level.id}
                  onClick={() => setSelectedLevelId(level.id)}
                  type="button"
                >
                  <p className="eyebrow">{level.recommended ? 'Recommended' : 'Route'}</p>
                  <h2>{level.title}</h2>
                  <strong>{level.subtitle}</strong>
                  <p>{level.pacing}</p>
                  <p>{level.target}</p>
                </button>
              ))}
            </section>

            <section className="home-world-grid">
              {journeyUnits.map((unit) => {
                const mentor = mentorRoster[unit.mentorKey];
                const unitComplete = lessonCompletion.filter(
                  (item) => item.lesson.unitId === unit.id && item.complete,
                ).length;

                return (
                  <article className="card home-world-card" key={unit.id}>
                    <div className="unit-mentor">
                      <div className="unit-mentor-sprite">
                        <PixelSprite
                          label={mentor.name}
                          palette={mentor.palette}
                          pixels={mentor.pixels}
                          pixelSize={6}
                        />
                      </div>
                      <div>
                        <strong>{unit.title}</strong>
                        <p>{mentor.name}</p>
                      </div>
                    </div>
                    <p>{unit.description}</p>
                    <div className="pill-cloud">
                      <span className="pill">{unit.duration}</span>
                      <span className="pill accent">{unit.examWeight}</span>
                      <span className="pill">
                        {unitComplete}/{unit.lessons.length} lessons
                      </span>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        ) : null}

        {page === 'pathway' ? (
          <section className="pathway-page">
            <section className="pathway-header card">
              <div>
                <p className="eyebrow">Pathway</p>
                <h1>Choose a world, then open a lesson on its own screen.</h1>
                <p className="hero-text">
                  This route is built around {allJourneyLessons.length} guided lessons,
                  roughly {Math.round(totalJourneyMinutes / 60)} hours total, and deeper
                  drill sets attached to every lesson.
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() => openLesson(nextLesson)}
                type="button"
              >
                Continue {nextLesson.title}
              </button>
            </section>

            <section className="world-stack">
              {journeyUnits.map((unit, index) => {
                const mentor = mentorRoster[unit.mentorKey];
                return (
                  <article className="path-section card" key={unit.id}>
                    <div className="path-section-head">
                      <div>
                        <p className="eyebrow">World {index + 1}</p>
                        <h2>{unit.title}</h2>
                        <p className="world-description">{unit.description}</p>
                      </div>
                      <div className="unit-head-aside">
                        <div className="unit-mentor">
                          <div className="unit-mentor-sprite">
                            <PixelSprite
                              label={mentor.name}
                              palette={mentor.palette}
                              pixels={mentor.pixels}
                              pixelSize={6}
                            />
                          </div>
                          <div>
                            <strong>{mentor.name}</strong>
                            <p>{mentor.role}</p>
                          </div>
                        </div>
                        <span className="tiny-badge">{unit.duration}</span>
                      </div>
                    </div>

                    <div className="lesson-list">
                      {unit.lessons.map((lesson) => {
                        const lessonMission = getMissionById(lesson.missionId);
                        const complete =
                          lessonCompletion.find((item) => item.lesson.id === lesson.id)
                            ?.complete ?? false;

                        return (
                          <button
                            className={`lesson-list-card ${
                              selectedLesson.id === lesson.id ? 'active' : ''
                            } ${complete ? 'complete' : ''}`}
                            key={lesson.id}
                            onClick={() => openLesson(lesson)}
                            type="button"
                          >
                            <div className="lesson-list-card-top">
                              <span className="step-tag">
                                {complete ? 'Cleared' : lesson.duration}
                              </span>
                              <span className="tiny-badge">
                                {lesson.practiceCount} practice reps
                              </span>
                            </div>
                            <strong>{lesson.title}</strong>
                            <p>{lesson.objective}</p>
                            <div className="pill-cloud">
                              {lessonMission.officialTopics.map((topic) => (
                                <span className="topic-chip" key={`${lesson.id}-${topic}`}>
                                  Topic {topic}
                                </span>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </section>
          </section>
        ) : null}

        {page === 'lesson' ? (
          <section className="course-layout">
            <section className="path-panel">
              <section className="card lesson-route-card">
                <div className="lesson-route-head">
                  <button
                    className="secondary-button"
                    onClick={() => setPage('pathway')}
                    type="button"
                  >
                    Back to pathway
                  </button>
                  <span className="pill">
                    Lesson {lessonIndex + 1} / {allJourneyLessons.length}
                  </span>
                </div>
                <p className="eyebrow">{selectedUnit.title}</p>
                <h2>{selectedLesson.title}</h2>
                <p className="hero-text">{selectedLesson.objective}</p>
                <div className="pill-cloud">
                  <span className="pill">{selectedLesson.duration}</span>
                  <span className="pill accent">{selectedUnit.examWeight}</span>
                  <span className="pill">{selectedPracticeSection.title}</span>
                </div>
                <div className="focus-grid">
                  {selectedLesson.teachingMoments.map((moment) => (
                    <article className="focus-card" key={moment}>
                      <h4>What we teach here</h4>
                      <p>{moment}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="card lesson-card">
                <div className="lesson-header">
                  <div>
                    <p className="eyebrow">
                      {selectedMission.unit} // {selectedMission.arc}
                    </p>
                    <h2>{selectedMission.title}</h2>
                  </div>
                  <div className="lesson-mentor">
                    <PixelSprite
                      label={selectedMentor.name}
                      palette={selectedMentor.palette}
                      pixels={selectedMentor.pixels}
                      pixelSize={9}
                    />
                    <div>
                      <strong>{selectedMentor.name}</strong>
                      <p>{selectedMentor.role}</p>
                    </div>
                  </div>
                </div>

                <div className="lesson-meta">
                  <span className="pill">{selectedLesson.duration}</span>
                  <span className="pill accent">{selectedMission.examWeight}</span>
                  <span className="pill">Progress {currentMissionProgress}</span>
                  <span className="pill">{lessonPracticeChallenges.length} lesson reps</span>
                </div>

                <div className="substep-row">
                  {selectedMissionSubsteps.map((step) => (
                    <button
                      className={`substep-chip ${
                        selectedSubstep.id === step.id ? 'active' : ''
                      } ${step.done ? 'complete' : ''}`}
                      key={step.id}
                      onClick={() => setSelectedSubstepId(step.id)}
                      type="button"
                    >
                      <span>{step.bubbleLabel}</span>
                      {step.title}
                    </button>
                  ))}
                </div>

                <div className="lesson-focus">
                  <div className="lesson-focus-head">
                    <div>
                      <p className="eyebrow">Focused step</p>
                      <h3>{selectedSubstep.title}</h3>
                    </div>
                    <span className="tiny-badge">{selectedSubstep.bubbleLabel}</span>
                  </div>

                  {selectedSubstep.kind === 'brief' ? (
                    <div className="focus-grid">
                      <article className="focus-card">
                        <h4>Why this lesson exists</h4>
                        <p>{selectedMission.story}</p>
                      </article>
                      <article className="focus-card">
                        <h4>Lesson objective</h4>
                        <p>{selectedLesson.objective}</p>
                      </article>
                    </div>
                  ) : null}

                  {selectedSubstep.kind === 'concept' ? (
                    <div className="teaching-stack">
                      <article className="focus-card concept-card lesson-master-card">
                        <h4>Coach explanation</h4>
                        <p>{selectedLessonGuide.coachIntro}</p>
                        <p>{selectedMission.lesson}</p>
                      </article>

                      <div className="focus-grid">
                        <article className="focus-card">
                          <h4>Mental model</h4>
                          <p>{selectedLessonGuide.mentalModel}</p>
                        </article>
                        <article className="focus-card">
                          <h4>Common trap</h4>
                          <p>{selectedLessonGuide.commonMistake}</p>
                        </article>
                      </div>

                      <article className="focus-card example-card">
                        <h4>{selectedLessonGuide.workedExample.title}</h4>
                        <pre className="code-snippet">
                          <code>{selectedLessonGuide.workedExample.code.join('\n')}</code>
                        </pre>
                        <p>{selectedLessonGuide.workedExample.walkthrough}</p>
                      </article>

                      <div className="focus-grid">
                        <article className="focus-card">
                          <h4>Debug rule</h4>
                          <p>{selectedLessonGuide.debugRule}</p>
                        </article>
                        <article className="focus-card">
                          <h4>Before you move on</h4>
                          <ul className="teaching-list">
                            {selectedLessonGuide.checklist.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </article>
                      </div>
                    </div>
                  ) : null}

                  {selectedSubstep.kind === 'boss' ? (
                    <div className="focus-grid">
                      <article className="focus-card boss-card">
                        <h4>Boss move</h4>
                        <p>{selectedMission.bossMove}</p>
                      </article>
                      <article className="focus-card">
                        <h4>Lesson route outcome</h4>
                        <p>{selectedLesson.teachingMoments.join('. ')}.</p>
                      </article>
                    </div>
                  ) : null}

                  {activeQuizChallenge ? (
                    <QuizCard
                      challenge={activeQuizChallenge}
                      selected={quizSelections[activeQuizChallenge.id]}
                      submitted={Boolean(quizSubmissions[activeQuizChallenge.id])}
                      onSelect={(optionId) =>
                        setQuizSelections((current) => ({
                          ...current,
                          [activeQuizChallenge.id]: optionId,
                        }))
                      }
                      onSubmit={() =>
                        setQuizSubmissions((current) => ({
                          ...current,
                          [activeQuizChallenge.id]: true,
                        }))
                      }
                    />
                  ) : null}

                  {activeFillChallenge ? (
                    <FillCard
                      challenge={activeFillChallenge}
                      mentor={selectedMentor}
                      submitted={Boolean(fillSubmissions[activeFillChallenge.id])}
                      values={fillInputs[activeFillChallenge.id] ?? {}}
                      onChange={(blankId, value) =>
                        setFillInputs((current) => ({
                          ...current,
                          [activeFillChallenge.id]: {
                            ...(current[activeFillChallenge.id] ?? {}),
                            [blankId]: value,
                          },
                        }))
                      }
                      onSubmit={() =>
                        setFillSubmissions((current) => ({
                          ...current,
                          [activeFillChallenge.id]: true,
                        }))
                      }
                    />
                  ) : null}
                </div>

                <div className="topic-chip-row">
                  {selectedMission.officialTopics.map((topic) => (
                    <span className="topic-chip" key={topic}>
                      Topic {topic}
                    </span>
                  ))}
                </div>
              </section>
            </section>

            <aside className="lesson-panel">
              <section className="card practice-card">
                <div className="practice-card-head">
                  <div>
                    <p className="eyebrow">Lesson drill pack</p>
                    <h2>{selectedPracticeSection.title}</h2>
                  </div>
                  <div className="practice-stat-block">
                    <strong>
                      {selectedPracticeCorrect}/{lessonPracticeChallenges.length}
                    </strong>
                    <p>completed in this lesson pack</p>
                  </div>
                </div>

                <p className="practice-note">{selectedPracticeSection.sourceNote}</p>

                <div className="practice-controls">
                  <span className="pill">{selectedLesson.duration}</span>
                  <span className="pill">{lessonPracticeChallenges.length} guided reps</span>
                  <span className="pill">{selectedPracticeSection.unit}</span>
                </div>

                <div className="practice-stack">
                  {lessonPracticeChallenges.map((challenge) =>
                    challenge.type === 'quiz' ? (
                      <QuizCard
                        challenge={challenge}
                        key={challenge.id}
                        selected={quizSelections[challenge.id]}
                        submitted={Boolean(quizSubmissions[challenge.id])}
                        onSelect={(optionId) =>
                          setQuizSelections((current) => ({
                            ...current,
                            [challenge.id]: optionId,
                          }))
                        }
                        onSubmit={() =>
                          setQuizSubmissions((current) => ({
                            ...current,
                            [challenge.id]: true,
                          }))
                        }
                      />
                    ) : (
                      <FillCard
                        challenge={challenge}
                        key={challenge.id}
                        mentor={selectedMentor}
                        submitted={Boolean(fillSubmissions[challenge.id])}
                        values={fillInputs[challenge.id] ?? {}}
                        onChange={(blankId, value) =>
                          setFillInputs((current) => ({
                            ...current,
                            [challenge.id]: {
                              ...(current[challenge.id] ?? {}),
                              [blankId]: value,
                            },
                          }))
                        }
                        onSubmit={() =>
                          setFillSubmissions((current) => ({
                            ...current,
                            [challenge.id]: true,
                          }))
                        }
                      />
                    ),
                  )}
                </div>
              </section>

              <section className="card side-card">
                <p className="eyebrow">Official Exam Mode</p>
                <h2>Four boss types you need to beat</h2>
                <div className="frq-grid">
                  {frqBlueprint.map((item) => (
                    <div className="frq-item" key={item.title}>
                      <strong>{item.title}</strong>
                      <p>{item.cue}</p>
                    </div>
                  ))}
                </div>
                <div className="pill-cloud">
                  {examBlueprint.unitWeights.map((unit) => (
                    <span className="pill" key={unit}>
                      {unit}
                    </span>
                  ))}
                </div>
              </section>
            </aside>
          </section>
        ) : null}
      </main>
    </div>
  );
}

type QuizCardProps = {
  challenge: QuizChallenge;
  selected?: string;
  submitted: boolean;
  onSelect: (optionId: string) => void;
  onSubmit: () => void;
};

function QuizCard({
  challenge,
  selected,
  submitted,
  onSelect,
  onSubmit,
}: QuizCardProps) {
  const isCorrect = selected === challenge.answer;

  return (
    <article className="challenge-card">
      <div className="challenge-topline">
        <span className="tiny-badge">Quick practice</span>
      </div>
      <h3>{challenge.prompt}</h3>
      <div className="option-grid">
        {challenge.options.map((option) => {
          const stateClass = submitted
            ? option.id === challenge.answer
              ? 'correct'
              : option.id === selected
                ? 'incorrect'
                : ''
            : option.id === selected
              ? 'selected'
              : '';

          return (
            <button
              className={`option-card ${stateClass}`}
              key={option.id}
              onClick={() => onSelect(option.id)}
              type="button"
            >
              <span>{option.id.toUpperCase()}</span>
              <strong>{option.text}</strong>
            </button>
          );
        })}
      </div>
      <div className="challenge-actions">
        <button className="primary-button" onClick={onSubmit} type="button">
          Check answer
        </button>
        {submitted ? (
          <p className={`feedback ${isCorrect ? 'good' : 'needs-work'}`}>
            {isCorrect ? 'Correct.' : 'Not quite yet.'} {challenge.explanation}
          </p>
        ) : (
          <p className="feedback muted">
            Tap an option, check it, and keep the streak moving.
          </p>
        )}
      </div>
    </article>
  );
}

type FillCardProps = {
  challenge: FillChallenge;
  mentor: MentorProfile;
  submitted: boolean;
  values: Record<string, string>;
  onChange: (blankId: string, value: string) => void;
  onSubmit: () => void;
};

function FillCard({
  challenge,
  mentor,
  submitted,
  values,
  onChange,
  onSubmit,
}: FillCardProps) {
  const isCorrect = isFillBlankCorrect(challenge, values);
  const [testsRun, setTestsRun] = useState(false);
  const blankChecks = challenge.blanks.map((blank) => {
    const value = values[blank.id] ?? '';
    const accepted = [blank.answer, ...(blank.alternates ?? [])];
    const filled = value.trim().length > 0;
    const lineNumber =
      challenge.snippet.findIndex((line) => line.includes(`__${blank.id}__`)) + 1;
    const correct = accepted.some(
      (candidate) =>
        normalizeCompact(candidate) === normalizeCompact(value) ||
        normalize(candidate) === normalize(value),
    );

    return {
      blank,
      filled,
      correct,
      lineNumber,
      hint: getBlankMentorHint(blank, lineNumber, value),
    };
  });
  const editorPreview = buildCodePreview(challenge, values);
  const firstIssue =
    blankChecks.find((check) => !check.correct) ??
    blankChecks.find((check) => !check.filled);
  const editorTests = [
    {
      id: 'filled',
      label: 'All blanks filled',
      pass: blankChecks.every((check) => check.filled),
      detail: blankChecks.every((check) => check.filled)
        ? 'The file compiles far enough for every placeholder to be tested.'
        : 'At least one placeholder is still empty, so the file is incomplete.',
    },
    ...blankChecks.map((check) => ({
      id: check.blank.id,
      label: check.blank.label,
      pass: check.correct,
      detail: check.correct
        ? 'This line now matches the expected Java idea.'
        : 'This slot still does not match the required Java syntax or method choice.',
    })),
    {
      id: 'behavior',
      label: 'Expected behavior',
      pass: isCorrect,
      detail: isCorrect
        ? challenge.explanation
        : 'The program behavior still misses the target. Use the failed slot checks to narrow down the bug.',
    },
  ];
  const outputLines = testsRun
    ? [
        `> javac ${getEditorFileName(challenge.id)}`,
        blankChecks.every((check) => check.filled)
          ? 'Compilation check: placeholders resolved.'
          : 'Compilation check: unresolved placeholder or invalid token found.',
        `> java ${getEditorFileName(challenge.id).replace('.java', '')}`,
        isCorrect
          ? 'Program output: all expected checks passed.'
          : firstIssue
            ? `Runtime hint: line ${firstIssue.lineNumber} needs attention before the output matches.`
            : 'Runtime hint: re-check the program logic.',
      ]
    : [];
  const mentorMessage = !testsRun
    ? `I’m watching the code with you. Hit Run when you want me to inspect the file and point at the first bug.`
    : isCorrect
      ? `Nice. The code structure is clean and the output checks are green. Lock it in and keep moving.`
      : firstIssue
        ? firstIssue.hint
        : `The code is close, but one of the Java ideas is still off. Check the console and fix the first failing slot.`;

  useEffect(() => {
    setTestsRun(false);
  }, [challenge.id]);

  return (
    <article className="challenge-card code-card">
      <div className="challenge-topline">
        <span className="tiny-badge alt">IDE mission</span>
      </div>
      <h3>{challenge.prompt}</h3>
      <div className="ide-shell">
        <div className="ide-topbar">
          <div className="ide-dots">
            <span />
            <span />
            <span />
          </div>
          <strong>{getEditorFileName(challenge.id)}</strong>
          <span className="ide-status">{testsRun ? 'tests loaded' : 'ready to run'}</span>
        </div>

        <div className="ide-body">
          <div className="ide-editor">
            {challenge.snippet.map((line, index) => (
              <div className="editor-line" key={`${challenge.id}-${index}`}>
                <span className="editor-gutter">{index + 1}</span>
                <div className="editor-code">
                  {line.split(/(__[a-zA-Z0-9-]+__)/g).map((part, partIndex) => {
                    const match = part.match(/^__(.+)__$/);
                    if (!match) {
                      return (
                        <span key={`${challenge.id}-${index}-${partIndex}`}>
                          {renderSyntaxSegment(
                            part,
                            `${challenge.id}-${index}-${partIndex}`,
                          )}
                        </span>
                      );
                    }

                    const blank = challenge.blanks.find((item) => item.id === match[1]);
                    if (!blank) {
                      return null;
                    }

                    return (
                      <input
                        className={`editor-inline-input ${
                          submitted
                            ? blankChecks.find((check) => check.blank.id === blank.id)?.correct
                              ? 'correct'
                              : 'incorrect'
                            : ''
                        }`}
                        key={`${challenge.id}-${blank.id}`}
                        onChange={(event) => onChange(blank.id, event.target.value)}
                        placeholder={blank.label}
                        spellCheck={false}
                        type="text"
                        value={values[blank.id] ?? ''}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <aside className="ide-sidepanel">
            <strong>What this code is testing</strong>
            <ul className="teaching-list compact">
              {challenge.blanks.map((blank) => (
                <li key={blank.id}>{blank.label}</li>
              ))}
            </ul>
            <p>{challenge.explanation}</p>
          </aside>
        </div>

        <div className="ide-console">
          <div className="ide-console-head">
            <strong>Test console</strong>
            <span>{editorTests.filter((test) => test.pass).length}/{editorTests.length} checks green</span>
          </div>
          {testsRun ? (
            <>
              <pre className="console-code terminal-log">
                <code>{outputLines.join('\n')}</code>
              </pre>
              <div className="test-stack">
                {editorTests.map((test) => (
                  <div className={`test-row ${test.pass ? 'pass' : 'fail'}`} key={test.id}>
                    <strong>{test.pass ? 'PASS' : 'FAIL'}</strong>
                    <div>
                      <span>{test.label}</span>
                      <p>{test.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="console-preview">
              <pre className="console-code">
                <code>{editorPreview}</code>
              </pre>
              <p>Press Run to compile this practice file, inspect the output, and get mentor debugging feedback.</p>
            </div>
          )}
        </div>

        <div className="mentor-debug-panel">
          <div className="mentor-debug-avatar">
            <PixelSprite
              label={mentor.name}
              palette={mentor.palette}
              pixels={mentor.pixels}
              pixelSize={7}
            />
          </div>
          <div className="mentor-debug-copy">
            <strong>{mentor.name}</strong>
            <p>{mentorMessage}</p>
          </div>
        </div>
      </div>
      <div className="challenge-actions">
        <div className="challenge-button-row">
          <button
            className="secondary-button"
            onClick={() => setTestsRun(true)}
            type="button"
          >
            Run
          </button>
          <button className="primary-button" onClick={onSubmit} type="button">
            Check code
          </button>
        </div>
        {submitted ? (
          <p className={`feedback ${isCorrect ? 'good' : 'needs-work'}`}>
            {isCorrect ? 'Nice work.' : 'Close, but fix the syntax.'}{' '}
            {challenge.explanation}
          </p>
        ) : (
          <p className="feedback muted">
            Use the coach panel, run the tests, then lock the code in when the checks look good.
          </p>
        )}
      </div>
    </article>
  );
}

export default App;
