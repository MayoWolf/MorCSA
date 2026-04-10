import type { FillBlank, FillChallenge, QuizChallenge } from './course';
import type { PracticeChallenge } from './practiceDecks';

export type CedPracticeBank = {
  subunitCode: string;
  title: string;
  sourceLabel: string;
  challenges: PracticeChallenge[];
};

export type CedTeachingMoment = {
  quote: string;
  bridge: string;
  sourceLabel: string;
};

export type CedTeachingGuide = {
  heading: string;
  overview: string;
  detail: string;
  warning: string;
  quote: string;
  quoteContext: string;
  sourceLabel: string;
};

type QuizSpec = {
  prompt: string;
  options: [string, string, string, string];
  answerIndex: number;
  explanation: string;
};

type FillSpec = {
  prompt: string;
  snippet: string[];
  blanks: FillBlank[];
  explanation: string;
};

const optionIds = ['a', 'b', 'c', 'd'] as const;

function quiz(id: string, spec: QuizSpec): QuizChallenge {
  return {
    id,
    type: 'quiz',
    prompt: spec.prompt,
    options: spec.options.map((text, index) => ({
      id: optionIds[index],
      text,
    })),
    answer: optionIds[spec.answerIndex],
    explanation: spec.explanation,
  };
}

function fill(id: string, spec: FillSpec): FillChallenge {
  return {
    id,
    type: 'fill',
    prompt: spec.prompt,
    snippet: spec.snippet,
    blanks: spec.blanks,
    explanation: spec.explanation,
  };
}

function buildBank(
  subunitCode: string,
  title: string,
  sourceLabel: string,
  quizSpecs: QuizSpec[],
  fillSpec: FillSpec,
): CedPracticeBank {
  const challenges: PracticeChallenge[] = [
    ...quizSpecs.map((spec, index) => quiz(`ced-${subunitCode.replace('.', '-')}-q${index + 1}`, spec)),
    fill(`ced-${subunitCode.replace('.', '-')}-f1`, fillSpec),
  ];

  return {
    subunitCode,
    title,
    sourceLabel,
    challenges,
  };
}

