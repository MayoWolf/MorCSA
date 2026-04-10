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
import {
  getCedPracticeChallenges,
  getCedTeachingGuide,
  getCedTeachingMoment,
} from './data/cedPractice';
import { lessonGuides } from './data/lessonGuides';
import {
  cedSubunitCatalog,
  courseLevels,
  getLessonCedSubunits,
  journeyUnits,
  totalJourneyMinutes,
  type CedSubunit,
  type CourseLevel,
  type JourneyLesson,
  type JourneyUnit,
} from './data/journey';

type QuizSelections = Record<string, string>;
type QuizSubmissions = Record<string, boolean>;
type FillInputs = Record<string, Record<string, string>>;
type FillSubmissions = Record<string, boolean>;
type MissionSubstepKind = 'brief' | 'concept' | 'boss' | 'quiz' | 'fill' | 'quote';
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

type LessonFlowStep = {
  id: string;
  kind: MissionSubstepKind;
  bubbleLabel: string;
  title: string;
  summary: string;
  done: boolean;
  lane: 'lesson' | 'checkpoint' | 'drill' | 'wrap';
  challenge?: PracticeChallenge;
  subunit?: CedSubunit;
  quote?: string;
  bridge?: string;
  sourceLabel?: string;
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

function getLessonSourceChallenges(lesson: JourneyLesson) {
  return getLessonCedSubunits(lesson).flatMap((subunit) =>
    getCedPracticeChallenges(subunit.code),
  );
}

function getLessonCoreChallenges(lesson: JourneyLesson, mission: Mission) {
  const sourceChallenges = getLessonSourceChallenges(lesson);
  return sourceChallenges.length > 0 ? sourceChallenges : mission.challenges;
}

function buildLessonFlowSteps(
  lesson: JourneyLesson,
  mission: Mission,
  quizSelections: QuizSelections,
  fillInputs: FillInputs,
): LessonFlowStep[] {
  const lessonPractice = getLessonPracticeChallenges(lesson);
  const lessonSubunitSteps = getLessonCedSubunits(lesson).flatMap((subunit) => {
    const teachingMoment = getCedTeachingMoment(subunit.code);
    const conceptStep: LessonFlowStep = {
      id: `${lesson.id}-concept-${subunit.code}`,
      kind: 'concept',
      bubbleLabel: subunit.code,
      title: `${subunit.code} ${subunit.title}`,
      summary: subunit.explanation,
      done: false,
      lane: 'lesson',
      subunit,
    };
    const sourceSteps = getCedPracticeChallenges(subunit.code).map((challenge, index) => ({
      id: challenge.id,
      kind: challenge.type,
      bubbleLabel: challenge.type === 'quiz' ? `Q${index + 1}` : 'Fill',
      title: challenge.prompt,
      summary: `Source practice for ${subunit.code}. ${challenge.explanation}`,
      done: isChallengeCorrect(challenge, quizSelections, fillInputs),
      lane: challenge.type === 'quiz' ? ('checkpoint' as const) : ('drill' as const),
      challenge,
      subunit,
    }));
    const quoteStep: LessonFlowStep | undefined =
      teachingMoment && sourceSteps.length > 0
        ? {
            id: `${lesson.id}-quote-${subunit.code}`,
            kind: 'quote',
            bubbleLabel: 'Quote',
            title: `${subunit.code} Mentor Quote`,
            summary: teachingMoment.bridge,
            done: false,
            lane: 'lesson',
            subunit,
            quote: teachingMoment.quote,
            bridge: teachingMoment.bridge,
            sourceLabel: teachingMoment.sourceLabel,
          }
        : undefined;

    if (!quoteStep || sourceSteps.length < 2) {
      return [conceptStep, ...sourceSteps, ...(quoteStep ? [quoteStep] : [])];
    }

    return [conceptStep, sourceSteps[0], quoteStep, ...sourceSteps.slice(1)];
  });
  const checkpointSteps = getLessonSourceChallenges(lesson).length > 0 ? [] : mission.challenges.map((challenge, index) => ({
    id: challenge.id,
    kind: challenge.type,
    bubbleLabel: challenge.type === 'quiz' ? `Q${index + 1}` : `Code ${index + 1}`,
    title: challenge.prompt,
    summary: challenge.explanation,
    done: isChallengeCorrect(challenge, quizSelections, fillInputs),
    lane: 'checkpoint' as const,
    challenge,
  }));
  const drillSteps = lessonPractice.map((challenge, index) => ({
    id: `${lesson.id}-drill-${challenge.id}`,
    kind: challenge.type,
    bubbleLabel: challenge.type === 'quiz' ? `D${index + 1}` : `IDE ${index + 1}`,
    title: challenge.prompt,
    summary: challenge.explanation,
    done: isChallengeCorrect(challenge, quizSelections, fillInputs),
    lane: 'drill' as const,
    challenge,
  }));
  const guidedChallengeSteps = [
    ...lessonSubunitSteps.filter((step) => step.challenge),
    ...checkpointSteps,
    ...drillSteps,
  ];

  return [
    {
      id: `${lesson.id}-start`,
      kind: 'brief' as const,
      bubbleLabel: 'Start',
      title: 'Lesson Launch',
      summary: lesson.objective,
      done: false,
      lane: 'lesson' as const,
    },
    ...lessonSubunitSteps,
    ...checkpointSteps,
    ...drillSteps,
    {
      id: `${lesson.id}-wrap`,
      kind: 'boss' as const,
      bubbleLabel: 'Wrap',
      title: 'Lesson Wrap',
      summary: mission.bossMove,
      done: guidedChallengeSteps.every((step) => step.done),
      lane: 'wrap' as const,
    },
  ] satisfies LessonFlowStep[];
}

function getDefaultLessonFlowStepId(lesson: JourneyLesson) {
  return `${lesson.id}-start`;
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
    getDefaultLessonFlowStepId(allJourneyLessons[0]),
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
  const selectedUnitLessons = selectedUnit.lessons;
  const lessonPracticeChallenges = useMemo(
    () => getLessonPracticeChallenges(selectedLesson),
    [selectedLesson],
  );
  const selectedLessonCedSubunits = useMemo(
    () => getLessonCedSubunits(selectedLesson),
    [selectedLesson],
  );
  const selectedPracticeSection = getPracticeSectionById(selectedLesson.practiceSectionId);
  const selectedLessonFlowSteps = useMemo(
    () =>
      buildLessonFlowSteps(
        selectedLesson,
        selectedMission,
        quizSelections,
        fillInputs,
      ),
    [fillInputs, quizSelections, selectedLesson, selectedMission],
  );
  const selectedSubstep =
    selectedLessonFlowSteps.find((step) => step.id === selectedSubstepId) ??
    selectedLessonFlowSteps[0];
  const selectedCedTeachingGuide = selectedSubstep.subunit
    ? getCedTeachingGuide(selectedSubstep.subunit.code)
    : undefined;
  const activeQuizChallenge =
    selectedSubstep.challenge?.type === 'quiz' ? selectedSubstep.challenge : undefined;
  const activeFillChallenge =
    selectedSubstep.challenge?.type === 'fill' ? selectedSubstep.challenge : undefined;
  const selectedLessonChallengeSteps = selectedLessonFlowSteps.filter(
    (step) => step.lane === 'checkpoint' || step.lane === 'drill',
  );
  const selectedLessonCorrectChallenges = selectedLessonChallengeSteps.filter(
    (step) => step.done,
  ).length;
  const selectedFlowIndex = Math.max(
    selectedLessonFlowSteps.findIndex((step) => step.id === selectedSubstep.id),
    0,
  );
  const selectedFlowProgress = Math.round(
    ((selectedFlowIndex + 1) / selectedLessonFlowSteps.length) * 100,
  );
  const selectedUnitIndex = journeyUnits.findIndex((unit) => unit.id === selectedUnit.id);
  const selectedLessonIndexInUnit = Math.max(
    selectedUnitLessons.findIndex((lesson) => lesson.id === selectedLesson.id),
    0,
  );

  const uniqueTrackedChallenges = useMemo(() => {
    const seen = new Set<string>();
    return allJourneyLessons
      .flatMap((lesson) => {
        const mission = getMissionById(lesson.missionId);
        return [
          ...getLessonCoreChallenges(lesson, mission),
          ...getLessonPracticeChallenges(lesson),
        ];
      })
      .filter((challenge) => {
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
        const coreChallenges = getLessonCoreChallenges(lesson, mission);
        const practice = getLessonPracticeChallenges(lesson);
        const complete =
          coreChallenges.every((challenge) =>
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
      selectedLessonChallengeSteps.reduce((sum, step) => {
        const challenge = step.challenge;
        if (!challenge) {
          return sum;
        }
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
  const selectedUnitCompletedLessons = lessonCompletion.filter(
    (item) => item.lesson.unitId === selectedUnit.id && item.complete,
  ).length;
  const currentLessonProgress = `${selectedLessonCorrectChallenges}/${selectedLessonChallengeSteps.length}`;
  const previousLessonFlowStep = selectedLessonFlowSteps[selectedFlowIndex - 1];
  const nextLessonFlowStep = selectedLessonFlowSteps[selectedFlowIndex + 1];
  const nextLessonInUnit = selectedUnitLessons[selectedLessonIndexInUnit + 1];
  const totalCedSubunits = Object.keys(cedSubunitCatalog).length;

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
    if (!selectedLessonFlowSteps.some((step) => step.id === selectedSubstepId)) {
      setSelectedSubstepId(getDefaultLessonFlowStepId(selectedLesson));
    }
  }, [selectedLesson, selectedLessonFlowSteps, selectedSubstepId]);

  function openUnit(unit: JourneyUnit) {
    setSelectedLessonId(unit.lessons[0].id);
    setPage('pathway');
  }

  function openLesson(lesson: JourneyLesson) {
    setSelectedLessonId(lesson.id);
    setSelectedSubstepId(getDefaultLessonFlowStepId(lesson));
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
          <section className="home-page">
            <section className="card home-route-header">
              <div className="home-route-top">
                <div>
                  <p className="eyebrow">Home Path</p>
                  <h1>Follow the worlds in order, then enter one lesson bubble at a time.</h1>
                  <p className="hero-text">
                    This screen is just your roadmap. Pick the route, tap a world,
                    then move into a focused lesson screen where you only see one stop,
                    one question, or one IDE mission at once.
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => openLesson(nextLesson)}
                  type="button"
                >
                  Continue {nextLesson.title}
                </button>
              </div>

              <div className="level-selector-row">
                {courseLevels.map((level) => (
                  <button
                    className={`level-chip ${
                      selectedLevel.id === level.id ? 'active' : ''
                    }`}
                    key={level.id}
                    onClick={() => setSelectedLevelId(level.id)}
                    type="button"
                  >
                    <strong>{level.title}</strong>
                    <span>{level.subtitle}</span>
                  </button>
                ))}
              </div>

              <div className="route-summary-grid">
                <article className="focus-card">
                  <h4>Selected route</h4>
                  <p>{selectedLevel.pacing}</p>
                </article>
                <article className="focus-card">
                  <h4>Course progress</h4>
                  <p>
                    {completedLessons}/{allJourneyLessons.length} lessons cleared and{' '}
                    {answeredCount}/{uniqueTrackedChallenges.length} tracked reps touched.
                  </p>
                </article>
                <article className="focus-card">
                  <h4>Readiness</h4>
                  <p>
                    {readiness}% exam readiness with {Math.round(totalJourneyMinutes / 60)} hours
                    mapped across {totalCedSubunits} official CED subunits.
                  </p>
                </article>
              </div>
            </section>

            <section className="card home-pathway-card">
              <div className="path-section-head">
                <div>
                  <p className="eyebrow">Linear Pathway</p>
                  <h2>Worlds first. Lessons second. Questions inside the lesson only.</h2>
                </div>
                <span className="tiny-badge">{Math.round(totalJourneyMinutes / 60)} hour route</span>
              </div>

              <div className="unit-path-rail">
                {journeyUnits.map((unit, index) => {
                  const mentor = mentorRoster[unit.mentorKey];
                  const unitComplete = lessonCompletion.filter(
                    (item) => item.lesson.unitId === unit.id && item.complete,
                  ).length;
                  const isActiveUnit = selectedUnit.id === unit.id;

                  return (
                    <article
                      className={`unit-path-node ${isActiveUnit ? 'active' : ''}`}
                      key={unit.id}
                    >
                      <div
                        className={`unit-path-orb ${
                          unitComplete === unit.lessons.length
                            ? 'complete'
                            : isActiveUnit
                              ? 'active'
                              : ''
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="unit-path-card">
                        <div className="unit-path-card-head">
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
                          <span className="tiny-badge">{unit.duration}</span>
                        </div>

                        <p>{unit.description}</p>
                        <div className="pill-cloud">
                          <span className="pill">{unit.examWeight}</span>
                          <span className="pill">{unitComplete}/{unit.lessons.length} lessons</span>
                        </div>

                        <div className="lesson-bubble-row">
                          {unit.lessons.map((lesson, lessonIndex) => {
                            const complete =
                              lessonCompletion.find((item) => item.lesson.id === lesson.id)
                                ?.complete ?? false;

                            return (
                              <button
                                className={`lesson-bubble ${
                                  selectedLesson.id === lesson.id ? 'active' : ''
                                } ${complete ? 'complete' : ''}`}
                                key={lesson.id}
                                onClick={() => {
                                  setSelectedLessonId(lesson.id);
                                  setSelectedSubstepId(getDefaultLessonFlowStepId(lesson));
                                  setPage('pathway');
                                }}
                                title={lesson.title}
                                type="button"
                              >
                                {lessonIndex + 1}
                              </button>
                            );
                          })}
                        </div>

                        <div className="unit-path-actions">
                          <p className="feedback muted">
                            Open this world to see its lesson-by-lesson path before you start drilling.
                          </p>
                          <button
                            className="secondary-button"
                            onClick={() => openUnit(unit)}
                            type="button"
                          >
                            Open {unit.title}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </section>
        ) : null}

        {page === 'pathway' ? (
          <section className="pathway-detail-page">
            <div className="unit-switcher-row">
              {journeyUnits.map((unit, index) => (
                <button
                  className={`unit-switcher-chip ${
                    selectedUnit.id === unit.id ? 'active' : ''
                  }`}
                  key={unit.id}
                  onClick={() => openUnit(unit)}
                  type="button"
                >
                  <span>W{index + 1}</span>
                  {unit.title}
                </button>
              ))}
            </div>

            <section className="card pathway-detail-header">
              <div className="lesson-route-head">
                <button
                  className="secondary-button"
                  onClick={() => setPage('home')}
                  type="button"
                >
                  Back home
                </button>
                <button
                  className="primary-button"
                  onClick={() => openLesson(selectedLesson)}
                  type="button"
                >
                  Open {selectedLesson.title}
                </button>
              </div>

              <div className="pathway-detail-hero">
                <div>
                  <p className="eyebrow">World {selectedUnitIndex + 1}</p>
                  <h1>{selectedUnit.title}</h1>
                  <p className="hero-text">{selectedUnit.description}</p>
                  <div className="pill-cloud">
                    <span className="pill">{selectedUnit.duration}</span>
                    <span className="pill accent">{selectedUnit.examWeight}</span>
                    <span className="pill">
                      {selectedUnitCompletedLessons}/{selectedUnitLessons.length} lessons cleared
                    </span>
                  </div>
                </div>

                <div className="unit-mentor">
                  <div className="unit-mentor-sprite">
                    <PixelSprite
                      label={selectedMentor.name}
                      palette={selectedMentor.palette}
                      pixels={selectedMentor.pixels}
                      pixelSize={7}
                    />
                  </div>
                  <div>
                    <strong>{selectedMentor.name}</strong>
                    <p>{selectedMentor.role}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="card unit-lesson-path-card">
              <div className="path-section-head">
                <div>
                  <p className="eyebrow">Inner bubbles</p>
                  <h2>Each lesson opens into its own guided sub-path.</h2>
                </div>
                <span className="tiny-badge">{selectedUnitLessons.length} lessons</span>
              </div>

              <div className="lesson-path-rail">
                {selectedUnitLessons.map((lesson, index) => {
                  const lessonCedSubunits = getLessonCedSubunits(lesson);
                  const lessonMission = getMissionById(lesson.missionId);
                  const lessonCoreChallenges = getLessonCoreChallenges(
                    lesson,
                    lessonMission,
                  );
                  const complete =
                    lessonCompletion.find((item) => item.lesson.id === lesson.id)
                      ?.complete ?? false;
                  const lessonStops =
                    2 +
                    lessonCedSubunits.length +
                    lessonCoreChallenges.length +
                    getLessonPracticeChallenges(lesson).length;

                  return (
                    <article
                      className={`lesson-path-node ${
                        selectedLesson.id === lesson.id ? 'active' : ''
                      } ${complete ? 'complete' : ''}`}
                      key={lesson.id}
                    >
                      <div className="lesson-path-node-orb">{index + 1}</div>
                      <div className="lesson-path-node-card">
                        <div className="lesson-path-card-head">
                          <div>
                            <p className="eyebrow">Lesson {index + 1}</p>
                            <h3>{lesson.title}</h3>
                          </div>
                          <span className="step-tag">
                            {complete ? 'Cleared' : lesson.duration}
                          </span>
                        </div>

                        <p>{lesson.objective}</p>

                        <div className="lesson-stop-row">
                          <span className="mini-stop">Start</span>
                          {lessonCedSubunits.map((subunit) => (
                            <span className="mini-stop ced" key={`${lesson.id}-${subunit.code}`}>
                              {subunit.code}
                            </span>
                          ))}
                          <span className="mini-stop">
                            {lessonCoreChallenges.length} source checks
                          </span>
                          <span className="mini-stop">
                            {getLessonPracticeChallenges(lesson).length} drills
                          </span>
                          <span className="mini-stop">Wrap</span>
                        </div>

                        <div className="pill-cloud">
                          <span className="pill">{lessonStops} total stops</span>
                          <span className="pill">{lesson.practiceCount} practice pulls</span>
                          <span className="pill accent">
                            {lessonCedSubunits.length} CED subunits
                          </span>
                        </div>

                        <div className="ced-subunit-grid">
                          {lessonCedSubunits.map((subunit) => (
                            <article className="ced-subunit-card" key={`${lesson.id}-${subunit.code}`}>
                              <strong>{subunit.code}</strong>
                              <h4>{subunit.title}</h4>
                              <p>{subunit.explanation}</p>
                            </article>
                          ))}
                        </div>

                        <div className="lesson-path-node-actions">
                          <button
                            className="secondary-button"
                            onClick={() => {
                              setSelectedLessonId(lesson.id);
                              setSelectedSubstepId(getDefaultLessonFlowStepId(lesson));
                            }}
                            type="button"
                          >
                            Preview here
                          </button>
                          <button
                            className="primary-button"
                            onClick={() => openLesson(lesson)}
                            type="button"
                          >
                            Open lesson
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </section>
        ) : null}

        {page === 'lesson' ? (
          <section className="lesson-page">
            <section className="lesson-stage">
              <aside className="card lesson-track-card">
                <div className="lesson-route-head">
                  <button
                    className="secondary-button"
                    onClick={() => setPage('pathway')}
                    type="button"
                  >
                    Back to {selectedUnit.title}
                  </button>
                  <span className="pill">
                    Lesson {selectedLessonIndexInUnit + 1} / {selectedUnitLessons.length}
                  </span>
                </div>

                <div className="lesson-track-top">
                  <div>
                    <p className="eyebrow">{selectedUnit.title}</p>
                    <h2>{selectedLesson.title}</h2>
                    <p className="world-description">{selectedLesson.objective}</p>
                  </div>
                  <div className="unit-mentor">
                    <div className="unit-mentor-sprite">
                      <PixelSprite
                        label={selectedMentor.name}
                        palette={selectedMentor.palette}
                        pixels={selectedMentor.pixels}
                        pixelSize={7}
                      />
                    </div>
                    <div>
                      <strong>{selectedMentor.name}</strong>
                      <p>{selectedMentor.role}</p>
                    </div>
                  </div>
                </div>

                <div className="pill-cloud">
                  <span className="pill">{selectedLesson.duration}</span>
                  <span className="pill accent">{selectedPracticeSection.title}</span>
                  <span className="pill">
                    {selectedLessonCedSubunits.length} CED subunits
                  </span>
                  <span className="pill">Solved {currentLessonProgress}</span>
                </div>

                <div className="lesson-track-rail">
                  {selectedLessonFlowSteps.map((step, index) => {
                    const complete = step.done || index < selectedFlowIndex;

                    return (
                      <button
                        className={`lesson-track-step ${
                          selectedSubstep.id === step.id ? 'active' : ''
                        } ${complete ? 'complete' : ''}`}
                        key={step.id}
                        onClick={() => setSelectedSubstepId(step.id)}
                        type="button"
                      >
                        <span className="lesson-track-step-orb">{step.bubbleLabel}</span>
                        <div className="lesson-track-step-copy">
                          <strong>{step.title}</strong>
                          <p>{step.summary}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <section className="card lesson-workspace-card">
                <div className="lesson-workspace-head">
                  <div>
                    <p className="eyebrow">
                      {selectedSubstep.lane === 'lesson'
                        ? 'Lesson lane'
                        : selectedSubstep.lane === 'checkpoint'
                          ? 'Checkpoint lane'
                          : selectedSubstep.lane === 'drill'
                            ? 'Drill lane'
                            : 'Wrap lane'}
                    </p>
                    <h2>{selectedSubstep.title}</h2>
                  </div>
                  <span className="tiny-badge">{selectedSubstep.bubbleLabel}</span>
                </div>

                <div className="lesson-meta">
                  <span className="pill">{selectedMission.unit}</span>
                  <span className="pill">{selectedMission.arc}</span>
                  <span className="pill accent">{selectedMission.examWeight}</span>
                </div>

                <div className="mentor-callout">
                  <div className="mentor-callout-avatar">
                    <PixelSprite
                      label={selectedMentor.name}
                      palette={selectedMentor.palette}
                      pixels={selectedMentor.pixels}
                      pixelSize={8}
                    />
                  </div>
                  <div>
                    <strong>{selectedMentor.name}</strong>
                    <p>
                      {selectedSubstep.kind === 'brief'
                        ? selectedMission.story
                        : selectedSubstep.kind === 'concept'
                          ? selectedCedTeachingGuide?.overview ??
                            selectedSubstep.subunit?.explanation ??
                            selectedLessonGuide.coachIntro
                          : selectedSubstep.kind === 'quote'
                            ? selectedSubstep.quote ?? selectedSubstep.bridge ?? selectedSubstep.summary
                          : selectedSubstep.kind === 'boss'
                            ? selectedMission.bossMove
                            : selectedSubstep.summary}
                    </p>
                  </div>
                </div>

                {selectedSubstep.kind === 'brief' ? (
                  <div className="focus-grid">
                    <article className="focus-card">
                      <h4>What this sub-unit covers</h4>
                      <p>{selectedLesson.objective}</p>
                    </article>
                    <article className="focus-card">
                      <h4>What you will do</h4>
                      <p>
                        Learn the idea, clear the checkpoint questions, finish the IDE
                        drills, then wrap the lesson before moving to the next bubble.
                      </p>
                    </article>
                    <article className="focus-card">
                      <h4>Official CED subunits in this lesson</h4>
                      <div className="topic-chip-row">
                        {selectedLessonCedSubunits.map((subunit) => (
                          <span className="topic-chip" key={subunit.code}>
                            {subunit.code} {subunit.title}
                          </span>
                        ))}
                      </div>
                    </article>
                    {selectedLesson.teachingMoments.map((moment) => (
                      <article className="focus-card" key={moment}>
                        <h4>Teaching focus</h4>
                        <p>{moment}</p>
                      </article>
                    ))}
                  </div>
                ) : null}

                {selectedSubstep.kind === 'concept' ? (
                  selectedCedTeachingGuide ? (
                    <div className="teaching-stack">
                      <article className="focus-card ced-topic-card">
                        <h4>From the teaching guide</h4>
                        <strong>{selectedCedTeachingGuide.heading}</strong>
                        <p>{selectedCedTeachingGuide.overview}</p>
                        <span className="tiny-badge">
                          {selectedCedTeachingGuide.sourceLabel}
                        </span>
                      </article>

                      <article className="focus-card">
                        <h4>Direct explanation</h4>
                        <p>{selectedCedTeachingGuide.detail}</p>
                      </article>

                      <article className="focus-card quote-card">
                        <h4>Common trap from the guide</h4>
                        <p>{selectedCedTeachingGuide.warning}</p>
                      </article>
                    </div>
                  ) : (
                    <div className="teaching-stack">
                      <article className="focus-card ced-topic-card">
                        <h4>Official CED topic</h4>
                        <strong>
                          {selectedSubstep.subunit?.code} {selectedSubstep.subunit?.title}
                        </strong>
                        <p>{selectedSubstep.subunit?.explanation ?? selectedSubstep.summary}</p>
                      </article>

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
                  )
                ) : null}

                {selectedSubstep.kind === 'quote' ? (
                  <div className="teaching-stack">
                    <article className="focus-card quote-card">
                      <h4>Guide quote</h4>
                      <blockquote className="mentor-quote">
                        “{selectedSubstep.quote}”
                      </blockquote>
                      <p>
                        {selectedCedTeachingGuide?.quoteContext ??
                          selectedSubstep.bridge ??
                          selectedSubstep.summary}
                      </p>
                      {selectedSubstep.sourceLabel ? (
                        <span className="tiny-badge">{selectedSubstep.sourceLabel}</span>
                      ) : null}
                    </article>

                    {selectedCedTeachingGuide ? (
                      <div className="focus-grid">
                        <article className="focus-card">
                          <h4>Guide explanation</h4>
                          <p>{selectedCedTeachingGuide.detail}</p>
                        </article>
                        <article className="focus-card">
                          <h4>Guide warning</h4>
                          <p>{selectedCedTeachingGuide.warning}</p>
                        </article>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {(activeQuizChallenge || activeFillChallenge) ? (
                  <article className="focus-card active-step-brief">
                    <h4>What this stop is checking</h4>
                    <p>{selectedSubstep.summary}</p>
                  </article>
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

                {selectedSubstep.kind === 'boss' ? (
                  <>
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

                    <article className="focus-card">
                      <h4>Exam transfer</h4>
                      <p>
                        {frqBlueprint[0].cue} Keep these unit weights in mind as you move on:
                      </p>
                      <div className="pill-cloud">
                        {examBlueprint.unitWeights.map((unit) => (
                          <span className="pill" key={unit}>
                            {unit}
                          </span>
                        ))}
                      </div>
                    </article>

                    <article className="focus-card">
                      <h4>CED topics you just covered</h4>
                      <div className="ced-subunit-grid compact">
                        {selectedLessonCedSubunits.map((subunit) => (
                          <article className="ced-subunit-card compact" key={subunit.code}>
                            <strong>{subunit.code}</strong>
                            <h4>{subunit.title}</h4>
                            <p>{subunit.explanation}</p>
                          </article>
                        ))}
                      </div>
                    </article>
                  </>
                ) : null}

                <div className="topic-chip-row">
                  {selectedLessonCedSubunits.map((subunit) => (
                    <span className="topic-chip" key={subunit.code}>
                      {subunit.code} {subunit.title}
                    </span>
                  ))}
                </div>
              </section>
            </section>

            <section className="card lesson-progress-dock">
              <div className="lesson-progress-copy">
                <p className="eyebrow">Sub-unit progress</p>
                <strong>
                  {selectedLesson.title} · Step {selectedFlowIndex + 1} of{' '}
                  {selectedLessonFlowSteps.length}
                </strong>
              </div>
              <div className="lesson-progress-meter">
                <span style={{ width: `${selectedFlowProgress}%` }} />
              </div>
              <div className="lesson-progress-actions">
                <button
                  className="secondary-button"
                  disabled={!previousLessonFlowStep}
                  onClick={() =>
                    previousLessonFlowStep &&
                    setSelectedSubstepId(previousLessonFlowStep.id)
                  }
                  type="button"
                >
                  Previous
                </button>
                <button
                  className="primary-button"
                  onClick={() => {
                    if (nextLessonFlowStep) {
                      setSelectedSubstepId(nextLessonFlowStep.id);
                      return;
                    }

                    if (nextLessonInUnit) {
                      openLesson(nextLessonInUnit);
                      return;
                    }

                    setPage('pathway');
                  }}
                  type="button"
                >
                  {nextLessonFlowStep
                    ? 'Next step'
                    : nextLessonInUnit
                      ? 'Next lesson'
                      : 'Back to world'}
                </button>
              </div>
            </section>
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
