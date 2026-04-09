export type LessonGuide = {
  coachIntro: string;
  mentalModel: string;
  commonMistake: string;
  debugRule: string;
  workedExample: {
    title: string;
    code: string[];
    walkthrough: string;
  };
  checklist: string[];
};

export const lessonGuides: Record<string, LessonGuide> = {
  'mission-1': {
    coachIntro:
      'Unit 1 starts with one job: understand what each variable is allowed to store. If you pick the wrong type, every line after that gets harder.',
    mentalModel:
      'Think of a variable as a labeled box. The type decides what can go inside the box, and the variable name helps you remember what the box means.',
    commonMistake:
      'Students often memorize syntax without asking what the variable represents. That leads to choosing `int` when the program really needs a `boolean` or `String`.',
    debugRule:
      'When tracing, say two things for each line: what type the variable is and what value it holds right now.',
    workedExample: {
      title: 'Worked example: variable meaning before arithmetic',
      code: [
        'int coins = 3;',
        'double bonus = 1.5;',
        'System.out.println(coins + bonus);',
      ],
      walkthrough:
        'The first line stores a whole number, so `coins` is an int. The second stores a decimal, so `bonus` is a double. When Java adds them, the int is promoted to a double and the printed result becomes `4.5`.',
    },
    checklist: [
      'I can choose between int, double, boolean, and String based on meaning.',
      'I can predict printed output from a short variable-tracing snippet.',
      'I know integer division is different from decimal arithmetic.',
    ],
  },
  'mission-2': {
    coachIntro:
      'This lesson is about calling the right method and understanding what comes back. APCSA method questions usually test input, output, and whether you stored the returned value.',
    mentalModel:
      'A method call is like asking Java for a result. If the method returns something, you need a place for that result to go next.',
    commonMistake:
      'A classic trap is assuming String methods change the original String. They do not. If you want the new result, store it.',
    debugRule:
      'Underline the object, the method name, the argument list, and the return value. If you cannot name all four parts, slow down.',
    workedExample: {
      title: 'Worked example: String methods return new values',
      code: [
        'String word = "coding";',
        'String part = word.substring(1, 4);',
        'System.out.println(part);',
      ],
      walkthrough:
        '`substring(1, 4)` starts at index 1 and stops before index 4, so `part` stores `odi`. The original string `word` stays `coding` because Strings are immutable.',
    },
    checklist: [
      'I know the difference between `length()` and `length`.',
      'I can trace `substring`, `indexOf`, `equals`, and `Math.abs`.',
      'I understand that casting to int truncates instead of rounding.',
    ],
  },
  'mission-3': {
    coachIntro:
      'Now we switch from values to objects. A class is the blueprint; an object is one thing built from that blueprint.',
    mentalModel:
      'Read `new ClassName(...)` as “build one object now.” Read `objectName.method()` as “ask that object to do something.”',
    commonMistake:
      'Students often blur together the class name, the object reference, and the constructor call. APCSA loves asking about those separately.',
    debugRule:
      'When you see object code, label each piece: class, reference variable, constructor, and instance method.',
    workedExample: {
      title: 'Worked example: create an object, then call a method',
      code: [
        'Scanner scan = new Scanner(System.in);',
        'String line = scan.nextLine();',
        'System.out.println(line.length());',
      ],
      walkthrough:
        'The Scanner object is created with `new`. The reference variable `scan` stores that object. Then `nextLine()` reads text, and the returned String can call `length()`.',
    },
    checklist: [
      'I can identify the object reference in a declaration.',
      'I know what `new` does.',
      'I can tell whether a method is called on a class or on an instance.',
    ],
  },
  'mission-4': {
    coachIntro:
      'Selection means your program makes decisions. That only works if you read boolean expressions exactly, not approximately.',
    mentalModel:
      'Break compound conditions into tiny truth checks. Evaluate each comparison first, then combine them with `&&`, `||`, or `!`.',
    commonMistake:
      'Many misses come from boundary values like 90, 0, or 5. A single `>` versus `>=` changes which scores count.',
    debugRule:
      'Rewrite the condition in plain English before deciding whether the branch runs.',
    workedExample: {
      title: 'Worked example: boundary values matter',
      code: [
        'int score = 90;',
        'if (score >= 90) {',
        '  System.out.println("A");',
        '}',
      ],
      walkthrough:
        'Because the comparison includes equality, a score of exactly 90 enters the branch. If the code had used `> 90`, this same score would fail the test.',
    },
    checklist: [
      'I can translate boolean expressions into plain English.',
      'I watch boundary values carefully.',
      'I know De Morgan-style negation ideas like `!(x < 5)` meaning `x >= 5`.',
    ],
  },
  'mission-5': {
    coachIntro:
      'Loops are about controlled repetition. To master them, always track the start, the stop condition, and the update.',
    mentalModel:
      'A loop is a machine that repeats while its condition is true. If the machine never changes state, it never stops.',
    commonMistake:
      'Students often look only at the condition and forget to check the update. That is how infinite loops and off-by-one bugs happen.',
    debugRule:
      'Use a tiny trace table with three columns: current value, condition result, next value.',
    workedExample: {
      title: 'Worked example: counting loop',
      code: [
        'for (int i = 0; i < 3; i++) {',
        '  System.out.println(i);',
        '}',
      ],
      walkthrough:
        'The variable starts at 0. The body runs while `i < 3`, so it prints 0, then 1, then 2. After `i` becomes 3, the condition is false and the loop stops.',
    },
    checklist: [
      'I can explain how many times a loop runs and why.',
      'I can spot missing or incorrect updates.',
      'I can handle nested loops by combining the work of both levels.',
    ],
  },
  'mission-6': {
    coachIntro:
      'Unit 3 is where you stop reading other people’s classes and start writing your own. FRQ 2 is mostly about structure and precision.',
    mentalModel:
      'Instance variables store state. Constructors set initial state. Methods either report state or change state.',
    commonMistake:
      'Students lose points by adding extra features, forgetting a field assignment, or using the wrong return type for a method.',
    debugRule:
      'Read the class spec like a contract. Match each field, constructor, and method to exactly what the prompt asks for.',
    workedExample: {
      title: 'Worked example: constructor plus accessor',
      code: [
        'public class Drone {',
        '  private int energy;',
        '',
        '  public Drone(int energy) {',
        '    this.energy = energy;',
        '  }',
        '',
        '  public int getEnergy() {',
        '    return energy;',
        '  }',
        '}',
      ],
      walkthrough:
        'The field belongs to every Drone object. The constructor initializes it, and the accessor returns the current stored value without changing it.',
    },
    checklist: [
      'I know the job of a constructor.',
      'I can tell accessors from mutators.',
      'I use `this` correctly when a parameter name matches a field.',
    ],
  },
  'mission-7': {
    coachIntro:
      'Arrays are fixed-size indexed storage. Most array questions are really traversal questions in disguise.',
    mentalModel:
      'Think in a repeatable loop pattern: visit one index, inspect the value, update a tracker such as a sum, count, max, or position.',
    commonMistake:
      'The most common errors are starting at the wrong index and using `<=` instead of `<` with the array length.',
    debugRule:
      'Write the valid index range first: `0` through `length - 1`. Then make your loop respect that range.',
    workedExample: {
      title: 'Worked example: summing an array',
      code: [
        'int[] values = {4, 1, 7};',
        'int total = 0;',
        'for (int i = 0; i < values.length; i++) {',
        '  total += values[i];',
        '}',
      ],
      walkthrough:
        'The loop visits index 0, 1, and 2. Each pass adds the current element into `total`, so the final sum becomes 12.',
    },
    checklist: [
      'I can write a safe array traversal header.',
      'I know the last valid array index.',
      'I can build sum, count, and search algorithms over arrays.',
    ],
  },
  'mission-8': {
    coachIntro:
      'ArrayLists act like resizable arrays, but the method vocabulary matters. On APCSA, the method choice is often the whole question.',
    mentalModel:
      'Arrays use bracket indexing and `length`. ArrayLists use methods like `size()`, `get`, `set`, `add`, and `remove`.',
    commonMistake:
      'Students often use array habits on ArrayLists, especially writing `length` instead of `size()` or forgetting that removal shifts later elements left.',
    debugRule:
      'Highlight every collection method in the code before tracing what it does to indexes and size.',
    workedExample: {
      title: 'Worked example: read and replace an element',
      code: [
        'ArrayList<String> prizes = new ArrayList<String>();',
        'prizes.add("coin");',
        'prizes.add("key");',
        'prizes.set(1, "gem");',
      ],
      walkthrough:
        'The list begins with two elements. `set(1, "gem")` replaces the element at index 1, so the final contents are `coin, gem`.',
    },
    checklist: [
      'I use `size()` for loop bounds.',
      'I know the difference between `add`, `get`, and `set`.',
      'I remember that removals shift elements left.',
    ],
  },
  'mission-9': {
    coachIntro:
      'A 2D array is just an array of arrays, so the safe way to think is row first, then column.',
    mentalModel:
      'Use nested loops: outer for rows, inner for columns inside the current row. Name your variables `row` and `col` to keep the grid straight.',
    commonMistake:
      'The usual bug is swapping row and column indexes or using `grid.length` when the code really needs `grid[row].length`.',
    debugRule:
      'Whenever you touch a 2D array, say aloud what each index means before you trace the line.',
    workedExample: {
      title: 'Worked example: row-major traversal',
      code: [
        'for (int row = 0; row < board.length; row++) {',
        '  for (int col = 0; col < board[row].length; col++) {',
        '    total += board[row][col];',
        '  }',
        '}',
      ],
      walkthrough:
        'The outer loop picks one row at a time. The inner loop walks across all columns in that row. Together, they visit every element exactly once.',
    },
    checklist: [
      'I know that the first index is the row.',
      'I can choose the correct row and column bounds.',
      'I can write nested traversal code without swapping indexes.',
    ],
  },
  'mission-10': {
    coachIntro:
      'The final lesson is about pattern choice under time pressure. APCSA rewards using the simplest correct tool for the problem.',
    mentalModel:
      'Search when you need to find, sort when order matters, recurse only when the problem clearly shrinks toward a stopping point.',
    commonMistake:
      'A common score drop happens when students overbuild. They write too much instead of locking down the required loop, condition, or return statement first.',
    debugRule:
      'Secure easy points first: method headers, loop bounds, base cases, and return statements before polishing.',
    workedExample: {
      title: 'Worked example: recursion with a real base case',
      code: [
        'public int sumDown(int n) {',
        '  if (n == 0) {',
        '    return 0;',
        '  }',
        '  return n + sumDown(n - 1);',
        '}',
      ],
      walkthrough:
        'The base case stops the recursion at 0. Each recursive call reduces the problem size by 1, so the method moves toward termination instead of looping forever.',
    },
    checklist: [
      'I can identify the base case in a recursive method.',
      'I know binary search requires sorted data.',
      'I can start an FRQ by matching the specification instead of improvising.',
    ],
  },
};
