export type CourseLevel = {
  id: string;
  title: string;
  subtitle: string;
  pacing: string;
  target: string;
  recommended?: boolean;
};

export type JourneyLesson = {
  id: string;
  missionId: string;
  unitId: string;
  title: string;
  duration: string;
  objective: string;
  teachingMoments: string[];
  practiceSectionId: string;
  practiceStart: number;
  practiceCount: number;
};

export type JourneyUnit = {
  id: string;
  title: string;
  duration: string;
  mentorKey: 'byte' | 'loop' | 'classer' | 'array';
  examWeight: string;
  description: string;
  lessons: JourneyLesson[];
};

export const courseLevels: CourseLevel[] = [
  {
    id: 'foundation',
    title: 'Foundation Run',
    subtitle: 'Best if you need slower pacing and lots of explanation',
    pacing: '10 hours core path + optional extra drill time',
    target: 'Build confidence from zero to exam-ready habits',
  },
  {
    id: 'score-5',
    title: 'Score 5 Route',
    subtitle: 'Recommended for serious APCSA prep',
    pacing: '10 focused hours with teach -> practice -> IDE -> review',
    target: 'Finish with strong MCQ tracing and FRQ pattern recognition',
    recommended: true,
  },
  {
    id: 'sprint',
    title: 'Exam Sprint',
    subtitle: 'Faster review mode once you already know the basics',
    pacing: '6-7 hours with heavier practice and lighter teaching',
    target: 'Tighten weak spots before test day',
  },
];