export const cedPracticeBanks: Record<string, CedPracticeBank> = {
  '1.1': buildBank(
    '1.1',
    'Introduction to Algorithms, Programming, and Compilers',
    'APCSA_Unit1_1.1_FULL.pdf',
    [
      {
        prompt: 'What is an algorithm?',
        options: [
          'A programming language',
          'A step-by-step process to solve a problem',
          'A compiler',
          'A variable',
        ],
        answerIndex: 1,
        explanation:
          'The packet defines an algorithm as an ordered, step-by-step process for solving a problem.',
      },
      {
        prompt: 'What is the purpose of a compiler?',
        options: [
          'Execute code',
          'Translate source code into machine-readable form',
          'Store variables',
          'Print output',
        ],
        answerIndex: 1,
        explanation:
          'A compiler translates Java source into a form the machine can run.',
      },
    ],
    {
      prompt: 'Complete the comment using the Unit 1.1 packet definition.',
      snippet: [
        '// An __term__ is a step-by-step process.',
      ],
      blanks: [
        {
          id: 'term',
          label: 'CS term',
          answer: 'algorithm',
        },
      ],
      explanation:
        'The packet uses algorithm to describe a step-by-step process for solving a problem.',
    },
  ),
  '1.2': buildBank(
    '1.2',
    'Variables and Data Types',
    'APCSA_Unit1_1.2_FULL.pdf',
    [
      {
        prompt: 'Which data type stores decimal values?',
        options: ['int', 'double', 'boolean', 'String'],
        answerIndex: 1,
        explanation: 'The Unit 1.2 packet says double is the decimal numeric type.',
      },
      {
        prompt: 'Which is NOT a primitive type in AP CSA?',
        options: ['int', 'double', 'boolean', 'String'],
        answerIndex: 3,
        explanation: 'String is an object type, not a primitive.',
      },
    ],
    {
      prompt: 'Fill in the missing type from the Unit 1.2 packet.',
      snippet: [
        '__type__ x = 10;',
        'System.out.println(x);',
      ],
      blanks: [
        {
          id: 'type',
          label: 'type for a whole number',
          answer: 'int',
        },
      ],
      explanation:
        'The packet uses int for whole numbers such as 10.',
    },
  ),
  '1.3': buildBank(
    '1.3',
    'Expressions and Output',
    'APCSA_Unit1_1.3_FULL.pdf',
    [
      {
        prompt: 'What is printed by `System.out.println(2 + 3 * 4);`?',
        options: ['20', '14', '24', '10'],
        answerIndex: 1,
        explanation:
          'Multiplication happens before addition, so Java computes 3 * 4 first.',
      },
      {
        prompt: 'What does `System.out.print` do?',
        options: [
          'Prints with a newline',
          'Prints without a newline',
          'Reads input',
          'Declares a variable',
        ],
        answerIndex: 1,
        explanation:
          'The packet distinguishes print from println by noting that print does not add a newline.',
      },
    ],
    {
      prompt: 'Complete the expression so the line prints 11.',
      snippet: [
        'System.out.println(3 + __factor__ * 2);',
      ],
      blanks: [
        {
          id: 'factor',
          label: 'number multiplied by 2',
          answer: '4',
        },
      ],
      explanation:
        'Substituting 4 gives 3 + 4 * 2, and Java evaluates that to 11.',
    },
  ),
  '1.4': buildBank(
    '1.4',
    'Assignment Statements and Input',
    'APCSA_Unit1_1.4_FULL.pdf',
    [
      {
        prompt: 'What is printed?\n`int a = 3; a = a + 2; System.out.println(a);`',
        options: ['3', '5', '6', 'Error'],
        answerIndex: 1,
        explanation:
          'Assignment replaces the old value with the new result, so a becomes 5.',
      },
      {
        prompt: 'Which Scanner method reads an int from input?',
        options: ['nextLine()', 'nextDouble()', 'nextInt()', 'readInt()'],
        answerIndex: 2,
        explanation:
          'The packet uses nextInt() as the Scanner method for integer input.',
      },
    ],
    {
      prompt: 'Use the updated variable name from the packet example.',
      snippet: [
        'int a = 4;',
        'int b = 2;',
        'a = a * b;',
        'System.out.println(__name__);',
      ],
      blanks: [
        {
          id: 'name',
          label: 'updated variable',
          answer: 'a',
        },
      ],
      explanation:
        'After the assignment, the updated result is stored back into a.',
    },
  ),
  '1.5': buildBank(
    '1.5',
    'Casting and Range of Variables',
    'APCSA_Unit1_1.5_FULL.pdf',
    [
      {
        prompt: 'What is the value of `int x = (int) 5.9;`?',
        options: ['5', '6', '5.9', 'Error'],
        answerIndex: 0,
        explanation:
          'Casting a positive double to int truncates the decimal part instead of rounding.',
      },
      {
        prompt: 'What is printed by `System.out.println((double) 7 / 2);`?',
        options: ['3', '3.5', '4', '2'],
        answerIndex: 1,
        explanation:
          'Casting one operand to double makes the division decimal instead of integer-only.',
      },
    ],
    {
      prompt: 'Add the cast from the Unit 1.5 packet.',
      snippet: [
        'double d = 6.8;',
        'int x = __cast__;',
        'System.out.println(x);',
      ],
      blanks: [
        {
          id: 'cast',
          label: 'cast expression',
          answer: '(int) d',
          alternates: ['(int)d'],
        },
      ],
      explanation:
        'The packet shows casting the double before assigning it to an int variable.',
    },
  ),
  '1.6': buildBank(
    '1.6',
    'Compound Assignment Operators',
    'APCSA_Unit1_1.6_FULL.pdf',
    [
      {
        prompt: 'What is x?\n`int x = 5; x += 3;`',
        options: ['5', '8', '15', 'Error'],
        answerIndex: 1,
        explanation:
          'The packet treats += as add and store, so x becomes 8.',
      },
      {
        prompt: 'Which is equivalent to `x += 5`?',
        options: ['x = 5 + x', 'x = x + 5', 'x + 5 = x', 'x == 5'],
        answerIndex: 1,
        explanation:
          'Compound addition means take the current value of x, add 5, and store it back in x.',
      },
    ],
    {
      prompt: 'Fill in the compound operator from the packet.',
      snippet: [
        'int x = 5;',
        'x __op__ 4;',
        'System.out.println(x);',
      ],
      blanks: [
        {
          id: 'op',
          label: 'compound operator',
          answer: '+=',
        },
      ],
      explanation:
        'The Unit 1.6 packet uses += to add 4 to x and store the updated result.',
    },
  ),
  '1.7': buildBank(
    '1.7',
    'Application Program Interface (API) and Libraries',
    'APCSA_Unit1_1.7_FULL.pdf',
    [
      {
        prompt: 'What is an API?',
        options: [
          'A programming language',
          'A set of prewritten methods',
          'A variable',
          'A loop',
        ],
        answerIndex: 1,
        explanation:
          'The packet defines an API as a set of prewritten functionality you can call.',
      },
      {
        prompt: 'Which statement about APIs is true?',
        options: [
          'APIs must be rewritten',
          'APIs save time',
          'APIs are variables',
          'APIs are loops',
        ],
        answerIndex: 1,
        explanation:
          'The point of an API is to reuse tested functionality instead of rebuilding it every time.',
      },
    ],
    {
      prompt: 'Complete the API call from the Unit 1.7 packet.',
      snippet: [
        'double r = __call__;',
        'System.out.println(r);',
      ],
      blanks: [
        {
          id: 'call',
          label: 'API call',
          answer: 'Math.random()',
        },
      ],
      explanation:
        'The packet uses Math.random() as the sample API call.',
    },
  ),
  '1.8': buildBank(
    '1.8',
    'Documentation with Comments',
    'APCSA_Unit1_1.8_FULL.pdf',
    [
      {
        prompt: 'What is the purpose of comments?',
        options: ['Execute code', 'Explain code', 'Store variables', 'Run programs'],
        answerIndex: 1,
        explanation:
          'Comments exist for humans and make code easier to understand.',
      },
      {
        prompt: 'Which statement about comments is correct?',
        options: [
          'Comments are executed',
          'Comments are ignored by the compiler',
          'Comments change values',
          'Comments store data',
        ],
        answerIndex: 1,
        explanation:
          'The packet explains that comments do not affect execution because the compiler ignores them.',
      },
    ],
    {
      prompt: 'Use the correct single-line comment symbol.',
      snippet: [
        '__comment__ This prints Hello',
        'System.out.println("Hello");',
      ],
      blanks: [
        {
          id: 'comment',
          label: 'single-line comment marker',
          answer: '//',
        },
      ],
      explanation:
        'The Unit 1.8 packet uses // for a single-line Java comment.',
    },
  ),
  '1.9': buildBank(
    '1.9',
    'Method Signatures',
    'APCSA_Unit1_1.9_FULL.pdf',
    [
      {
        prompt: 'What is a method signature?',
        options: [
          'Method body',
          'Name + parameters + return type',
          'Only return type',
          'Only parameters',
        ],
        answerIndex: 1,
        explanation:
          'The packet frames a signature as the method name, parameter list, and return type together.',
      },
      {
        prompt: 'What does `void` mean in a method header?',
        options: ['Returns nothing', 'Returns int', 'Returns double', 'Error'],
        answerIndex: 0,
        explanation:
          'A void method performs an action without returning a value.',
      },
    ],
    {
      prompt: 'Fill in the return type from the packet method header.',
      snippet: [
        'public static __type__ add(int a, int b) {',
        '  return a + b;',
        '}',
      ],
      blanks: [
        {
          id: 'type',
          label: 'return type',
          answer: 'int',
        },
      ],
      explanation:
        'Because the method returns the sum of two ints, the header must use int as the return type.',
    },
  ),
  '1.10': buildBank(
    '1.10',
    'Calling Class Methods',
    'APCSA_Unit1_1.10_FULL.pdf',
    [
      {
        prompt: 'Which correctly calls a class method?',
        options: ['Math random()', 'Math.random()', 'random.Math()', 'Math.random;'],
        answerIndex: 1,
        explanation:
          'The Unit 1.10 packet uses the Class.method() format for static method calls.',
      },
      {
        prompt: 'Which expression generates 1-10 inclusive?',
        options: [
          '(int)(Math.random()*10)',
          '(int)(Math.random()*10)+1',
          'Math.random(10)',
          'random()*10',
        ],
        answerIndex: 1,
        explanation:
          'Multiplying by 10 gives 0-9 after casting, so +1 shifts the range to 1-10.',
      },
    ],
    {
      prompt: 'Complete the class method call from the packet.',
      snippet: [
        'int val = Math.__method__(-10);',
        'System.out.println(val);',
      ],
      blanks: [
        {
          id: 'method',
          label: 'Math method name',
          answer: 'abs',
        },
      ],
      explanation:
        'The Unit 1.10 packet uses Math.abs to return absolute value.',
    },
  ),
  '1.11': buildBank(
    '1.11',
    'Math Class',
    'APCSA_Unit1_1.11_FULL.pdf',
    [
      {
        prompt: 'What does `Math.pow(2, 3)` return?',
        options: ['5', '6', '8', '9'],
        answerIndex: 2,
        explanation:
          '2 raised to the third power is 8.',
      },
      {
        prompt: 'What is printed by `System.out.println(Math.max(3, 7));`?',
        options: ['3', '7', '10', 'Error'],
        answerIndex: 1,
        explanation:
          'Math.max returns the larger of the two arguments.',
      },
    ],
    {
      prompt: 'Use the Math method from the packet to find a square root.',
      snippet: [
        'double x = Math.__method__(25);',
        'System.out.println(x);',
      ],
      blanks: [
        {
          id: 'method',
          label: 'Math method name',
          answer: 'sqrt',
        },
      ],
      explanation:
        'The packet uses Math.sqrt for square roots.',
    },
  ),
  '1.12': buildBank(
    '1.12',
    'Objects: Instances of Classes',
    'APCSA_Unit1_1.12_FULL.pdf',
    [
      {
        prompt: 'What is an object?',
        options: ['A variable', 'An instance of a class', 'A loop', 'A method'],
        answerIndex: 1,
        explanation:
          'The packet defines an object as an instance created from a class.',
      },
      {
        prompt: 'What does `new` do?',
        options: ['Deletes object', 'Creates object', 'Prints object', 'Compares objects'],
        answerIndex: 1,
        explanation:
          'The keyword new creates an object instance.',
      },
    ],
    {
      prompt: 'Add the missing keyword from the packet object creation example.',
      snippet: [
        'String s = __keyword__ String("hello");',
        'System.out.println(s);',
      ],
      blanks: [
        {
          id: 'keyword',
          label: 'object-creation keyword',
          answer: 'new',
        },
      ],
      explanation:
        'The Unit 1.12 packet uses new String(...) to show object creation.',
    },
  ),
  '1.13': buildBank(
    '1.13',
    'Object Creation and Storage (Instantiation)',
    'APCSA_Unit1_1.13_FULL.pdf',
    [
      {
        prompt: 'What does instantiation mean?',
        options: ['Deleting object', 'Creating an object', 'Calling method', 'Printing output'],
        answerIndex: 1,
        explanation:
          'The packet defines instantiation as the act of creating an object.',
      },
      {
        prompt: 'What is `null` in Java?',
        options: ['0', 'Empty string', 'No reference', 'false'],
        answerIndex: 2,
        explanation:
          'null means the variable does not currently refer to an object.',
      },
    ],
    {
      prompt: 'Complete the reference vocabulary from the packet.',
      snippet: [
        'String a = "test";',
        'String b = a;',
        '// b stores a __term__',
      ],
      blanks: [
        {
          id: 'term',
          label: 'storage term',
          answer: 'reference',
        },
      ],
      explanation:
        'The packet says object variables store references rather than the full object itself.',
    },
  ),
  '1.14': buildBank(
    '1.14',
    'Calling Instance Methods',
    'APCSA_Unit1_1.14_FULL.pdf',
    [
      {
        prompt: 'What is an instance method?',
        options: ['Called on class', 'Called on object', 'Static only', 'Not callable'],
        answerIndex: 1,
        explanation:
          'The Unit 1.14 packet contrasts instance methods with class methods by noting they are called on objects.',
      },
      {
        prompt: 'What does `equals` compare for Strings?',
        options: ['references', 'memory', 'values/content', 'variables'],
        answerIndex: 2,
        explanation:
          'The packet uses equals to compare string contents rather than object identity.',
      },
    ],
    {
      prompt: 'Complete the instance method call from the packet.',
      snippet: [
        'String s = "hello";',
        'System.out.println(s.__method__());',
      ],
      blanks: [
        {
          id: 'method',
          label: 'instance method name',
          answer: 'length',
        },
      ],
      explanation:
        'The packet uses length() as a String instance method.',
    },
  ),
  '1.15': buildBank(
    '1.15',
    'String Manipulation',
    'APCSA_Unit1_1.15_FULL.pdf',
    [
      {
        prompt: 'What is printed?\n`String s = "abcde"; System.out.println(s.indexOf("c"));`',
        options: ['1', '2', '3', '-1'],
        answerIndex: 1,
        explanation:
          'The character c appears at index 2 in the string abcde.',
      },
      {
        prompt: 'What does `indexOf` return if the target is not found?',
        options: ['0', '-1', 'null', 'error'],
        answerIndex: 1,
        explanation:
          'The packet uses -1 to mark “not found” for String searches.',
      },
    ],
    {
      prompt: 'Use the String method from the packet to find the index of a character.',
      snippet: [
        'String s = "robot";',
        'System.out.println(s.__method__("o"));',
      ],
      blanks: [
        {
          id: 'method',
          label: 'String method name',
          answer: 'indexOf',
        },
      ],
      explanation:
        'The Unit 1.15 packet uses indexOf to return the position of a match inside the string.',
    },
  ),
};

