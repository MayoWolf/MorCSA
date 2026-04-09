import { useEffect, useMemo, useState } from 'react';
import PixelSprite from './components/PixelSprite';
import {
  examBlueprint,
  frqBlueprint,
  mentorRoster,
  missions,
  type FillChallenge,
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

    return {
      quizSelections: JSON.parse(saved).quizSelections ?? {},
      quizSubmissions: JSON.parse(saved).quizSubmissions ?? {},
      fillInputs: JSON.parse(saved).fillInputs ?? {},
      fillSubmissions: JSON.parse(saved).fillSubmissions ?? {},
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

  const selectedMission =
    missions.find((mission) => mission.id === selectedMissionId) ?? missions[0];

  const scoredChallengeIds = useMemo(
    () =>
      missions.flatMap((mission) =>
        mission.challenges.map((challenge) => challenge.id),
      ),
    [],
  );

  const totalXp = missions.reduce((sum, mission) => sum + mission.xp, 0);

  const earnedXp = useMemo(() => {
    return missions.reduce((sum, mission) => {
      const missionCorrect = mission.challenges.every((challenge) => {
        if (challenge.type === 'quiz') {
          return quizSelections[challenge.id] === challenge.answer;
        }

        return challenge.blanks.every((blank) => {
          const value = fillInputs[challenge.id]?.[blank.id] ?? '';
          const accepted = [blank.answer, ...(blank.alternates ?? [])];

          return accepted.some(
            (candidate) =>
              normalizeCompact(candidate) === normalizeCompact(value) ||
              normalize(candidate) === normalize(value),
          );
        });
      });

      return missionCorrect ? sum + mission.xp : sum;
    }, 0);
  }, [fillInputs, quizSelections]);

  const answeredCount = scoredChallengeIds.filter((challengeId) => {
    if (quizSelections[challengeId]) {
      return true;
    }

    return Boolean(fillSubmissions[challengeId]);
  }).length;

  const correctCount = useMemo(() => {
    return missions.reduce((sum, mission) => {
      return (
        sum +
        mission.challenges.filter((challenge) => {
          if (challenge.type === 'quiz') {
            return quizSelections[challenge.id] === challenge.answer;
          }

          return challenge.blanks.every((blank) => {
            const value = fillInputs[challenge.id]?.[blank.id] ?? '';
            const accepted = [blank.answer, ...(blank.alternates ?? [])];

            return accepted.some(
              (candidate) =>
                normalizeCompact(candidate) === normalizeCompact(value) ||
                normalize(candidate) === normalize(value),
            );
          });
        }).length
      );
    }, 0);
  }, [fillInputs, quizSelections]);

  const readiness = Math.round((correctCount / scoredChallengeIds.length) * 100);
  const missionProgress = `${missions.filter((mission) =>
    mission.challenges.every((challenge) => {
      if (challenge.type === 'quiz') {
        return quizSelections[challenge.id] === challenge.answer;
      }

      return challenge.blanks.every((blank) => {
        const value = fillInputs[challenge.id]?.[blank.id] ?? '';
        const accepted = [blank.answer, ...(blank.alternates ?? [])];

        return accepted.some(
          (candidate) =>
            normalizeCompact(candidate) === normalizeCompact(value) ||
            normalize(candidate) === normalize(value),
        );
      });
    }),
  ).length}/${missions.length}`;

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        quizSelections,
        quizSubmissions,
        fillInputs,
        fillSubmissions,
      }),
    );
  }, [fillInputs, fillSubmissions, quizSelections, quizSubmissions]);

  return (
    <div className="app-shell">
      <div className="background-grid" />
      <main className="app">
        <section className="hero card">
          <div className="hero-copy">
            <p className="eyebrow">MorCSA // APCSA Score-5 Quest</p>
            <h1>Play through a focused 10-hour APCSA prep run.</h1>
            <p className="hero-text">
              This learning game maps to the official 2025 APCSA course
              description with mini questions, fill-in-the-blank code,
              explanations, and exam-aware progression from syntax basics to FRQ
              strategy.
            </p>
            <div className="hero-stats">
              <div>
                <span className="stat-label">Estimated time</span>
                <strong>{examBlueprint.totalTime}</strong>
              </div>
              <div>
                <span className="stat-label">Exam format</span>
                <strong>{examBlueprint.examFormat}</strong>
              </div>
              <div>
                <span className="stat-label">Readiness</span>
                <strong>{readiness}%</strong>
              </div>
            </div>
          </div>

          <div className="hero-party">
            {Object.values(mentorRoster).map((mentor) => (
              <div className="mentor-chip" key={mentor.name}>
                <PixelSprite
                  label={mentor.name}
                  palette={mentor.palette}
                  pixels={mentor.pixels}
                  pixelSize={8}
                />
                <div>
                  <strong>{mentor.name}</strong>
                  <p>{mentor.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard">
          <article className="card progress-card">
            <p className="eyebrow">Campaign Progress</p>
            <div className="progress-grid">
              <div>
                <span className="stat-label">XP earned</span>
                <strong>
                  {earnedXp}/{totalXp}
                </strong>
              </div>
              <div>
                <span className="stat-label">Challenges checked</span>
                <strong>
                  {answeredCount}/{scoredChallengeIds.length}
                </strong>
              </div>
              <div>
                <span className="stat-label">Missions cleared</span>
                <strong>{missionProgress}</strong>
              </div>
            </div>
            <div className="meter">
              <span style={{ width: `${Math.max(readiness, 8)}%` }} />
            </div>
            <p className="support-copy">
              Score-5 focus means strong tracing, careful method calls, class
              design, and repeatable array/ArrayList/2D array patterns.
            </p>
          </article>

          <article className="card blueprint-card">
            <p className="eyebrow">Official Blueprint</p>
            <p className="support-copy">{examBlueprint.source}</p>
            <div className="pill-row">
              {examBlueprint.unitWeights.map((unit) => (
                <span className="pill" key={unit}>
                  {unit}
                </span>
              ))}
            </div>
          </article>
        </section>

        <section className="map-layout">
          <aside className="card mission-map">
            <div className="section-heading">
              <div>
                <p className="eyebrow">World Map</p>
                <h2>Ten missions, one exam arc</h2>
              </div>
              <span className="tiny-badge">About 10 hours total</span>
            </div>

            <div className="mission-list">
              {missions.map((mission, index) => {
                const complete = mission.challenges.every((challenge) => {
                  if (challenge.type === 'quiz') {
                    return quizSelections[challenge.id] === challenge.answer;
                  }

                  return challenge.blanks.every((blank) => {
                    const value = fillInputs[challenge.id]?.[blank.id] ?? '';
                    const accepted = [blank.answer, ...(blank.alternates ?? [])];

                    return accepted.some(
                      (candidate) =>
                        normalizeCompact(candidate) ===
                          normalizeCompact(value) ||
                        normalize(candidate) === normalize(value),
                    );
                  });
                });

                return (
                  <button
                    className={`mission-node ${
                      mission.id === selectedMissionId ? 'active' : ''
                    } ${complete ? 'complete' : ''}`}
                    key={mission.id}
                    onClick={() => setSelectedMissionId(mission.id)}
                    type="button"
                  >
                    <span className="node-index">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <strong>{mission.title}</strong>
                      <p>
                        {mission.unit} · {mission.duration} · {mission.focus}
                      </p>
                    </div>
                    <span className="node-xp">{mission.xp} XP</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="card mission-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  {selectedMission.unit} // {selectedMission.arc}
                </p>
                <h2>{selectedMission.title}</h2>
              </div>
              <div className="mission-mentor">
                <PixelSprite
                  label={mentorRoster[selectedMission.mentor].name}
                  palette={mentorRoster[selectedMission.mentor].palette}
                  pixels={mentorRoster[selectedMission.mentor].pixels}
                  pixelSize={9}
                />
                <div>
                  <strong>{mentorRoster[selectedMission.mentor].name}</strong>
                  <p>{mentorRoster[selectedMission.mentor].role}</p>
                </div>
              </div>
            </div>

            <div className="pill-row">
              <span className="pill accent">{selectedMission.examWeight}</span>
              {selectedMission.officialTopics.map((topic) => (
                <span className="pill" key={topic}>
                  Topic {topic}
                </span>
              ))}
            </div>

            <p className="story">{selectedMission.story}</p>
            <div className="lesson-grid">
              <article>
                <h3>What this mission teaches</h3>
                <p>{selectedMission.lesson}</p>
              </article>
              <article>
                <h3>Boss move</h3>
                <p>{selectedMission.bossMove}</p>
              </article>
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
        </section>

        <section className="final-row">
          <article className="card frq-card">
            <p className="eyebrow">Free-Response Bosses</p>
            <h2>Train for the four official FRQ archetypes</h2>
            <div className="frq-grid">
              {frqBlueprint.map((item) => (
                <div className="frq-item" key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.cue}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="card strategy-card">
            <p className="eyebrow">Score-5 Strategy</p>
            <h2>What this site is optimizing for</h2>
            <ul className="strategy-list">
              <li>Fast code tracing without panic.</li>
              <li>Reliable loop and conditional patterns.</li>
              <li>Specification-first FRQ writing.</li>
              <li>Low-error array, ArrayList, and 2D array traversal.</li>
            </ul>
          </article>
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
        <span className="tiny-badge">Mini Question</span>
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
            Submit when you’re ready and the explanation will unlock.
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
  const isCorrect = challenge.blanks.every((blank) => {
    const value = values[blank.id] ?? '';
    const accepted = [blank.answer, ...(blank.alternates ?? [])];

    return accepted.some(
      (candidate) =>
        normalizeCompact(candidate) === normalizeCompact(value) ||
        normalize(candidate) === normalize(value),
    );
  });

  return (
    <article className="challenge-card code-card">
      <div className="challenge-topline">
        <span className="tiny-badge alt">Fill the blank code</span>
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
            Enter code fragments exactly like you would on paper.
          </p>
        )}
      </div>
    </article>
  );
}

export default App;
