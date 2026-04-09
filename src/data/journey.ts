export type CourseLevel = {
  id: string;
  title: string;
  subtitle: string;
  pacing: string;
  target: string;
  recommended?: boolean;
};

export type CedSubunit = {
  code: string;
  title: string;
  explanation: string;
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
  subunitCodes: string[];
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

export const cedSubunitCatalog: Record<string, CedSubunit> = {
  '1.1': {
    code: '1.1',
    title: 'Introduction to Algorithms, Programming, and Compilers',
    explanation:
      'You learn what an algorithm is and how programs turn logic into executable code. This topic also covers how compilers translate Java so the computer can actually run it.',
  },
  '1.2': {
    code: '1.2',
    title: 'Variables and Data Types',
    explanation:
      'Variables store data, and each one has a type like int, double, or boolean. The type determines what values fit and what operations Java allows.',
  },
  '1.3': {
    code: '1.3',
    title: 'Expressions and Output',
    explanation:
      'Expressions combine values and operators to produce results. You also learn how to display results with System.out.print and trace evaluation order correctly.',
  },
  '1.4': {
    code: '1.4',
    title: 'Assignment Statements and Input',
    explanation:
      'Assignment updates the value inside a variable over time. This topic also introduces the idea of getting data into a program so later lines can react to it.',
  },
  '1.5': {
    code: '1.5',
    title: 'Casting and Range of Variables',
    explanation:
      'Casting converts one data type into another, such as double to int. You also study range limits, overflow, and precision loss so you can avoid subtle bugs.',
  },
  '1.6': {
    code: '1.6',
    title: 'Compound Assignment Operators',
    explanation:
      'Shortcuts like += and -= combine math and assignment in one step. These operators show up constantly in loops, counters, and score updates.',
  },
  '1.7': {
    code: '1.7',
    title: 'Application Program Interface (API) and Libraries',
    explanation:
      'APIs are prebuilt Java tools such as Math and String. Instead of reinventing everything, you learn how to call existing methods and use the library correctly.',
  },
  '1.8': {
    code: '1.8',
    title: 'Documentation with Comments',
    explanation:
      'Comments explain code for humans instead of the compiler. They make programs easier to read and maintain, which matters when you are writing clear exam solutions.',
  },
  '1.9': {
    code: '1.9',
    title: 'Method Signatures',
    explanation:
      'A method signature tells you the method name, parameter list, and return type. Reading signatures well is the key to calling methods with the correct inputs and expectations.',
  },
  '1.10': {
    code: '1.10',
    title: 'Calling Class Methods',
    explanation:
      'This topic introduces calling static methods like Math.random(). Because the method belongs to the class, you do not need an object first.',
  },
  '1.11': {
    code: '1.11',
    title: 'Math Class',
    explanation:
      'The Math class gives you built-in methods like abs, pow, and sqrt. These let you solve calculations cleanly without writing the math logic yourself.',
  },
  '1.12': {
    code: '1.12',
    title: 'Objects: Instances of Classes',
    explanation:
      'Objects are instances created from class blueprints and they hold both data and behavior. This is your first serious step into object-oriented programming.',
  },
  '1.13': {
    code: '1.13',
    title: 'Object Creation and Storage (Instantiation)',
    explanation:
      'You create objects with new and store references to them in variables. This is how Java programs manage more complex data than simple primitives.',
  },
  '1.14': {
    code: '1.14',
    title: 'Calling Instance Methods',
    explanation:
      'Instance methods are called on specific objects, such as str.length(). These methods use the data already stored in that object, which makes them different from static methods.',
  },
  '1.15': {
    code: '1.15',
    title: 'String Manipulation',
    explanation:
      'Strings are objects with methods like substring, indexOf, and equals. These methods show up often on APCSA because they test indexing, return values, and careful tracing.',
  },
  '2.1': {
    code: '2.1',
    title: 'Algorithms with Selection and Repetition',
    explanation:
      'Programs need to make decisions and repeat steps. This topic introduces the control-flow ideas behind conditionals and loops.',
  },
  '2.2': {
    code: '2.2',
    title: 'Boolean Expressions',
    explanation:
      'Boolean expressions evaluate to true or false and drive the decisions in your program. You need to read comparisons and logical operators with precision.',
  },
  '2.3': {
    code: '2.3',
    title: 'if Statements',
    explanation:
      'if statements run code only when a condition is true. They are the simplest branching structure and the foundation for more complex decision logic.',
  },
  '2.4': {
    code: '2.4',
    title: 'Nested if Statements',
    explanation:
      'You can place one if statement inside another to create more detailed decisions. The challenge is keeping track of which branch you are actually in.',
  },
  '2.5': {
    code: '2.5',
    title: 'Compound Boolean Expressions',
    explanation:
      'You combine multiple conditions with &&, ||, and ! to express more exact rules. Grouping and order matter because the meaning changes quickly.',
  },
  '2.6': {
    code: '2.6',
    title: 'Comparing Boolean Expressions',
    explanation:
      'This topic trains you to compare different boolean expressions and decide whether they behave the same way. It helps you catch logic mistakes before they spread.',
  },
  '2.7': {
    code: '2.7',
    title: 'while Loops',
    explanation:
      'while loops repeat as long as a condition remains true. They are powerful when the number of repetitions is not known ahead of time, but infinite loops are a common trap.',
  },
  '2.8': {
    code: '2.8',
    title: 'for Loops',
    explanation:
      'for loops package the start value, stop condition, and update in one place. They are one of the most tested loop structures on the AP exam.',
  },
  '2.9': {
    code: '2.9',
    title: 'Implementing Selection and Iteration Algorithms',
    explanation:
      'This is where conditionals and loops combine into full algorithms. You are expected to trace and build logic that solves actual problems instead of isolated syntax drills.',
  },
  '2.10': {
    code: '2.10',
    title: 'Implementing String Algorithms',
    explanation:
      'String algorithms use loops and conditionals to inspect characters, count patterns, or test conditions. These patterns appear often in multiple-choice and FRQ prompts.',
  },
  '2.11': {
    code: '2.11',
    title: 'Nested Iteration',
    explanation:
      'Nested loops let you repeat work inside repeated work, which is useful for comparisons, patterns, and grids. They can grow in cost quickly, so careful tracing matters.',
  },
  '2.12': {
    code: '2.12',
    title: 'Informal Run-Time Analysis',
    explanation:
      'This topic asks you to reason about how efficient code is without heavy math. The main idea is recognizing how loops and nested loops affect running time.',
  },
  '3.1': {
    code: '3.1',
    title: 'Abstraction and Program Design',
    explanation:
      'Abstraction helps you focus on what matters and hide unnecessary details. It is a major design idea behind both classes and clean problem solving.',
  },
  '3.2': {
    code: '3.2',
    title: 'Impact of Program Design',
    explanation:
      'Design choices affect readability, maintainability, efficiency, and how people experience software. This topic also asks you to think about the broader impact of code.',
  },
  '3.3': {
    code: '3.3',
    title: 'Anatomy of a Class',
    explanation:
      'A class is a blueprint that defines fields and methods. Understanding how those parts fit together is the basis of FRQ 2 and object-oriented programming.',
  },
  '3.4': {
    code: '3.4',
    title: 'Constructors',
    explanation:
      'Constructors run when objects are created and establish their starting state. Most APCSA class questions expect you to understand what gets initialized and how.',
  },
  '3.5': {
    code: '3.5',
    title: 'Methods: How to Write Them',
    explanation:
      'Methods package useful behavior into reusable blocks. You need to match headers, parameters, return types, and logic to the exact job the prompt describes.',
  },
  '3.6': {
    code: '3.6',
    title: 'Methods: Passing and Returning References of an Object',
    explanation:
      'Objects can be passed into methods and returned from methods by reference. This lets different parts of a program work with the same underlying object data.',
  },
  '3.7': {
    code: '3.7',
    title: 'Class Variables and Methods',
    explanation:
      'Static variables and methods belong to the class rather than one object instance. They are useful when data or behavior should be shared across every object.',
  },
  '3.8': {
    code: '3.8',
    title: 'Scope and Access',
    explanation:
      'Scope controls where variables can be used, and access modifiers control what other code can see. These ideas protect class state and prevent accidental misuse.',
  },
  '3.9': {
    code: '3.9',
    title: 'this Keyword',
    explanation:
      'this refers to the current object. It is especially helpful in constructors and methods when parameter names match instance variable names.',
  },
  '4.1': {
    code: '4.1',
    title: 'Ethical and Social Issues Around Data Collection',
    explanation:
      'Data collection has privacy, bias, and fairness consequences. This topic reminds you that code decisions affect real people and systems.',
  },
  '4.2': {
    code: '4.2',
    title: 'Introduction to Using Data Sets',
    explanation:
      'Programs often work with large groups of related values rather than one variable at a time. This topic sets up arrays, collections, and data-processing patterns.',
  },
  '4.3': {
    code: '4.3',
    title: 'Array Creation and Access',
    explanation:
      'Arrays store multiple values of the same type in indexed order. You must create them correctly and access elements with legal indexes.',
  },
  '4.4': {
    code: '4.4',
    title: 'Array Traversals',
    explanation:
      'Traversing an array means visiting elements with a loop so you can inspect or update them. This pattern appears in almost every array-based AP problem.',
  },
  '4.5': {
    code: '4.5',
    title: 'Implementing Array Algorithms',
    explanation:
      'Array algorithms usually follow patterns such as sum, count, maximum, search, or replacement. Learning those patterns saves time on both MCQ and FRQ work.',
  },
  '4.6': {
    code: '4.6',
    title: 'Using Text Files',
    explanation:
      'Text files let a program read larger inputs instead of hard-coded data. The exam does not lean on this heavily, but it matters for understanding how programs scale up.',
  },
  '4.7': {
    code: '4.7',
    title: 'Wrapper Classes',
    explanation:
      'Wrapper classes such as Integer turn primitive values into objects. This matters because collections like ArrayList store objects, not raw primitives.',
  },
  '4.8': {
    code: '4.8',
    title: 'ArrayList Methods',
    explanation:
      'ArrayLists are resizable collections with methods such as add, remove, get, and set. They are more flexible than arrays, but the method vocabulary must be precise.',
  },
  '4.9': {
    code: '4.9',
    title: 'ArrayList Traversals',
    explanation:
      'You traverse an ArrayList with loops just like arrays, but you use size() and collection methods instead of length and brackets. Index shifts after removal are especially important.',
  },
  '4.10': {
    code: '4.10',
    title: 'Implementing ArrayList Algorithms',
    explanation:
      'This topic applies common counting, searching, and updating patterns to ArrayLists. Because elements can be inserted or removed, you also need to think about changing indexes.',
  },
  '4.11': {
    code: '4.11',
    title: '2D Array Creation and Access',
    explanation:
      '2D arrays organize data in rows and columns like a grid. Access requires two indexes, and mixing them up creates fast mistakes.',
  },
  '4.12': {
    code: '4.12',
    title: '2D Array Traversals',
    explanation:
      'Traversing a 2D array almost always means nested loops. Order matters because row-major traversal behaves differently from other patterns.',
  },
  '4.13': {
    code: '4.13',
    title: 'Implementing 2D Array Algorithms',
    explanation:
      '2D array algorithms solve grid problems such as sums, counts, patterns, and position tracking. This is one of the most common FRQ areas in APCSA.',
  },
  '4.14': {
    code: '4.14',
    title: 'Searching Algorithms',
    explanation:
      'Searching algorithms locate specific values in a structure. Linear search is the most common APCSA pattern, and you should also reason about when sorted data changes the strategy.',
  },
  '4.15': {
    code: '4.15',
    title: 'Sorting Algorithms',
    explanation:
      'Sorting arranges data into order so later operations become easier. APCSA focuses on understanding the process behind simple sorts more than memorizing every line of code.',
  },
  '4.16': {
    code: '4.16',
    title: 'Recursion',
    explanation:
      'Recursion happens when a method calls itself on a smaller version of the problem. A solid base case is what keeps the process from running forever.',
  },
  '4.17': {
    code: '4.17',
    title: 'Recursive Searching and Sorting',
    explanation:
      'This topic applies recursion to algorithms such as searching and sorting. The key is understanding how the problem shrinks and why each recursive call eventually stops.',
  },
};

export function getLessonCedSubunits(lesson: JourneyLesson): CedSubunit[] {
  return lesson.subunitCodes
    .map((code) => cedSubunitCatalog[code])
    .filter((subunit): subunit is CedSubunit => Boolean(subunit));
}

export const journeyUnits: JourneyUnit[] = [
  {
    id: 'unit-1',
    title: 'Unit 1: Using Objects and Methods',
    duration: '2 hr 55 min',
    mentorKey: 'byte',
    examWeight: '15-25% of the AP exam',
    description:
      'Learn Java basics, method calls, Strings, Math, object creation, and the tracing habits that make later units much easier.',
    lessons: [
      {
        id: 'u1-l1',
        missionId: 'mission-1',
        unitId: 'unit-1',
        title: 'CED 1.1-1.4 Foundations',
        duration: '45 min',
        objective: 'Build the first layer of Java fluency by tracing algorithms, variables, expressions, assignment, and output.',
        teachingMoments: [
          'Algorithms become code one line at a time',
          'Types control what values and operations make sense',
          'Assignment changes program state across time',
        ],
        practiceSectionId: 'unit-1',
        practiceStart: 0,
        practiceCount: 7,
        subunitCodes: ['1.1', '1.2', '1.3', '1.4'],
      },
      {
        id: 'u1-l2',
        missionId: 'mission-2',
        unitId: 'unit-1',
        title: 'CED 1.5-1.8 Casting, APIs, and Comments',
        duration: '45 min',
        objective: 'Use casts, compound assignment, libraries, and comments without losing track of what Java is actually doing.',
        teachingMoments: [
          'Casting changes type but may lose precision',
          'Compound operators compress common update patterns',
          'APIs and comments both support readable problem solving',
        ],
        practiceSectionId: 'unit-1',
        practiceStart: 7,
        practiceCount: 7,
        subunitCodes: ['1.5', '1.6', '1.7', '1.8'],
      },
      {
        id: 'u1-l3',
        missionId: 'mission-2',
        unitId: 'unit-1',
        title: 'CED 1.9-1.11 Method Signatures and Math',
        duration: '45 min',
        objective: 'Read method signatures correctly, call class methods with confidence, and use Math methods the AP way.',
        teachingMoments: [
          'Method signatures tell you exactly how to call a method',
          'Static class methods do not need an object instance',
          'Math methods are fast wins when you recognize them',
        ],
        practiceSectionId: 'unit-1',
        practiceStart: 14,
        practiceCount: 8,
        subunitCodes: ['1.9', '1.10', '1.11'],
      },
      {
        id: 'u1-l4',
        missionId: 'mission-3',
        unitId: 'unit-1',
        title: 'CED 1.12-1.15 Objects and Strings',
        duration: '40 min',
        objective: 'Move from primitives into object references, instance methods, and String operations that appear all over APCSA.',
        teachingMoments: [
          'Objects combine stored state and behavior',
          'new creates and stores a reference to one instance',
          'String methods return values that must be traced carefully',
        ],
        practiceSectionId: 'unit-1',
        practiceStart: 22,
        practiceCount: 8,
        subunitCodes: ['1.12', '1.13', '1.14', '1.15'],
      },
    ],
  },
  {
    id: 'unit-2',
    title: 'Unit 2: Selection and Iteration',
    duration: '2 hr 30 min',
    mentorKey: 'loop',
    examWeight: '25-35% of the AP exam',
    description:
      'Master boolean logic, if-statements, loops, nested iteration, and the tracing skills that dominate APCSA multiple choice.',
    lessons: [
      {
        id: 'u2-l1',
        missionId: 'mission-4',
        unitId: 'unit-2',
        title: 'CED 2.1-2.3 Selection Basics',
        duration: '35 min',
        objective: 'Understand control flow, boolean conditions, and simple if statements before the logic gets layered.',
        teachingMoments: [
          'Programs branch only when conditions are read exactly',
          'Boolean expressions are the language of decisions',
          'if statements are the first real control-flow gate',
        ],
        practiceSectionId: 'unit-2',
        practiceStart: 0,
        practiceCount: 7,
        subunitCodes: ['2.1', '2.2', '2.3'],
      },
      {
        id: 'u2-l2',
        missionId: 'mission-4',
        unitId: 'unit-2',
        title: 'CED 2.4-2.6 Nested and Compound Logic',
        duration: '35 min',
        objective: 'Handle nested branches and compound conditions without losing the meaning of the original rule.',
        teachingMoments: [
          'Nested if statements add structure and confusion at the same time',
          'Compound logic changes meaning based on grouping',
          'Equivalent expressions may look different but behave the same',
        ],
        practiceSectionId: 'unit-2',
        practiceStart: 7,
        practiceCount: 7,
        subunitCodes: ['2.4', '2.5', '2.6'],
      },
      {
        id: 'u2-l3',
        missionId: 'mission-5',
        unitId: 'unit-2',
        title: 'CED 2.7-2.8 Loop Structures',
        duration: '40 min',
        objective: 'Master while loops and for loops by tracing initialization, conditions, updates, and stopping points.',
        teachingMoments: [
          'A loop needs a valid start, stop, and update',
          'while loops fit unknown repetition counts',
          'for loops are compact and heavily tested',
        ],
        practiceSectionId: 'unit-2',
        practiceStart: 14,
        practiceCount: 8,
        subunitCodes: ['2.7', '2.8'],
      },
      {
        id: 'u2-l4',
        missionId: 'mission-5',
        unitId: 'unit-2',
        title: 'CED 2.9-2.12 Algorithms, Strings, and Run Time',
        duration: '40 min',
        objective: 'Combine selection and iteration into full algorithms, then reason about string work, nested loops, and efficiency.',
        teachingMoments: [
          'Algorithms blend decision logic with repetition',
          'String algorithms reward careful character-by-character tracing',
          'Nested loops often drive the run-time story',
        ],
        practiceSectionId: 'unit-2',
        practiceStart: 22,
        practiceCount: 8,
        subunitCodes: ['2.9', '2.10', '2.11', '2.12'],
      },
    ],
  },
  {
    id: 'unit-3',
    title: 'Unit 3: Class Creation',
    duration: '1 hr 50 min',
    mentorKey: 'classer',
    examWeight: '10-18% of the AP exam',
    description:
      'Build classes that match a specification, use constructors correctly, and earn easy FRQ 2 points with clean structure.',
    lessons: [
      {
        id: 'u3-l1',
        missionId: 'mission-6',
        unitId: 'unit-3',
        title: 'CED 3.1-3.3 Design and Class Anatomy',
        duration: '35 min',
        objective: 'Start Unit 3 with abstraction, program design impact, and the structural pieces that define a class.',
        teachingMoments: [
          'Abstraction keeps design focused on what matters',
          'Program design affects people, systems, and maintainability',
          'A class blueprint combines state and behavior',
        ],
        practiceSectionId: 'unit-3',
        practiceStart: 0,
        practiceCount: 10,
        subunitCodes: ['3.1', '3.2', '3.3'],
      },
      {
        id: 'u3-l2',
        missionId: 'mission-6',
        unitId: 'unit-3',
        title: 'CED 3.4-3.6 Constructors and Method Design',
        duration: '40 min',
        objective: 'Write constructors and methods that set up objects correctly and move references through a program safely.',
        teachingMoments: [
          'Constructors establish initial object state',
          'Method headers and return types must match the contract',
          'Reference passing changes how objects interact across methods',
        ],
        practiceSectionId: 'unit-3',
        practiceStart: 10,
        practiceCount: 10,
        subunitCodes: ['3.4', '3.5', '3.6'],
      },
      {
        id: 'u3-l3',
        missionId: 'mission-6',
        unitId: 'unit-3',
        title: 'CED 3.7-3.9 Static, Scope, and this',
        duration: '35 min',
        objective: 'Finish the class-creation unit by separating static behavior, variable scope, access control, and the this keyword.',
        teachingMoments: [
          'Static members belong to the class rather than one object',
          'Scope and access rules protect data from bad edits',
          'this helps you refer to the current object precisely',
        ],
        practiceSectionId: 'unit-3',
        practiceStart: 20,
        practiceCount: 10,
        subunitCodes: ['3.7', '3.8', '3.9'],
      },
    ],
  },
  {
    id: 'unit-4',
    title: 'Unit 4: Data Collections',
    duration: '2 hr 45 min',
    mentorKey: 'array',
    examWeight: '30-40% of the AP exam',
    description:
      'Train the heaviest exam unit: arrays, ArrayLists, 2D arrays, searching, sorting, recursion, and the algorithms behind FRQ 3 and FRQ 4.',
    lessons: [
      {
        id: 'u4-l1',
        missionId: 'mission-7',
        unitId: 'unit-4',
        title: 'CED 4.1-4.4 Data Sets and Arrays',
        duration: '30 min',
        objective: 'Start the data unit with data ethics, data-set thinking, array creation, and safe array traversal.',
        teachingMoments: [
          'Data decisions have ethical consequences',
          'Collections exist to manage larger groups of values',
          'Array traversal is the foundation for almost every later algorithm',
        ],
        practiceSectionId: 'unit-4',
        practiceStart: 0,
        practiceCount: 6,
        subunitCodes: ['4.1', '4.2', '4.3', '4.4'],
      },
      {
        id: 'u4-l2',
        missionId: 'mission-7',
        unitId: 'unit-4',
        title: 'CED 4.5-4.7 Array Algorithms and Wrappers',
        duration: '30 min',
        objective: 'Turn traversal into real array algorithms while understanding files and the wrapper classes needed by collections.',
        teachingMoments: [
          'Sum, count, and max are reusable array patterns',
          'Files help scale beyond hard-coded data',
          'Wrapper classes connect primitives to object-based collections',
        ],
        practiceSectionId: 'unit-4',
        practiceStart: 6,
        practiceCount: 6,
        subunitCodes: ['4.5', '4.6', '4.7'],
      },
      {
        id: 'u4-l3',
        missionId: 'mission-8',
        unitId: 'unit-4',
        title: 'CED 4.8-4.10 ArrayLists',
        duration: '35 min',
        objective: 'Use ArrayList methods, traverse dynamic collections safely, and apply common mutation and search patterns.',
        teachingMoments: [
          'ArrayLists trade fixed size for method-based control',
          'Traversal rules change when size can grow or shrink',
          'Mutation algorithms must respect shifting indexes',
        ],
        practiceSectionId: 'unit-4',
        practiceStart: 12,
        practiceCount: 6,
        subunitCodes: ['4.8', '4.9', '4.10'],
      },
      {
        id: 'u4-l4',
        missionId: 'mission-9',
        unitId: 'unit-4',
        title: 'CED 4.11-4.13 2D Arrays',
        duration: '35 min',
        objective: 'Build row and column awareness so 2D traversal and FRQ-style grid algorithms stay organized.',
        teachingMoments: [
          'Rows and columns must never be mentally swapped',
          'Nested traversal needs the correct row-based bounds',
          'Grid algorithms reward a consistent row-major plan',
        ],
        practiceSectionId: 'unit-4',
        practiceStart: 18,
        practiceCount: 6,
        subunitCodes: ['4.11', '4.12', '4.13'],
      },
      {
        id: 'u4-l5',
        missionId: 'mission-10',
        unitId: 'unit-4',
        title: 'CED 4.14-4.17 Search, Sort, and Recursion',
        duration: '35 min',
        objective: 'Close the course with algorithm choice: when to search, when to sort, and when recursion is the cleanest tool.',
        teachingMoments: [
          'Search and sort questions test both process and purpose',
          'Recursion only works when the problem shrinks toward a base case',
          'Algorithm choice is a big part of score-5 thinking',
        ],
        practiceSectionId: 'unit-4',
        practiceStart: 24,
        practiceCount: 6,
        subunitCodes: ['4.14', '4.15', '4.16', '4.17'],
      },
    ],
  },
];

export const totalJourneyMinutes = 600;
