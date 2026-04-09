export type QuizChallenge = {
  id: string;
  type: 'quiz';
  prompt: string;
  options: {
    id: string;
    text: string;
  }[];
  answer: string;
  explanation: string;
};

export type FillBlank = {
  id: string;
  label: string;
  answer: string;
  alternates?: string[];
};

export type FillChallenge = {
  id: string;
  type: 'fill';
  prompt: string;
  snippet: string[];
  blanks: FillBlank[];
  explanation: string;
};

export type Mission = {
  id: string;
  title: string;
  arc: string;
  unit: string;
  duration: string;
  xp: number;
  mentor: keyof typeof mentorRoster;
  examWeight: string;
  focus: string;
  officialTopics: string[];
  story: string;
  lesson: string;
  bossMove: string;
  challenges: Array<QuizChallenge | FillChallenge>;
};

export const mentorRoster = {
  byte: {
    name: 'Byte Scout',
    role: 'syntax ranger',
    palette: {
      A: '#101827',
      B: '#f7d354',
      C: '#ef7b45',
      D: '#ffd8a8',
      E: '#ffffff',
      F: '#4fd1c5',
      G: '#214f6b',
    },
    pixels: [
      '..AAAA..',
      '.ABBBBA.',
      'ABCDCDBA',
      'ABEEEEBA',
      'ABFAAFBA',
      '.AGAAGA.',
      '.A....A.',
      'A.A..A.A',
    ],
  },
  loop: {
    name: 'Loop Lynx',
    role: 'control-flow tracker',
    palette: {
      A: '#0e1b2a',
      B: '#87c95c',
      C: '#d8f7a1',
      D: '#ffffff',
      E: '#3a6b2f',
      F: '#ffad5a',
    },
    pixels: [
      'A......A',
      '.AB..BA.',
      '.BCCCB..',
      'ACDDDDCA',
      'ACEDDECA',
      '.ACEECA.',
      '.AF..FA.',
      'A.A..A.A',
    ],
  },
  classer: {
    name: 'Captain Class',
    role: 'design architect',
    palette: {
      A: '#101827',
      B: '#70b7ff',
      C: '#d8ecff',
      D: '#ffffff',
      E: '#ff8f70',
      F: '#275c96',
      G: '#f6c453',
    },
    pixels: [
      '..AAAA..',
      '.ABBBBA.',
      'ABCDCDBA',
      'ABEEEEBA',
      '.AFGGFA.',
      '.AFBBFA.',
      '.A.FF.A.',
      'A.A..A.A',
    ],
  },
  array: {
    name: 'Array Archivist',
    role: 'data vault keeper',
    palette: {
      A: '#11192a',
      B: '#9d7dff',
      C: '#dbc8ff',
      D: '#ffffff',
      E: '#f6c453',
      F: '#26c6da',
      G: '#4a2d88',
    },
    pixels: [
      '..BBBB..',
      '.BCC C B.',
      'BCDDD DCB',
      'BCDFFDCB',
      '.BGEEGB.',
      '.BGEEGB.',
      '.A.BB.A.',
      'A.A..A.A',
    ].map((row) => row.split(' ').join('')),
  },
} as const;

export const examBlueprint = {
  totalTime: '10 hours',
  examFormat: '42 multiple-choice questions + 4 free-response questions',
  source:
    'Built from the AP Computer Science A Course and Exam Description, effective Fall 2025.',
  unitWeights: [
    'Unit 1: Using Objects and Methods (15–25%)',
    'Unit 2: Selection and Iteration (25–35%)',
    'Unit 3: Class Creation (10–18%)',
    'Unit 4: Data Collections (30–40%)',
  ],
};

export const frqBlueprint = [
  {
    title: 'FRQ 1: Methods and Control Structures',
    cue: 'Write one constructor/method pair or two methods with loops, conditionals, and String work.',
  },
  {
    title: 'FRQ 2: Class Design',
    cue: 'Build a class with instance variables, a constructor, and behavior that matches examples.',
  },
  {
    title: 'FRQ 3: Data Analysis with ArrayList',
    cue: 'Traverse, filter, and update ArrayList data without breaking indexing.',
  },
  {
    title: 'FRQ 4: 2D Array',
    cue: 'Navigate rows and columns carefully and track counts, sums, or positions.',
  },
];