export const cedTeachingMoments: Record<string, CedTeachingMoment> = {
  '1.1': {
    quote:
      'Every step must be explicitly written, or the program will fail or behave incorrectly.',
    bridge:
      "A common mistake is thinking computers 'understand intent.' They do not.",
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.2': {
    quote: 'Always match the variable type with the value type.',
    bridge:
      'A common mistake is assigning wrong types, like int x = 5.5;, which causes a compile error.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.3': {
    quote:
      'String concatenation is left to right: "Hi" + 5 + 6 becomes "Hi56", while 5 + 6 + "Hi" becomes "11Hi".',
    bridge: 'This is a common AP trick.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.4': {
    quote: 'The right side is evaluated first, then stored in the variable.',
    bridge:
      'A common mistake is writing x + 5 = x;, which is invalid. Assignment always has the variable on the left.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.5': {
    quote: 'It truncates, not rounds.',
    bridge:
      'A tricky example: (int)(2.9 + 1.2) = 4, but (int)2.9 + (int)1.2 = 3. Order matters.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.6': {
    quote: 'Order matters: x *= x + 1 means x = x * (x + 1).',
    bridge:
      'A common mistake is misunderstanding integer division: x /= 4 truncates results.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.7': {
    quote:
      'Math.random() returns a double from 0.0 to <1.0. To get integers, use (int)(Math.random()*n).',
    bridge:
      'A common trap: (int)(Math.random()*10)+1 gives 1–10, not 0–9.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.8': {
    quote: 'Good practice is commenting why code exists, not what it does.',
    bridge:
      'Comments explain code and are ignored by the compiler.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.9': {
    quote: 'void means no return value, while other types require return statements.',
    bridge:
      'A common mistake is mismatching parameter types when calling methods.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.10': {
    quote:
      'Static methods are called using Class.method(), like Math.random(). No object is needed.',
    bridge:
      'A key concept is distinguishing static vs instance methods.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.11': {
    quote: 'Most Math methods return double, even if inputs are integers.',
    bridge:
      'Casting may be needed when assigning results to int variables.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.12': {
    quote: 'Objects are instances of classes and store data + behavior.',
    bridge:
      'A key idea is that objects bundle data and actions together.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.13': {
    quote: 'Variables store references (memory addresses), not the actual object.',
    bridge:
      'null means no object, and calling methods on null causes runtime errors.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.14': {
    quote:
      'substring(start, end) excludes the end index. For example, "robot".substring(1,3) = "ob".',
    bridge:
      'equals() compares content, unlike == which compares references.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.15': {
    quote: 'indexOf returns -1 if not found.',
    bridge:
      'A common trap is off-by-one errors with indices.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
};

export const cedTeachingGuides: Record<string, CedTeachingGuide> = {
  '1.1': {
    heading: '1.1 Algorithms',
    overview:
      'An algorithm is a step-by-step set of instructions to solve a problem. For example, making a sandwich involves ordered steps like getting bread, adding ingredients, and assembling. In programming, algorithms must be precise and unambiguous.',
    detail:
      'Java programs follow the process: write code -> compile -> run. The compiler converts Java into bytecode, which the JVM executes. Understanding this flow helps debug errors at different stages.',
    warning:
      "A common mistake is thinking computers 'understand intent.' They do not. Every step must be explicitly written, or the program will fail or behave incorrectly.",
    quote:
      'Every step must be explicitly written, or the program will fail or behave incorrectly.',
    quoteContext:
      "A common mistake is thinking computers 'understand intent.' They do not.",
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.2': {
    heading: '1.2 Variables & Data Types',
    overview:
      'Variables store data, and each has a type such as int, double, or boolean. For example, int age = 16; stores a whole number, while double price = 9.99; stores decimals. The type determines valid operations.',
    detail:
      'Primitive types store actual values, while objects (like String) store references. For example, String name = "Wolf" creates an object. This distinction becomes critical later with objects.',
    warning:
      'A common mistake is assigning wrong types, like int x = 5.5;, which causes a compile error. Always match the variable type with the value type.',
    quote: 'Always match the variable type with the value type.',
    quoteContext:
      'A common mistake is assigning wrong types, like int x = 5.5;, which causes a compile error.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.3': {
    heading: '1.3 Expressions & Output',
    overview:
      'Expressions combine values and operators, following order of operations. For example, 3 + 4 * 2 evaluates to 11, not 14. Parentheses change evaluation order.',
    detail:
      'System.out.println() prints output and moves to a new line, while print() does not. For example, System.out.print("A"); System.out.print("B"); prints AB.',
    warning:
      'String concatenation is left to right: "Hi" + 5 + 6 becomes "Hi56", while 5 + 6 + "Hi" becomes "11Hi". This is a common AP trick.',
    quote:
      'String concatenation is left to right: "Hi" + 5 + 6 becomes "Hi56", while 5 + 6 + "Hi" becomes "11Hi".',
    quoteContext: 'This is a common AP trick.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.4': {
    heading: '1.4 Assignment & Input',
    overview:
      'Assignment updates variables using =, like x = x + 3. The right side is evaluated first, then stored in the variable. This allows tracking changes over time.',
    detail:
      'Using Scanner allows input: Scanner s = new Scanner(System.in); int x = s.nextInt();. This reads user input into variables.',
    warning:
      'A common mistake is writing x + 5 = x;, which is invalid. Assignment always has the variable on the left.',
    quote: 'The right side is evaluated first, then stored in the variable.',
    quoteContext:
      'This allows tracking changes over time.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.5': {
    heading: '1.5 Casting',
    overview:
      'Casting converts types, like (int)5.9 -> 5. It truncates, not rounds. This is very important for AP questions.',
    detail:
      'Integer division removes decimals: 7 / 2 = 3, but 7 / 2.0 = 3.5. Casting affects which type is used in calculations.',
    warning:
      'A tricky example: (int)(2.9 + 1.2) = 4, but (int)2.9 + (int)1.2 = 3. Order matters.',
    quote: 'It truncates, not rounds.',
    quoteContext:
      'This is very important for AP questions.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.6': {
    heading: '1.6 Compound Assignment',
    overview:
      'Compound operators combine math and assignment, like x += 3 meaning x = x + 3. These simplify repeated updates.',
    detail:
      'Order matters: x *= x + 1 means x = x * (x + 1). Always evaluate the right side first.',
    warning:
      'A common mistake is misunderstanding integer division: x /= 4 truncates results.',
    quote:
      'Order matters: x *= x + 1 means x = x * (x + 1).',
    quoteContext: 'Always evaluate the right side first.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.7': {
    heading: '1.7 APIs',
    overview:
      'APIs provide prebuilt methods like Math.random(). You do not need to implement them, just use them correctly.',
    detail:
      'Math.random() returns a double from 0.0 to <1.0. To get integers, use (int)(Math.random()*n).',
    warning:
      'A common trap: (int)(Math.random()*10)+1 gives 1-10, not 0-9.',
    quote:
      'Math.random() returns a double from 0.0 to <1.0.',
    quoteContext:
      'To get integers, use (int)(Math.random()*n).',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.8': {
    heading: '1.8 Comments',
    overview:
      'Comments explain code and are ignored by the compiler. For example, // this prints hello.',
    detail:
      'Multi-line comments use /* ... */ and are useful for longer explanations.',
    warning:
      'Good practice is commenting why code exists, not what it does.',
    quote: 'Good practice is commenting why code exists, not what it does.',
    quoteContext:
      'Comments explain code and are ignored by the compiler.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.9': {
    heading: '1.9 Method Signatures',
    overview:
      'A method signature includes name, parameters, and return type. For example: public int add(int a, int b).',
    detail:
      'void means no return value, while other types require return statements.',
    warning:
      'A common mistake is mismatching parameter types when calling methods.',
    quote:
      'A method signature includes name, parameters, and return type.',
    quoteContext:
      'void means no return value, while other types require return statements.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.10': {
    heading: '1.10 Class Methods',
    overview:
      'Static methods are called using Class.method(), like Math.random(). No object is needed.',
    detail:
      'Example: Math.abs(-5) returns 5. These methods belong to the class itself.',
    warning:
      'A key concept is distinguishing static vs instance methods.',
    quote:
      'Static methods are called using Class.method(), like Math.random(). No object is needed.',
    quoteContext:
      'These methods belong to the class itself.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.11': {
    heading: '1.11 Math Class',
    overview:
      'Math provides useful methods like sqrt, pow, abs, max, min. For example, Math.sqrt(16) = 4.0.',
    detail:
      'Most Math methods return double, even if inputs are integers.',
    warning:
      'Casting may be needed when assigning results to int variables.',
    quote: 'Most Math methods return double, even if inputs are integers.',
    quoteContext:
      'Casting may be needed when assigning results to int variables.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.12': {
    heading: '1.12 Objects',
    overview:
      'Objects are instances of classes and store data + behavior. For example, String is a class and "hi" is an object.',
    detail:
      'Objects allow you to call methods like s.length().',
    warning:
      'A key idea is that objects bundle data and actions together.',
    quote: 'Objects are instances of classes and store data + behavior.',
    quoteContext:
      'Objects allow you to call methods like s.length().',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.13': {
    heading: '1.13 Instantiation',
    overview:
      'Instantiation uses new to create objects: String s = new String("hi");.',
    detail:
      'Variables store references (memory addresses), not the actual object.',
    warning:
      'null means no object, and calling methods on null causes runtime errors.',
    quote:
      'Variables store references (memory addresses), not the actual object.',
    quoteContext:
      'null means no object, and calling methods on null causes runtime errors.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.14': {
    heading: '1.14 Instance Methods',
    overview:
      'Instance methods are called on objects, like s.length(). They require an object to exist.',
    detail:
      'substring(start, end) excludes the end index. For example, "robot".substring(1,3) = "ob".',
    warning:
      'equals() compares content, unlike == which compares references.',
    quote:
      'substring(start, end) excludes the end index.',
    quoteContext:
      'For example, "robot".substring(1,3) = "ob".',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.15': {
    heading: '1.15 String Manipulation',
    overview:
      'String methods include substring, indexOf, length, toUpperCase, trim. These are heavily tested.',
    detail:
      'indexOf returns -1 if not found. substring can take one or two parameters.',
    warning:
      'A common trap is off-by-one errors with indices.',
    quote: 'indexOf returns -1 if not found.',
    quoteContext:
      'substring can take one or two parameters.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
};

export function getCedPracticeChallenges(subunitCode: string): PracticeChallenge[] {
  return cedPracticeBanks[subunitCode]?.challenges ?? [];
}

export function getCedTeachingMoment(subunitCode: string) {
  return cedTeachingMoments[subunitCode];
}

export function getCedTeachingGuide(subunitCode: string) {
  return cedTeachingGuides[subunitCode];
}
