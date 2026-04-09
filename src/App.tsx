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

type QuizSelections = Record<string, string>;
type QuizSubmissions = Record<string, boolean>;
type FillInputs = Record<string, Record<string, string>>;
type FillSubmissions = Record<string, boolean>;

const storageKey = 'morcsa-progress-v1';

type StoredProgress = {
  quizSelections: QuizSelections;
  quizSubmissions: QuizSubmissions;
  fillInputs: FillInputs;
  fillSubmissions: FillSubmissions;
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
  challenge: Mission['challenges'][number],
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

function App() {
  const storedProgress = readStoredProgress();
  const [selectedMissionId, setSelectedMissionId] = useState(missions[0].id);
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

  const scoredChallengeIds = useMemo(
    () =>
      missions.flatMap((mission) =>
        mission.challenges.map((challenge) => challenge.id),
      ),
    [],
  );

  const totalXp = missions.reduce((sum, mission) => sum + mission.xp, 0);
  const completedMissions = missionStates.filter((state) => state.complete).length;

  const earnedXp = missionStates.reduce(
    (sum, state) => sum + (state.complete ? state.mission.xp : 0),
    0,
  );

  const correctCount = missions.reduce((sum, mission) => {
    return (
      sum +
      mission.challenges.filter((challenge) =>
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
                onClick={() => setSelectedMissionId(nextMission.id)}
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

                    return (
                      <button
                        className={`path-step ${sideClass} ${
                          state.complete ? 'complete' : ''
                        } ${isActive ? 'active' : ''} ${
                          isUnlocked ? 'unlocked' : 'future'
                        }`}
                        key={mission.id}
                        onClick={() => setSelectedMissionId(mission.id)}
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

              <div className="lesson-callout">
                <h3>Mission story</h3>
                <p>{selectedMission.story}</p>
              </div>

              <div className="lesson-duo-grid">
                <article>
                  <h3>Learn it</h3>
                  <p>{selectedMission.lesson}</p>
                </article>
                <article>
                  <h3>Boss move</h3>
                  <p>{selectedMission.bossMove}</p>
                </article>
              </div>

              <div className="topic-chip-row">
                {selectedMission.officialTopics.map((topic) => (
                  <span className="topic-chip" key={topic}>
                    Topic {topic}
                  </span>
                ))}
              </div>

              <div className="challenge-stack">
                {selectedMission.challenges.map((challenge) =>
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
