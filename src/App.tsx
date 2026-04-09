import { useEffect, useMemo, useState } from 'react';
import PixelSprite from './components/PixelSprite';
import {
  examBlueprint,
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

type QuizSelections = Record<string, string>;
type QuizSubmissions = Record<string, boolean>;
type FillInputs = Record<string, Record<string, string>>;
type FillSubmissions = Record<string, boolean>;
type MissionSubstepKind = 'brief' | 'concept' | 'boss' | 'quiz' | 'fill';

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

function App() {
  const practicePageSize = 5;
  const storedProgress = readStoredProgress();
  const [selectedMissionId, setSelectedMissionId] = useState(missions[0].id);
  const [selectedSubstepId, setSelectedSubstepId] = useState(() =>
    getDefaultMissionSubstepId(
      missions[0],
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
  const [practicePage, setPracticePage] = useState(0);

  const missionStates = useMemo(
    () =>
      missions.map((mission) => ({
        mission,
        complete: isMissionComplete(mission, quizSelections, fillInputs),
      })),
    [fillInputs, quizSelections],
  );

  const selectedMission =
    missionStates.find((state) => state.mission.id === selectedMissionId)
      ?.mission ?? missions[0];
  const selectedMissionIndex = missions.findIndex(
    (mission) => mission.id === selectedMission.id,
  );
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
  const selectedLessonGuide = lessonGuides[selectedMission.id];
  const selectedPracticeSection =
    sectionPracticeDecks.find((section) => section.unit === selectedMission.unit) ??
    sectionPracticeDecks[sectionPracticeDecks.length - 1];
  const practicePageCount = Math.ceil(
    selectedPracticeSection.challenges.length / practicePageSize,
  );
  const practiceStart = practicePage * practicePageSize;
  const visiblePracticeChallenges = selectedPracticeSection.challenges.slice(
    practiceStart,
    practiceStart + practicePageSize,
  );

  const scoredChallengeIds = useMemo(
    () =>
      [
        ...missions.flatMap((mission) =>
          mission.challenges.map((challenge) => challenge.id),
        ),
        ...sectionPracticeDecks.flatMap((section) =>
          section.challenges.map((challenge) => challenge.id),
        ),
      ],
    [],
  );

  const totalXp = missions.reduce((sum, mission) => sum + mission.xp, 0);
  const completedMissions = missionStates.filter((state) => state.complete).length;

  const earnedXp = missionStates.reduce(
    (sum, state) => sum + (state.complete ? state.mission.xp : 0),
    0,
  );

  const correctCount =
    missions.reduce((sum, mission) => {
      return (
        sum +
        mission.challenges.filter((challenge) =>
          isChallengeCorrect(challenge, quizSelections, fillInputs),
        ).length
      );
    }, 0) +
    sectionPracticeDecks.reduce((sum, section) => {
      return (
        sum +
        section.challenges.filter((challenge) =>
          isChallengeCorrect(challenge, quizSelections, fillInputs),
        ).length
      );
    }, 0);

  const answeredCount = scoredChallengeIds.filter((challengeId) => {
    if (quizSelections[challengeId]) {
      return true;
    }

    return Boolean(fillSubmissions[challengeId]);
  }).length;

  const readiness = Math.round((correctCount / scoredChallengeIds.length) * 100);
  const streak = missionStates.reduce((count, state) => {
    if (count !== missionStates.indexOf(state)) {
      return count;
    }
    return state.complete ? count + 1 : count;
  }, 0);

  const firstIncompleteIndex = missionStates.findIndex((state) => !state.complete);
  const nextMission =
    missionStates[firstIncompleteIndex === -1 ? missions.length - 1 : firstIncompleteIndex]
      .mission;
  const unlockedIndex =
    firstIncompleteIndex === -1
      ? missions.length - 1
      : Math.min(firstIncompleteIndex + 1, missions.length - 1);

  const currentIncorrectChecks = selectedMission.challenges.reduce(
    (sum, challenge) => {
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
    },
    0,
  );

  const hearts = Math.max(1, 5 - currentIncorrectChecks);
  const gems = completedMissions * 15 + Math.round(readiness / 5);

  const unitSections = useMemo(() => {
    return missions.reduce<Array<{ unit: string; missions: Mission[] }>>(
      (sections, mission) => {
        const existing = sections.find((section) => section.unit === mission.unit);
        if (existing) {
          existing.missions.push(mission);
          return sections;
        }

        sections.push({ unit: mission.unit, missions: [mission] });
        return sections;
      },
      [],
    );
  }, []);

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

  const selectedMentor = mentorRoster[selectedMission.mentor];
  const currentMissionProgress = `${
    selectedMission.challenges.filter((challenge) =>
      isChallengeCorrect(challenge, quizSelections, fillInputs),
    ).length
  }/${selectedMission.challenges.length}`;
  const selectedPracticeCorrect = selectedPracticeSection.challenges.filter((challenge) =>
    isChallengeCorrect(challenge, quizSelections, fillInputs),
  ).length;

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

  useEffect(() => {
    setPracticePage(0);
  }, [selectedPracticeSection.id]);

  function selectMission(mission: Mission) {
    setSelectedMissionId(mission.id);
    setSelectedSubstepId(
      getDefaultMissionSubstepId(mission, quizSelections, fillInputs),
    );
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
            <div className="hud-pill hearts">Hearts {hearts}/5</div>
            <div className="hud-pill streak">Streak {streak}</div>
            <div className="hud-pill xp">{earnedXp} XP</div>
            <div className="hud-pill gems">{gems} Gems</div>
          </div>
        </header>

        <section className="hero-banner card">
          <div className="hero-copy">
            <p className="eyebrow">Duolingo energy, APCSA brain</p>
            <h1>Pixel-path your way to a 5 in AP Computer Science A.</h1>
            <p className="hero-text">
              Short lessons. Immediate feedback. Fill-in-code reps. Pixel art
              mentors. Real APCSA topics from variables and loops to FRQs,
              ArrayLists, and 2D arrays.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button hero-button"
                onClick={() => selectMission(nextMission)}
                type="button"
              >
                Continue {nextMission.title}
              </button>
              <div className="hero-badges">
                <span className="pill">10-hour path</span>
                <span className="pill">42 MCQ + 4 FRQ aware</span>
                <span className="pill">Pixel mentors</span>
              </div>
            </div>
          </div>

          <div className="hero-stage">
            <div className="speech-bubble">
              <strong>{selectedMentor.name}</strong>
              <p>
                Keep the streak alive. Clear one lesson at a time and the full
                APCSA map starts feeling very beatable.
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
            <span className="summary-label">Course progress</span>
            <strong>
              {completedMissions}/{missions.length} lessons mastered
            </strong>
            <div className="meter">
              <span style={{ width: `${Math.max(readiness, 8)}%` }} />
            </div>
            <p>
              Readiness score: {readiness}% · Checks answered: {answeredCount}/
              {scoredChallengeIds.length}
            </p>
          </article>

          <article className="card summary-card">
            <span className="summary-label">Today’s quest</span>
            <strong>{nextMission.title}</strong>
            <p>{nextMission.focus}</p>
          </article>

          <article className="card summary-card">
            <span className="summary-label">Exam blueprint</span>
            <strong>{examBlueprint.examFormat}</strong>
            <p>{examBlueprint.totalTime} sprint path</p>
          </article>
        </section>

        <section className="course-layout">
          <section className="path-panel">
            {unitSections.map((section, sectionIndex) => (
              <article className="path-section card" key={section.unit}>
                <div className="path-section-head">
                  <div>
                    <p className="eyebrow">World {sectionIndex + 1}</p>
                    <h2>{section.unit}</h2>
                  </div>
                  <span className="tiny-badge">
                    {
                      missionStates.filter(
                        (state) =>
                          state.mission.unit === section.unit && state.complete,
                      ).length
                    }
                    /{section.missions.length} cleared
                  </span>
                </div>

                <div className="path-rail">
                  {section.missions.map((mission, index) => {
                    const globalIndex = missions.findIndex((item) => item.id === mission.id);
                    const state = missionStates[globalIndex];
                    const isActive = mission.id === selectedMission.id;
                    const isNext = mission.id === nextMission.id;
                    const isUnlocked = globalIndex <= unlockedIndex;
                    const sideClass = index % 2 === 0 ? 'left' : 'right';
                    const missionSubsteps = buildMissionSubsteps(
                      mission,
                      quizSelections,
                      fillInputs,
                    );

                    return (
                      <div className={`path-node ${sideClass}`} key={mission.id}>
                        <button
                          className={`path-step ${sideClass} ${
                            state.complete ? 'complete' : ''
                          } ${isActive ? 'active' : ''} ${
                            isUnlocked ? 'unlocked' : 'future'
                          }`}
                          onClick={() => selectMission(mission)}
                          type="button"
                        >
                          <span className="path-line" />
                          <span className="path-orb">
                            {state.complete ? '✓' : String(globalIndex + 1)}
                          </span>
                          <div className="step-card">
                            <span className="step-tag">
                              {isNext
                                ? 'Next lesson'
                                : state.complete
                                  ? 'Mastered'
                                  : isUnlocked
                                    ? 'Ready'
                                    : 'Coming up'}
                            </span>
                            <strong>{mission.title}</strong>
                            <p>
                              {mission.duration} · {mission.focus}
                            </p>
                          </div>
                        </button>

                        {isActive ? (
                          <div className={`subpath-cluster ${sideClass}`}>
                            {missionSubsteps.map((step) => (
                              <button
                                className={`subpath-bubble ${step.kind} ${
                                  step.done ? 'complete' : ''
                                } ${
                                  selectedSubstep.id === step.id ? 'active' : ''
                                }`}
                                key={step.id}
                                onClick={() => setSelectedSubstepId(step.id)}
                                type="button"
                              >
                                <span>{step.bubbleLabel}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </section>

          <aside className="lesson-panel">
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
                <span className="pill">Lesson {selectedMissionIndex + 1}</span>
                <span className="pill accent">{selectedMission.examWeight}</span>
                <span className="pill">{selectedMission.duration}</span>
                <span className="pill">{selectedMission.xp} XP</span>
                <span className="pill">Progress {currentMissionProgress}</span>
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
                  <span className="tiny-badge">
                    {selectedSubstep.bubbleLabel}
                  </span>
                </div>

                {selectedSubstep.kind === 'brief' ? (
                  <div className="focus-grid">
                    <article className="focus-card">
                      <h4>Why this mission matters</h4>
                      <p>{selectedMission.story}</p>
                    </article>
                    <article className="focus-card">
                      <h4>What you will practice</h4>
                      <p>{selectedMission.focus}</p>
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
                      <h4>Exam alignment</h4>
                      <p>{selectedMission.examWeight}</p>
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

            <section className="card practice-card">
              <div className="practice-card-head">
                <div>
                  <p className="eyebrow">Section drill pack</p>
                  <h2>{selectedPracticeSection.title}</h2>
                </div>
                <div className="practice-stat-block">
                  <strong>
                    {selectedPracticeCorrect}/{selectedPracticeSection.challenges.length}
                  </strong>
                  <p>completed in this section</p>
                </div>
              </div>

              <p className="practice-note">{selectedPracticeSection.sourceNote}</p>

              <div className="practice-controls">
                <span className="pill">
                  Page {practicePage + 1} / {practicePageCount}
                </span>
                <span className="pill">
                  {selectedPracticeSection.challenges.length} total reps
                </span>
                <button
                  className="secondary-button"
                  disabled={practicePage === 0}
                  onClick={() =>
                    setPracticePage((current) => Math.max(0, current - 1))
                  }
                  type="button"
                >
                  Previous
                </button>
                <button
                  className="secondary-button"
                  disabled={practicePage >= practicePageCount - 1}
                  onClick={() =>
                    setPracticePage((current) =>
                      Math.min(practicePageCount - 1, current + 1),
                    )
                  }
                  type="button"
                >
                  Next
                </button>
              </div>

              <div className="practice-stack">
                {visiblePracticeChallenges.map((challenge) =>
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
  submitted: boolean;
  values: Record<string, string>;
  onChange: (blankId: string, value: string) => void;
  onSubmit: () => void;
};

function FillCard({
  challenge,
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
    const correct = accepted.some(
      (candidate) =>
        normalizeCompact(candidate) === normalizeCompact(value) ||
        normalize(candidate) === normalize(value),
    );

    return {
      blank,
      filled,
      correct,
    };
  });
  const editorPreview = buildCodePreview(challenge, values);
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
                          {part}
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
          ) : (
            <div className="console-preview">
              <pre className="console-code">
                <code>{editorPreview}</code>
              </pre>
              <p>Press Run tests to compile this practice file and check each blank like a mini IDE challenge.</p>
            </div>
          )}
        </div>
      </div>
      <div className="challenge-actions">
        <div className="challenge-button-row">
          <button
            className="secondary-button"
            onClick={() => setTestsRun(true)}
            type="button"
          >
            Run tests
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