export const journeyUnits: JourneyUnit[] = [
  {
    id: 'unit-1',
    title: 'Unit 1: Using Objects and Methods',
    duration: '3 hr 5 min',
    mentorKey: 'byte',
    examWeight: '15–25% of the AP exam',
    description:
      'Learn Java basics, method calls, Strings, Math, object creation, and the tracing habits that make later units much easier.',
    lessons: [
      {
        id: 'u1-l1',
        missionId: 'mission-1',
        unitId: 'unit-1',
        title: 'Variables, Data Types, and Output',
        duration: '35 min',
        objective: 'Choose correct primitive types, store values, and predict output from short code segments.',
        teachingMoments: [
          'Primitive type meanings and why they matter',
          'Output tracing without guessing',
          'Integer versus decimal arithmetic',
        ],
        practiceSectionId: 'unit-1',
        practiceStart: 0,
        practiceCount: 8,
      },
      {
        id: 'u1-l2',
        missionId: 'mission-2',
        unitId: 'unit-1',
        title: 'Casting, Strings, and the Java Quick Reference',
        duration: '40 min',
        objective: 'Use method calls correctly and understand what Java returns from substring, equals, Math, and casts.',
        teachingMoments: [
          'Returned values versus changed variables',
          'substring and index boundaries',
          'Casting rules that show up on MCQ',
        ],
        practiceSectionId: 'unit-1',
        practiceStart: 8,
        practiceCount: 8,
      },
      {
        id: 'u1-l3',
        missionId: 'mission-3',
        unitId: 'unit-1',
        title: 'Objects, Constructors, and Instance Methods',
        duration: '35 min',
        objective: 'Read object code clearly and understand how constructors and instance methods differ.',
        teachingMoments: [
          'Reference variables versus objects',
          'What `new` actually does',
          'Method calls on created objects',
        ],
        practiceSectionId: 'unit-1',
        practiceStart: 16,
        practiceCount: 8,
      },
      {
        id: 'u1-l4',
        missionId: 'mission-3',
        unitId: 'unit-1',
        title: 'Unit 1 Mastery Lab',
        duration: '35 min',
        objective: 'Blend method tracing, String work, object creation, and small code fixes in one review lab.',
        teachingMoments: [
          'Mixed tracing from the first unit',
          'Spotting compile-time versus logic mistakes',
          'Writing small code corrections quickly',
        ],
        practiceSectionId: 'unit-1',
        practiceStart: 24,
        practiceCount: 6,
      },
    ],
  },
  {
    id: 'unit-2',
    title: 'Unit 2: Selection and Iteration',
    duration: '2 hr 40 min',
    mentorKey: 'loop',
    examWeight: '25–35% of the AP exam',
    description:
      'Master boolean logic, if-statements, loops, nested iteration, and the tracing skills that dominate APCSA multiple choice.',
    lessons: [
      {
        id: 'u2-l1',
        missionId: 'mission-4',
        unitId: 'unit-2',
        title: 'Boolean Expressions and if Statements',
        duration: '35 min',
        objective: 'Read conditions correctly, especially at boundaries, and predict which branch executes.',
        teachingMoments: [
          'Relational operators in plain English',
          'Boundary mistakes such as `>` vs `>=`',
          'One-way and two-way selection',
        ],
        practiceSectionId: 'unit-2',
        practiceStart: 0,
        practiceCount: 8,
      },
      {
        id: 'u2-l2',
        missionId: 'mission-4',
        unitId: 'unit-2',
        title: 'Compound Logic and Nested Decisions',
        duration: '30 min',
        objective: 'Combine boolean conditions and interpret more complex branches without losing track of the logic.',
        teachingMoments: [
          'Reading `&&`, `||`, and `!` carefully',
          'Nested if flow in execution order',
          'Turning English rules into conditionals',
        ],
        practiceSectionId: 'unit-2',
        practiceStart: 8,
        practiceCount: 7,
      },
      {
        id: 'u2-l3',
        missionId: 'mission-5',
        unitId: 'unit-2',
        title: 'for Loops, while Loops, and Trace Tables',
        duration: '35 min',
        objective: 'Track loop state accurately and explain how often code executes.',
        teachingMoments: [
          'Initialization, condition, update',
          'Infinite loops and missing updates',
          'How to build a fast trace table',
        ],
        practiceSectionId: 'unit-2',
        practiceStart: 15,
        practiceCount: 8,
      },
      {
        id: 'u2-l4',
        missionId: 'mission-5',
        unitId: 'unit-2',
        title: 'Nested Iteration and Unit 2 Review',
        duration: '40 min',
        objective: 'Work through nested loops and finish Unit 2 with heavier algorithm practice.',
        teachingMoments: [
          'Counting inner-loop executions',
          'Loop patterns that appear on FRQ 1',
          'Mixed bug-fix review',
        ],
        practiceSectionId: 'unit-2',
        practiceStart: 23,
        practiceCount: 7,
      },
    ],
  },
  {
    id: 'unit-3',
    title: 'Unit 3: Class Creation',
    duration: '1 hr 55 min',
    mentorKey: 'classer',
    examWeight: '10–18% of the AP exam',
    description:
      'Build classes that match a specification, use constructors correctly, and earn easy FRQ 2 points with clean structure.',
    lessons: [
      {
        id: 'u3-l1',
        missionId: 'mission-6',
        unitId: 'unit-3',
        title: 'Class Anatomy and Constructors',
        duration: '35 min',
        objective: 'Understand instance variables, constructor headers, and how fields are initialized.',
        teachingMoments: [
          'Fields versus local variables',
          'Constructor structure',
          'Using `this` correctly',
        ],
        practiceSectionId: 'unit-3',
        practiceStart: 0,
        practiceCount: 10,
      },
      {
        id: 'u3-l2',
        missionId: 'mission-6',
        unitId: 'unit-3',
        title: 'Accessors, Mutators, and Method Design',
        duration: '40 min',
        objective: 'Write methods that either report state or change state in a clean, predictable way.',
        teachingMoments: [
          'Choosing return types',
          'Accessor vs mutator thinking',
          'Method bodies that match the prompt exactly',
        ],
        practiceSectionId: 'unit-3',
        practiceStart: 10,
        practiceCount: 10,
      },
      {
        id: 'u3-l3',
        missionId: 'mission-6',
        unitId: 'unit-3',
        title: 'FRQ 2 Build Session',
        duration: '40 min',
        objective: 'Use a class spec, examples, and small method requirements to simulate real FRQ 2 work.',
        teachingMoments: [
          'Reading the prompt like a contract',
          'Avoiding overbuilding',
          'Securing easy structure points first',
        ],
        practiceSectionId: 'unit-3',
        practiceStart: 20,
        practiceCount: 10,
      },
    ],
  },
  {
    id: 'unit-4',
    title: 'Unit 4: Data Collections',
    duration: '2 hr 20 min',
    mentorKey: 'array',
    examWeight: '30–40% of the AP exam',
    description:
      'Train the heaviest exam unit: arrays, ArrayLists, 2D arrays, searching, sorting, and the algorithm patterns that power FRQ 3 and FRQ 4.',
    lessons: [
      {
        id: 'u4-l1',
        missionId: 'mission-7',
        unitId: 'unit-4',
        title: 'Arrays and Safe Traversal',
        duration: '30 min',
        objective: 'Use array indexes safely and write common traversal algorithms like sum, count, and search.',
        teachingMoments: [
          'Index bounds and off-by-one errors',
          'Traversal headers you can trust',
          'Tracker variables such as totals and counts',
        ],
        practiceSectionId: 'unit-4',
        practiceStart: 0,
        practiceCount: 8,
      },
      {
        id: 'u4-l2',
        missionId: 'mission-8',
        unitId: 'unit-4',
        title: 'ArrayLists and Wrapper Classes',
        duration: '30 min',
        objective: 'Use ArrayList methods correctly and avoid common mutation mistakes.',
        teachingMoments: [
          'size vs length',
          'get, set, add, and remove',
          'Why Integer appears instead of int',
        ],
        practiceSectionId: 'unit-4',
        practiceStart: 8,
        practiceCount: 8,
      },
      {
        id: 'u4-l3',
        missionId: 'mission-9',
        unitId: 'unit-4',
        title: '2D Arrays and Row-Major Thinking',
        duration: '35 min',
        objective: 'Track rows and columns correctly and build nested traversals that stay in bounds.',
        teachingMoments: [
          'First index row, second index column',
          'Using the right row length',
          'Nested loops without index swaps',
        ],
        practiceSectionId: 'unit-4',
        practiceStart: 16,
        practiceCount: 7,
      },
      {
        id: 'u4-l4',
        missionId: 'mission-10',
        unitId: 'unit-4',
        title: 'Searching, Sorting, and Algorithm Choice',
        duration: '40 min',
        objective: 'Recognize when to search, when to sort, and what conditions a given algorithm requires.',
        teachingMoments: [
          'Linear versus binary search',
          'When sorted order matters',
          'Selection and insertion sort as patterns',
        ],
        practiceSectionId: 'unit-4',
        practiceStart: 23,
        practiceCount: 7,
      },
      {
        id: 'u4-l5',
        missionId: 'mission-10',
        unitId: 'unit-4',
        title: 'Mixed Review Forge',
        duration: '45 min',
        objective: 'End the course with mixed exam-style review covering the most common APCSA traps.',
        teachingMoments: [
          'Choosing the right pattern under pressure',
          'Recursion base-case awareness',
          'Final exam triage and confidence building',
        ],
        practiceSectionId: 'mixed-review',
        practiceStart: 0,
        practiceCount: 15,
      },
    ],
  },
];

export const totalJourneyMinutes = 600;
