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
    quote: 'Every step must be explicit.',
    bridge:
      'That is the whole mindset of early APCSA. If the step is not written, the computer will not infer it for you.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.2': {
    quote: 'Always match the variable type with the value type.',
    bridge:
      'When students miss Unit 1 questions, it is often because they chose a type by syntax instead of by meaning.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.3': {
    quote: 'String concatenation is left to right.',
    bridge:
      'That one tracing rule explains a lot of “Hi56” versus “11Hi” style APCSA multiple-choice traps.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.4': {
    quote: 'The right side is evaluated first.',
    bridge:
      'Read assignment as “compute first, store second.” That habit keeps updates and Scanner input much easier to follow.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.5': {
    quote: 'It truncates, not rounds.',
    bridge:
      'Whenever casting or integer division shows up, assume the exam is checking whether you noticed the lost decimal part.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.6': {
    quote: 'Always evaluate the right side first.',
    bridge:
      'Compound assignment is still assignment, so Java still computes the expression before storing the new value.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.7': {
    quote: 'Use them correctly.',
    bridge:
      'APIs save you work, but APCSA still expects you to know the method name, return type, and resulting range or behavior.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.8': {
    quote: 'Comment why code exists.',
    bridge:
      'That is stronger than narrating every line. Good comments explain intent and design choices, not obvious syntax.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.9': {
    quote: 'void means no return value.',
    bridge:
      'Method signatures are contracts. If the header says int or double, the body must actually return that kind of value.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.10': {
    quote: 'No object is needed.',
    bridge:
      'That is the fastest way to separate static class methods from instance methods when a question mixes both on one page.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.11': {
    quote: 'Most Math methods return double.',
    bridge:
      'That return-type detail matters because APCSA likes to test whether you kept the decimal or cast it away.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.12': {
    quote: 'Objects bundle data and actions together.',
    bridge:
      'Once you see an object as state plus behavior, method calls and class design questions become much more natural.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.13': {
    quote: 'Variables store references, not the actual object.',
    bridge:
      'That idea is what makes aliasing, null, and shared object access make sense later in the course.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.14': {
    quote: 'substring excludes the end index.',
    bridge:
      'That single rule prevents a huge number of String and instance-method mistakes on APCSA.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
  '1.15': {
    quote: 'indexOf returns -1 if not found.',
    bridge:
      'String manipulation is mostly careful indexing, so little return-value facts like this drive a lot of correct answers.',
    sourceLabel: 'APCSA_Unit1_DETAILED_Teaching_Guide.pdf',
  },
};

export function getCedPracticeChallenges(subunitCode: string): PracticeChallenge[] {
  return cedPracticeBanks[subunitCode]?.challenges ?? [];
}

export function getCedTeachingMoment(subunitCode: string) {
  return cedTeachingMoments[subunitCode];
}