export const missions: Mission[] = [
  {
    id: 'mission-1',
    title: 'Boot Camp Terminal',
    arc: 'Java startup systems',
    unit: 'Unit 1',
    duration: '50 min',
    xp: 90,
    mentor: 'byte',
    examWeight: 'Foundational language fluency',
    focus: 'variables, data types, expressions, output',
    officialTopics: ['1.1', '1.2', '1.3'],
    story:
      'Byte Scout helps you repair a silent training terminal by choosing the right data types and rebuilding the first output statements.',
    lesson:
      'APCSA rewards precision early. Integers store whole numbers, doubles store decimals, booleans store true/false, and String values hold text. Many multiple-choice questions are really tracing questions: can you predict what each line stores or prints?',
    bossMove:
      'Say out loud what every variable means before tracing its value. That habit pays off across the full exam.',
    challenges: [
      {
        id: 'm1-q1',
        type: 'quiz',
        prompt: 'Which data type is the best match for a variable that stores whether a robot door is unlocked?',
        options: [
          { id: 'a', text: 'int' },
          { id: 'b', text: 'double' },
          { id: 'c', text: 'boolean' },
          { id: 'd', text: 'String' },
        ],
        answer: 'c',
        explanation:
          'A boolean stores only true or false, which matches a locked/unlocked style condition exactly.',
      },
      {
        id: 'm1-q2',
        type: 'quiz',
        prompt: 'What is printed by this code? `int x = 4; double y = 2.5; System.out.println(x + y);`',
        options: [
          { id: 'a', text: '6' },
          { id: 'b', text: '6.0' },
          { id: 'c', text: '6.5' },
          { id: 'd', text: '42.5' },
        ],
        answer: 'c',
        explanation:
          'The int is promoted to a double during addition, so the result is the decimal value 6.5.',
      },
      {
        id: 'm1-fill',
        type: 'fill',
        prompt: 'Complete the code so it stores a score and prints it with a label.',
        snippet: [
          'int score = __score__;',
          'System.out.println("Score: " + __value__);',
        ],
        blanks: [
          { id: 'score', label: 'initial score literal', answer: '5' },
          {
            id: 'value',
            label: 'variable to print',
            answer: 'score',
          },
        ],
        explanation:
          'The first blank initializes the variable, and the second blank should reference the variable name so the output updates from storage rather than a hard-coded copy.',
      },
    ],
  },
  {
    id: 'mission-2',
    title: 'Method Mountain',
    arc: 'API climbing',
    unit: 'Unit 1',
    duration: '55 min',
    xp: 100,
    mentor: 'byte',
    examWeight: 'Strings, Math, and method calls show up constantly',
    focus: 'assignment, casting, Math, String, signatures',
    officialTopics: ['1.4', '1.5', '1.9', '1.10', '1.11', '1.15'],
    story:
      'You climb a mountain of helper methods, learning when Java returns a value, when to cast, and how String tools carve paths through text.',
    lesson:
      'On the exam, method questions usually test three things at once: argument types, return values, and whether the programmer actually stored the returned result. Strings are immutable, so methods like substring create a new string instead of changing the original.',
    bossMove:
      'Whenever a method returns something, ask: where does that value go next?',
    challenges: [
      {
        id: 'm2-q1',
        type: 'quiz',
        prompt: 'Which expression returns the length of the String variable `name`?',
        options: [
          { id: 'a', text: 'name.length' },
          { id: 'b', text: 'name.length()' },
          { id: 'c', text: 'String.length(name)' },
          { id: 'd', text: 'length(name)' },
        ],
        answer: 'b',
        explanation:
          'For String objects, `length()` is an instance method and must include parentheses.',
      },
      {
        id: 'm2-q2',
        type: 'quiz',
        prompt: 'What does `(int) 7.9` evaluate to in Java?',
        options: [
          { id: 'a', text: '8' },
          { id: 'b', text: '7.9' },
          { id: 'c', text: '7' },
          { id: 'd', text: 'compile error' },
        ],
        answer: 'c',
        explanation:
          'Casting a positive double to int truncates the decimal part instead of rounding.',
      },
      {
        id: 'm2-fill',
        type: 'fill',
        prompt: 'Use String and Math methods to complete the mini utility.',
        snippet: [
          'String tag = hero.__first__(0, 1).toUpperCase();',
          'int roll = (int) (Math.random() * __range__);',
          'return tag + roll;',
        ],
        blanks: [
          {
            id: 'first',
            label: 'String method',
            answer: 'substring',
          },
          {
            id: 'range',
            label: 'exclusive upper bound',
            answer: '10',
          },
        ],
        explanation:
          '`substring(0, 1)` captures the first character. Multiplying `Math.random()` by 10 gives integer results from 0 through 9 after casting.',
      },
    ],
  },
  {
    id: 'mission-3',
    title: 'Object Outpost',
    arc: 'instances and behaviors',
    unit: 'Unit 1',
    duration: '60 min',
    xp: 105,
    mentor: 'classer',
    examWeight: 'Objects and instance methods unlock later FRQs',
    focus: 'objects, instantiation, instance methods',
    officialTopics: ['1.12', '1.13', '1.14'],
    story:
      'Captain Class runs an outpost where every tool is an object. Your job is to instantiate gear correctly and call the right instance methods to move the mission forward.',
    lesson:
      'A class is the blueprint, while an object is a specific instance created from that blueprint. APCSA often checks whether you can tell the difference between a reference variable, the constructor call, and a later instance method call on the created object.',
    bossMove:
      'If you see `new`, think “create one object now.” If you see `objectName.method()`, think “ask that object to do something.”',
    challenges: [
      {
        id: 'm3-q1',
        type: 'quiz',
        prompt: 'What does the keyword `new` do in APCSA-level Java?',
        options: [
          { id: 'a', text: 'Declares a method' },
          { id: 'b', text: 'Creates an object' },
          { id: 'c', text: 'Imports a library' },
          { id: 'd', text: 'Returns from a constructor' },
        ],
        answer: 'b',
        explanation:
          '`new` calls a constructor and creates a fresh object in memory.',
      },
      {
        id: 'm3-q2',
        type: 'quiz',
        prompt: 'If `String word = "java";`, which call returns `"va"`?',
        options: [
          { id: 'a', text: 'word.substring(1, 3)' },
          { id: 'b', text: 'word.substring(2)' },
          { id: 'c', text: 'word.substring(0, 2)' },
          { id: 'd', text: 'word.substring(2, 3)' },
        ],
        answer: 'b',
        explanation:
          '`substring(2)` starts at index 2 and continues to the end, producing `"va"`.',
      },
      {
        id: 'm3-fill',
        type: 'fill',
        prompt: 'Instantiate the object and call its method.',
        snippet: [
          'Scanner input = __new__ Scanner(System.in);',
          'String line = input.__call__();',
        ],
        blanks: [
          { id: 'new', label: 'keyword', answer: 'new' },
          { id: 'call', label: 'Scanner method', answer: 'nextLine' },
        ],
        explanation:
          'A constructor call needs `new`, and `nextLine()` reads a full line from the Scanner.',
      },
    ],
  },
  {
    id: 'mission-4',
    title: 'Boolean Bog',
    arc: 'decision making under pressure',
    unit: 'Unit 2',
    duration: '60 min',
    xp: 110,
    mentor: 'loop',
    examWeight: 'Selection and condition tracing are a major MCQ source',
    focus: 'boolean expressions, if, nested if, compound logic',
    officialTopics: ['2.2', '2.3', '2.4', '2.5', '2.6'],
    story:
      'Loop Lynx leads you through a foggy swamp where one wrong condition triggers a trap. You survive by reading boolean logic exactly as Java does.',
    lesson:
      'Boolean questions become easier when you simplify step by step. Test one comparison at a time, then combine them with `&&`, `||`, or `!`. Nested conditionals are just branches inside branches, not a different concept.',
    bossMove:
      'For compound booleans, rewrite the expression in plain English before deciding whether it is true.',
    challenges: [
      {
        id: 'm4-q1',
        type: 'quiz',
        prompt: 'When is `score >= 80 && score < 90` true?',
        options: [
          { id: 'a', text: 'Only for scores from 80 through 89' },
          { id: 'b', text: 'Only for scores above 90' },
          { id: 'c', text: 'For any positive score' },
          { id: 'd', text: 'Only for 80 and 90' },
        ],
        answer: 'a',
        explanation:
          'Both sides must be true at the same time, so the score must be at least 80 and still less than 90.',
      },
      {
        id: 'm4-q2',
        type: 'quiz',
        prompt: 'Which expression is equivalent to `!(x < 5)`?',
        options: [
          { id: 'a', text: 'x < 5' },
          { id: 'b', text: 'x <= 5' },
          { id: 'c', text: 'x >= 5' },
          { id: 'd', text: 'x > 5' },
        ],
        answer: 'c',
        explanation:
          'Not less than 5 means greater than or equal to 5.',
      },
      {
        id: 'm4-fill',
        type: 'fill',
        prompt: 'Complete the conditional so the scholarship badge is awarded for scores 90 or higher.',
        snippet: [
          'if (score __compare__ 90) {',
          '  badge = "__label__";',
          '}',
        ],
        blanks: [
          { id: 'compare', label: 'comparison operator', answer: '>=' },
          { id: 'label', label: 'badge text', answer: 'Scholar' },
        ],
        explanation:
          'Using `>=` includes exactly 90, which matters often in APCSA boundary questions.',
      },
    ],
  },
  {
    id: 'mission-5',
    title: 'Loop Labyrinth',
    arc: 'repetition and tracing',
    unit: 'Unit 2',
    duration: '65 min',
    xp: 115,
    mentor: 'loop',
    examWeight: 'Loops dominate both MCQ tracing and FRQ algorithms',
    focus: 'while loops, for loops, nested iteration, runtime intuition',
    officialTopics: ['2.7', '2.8', '2.11', '2.12'],
    story:
      'The labyrinth only opens for programmers who can predict exactly how many times a loop runs and what changes inside each pass.',
    lesson:
      'Loop questions usually come down to initialization, stopping condition, and update. For nested loops, multiply the work of the outer loop by the work of the inner loop. If a loop skips or repeats an index, that detail usually explains the bug.',
    bossMove:
      'Trace with a tiny table: variable, current value, next value. It is faster than guessing.',
    challenges: [
      {
        id: 'm5-q1',
        type: 'quiz',
        prompt: 'How many values does this loop print? `for (int i = 1; i <= 4; i++)`',
        options: [
          { id: 'a', text: '3' },
          { id: 'b', text: '4' },
          { id: 'c', text: '5' },
          { id: 'd', text: 'It never stops' },
        ],
        answer: 'b',
        explanation:
          'The values are 1, 2, 3, and 4. The loop runs while `i <= 4` remains true.',
      },
      {
        id: 'm5-q2',
        type: 'quiz',
        prompt: 'What is the main advantage of a `for` loop over a `while` loop in APCSA?',
        options: [
          { id: 'a', text: 'It can use booleans and while cannot' },
          { id: 'b', text: 'It groups start, stop, and update in one header' },
          { id: 'c', text: 'It is always faster at run time' },
          { id: 'd', text: 'It can only run a fixed number of times' },
        ],
        answer: 'b',
        explanation:
          'A `for` loop is especially clear when repetition is controlled by a counter variable.',
      },
      {
        id: 'm5-fill',
        type: 'fill',
        prompt: 'Repair the traversal so it prints indexes 0 through 4.',
        snippet: [
          'for (int i = 0; i __stop__ 5; i__step__) {',
          '  System.out.println(i);',
          '}',
        ],
        blanks: [
          { id: 'stop', label: 'loop condition', answer: '<' },
          { id: 'step', label: 'update', answer: '++', alternates: [' += 1'] },
        ],
        explanation:
          'Stopping at `i < 5` keeps the last printed index at 4, and incrementing by one visits every position.',
      },
    ],
  },
  {
    id: 'mission-6',
    title: 'Class Castle',
    arc: 'design your own type',
    unit: 'Unit 3',
    duration: '55 min',
    xp: 120,
    mentor: 'classer',
    examWeight: 'Direct practice for FRQ 2: Class Design',
    focus: 'class anatomy, constructors, methods, scope, this',
    officialTopics: ['3.3', '3.4', '3.5', '3.8', '3.9'],
    story:
      'Inside the castle, you stop reading classes and start building them. Every door unlocks only if your fields, constructor, and methods match the specification.',
    lesson:
      'FRQ 2 rewards structure. Instance variables store persistent state, constructors initialize it, and methods update or report it. Use `this` when a parameter name matches an instance variable and you need to refer to the field belonging to the object.',
    bossMove:
      'When a prompt gives an example table, mirror it method by method. Don’t improvise extra features.',
    challenges: [
      {
        id: 'm6-q1',
        type: 'quiz',
        prompt: 'Which part of a class is responsible for setting initial instance variable values?',
        options: [
          { id: 'a', text: 'A constructor' },
          { id: 'b', text: 'A comment block' },
          { id: 'c', text: 'A static import' },
          { id: 'd', text: 'The return statement' },
        ],
        answer: 'a',
        explanation:
          'Constructors run when an object is created and are used to initialize the object state.',
      },
      {
        id: 'm6-q2',
        type: 'quiz',
        prompt: 'Why might a constructor include `this.score = score;`?',
        options: [
          { id: 'a', text: 'To create a local variable named `this`' },
          { id: 'b', text: 'To assign the parameter to the instance variable' },
          { id: 'c', text: 'To return a score value' },
          { id: 'd', text: 'To make score static' },
        ],
        answer: 'b',
        explanation:
          'The left side refers to the field on the object, while the right side is the parameter.',
      },
      {
        id: 'm6-fill',
        type: 'fill',
        prompt: 'Complete the constructor so the object stores its energy.',
        snippet: [
          'public Drone(int energy) {',
          '  __owner__.energy = energy;',
          '}',
        ],
        blanks: [
          { id: 'owner', label: 'reference to the current object', answer: 'this' },
        ],
        explanation:
          '`this` refers to the current object and is the clearest way to disambiguate a field from a parameter with the same name.',
      },
    ],
  },
  {
    id: 'mission-7',
    title: 'Array Canyon',
    arc: 'ordered data survival',
    unit: 'Unit 4',
    duration: '65 min',
    xp: 130,
    mentor: 'array',
    examWeight: 'Arrays are a major bridge from MCQ logic to FRQ data processing',
    focus: 'array creation, access, traversal, algorithms',
    officialTopics: ['4.3', '4.4', '4.5'],
    story:
      'The canyon is lined with indexed stones. One off-by-one step sends the whole traversal sideways, so the Archivist teaches you how arrays really move.',
    lesson:
      'Arrays use zero-based indexing and fixed length. Most array FRQ work is just careful traversal: visit every element once, keep a running value like a count or sum, and update it only when the condition matches.',
    bossMove:
      'Translate array tasks into a repeatable pattern: loop through, inspect current value, update a tracker.',
    challenges: [
      {
        id: 'm7-q1',
        type: 'quiz',
        prompt: 'What is the last valid index of an array with length 8?',
        options: [
          { id: 'a', text: '8' },
          { id: 'b', text: '7' },
          { id: 'c', text: '6' },
          { id: 'd', text: '9' },
        ],
        answer: 'b',
        explanation:
          'Array indexes begin at 0, so the last valid index is `length - 1`.',
      },
      {
        id: 'm7-q2',
        type: 'quiz',
        prompt: 'Which loop header visits every index of `nums` in order?',
        options: [
          { id: 'a', text: 'for (int i = 1; i <= nums.length; i++)' },
          { id: 'b', text: 'for (int i = 0; i < nums.length; i++)' },
          { id: 'c', text: 'for (int i = 0; i <= nums.length; i++)' },
          { id: 'd', text: 'for (int i = nums.length; i >= 0; i--)' },
        ],
        answer: 'b',
        explanation:
          'Starting at 0 and continuing while `i < nums.length` visits each valid index exactly once.',
      },
      {
        id: 'm7-fill',
        type: 'fill',
        prompt: 'Complete the traversal that sums every element in the array.',
        snippet: [
          'int total = 0;',
          'for (int i = 0; i < values.__size__; i++) {',
          '  total += values[__index__];',
          '}',
        ],
        blanks: [
          { id: 'size', label: 'array length property', answer: 'length' },
          { id: 'index', label: 'current index variable', answer: 'i' },
        ],
        explanation:
          'Arrays use the `length` field, not a method call, and the traversal uses the loop variable to access each element.',
      },
    ],
  },
  {
    id: 'mission-8',
    title: 'ArrayList Arcade',
    arc: 'dynamic collection control',
    unit: 'Unit 4',
    duration: '55 min',
    xp: 135,
    mentor: 'array',
    examWeight: 'Direct setup for FRQ 3',
    focus: 'wrapper classes, ArrayList methods, traversals, updates',
    officialTopics: ['4.7', '4.8', '4.9', '4.10'],
    story:
      'The arcade cabinets shuffle and resize their prize lists. To win, you need ArrayList instincts instead of fixed-size array habits.',
    lesson:
      'ArrayLists grow and shrink, so index management matters. Use `size()` instead of `length`, `get(index)` to access, `set(index, value)` to replace, and be careful when removing elements because later indexes shift left.',
    bossMove:
      'On FRQ 3, underline every collection method in the prompt before writing a line of code.',
    challenges: [
      {
        id: 'm8-q1',
        type: 'quiz',
        prompt: 'Which method returns the number of elements in an `ArrayList<String> names`?',
        options: [
          { id: 'a', text: 'names.length' },
          { id: 'b', text: 'names.length()' },
          { id: 'c', text: 'names.size()' },
          { id: 'd', text: 'names.count()' },
        ],
        answer: 'c',
        explanation:
          'ArrayLists use the `size()` method instead of the array `length` property.',
      },
      {
        id: 'm8-q2',
        type: 'quiz',
        prompt: 'What does `items.set(2, "gem")` do?',
        options: [
          { id: 'a', text: 'Adds "gem" after index 2' },
          { id: 'b', text: 'Replaces the element at index 2 with "gem"' },
          { id: 'c', text: 'Deletes index 2' },
          { id: 'd', text: 'Prints the element at index 2' },
        ],
        answer: 'b',
        explanation:
          '`set` updates an existing position instead of inserting a new one.',
      },
      {
        id: 'm8-fill',
        type: 'fill',
        prompt: 'Complete the ArrayList traversal that counts available items.',
        snippet: [
          'int available = 0;',
          'for (int i = 0; i < inventory.__count__(); i++) {',
          '  if (inventory.__read__(i).isAvailable()) {',
          '    available++;',
          '  }',
          '}',
        ],
        blanks: [
          { id: 'count', label: 'ArrayList size method', answer: 'size' },
          { id: 'read', label: 'ArrayList access method', answer: 'get' },
        ],
        explanation:
          'For APCSA ArrayLists, `size()` controls the loop and `get(i)` reads the current element.',
      },
    ],
  },
  {
    id: 'mission-9',
    title: 'Grid Temple',
    arc: 'two-dimensional reasoning',
    unit: 'Unit 4',
    duration: '60 min',
    xp: 145,
    mentor: 'array',
    examWeight: 'Exact prep for FRQ 4',
    focus: '2D array creation, row-major traversal, 2D algorithms',
    officialTopics: ['4.11', '4.12', '4.13'],
    story:
      'The temple floor is a 2D array of rooms. To unlock the chamber, you must move row by row without confusing rows and columns.',
    lesson:
      'A 2D array is an array of arrays. The standard APCSA pattern is nested loops: outer loop for rows, inner loop for columns inside that row. Most mistakes happen when students swap row and column indexes or use the wrong length for the inner loop.',
    bossMove:
      'Use names like `row` and `col` instead of `i` and `j` when you draft FRQ 4 by hand.',
    challenges: [
      {
        id: 'm9-q1',
        type: 'quiz',
        prompt: 'In `grid[row][col]`, what does the first index represent?',
        options: [
          { id: 'a', text: 'The column' },
          { id: 'b', text: 'The row' },
          { id: 'c', text: 'The value' },
          { id: 'd', text: 'The total length' },
        ],
        answer: 'b',
        explanation:
          'The first index chooses which row array to access; the second chooses a column within that row.',
      },
      {
        id: 'm9-q2',
        type: 'quiz',
        prompt: 'Which expression is safest for the number of columns in the current row?',
        options: [
          { id: 'a', text: 'grid.length' },
          { id: 'b', text: 'grid[row].length' },
          { id: 'c', text: 'grid[col].length' },
          { id: 'd', text: 'grid.size()' },
        ],
        answer: 'b',
        explanation:
          'The outer array length is the row count. For columns in the current row, use `grid[row].length`.',
      },
      {
        id: 'm9-fill',
        type: 'fill',
        prompt: 'Complete the nested traversal that adds every element in a 2D array.',
        snippet: [
          'for (int row = 0; row < board.length; row++) {',
          '  for (int col = 0; col < board[row].length; __update__) {',
          '    total += board[row][__slot__];',
          '  }',
          '}',
        ],
        blanks: [
          { id: 'update', label: 'inner-loop update', answer: 'col++', alternates: ['col += 1'] },
          { id: 'slot', label: 'column variable', answer: 'col' },
        ],
        explanation:
          'The inner loop must change the column variable, and the second index should use that same column tracker.',
      },
    ],
  },
  {
    id: 'mission-10',
    title: 'Five Forge',
    arc: 'exam synthesis',
    unit: 'Units 2-4',
    duration: '75 min',
    xp: 180,
    mentor: 'classer',
    examWeight: 'Final score-5 rehearsal',
    focus: 'searching, sorting, recursion, FRQ strategy, exam pacing',
    officialTopics: ['4.14', '4.15', '4.16', '4.17', 'Exam Overview'],
    story:
      'All mentors meet at the forge for the final run. You combine algorithms, recursion awareness, and the official exam format into one last push toward a 5.',
    lesson:
      'The last edge for APCSA is choosing the right pattern under time pressure. Search when you need to find; sort when order matters; recurse only when the prompt clearly leads there; and keep FRQ answers close to the specification instead of overbuilding.',
    bossMove:
      'During the real exam, secure the easy points first: correct headers, loop structure, and return statements before polishing.',
    challenges: [
      {
        id: 'm10-q1',
        type: 'quiz',
        prompt: 'Which statement about the APCSA exam is correct?',
        options: [
          { id: 'a', text: 'It has 50 multiple-choice questions and 2 FRQs' },
          { id: 'b', text: 'It has 42 multiple-choice questions and 4 FRQs' },
          { id: 'c', text: 'It has only free-response questions' },
          { id: 'd', text: 'It has 4 multiple-choice questions and 42 FRQs' },
        ],
        answer: 'b',
        explanation:
          'According to the 2025 course and exam description, the exam includes 42 MCQs and 4 FRQs.',
      },
      {
        id: 'm10-q2',
        type: 'quiz',
        prompt: 'What is the base case in recursion?',
        options: [
          { id: 'a', text: 'The part that repeats the recursive call forever' },
          { id: 'b', text: 'The condition that stops further recursive calls' },
          { id: 'c', text: 'The first element of an array' },
          { id: 'd', text: 'A comment above the method' },
        ],
        answer: 'b',
        explanation:
          'Without a base case, recursion keeps calling itself and never reaches a stopping point.',
      },
      {
        id: 'm10-fill',
        type: 'fill',
        prompt: 'Complete the recursive method so it stops cleanly and keeps reducing the problem size.',
        snippet: [
          'public int mystery(int n) {',
          '  if (n == 0) {',
          '    return __base__;',
          '  }',
          '  return n + mystery(n __step__);',
          '}',
        ],
        blanks: [
          { id: 'base', label: 'base-case return', answer: '0' },
          { id: 'step', label: 'smaller recursive input', answer: '- 1', alternates: ['-1'] },
        ],
        explanation:
          'A correct recursive solution needs a stopping value and a recursive call that moves toward that stop.',
      },
    ],
  },
];
