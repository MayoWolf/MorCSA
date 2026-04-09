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
                  <article className="focus-card concept-card">
                    <h4>Core explanation</h4>
                    <p>{selectedMission.lesson}</p>
                  </article>
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

  return (
    <article className="challenge-card code-card">
      <div className="challenge-topline">
        <span className="tiny-badge alt">Code puzzle</span>
      </div>
      <h3>{challenge.prompt}</h3>
      <pre className="code-snippet">
        <code>{challenge.snippet.join('\n')}</code>
      </pre>
      <div className="blank-grid">
        {challenge.blanks.map((blank) => (
          <label className="blank-field" key={blank.id}>
            <span>{blank.label}</span>
            <input
              onChange={(event) => onChange(blank.id, event.target.value)}
              placeholder={`Fill ${blank.id}`}
              type="text"
              value={values[blank.id] ?? ''}
            />
          </label>
        ))}
      </div>
      <div className="challenge-actions">
        <button className="primary-button" onClick={onSubmit} type="button">
          Check code
        </button>
        {submitted ? (
          <p className={`feedback ${isCorrect ? 'good' : 'needs-work'}`}>
            {isCorrect ? 'Nice work.' : 'Close, but fix the syntax.'}{' '}
            {challenge.explanation}
          </p>
        ) : (
          <p className="feedback muted">
            Fill it like exam paper code, then lock it in.
          </p>
        )}
      </div>
    </article>
  );
}

export default App;
