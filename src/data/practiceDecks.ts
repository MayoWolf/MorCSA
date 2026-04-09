import type { FillBlank, FillChallenge, QuizChallenge } from './course';

export type PracticeChallenge = QuizChallenge | FillChallenge;

export type PracticeSection = {
  id: string;
  unit: string;
  title: string;
  sourceNote: string;
  challenges: PracticeChallenge[];
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

function buildQuizSet(prefix: string, specs: QuizSpec[]) {
  return specs.map((spec, index) => quiz(`${prefix}-q${index + 1}`, spec));
}

function buildFillSet(prefix: string, specs: FillSpec[]) {
  return specs.map((spec, index) => fill(`${prefix}-f${index + 1}`, spec));
}

const unit1QuizSpecs: QuizSpec[] = [
  {
    prompt: 'Which declaration best stores whether a game level is unlocked?',
    options: ['int unlocked = 1;', 'boolean unlocked = true;', 'double unlocked = 1.0;', 'String unlocked = "yes";'],
    answerIndex: 1,
    explanation: 'A boolean is the correct primitive type for true/false program state.',
  },
  {
    prompt: 'What is printed by `int x = 8; int y = 3; System.out.println(x / y);`?',
    options: ['2', '2.6', '3', '8 / 3'],
    answerIndex: 0,
    explanation: 'Integer division truncates the decimal portion instead of rounding.',
  },
  {
    prompt: 'What is printed by `double a = 4.5; int b = 2; System.out.println(a + b);`?',
    options: ['6', '6.0', '6.5', 'compile error'],
    answerIndex: 2,
    explanation: 'Adding an int to a double promotes the int and produces a double result.',
  },
  {
    prompt: 'What does `(int) 12.99` evaluate to?',
    options: ['12', '13', '12.99', 'compile error'],
    answerIndex: 0,
    explanation: 'Casting a positive double to int removes the decimal part.',
  },
  {
    prompt: 'If `String word = "rocket";`, what does `word.length()` return?',
    options: ['5', '6', '7', '"rocket"'],
    answerIndex: 1,
    explanation: 'The string has six characters.',
  },
  {
    prompt: 'If `String word = "rocket";`, what does `word.substring(1, 4)` return?',
    options: ['roc', 'ock', 'ocke', 'cket'],
    answerIndex: 1,
    explanation: 'substring begins at index 1 and stops before index 4.',
  },
  {
    prompt: 'If `String code = "apcsa";`, what does `code.indexOf("cs")` return?',
    options: ['1', '2', '3', '-1'],
    answerIndex: 2,
    explanation: 'The substring `cs` starts at index 3.',
  },
  {
    prompt: 'Which expression returns `true` when two strings have the same characters?',
    options: ['name == other', 'name.equals(other)', 'name.compare(other)', 'String.same(name, other)'],
    answerIndex: 1,
    explanation: 'APCSA uses `.equals` to compare the contents of strings.',
  },
  {
    prompt: 'What is the value of `Math.abs(-14)`?',
    options: ['-14', '14', '0', 'compile error'],
    answerIndex: 1,
    explanation: 'Math.abs returns the distance from zero.',
  },
  {
    prompt: 'What range of values can `(int) (Math.random() * 5)` produce?',
    options: ['0 through 4', '1 through 5', '0 through 5', '1 through 4'],
    answerIndex: 0,
    explanation: 'Math.random() is at least 0.0 and less than 1.0, so multiplying by 5 and casting gives 0 to 4.',
  },
  {
    prompt: 'Which line creates a new Scanner object named `input`?',
    options: ['Scanner input(System.in);', 'new Scanner input = System.in;', 'Scanner input = new Scanner(System.in);', 'Scanner.new input(System.in);'],
    answerIndex: 2,
    explanation: 'Object creation needs the class name, a variable, and a constructor call with `new`.',
  },
  {
    prompt: 'Which statement about strings is correct for APCSA?',
    options: ['Strings are mutable and change in place.', 'Strings are immutable and methods return new strings.', 'Strings can only store one character.', 'Strings cannot call methods.'],
    answerIndex: 1,
    explanation: 'String methods such as substring produce a new string instead of changing the original.',
  },
  {
    prompt: 'What is printed by `String s = "go"; s = s.toUpperCase(); System.out.println(s);`?',
    options: ['go', 'GO', 'gO', 'compile error'],
    answerIndex: 1,
    explanation: 'The returned uppercase string is stored back into `s` and then printed.',
  },
  {
    prompt: 'Which method call returns the first character of `label` as a String?',
    options: ['label.charAt(0)', 'label.substring(0, 1)', 'label.substring(1, 0)', 'label.indexOf(0)'],
    answerIndex: 1,
    explanation: 'The current CED uses substring-based String manipulation rather than charAt.',
  },
  {
    prompt: 'What is printed by `int score = 5; score += 3; System.out.println(score);`?',
    options: ['3', '5', '8', '53'],
    answerIndex: 2,
    explanation: 'Compound assignment adds 3 to the existing value and stores 8.',
  },
  {
    prompt: 'Which comment is a valid single-line Java comment?',
    options: ['<!-- note -->', '# note', '// note', '** note'],
    answerIndex: 2,
    explanation: 'Java uses `//` for single-line comments.',
  },
  {
    prompt: 'If `String pet = "llama";`, what does `pet.substring(2)` return?',
    options: ['ll', 'ama', 'ma', 'lama'],
    answerIndex: 1,
    explanation: 'substring with one parameter starts at that index and continues to the end.',
  },
  {
    prompt: 'What is the value of `Integer.parseInt("42")`?',
    options: ['"42"', '42', '4.2', 'compile error'],
    answerIndex: 1,
    explanation: 'parseInt converts the string digits into an int value.',
  },
];

const unit1FillSpecs: FillSpec[] = [
  {
    prompt: 'Complete the code so it stores a decimal temperature.',
    snippet: ['double temp = __value__;', 'System.out.println(temp);'],
    blanks: [{ id: 'value', label: 'decimal literal', answer: '72.5' }],
    explanation: 'A double literal with a decimal point fits the variable type.',
  },
  {
    prompt: 'Finish the String call so it reports the number of letters.',
    snippet: ['String hero = "Pixel";', 'int letters = hero.__method__();'],
    blanks: [{ id: 'method', label: 'String method', answer: 'length' }],
    explanation: 'For Strings, `length()` is a method call.',
  },
  {
    prompt: 'Complete the slice that returns `"CSA"` from the text.',
    snippet: ['String text = "APCSA";', 'String part = text.__cut__(2);'],
    blanks: [{ id: 'cut', label: 'String method', answer: 'substring' }],
    explanation: 'substring(2) begins at index 2 and returns the rest of the string.',
  },
  {
    prompt: 'Complete the cast so the double is stored as an int.',
    snippet: ['double raw = 9.8;', 'int score = (__cast__) raw;'],
    blanks: [{ id: 'cast', label: 'type cast', answer: 'int' }],
    explanation: 'Java casts to int with `(int)` before the expression.',
  },
  {
    prompt: 'Use the correct Math method to find distance from zero.',
    snippet: ['int gap = Math.__tool__(-9);'],
    blanks: [{ id: 'tool', label: 'Math method name', answer: 'abs' }],
    explanation: 'Math.abs is the Quick Reference method for absolute value.',
  },
  {
    prompt: 'Complete the constructor call for a new Scanner object.',
    snippet: ['Scanner scan = __new__ Scanner(System.in);'],
    blanks: [{ id: 'new', label: 'keyword', answer: 'new' }],
    explanation: 'Object construction in Java requires the `new` keyword.',
  },
  {
    prompt: 'Finish the code so it reads a whole line from the Scanner.',
    snippet: ['String line = scan.__read__();'],
    blanks: [{ id: 'read', label: 'Scanner method', answer: 'nextLine' }],
    explanation: 'nextLine() reads an entire line of input.',
  },
  {
    prompt: 'Complete the comparison so it checks string content equality.',
    snippet: ['boolean same = first.__check__(second);'],
    blanks: [{ id: 'check', label: 'String comparison method', answer: 'equals' }],
    explanation: 'For String contents, the correct method is equals.',
  },
  {
    prompt: 'Fill in the range so the roll is from 0 through 5.',
    snippet: ['int roll = (int) (Math.random() * __range__);'],
    blanks: [{ id: 'range', label: 'exclusive upper bound', answer: '6' }],
    explanation: 'Multiplying by 6 gives possible int results 0, 1, 2, 3, 4, and 5.',
  },
  {
    prompt: 'Complete the code so it prints the variable, not a hard-coded copy.',
    snippet: ['int xp = 120;', 'System.out.println(__name__);'],
    blanks: [{ id: 'name', label: 'variable name', answer: 'xp' }],
    explanation: 'The code should print the stored variable name.',
  },
  {
    prompt: 'Complete the method call so the substring begins at index 1 and ends before 3.',
    snippet: ['String badge = "coder";', 'String shortTag = badge.substring(1, __end__);'],
    blanks: [{ id: 'end', label: 'ending index', answer: '3' }],
    explanation: 'substring excludes the ending index, so index 3 stops after characters 1 and 2.',
  },
  {
    prompt: 'Finish the declaration with the correct primitive type for true/false.',
    snippet: ['__type__ passedCheck = false;'],
    blanks: [{ id: 'type', label: 'primitive type', answer: 'boolean' }],
    explanation: 'Boolean values use the primitive type boolean.',
  },
];

const unit2QuizSpecs: QuizSpec[] = [
  {
    prompt: 'When is `score >= 70 && score < 80` true?',
    options: ['Only for scores 70 through 79', 'Only for scores above 80', 'For all positive scores', 'Only for exactly 70 and 80'],
    answerIndex: 0,
    explanation: 'Both comparisons must be true at once, so the value must be in that interval.',
  },
  {
    prompt: 'Which expression is equivalent to `!(x >= 9)`?',
    options: ['x > 9', 'x <= 9', 'x < 9', 'x != 9'],
    answerIndex: 2,
    explanation: 'Not greater than or equal to 9 means strictly less than 9.',
  },
  {
    prompt: 'What is printed?\n`int temp = 68; if (temp > 70) { System.out.println("warm"); } else { System.out.println("cool"); }`',
    options: ['warm', 'cool', '68', 'nothing'],
    answerIndex: 1,
    explanation: 'The condition is false, so the else branch executes.',
  },
  {
    prompt: 'How many times does `System.out.println(i);` run in `for (int i = 2; i <= 6; i++)`?',
    options: ['3', '4', '5', '6'],
    answerIndex: 2,
    explanation: 'The values are 2, 3, 4, 5, and 6, for five total iterations.',
  },
  {
    prompt: 'How many times does the body run?\n`int n = 1; while (n < 10) { n *= 2; }`',
    options: ['2', '3', '4', '5'],
    answerIndex: 2,
    explanation: 'The values progress 1 -> 2 -> 4 -> 8 -> 16, so the loop body runs four times.',
  },
  {
    prompt: 'What is printed by `for (int i = 0; i < 3; i++) { System.out.print(i + " "); }`?',
    options: ['0 1 2', '1 2 3', '0 1 2 3', 'nothing'],
    answerIndex: 0,
    explanation: 'The loop starts at 0 and stops before 3.',
  },
  {
    prompt: 'If `x` is 4 and `y` is 7, what is the value of `x < 5 || y < 3`?',
    options: ['true', 'false', '4', '7'],
    answerIndex: 0,
    explanation: 'The left side is true, so the entire OR expression is true.',
  },
  {
    prompt: 'Which condition correctly checks whether `guess` is not equal to 10?',
    options: ['guess <> 10', 'guess != 10', 'guess not 10', '!(guess == 10'],
    answerIndex: 1,
    explanation: 'Java uses `!=` for not equal.',
  },
  {
    prompt: 'What is printed?\n`for (int row = 0; row < 2; row++) { for (int col = 0; col < 3; col++) { System.out.print("*"); } }`',
    options: ['***', '******', '**', 'compiler error'],
    answerIndex: 1,
    explanation: 'The inner loop prints three stars for each of two outer iterations, producing six stars.',
  },
  {
    prompt: 'What is the purpose of the update portion of a `for` loop?',
    options: ['To declare the loop variable type only', 'To decide whether the loop is true', 'To change the control variable between iterations', 'To print the loop result'],
    answerIndex: 2,
    explanation: 'The update moves the loop toward termination or the next state.',
  },
  {
    prompt: 'Which statement about `if` and `if-else` is correct?',
    options: ['An `if` statement always needs an `else`.', 'An `if-else` provides exactly two possible branches.', 'An `if` statement cannot use boolean expressions.', 'An `if-else` can only print output.'],
    answerIndex: 1,
    explanation: 'A two-way selection chooses between one branch and the other.',
  },
  {
    prompt: 'What does `count++` do inside a loop?',
    options: ['Decreases count by 1', 'Leaves count unchanged', 'Increases count by 1', 'Turns count into a boolean'],
    answerIndex: 2,
    explanation: 'The increment operator adds one to the current variable value.',
  },
  {
    prompt: 'Which loop is best when the number of repetitions is controlled by an index?',
    options: ['for loop', 'comment loop', 'return loop', 'class loop'],
    answerIndex: 0,
    explanation: 'The for loop groups initialization, condition, and update in one place.',
  },
  {
    prompt: 'What is a likely problem if a while loop condition never becomes false?',
    options: ['The code will become a constructor.', 'The loop can run forever.', 'The loop skips its body.', 'The program must return true.'],
    answerIndex: 1,
    explanation: 'Without progress toward termination, a loop can become infinite.',
  },
  {
    prompt: 'How many total executions occur?\n`for (int a = 0; a < 4; a++) { for (int b = 0; b < 1; b++) { work(); } }`',
    options: ['1', '3', '4', '5'],
    answerIndex: 2,
    explanation: 'The inner body runs once for each of the four outer passes.',
  },
  {
    prompt: 'Which boolean expression is true only when both `hasPass` and `isReady` are true?',
    options: ['hasPass || isReady', '!hasPass && isReady', 'hasPass && isReady', 'hasPass == isReady == true'],
    answerIndex: 2,
    explanation: 'The logical AND operator requires both conditions to be true.',
  },
  {
    prompt: 'What is printed?\n`int x = 5; if (x % 2 == 0) { System.out.println("even"); } else { System.out.println("odd"); }`',
    options: ['even', 'odd', '5', 'nothing'],
    answerIndex: 1,
    explanation: 'Because 5 leaves remainder 1 when divided by 2, the else branch prints `odd`.',
  },
  {
    prompt: 'Which best describes nested iteration?',
    options: ['A loop inside another loop', 'A loop with no condition', 'A loop that only runs once', 'A constructor with a return type'],
    answerIndex: 0,
    explanation: 'Nested iteration means one iterative structure is placed inside another.',
  },
];

const unit2FillSpecs: FillSpec[] = [
  {
    prompt: 'Complete the condition so the code runs when the score is at least 90.',
    snippet: ['if (score __check__ 90) {', '  medal = "gold";', '}'],
    blanks: [{ id: 'check', label: 'comparison operator', answer: '>=' }],
    explanation: 'Use `>=` when a boundary value such as 90 should be included.',
  },
  {
    prompt: 'Finish the if-else so it handles the false branch.',
    snippet: ['if (hasBadge) {', '  points += 5;', '} __word__ {', '  points += 1;', '}'],
    blanks: [{ id: 'word', label: 'keyword', answer: 'else' }],
    explanation: 'An else branch executes when the if condition is false.',
  },
  {
    prompt: 'Complete the compound boolean so both tests must pass.',
    snippet: ['if (age >= 16 __join__ hasPermit) {', '  canDrive = true;', '}'],
    blanks: [{ id: 'join', label: 'logical operator', answer: '&&' }],
    explanation: 'Logical AND requires both component conditions to be true.',
  },
  {
    prompt: 'Complete the loop so `i` visits 0 through 4.',
    snippet: ['for (int i = 0; i __stop__ 5; i++) {', '  System.out.println(i);', '}'],
    blanks: [{ id: 'stop', label: 'loop condition operator', answer: '<' }],
    explanation: 'Using `< 5` stops the loop before 5 is printed.',
  },
  {
    prompt: 'Finish the loop update so the counter moves forward.',
    snippet: ['int count = 0;', 'while (count < 4) {', '  count__step__;', '}'],
    blanks: [{ id: 'step', label: 'counter update', answer: '++', alternates: [' += 1'] }],
    explanation: 'The counter must change in a way that moves it toward the loop bound.',
  },
  {
    prompt: 'Complete the nested loop so the inner variable advances.',
    snippet: ['for (int row = 0; row < 3; row++) {', '  for (int col = 0; col < 2; __update__) {', '    total++;', '  }', '}'],
    blanks: [{ id: 'update', label: 'inner update', answer: 'col++', alternates: ['col += 1'] }],
    explanation: 'The inner loop must update the inner control variable, not the row variable.',
  },
  {
    prompt: 'Use the right operator so the condition means “not equal to zero.”',
    snippet: ['while (value __op__ 0) {', '  value--;', '}'],
    blanks: [{ id: 'op', label: 'comparison operator', answer: '!=' }],
    explanation: 'Java uses `!=` for not equal.',
  },
  {
    prompt: 'Complete the String algorithm so it keeps moving to the next position.',
    snippet: ['int pos = text.indexOf("a");', 'while (pos >= 0) {', '  pos = text.indexOf("a", pos __next__);', '}'],
    blanks: [{ id: 'next', label: 'offset to move forward', answer: '+ 1', alternates: ['+1'] }],
    explanation: 'Without moving one character past the current match, the loop would find the same index again.',
  },
  {
    prompt: 'Finish the selection so a tie is handled in the final branch.',
    snippet: ['if (a > b) {', '  winner = a;', '} else if (b > a) {', '  winner = b;', '} else {', '  winner = __tie__;', '}'],
    blanks: [{ id: 'tie', label: 'tie value', answer: '0' }],
    explanation: 'The final else handles the case where the two values are equal.',
  },
  {
    prompt: 'Complete the loop header for a countdown from 5 to 1.',
    snippet: ['for (int n = 5; n > 0; __shift__) {', '  System.out.println(n);', '}'],
    blanks: [{ id: 'shift', label: 'update expression', answer: 'n--', alternates: ['n -= 1'] }],
    explanation: 'A countdown loop needs the control variable to decrease.',
  },
  {
    prompt: 'Finish the condition so the loop stops when the target is found.',
    snippet: ['while (index < words.length && !words[index].equals(target)) {', '  index++;', '}', 'boolean found = index __bound__ words.length;'],
    blanks: [{ id: 'bound', label: 'comparison operator', answer: '<' }],
    explanation: 'If the index is still within the array after the loop, a match was found.',
  },
  {
    prompt: 'Complete the if statement so the branch runs only when `open` is false.',
    snippet: ['if (!__state__) {', '  alarms++;', '}'],
    blanks: [{ id: 'state', label: 'boolean variable', answer: 'open' }],
    explanation: 'The logical not operator flips the boolean condition.',
  },
];

const unit3QuizSpecs: QuizSpec[] = [
  {
    prompt: 'Which part of a class stores persistent state for each object?',
    options: ['Instance variables', 'Loop headers', 'Comments', 'Import statements'],
    answerIndex: 0,
    explanation: 'Instance variables belong to each object and store its state over time.',
  },
  {
    prompt: 'Which method header is a constructor for class `Robot`?',
    options: ['public void Robot()', 'public Robot()', 'public int Robot()', 'void constructor Robot()'],
    answerIndex: 1,
    explanation: 'Constructors have the same name as the class and no return type.',
  },
  {
    prompt: 'Why is `this.level = level;` useful inside a constructor?',
    options: ['It creates a loop.', 'It distinguishes the field from the parameter.', 'It declares a local variable named `this`.', 'It makes the field static.'],
    answerIndex: 1,
    explanation: 'The left side refers to the object field; the right side refers to the parameter.',
  },
  {
    prompt: 'Which method is most likely a mutator method?',
    options: ['public int getCoins()', 'public String getName()', 'public void addCoins(int amt)', 'public int levelUp()'],
    answerIndex: 2,
    explanation: 'A mutator changes object state, and `addCoins` suggests updating a field.',
  },
  {
    prompt: 'Which method is most likely an accessor?',
    options: ['public void resetScore()', 'public int getScore()', 'public void addScore(int amt)', 'public void setScore(int s)'],
    answerIndex: 1,
    explanation: 'An accessor reports information without modifying object state.',
  },
  {
    prompt: 'What is the return type of a method that returns `true` or `false`?',
    options: ['int', 'boolean', 'String', 'void'],
    answerIndex: 1,
    explanation: 'Boolean-returning methods use the type boolean.',
  },
  {
    prompt: 'If a method header is `public void boost(int amt)`, what does `void` mean?',
    options: ['The method returns no value.', 'The method cannot use parameters.', 'The method is private.', 'The method must be static.'],
    answerIndex: 0,
    explanation: 'A void method performs an action without returning a value.',
  },
  {
    prompt: 'Where is a local variable declared inside a method visible?',
    options: ['Only inside that method block', 'Across the whole class', 'In every object of the class', 'In every file in the project'],
    answerIndex: 0,
    explanation: 'Local variables exist only in the scope where they are declared.',
  },
  {
    prompt: 'Which statement about class design best matches FRQ 2 expectations?',
    options: ['Add extra features not asked for.', 'Match the specification method by method.', 'Avoid constructors.', 'Use recursion whenever possible.'],
    answerIndex: 1,
    explanation: 'The FRQ rewards following the given class contract closely.',
  },
  {
    prompt: 'What is the purpose of an instance method?',
    options: ['It works with a specific object’s data.', 'It imports classes into a file.', 'It replaces the constructor.', 'It declares comments.'],
    answerIndex: 0,
    explanation: 'Instance methods act on the state stored by a particular object.',
  },
  {
    prompt: 'Which is a correct description of an object reference variable?',
    options: ['It stores a primitive decimal.', 'It names a specific loop.', 'It refers to an object created from a class.', 'It can only be used inside comments.'],
    answerIndex: 2,
    explanation: 'Reference variables point to objects rather than storing primitive values.',
  },
  {
    prompt: 'What should a constructor usually do?',
    options: ['Initialize instance variables', 'Return an int value', 'Call `main` automatically', 'Declare import statements'],
    answerIndex: 0,
    explanation: 'Constructors set up a new object’s initial state.',
  },
  {
    prompt: 'Which field should normally be declared outside all methods in a class?',
    options: ['A loop counter used once', 'An instance variable like `private int energy;`', 'A local temporary variable', 'A parameter name'],
    answerIndex: 1,
    explanation: 'Fields belong at class scope, outside individual methods.',
  },
  {
    prompt: 'Which header correctly declares an accessor for a String field `name`?',
    options: ['public void getName()', 'public String getName()', 'String public getName()', 'public name getString()'],
    answerIndex: 1,
    explanation: 'The method returns a String, so the return type must be String.',
  },
  {
    prompt: 'Which line best creates a `Robot` object named `bot`?',
    options: ['Robot = new bot();', 'new Robot bot();', 'Robot bot = new Robot();', 'Robot(bot) = new;'],
    answerIndex: 2,
    explanation: 'Object creation uses the class name, a variable name, and a constructor call.',
  },
  {
    prompt: 'If a method changes an instance variable, what kind of method is it usually acting as?',
    options: ['Accessor', 'Mutator', 'Comment', 'Loop guard'],
    answerIndex: 1,
    explanation: 'A mutator changes the object’s stored state.',
  },
  {
    prompt: 'Which keyword refers to the current object?',
    options: ['self', 'current', 'this', 'superclass'],
    answerIndex: 2,
    explanation: 'APCSA uses `this` to refer to the object whose method or constructor is running.',
  },
  {
    prompt: 'Which statement about parameters is correct?',
    options: ['Parameters are class fields by default.', 'Parameters are local to the method call.', 'Parameters must be booleans.', 'Parameters cannot share a name with fields.'],
    answerIndex: 1,
    explanation: 'Parameters exist only for that method call and are part of the method’s local scope.',
  },
];

const unit3FillSpecs: FillSpec[] = [
  {
    prompt: 'Complete the constructor header for class `Player`.',
    snippet: ['public __name__(int score) {', '  this.score = score;', '}'],
    blanks: [{ id: 'name', label: 'class name', answer: 'Player' }],
    explanation: 'A constructor uses the class name exactly and has no return type.',
  },
  {
    prompt: 'Finish the field assignment inside the constructor.',
    snippet: ['public Drone(int energy) {', '  this.energy = __value__;', '}'],
    blanks: [{ id: 'value', label: 'parameter name', answer: 'energy' }],
    explanation: 'The parameter value is assigned into the object field.',
  },
  {
    prompt: 'Complete the accessor so it returns the field.',
    snippet: ['public int getLevel() {', '  return __field__;', '}'],
    blanks: [{ id: 'field', label: 'field name', answer: 'level' }],
    explanation: 'Accessors return the requested instance variable.',
  },
  {
    prompt: 'Finish the mutator header so it changes the object without returning a value.',
    snippet: ['public __type__ setName(String newName) {', '  name = newName;', '}'],
    blanks: [{ id: 'type', label: 'return type', answer: 'void' }],
    explanation: 'A standard setter usually performs an update and returns nothing.',
  },
  {
    prompt: 'Use the keyword that refers to the current object.',
    snippet: ['public void setCoins(int coins) {', '  __owner__.coins = coins;', '}'],
    blanks: [{ id: 'owner', label: 'keyword', answer: 'this' }],
    explanation: 'Use `this` to refer to the current object’s field.',
  },
  {
    prompt: 'Complete the return statement of a boolean accessor.',
    snippet: ['public boolean isReady() {', '  return __field__;', '}'],
    blanks: [{ id: 'field', label: 'boolean field', answer: 'ready' }],
    explanation: 'A boolean accessor typically returns the boolean field directly.',
  },
  {
    prompt: 'Fill in the class name in the object creation line.',
    snippet: ['__type__ hero = new Hero(5);'],
    blanks: [{ id: 'type', label: 'class name', answer: 'Hero' }],
    explanation: 'The variable type and constructor class must match.',
  },
  {
    prompt: 'Complete the method call on the object reference.',
    snippet: ['Robot bot = new Robot();', 'bot.__action__(3);'],
    blanks: [{ id: 'action', label: 'instance method name', answer: 'move' }],
    explanation: 'Once an object exists, you call its instance methods through the reference variable.',
  },
  {
    prompt: 'Finish the parameter list to match the method body.',
    snippet: ['public void addPoints(int __param__) {', '  score += __param__;', '}'],
    blanks: [{ id: 'param', label: 'parameter name', answer: 'amt' }],
    explanation: 'The parameter name should be used consistently throughout the method body.',
  },
  {
    prompt: 'Complete the field declaration for a String instance variable.',
    snippet: ['private __type__ name;'],
    blanks: [{ id: 'type', label: 'data type', answer: 'String' }],
    explanation: 'Text values are stored in String fields.',
  },
  {
    prompt: 'Use the correct access modifier from common APCSA class examples.',
    snippet: ['__access__ int energy;'],
    blanks: [{ id: 'access', label: 'access modifier', answer: 'private' }],
    explanation: 'Instance variables are commonly declared private in class design problems.',
  },
  {
    prompt: 'Finish the return type for a method that reports a String field.',
    snippet: ['public __type__ getTitle() {', '  return title;', '}'],
    blanks: [{ id: 'type', label: 'return type', answer: 'String' }],
    explanation: 'The return type should match the kind of value returned by the method.',
  },
];

const unit4QuizSpecs: QuizSpec[] = [
  {
    prompt: 'What is the last valid index of an array with length 12?',
    options: ['10', '11', '12', '13'],
    answerIndex: 1,
    explanation: 'Arrays are zero-indexed, so the last valid position is length minus one.',
  },
  {
    prompt: 'Which loop visits every index of `nums` exactly once?',
    options: ['for (int i = 1; i <= nums.length; i++)', 'for (int i = 0; i < nums.length; i++)', 'for (int i = 0; i <= nums.length; i++)', 'for (int i = nums.length; i > 0; i++)'],
    answerIndex: 1,
    explanation: 'Start at 0 and continue while the index is less than the length.',
  },
  {
    prompt: 'If `int[] vals = {2, 4, 6}; int total = 0; for (int n : vals) total += n;`, what is `total`?',
    options: ['6', '8', '10', '12'],
    answerIndex: 3,
    explanation: 'The enhanced for loop visits all three values and sums them.',
  },
  {
    prompt: 'Which ArrayList method returns the number of stored elements?',
    options: ['length', 'size()', 'count()', 'getSize()'],
    answerIndex: 1,
    explanation: 'ArrayLists use the `size()` method instead of an array `length` field.',
  },
  {
    prompt: 'What does `items.get(3)` do?',
    options: ['Adds a value at index 3', 'Removes index 3', 'Returns the element at index 3', 'Sorts the first three elements'],
    answerIndex: 2,
    explanation: 'The `get` method reads the existing element at the specified index.',
  },
  {
    prompt: 'What does `items.set(1, "gem")` do?',
    options: ['Replaces the element at index 1', 'Appends `"gem"` to the end', 'Deletes index 1', 'Returns index 1'],
    answerIndex: 0,
    explanation: 'set replaces the existing element at that position.',
  },
  {
    prompt: 'Why can removing from an ArrayList during forward traversal be tricky?',
    options: ['size() stops working', 'Elements shift left after removal', 'The ArrayList becomes an array', 'Java forbids remove in loops'],
    answerIndex: 1,
    explanation: 'After a removal, later elements move to lower indexes.',
  },
  {
    prompt: 'In `grid[row][col]`, what does the first index represent?',
    options: ['The column', 'The row', 'The value itself', 'The data type'],
    answerIndex: 1,
    explanation: 'The first index chooses a row from the outer array.',
  },
  {
    prompt: 'Which expression gives the number of columns in the current row of a 2D array?',
    options: ['grid.length', 'grid[col].length', 'grid[row].length', 'grid.size()'],
    answerIndex: 2,
    explanation: 'The inner array length for the current row gives the column count.',
  },
  {
    prompt: 'What is row-major traversal?',
    options: ['Visiting all columns of one row before moving to the next row', 'Visiting the main diagonal only', 'Visiting columns from bottom to top only', 'Sorting each row alphabetically'],
    answerIndex: 0,
    explanation: 'Standard APCSA 2D traversal goes row by row.',
  },
  {
    prompt: 'When is binary search appropriate?',
    options: ['Whenever a list is unsorted', 'Only when the data is already sorted', 'Only for 2D arrays', 'Only for ArrayLists of Strings'],
    answerIndex: 1,
    explanation: 'Binary search relies on sorted order to eliminate half the search space.',
  },
  {
    prompt: 'What is the main idea of linear search?',
    options: ['Check elements one by one until found or exhausted', 'Sort the array first every time', 'Use recursion only', 'Compare only the middle element'],
    answerIndex: 0,
    explanation: 'Linear search traverses from one end, checking elements sequentially.',
  },
  {
    prompt: 'What does insertion sort do at a high level?',
    options: ['Places each new element into the correct spot among earlier sorted elements', 'Swaps the largest element to the end only once', 'Randomizes the array before sorting', 'Uses a queue instead of an array'],
    answerIndex: 0,
    explanation: 'Insertion sort builds a sorted portion one element at a time.',
  },
  {
    prompt: 'Which statement about selection sort is correct?',
    options: ['It repeatedly finds the smallest remaining element and puts it next', 'It requires recursion', 'It only works on String arrays', 'It changes array length'],
    answerIndex: 0,
    explanation: 'Selection sort chooses the next smallest value for each position.',
  },
  {
    prompt: 'Why are wrapper classes relevant to ArrayList?',
    options: ['ArrayLists store primitive types directly', 'ArrayLists store object references, so wrapper classes are used for numbers', 'Wrapper classes remove the need for methods', 'Wrapper classes are only for comments'],
    answerIndex: 1,
    explanation: 'ArrayLists hold references, which is why Integer appears instead of int in generic types.',
  },
  {
    prompt: 'Which declaration creates an ArrayList of Integer values?',
    options: ['ArrayList<int> nums = new ArrayList<int>();', 'ArrayList<Integer> nums = new ArrayList<Integer>();', 'IntegerList nums = new ArrayList();', 'ArrayList numbers = new Integer();'],
    answerIndex: 1,
    explanation: 'APCSA uses wrapper classes such as Integer in generic ArrayLists.',
  },
  {
    prompt: 'What is printed first in a standard row-major traversal of `{{5, 7}, {1, 9}}`?',
    options: ['7', '5', '1', '9'],
    answerIndex: 1,
    explanation: 'Row-major traversal starts at row 0, column 0.',
  },
  {
    prompt: 'If `ArrayList<String> words` has 4 elements, what is the last valid index?',
    options: ['2', '3', '4', '5'],
    answerIndex: 1,
    explanation: 'Like arrays, valid indexes run from 0 through size minus one.',
  },
  {
    prompt: 'Which best describes a common array algorithm pattern?',
    options: ['Traverse, inspect the current value, update a tracker', 'Jump directly to the last element only', 'Only compare the first two values', 'Avoid loops and use comments instead'],
    answerIndex: 0,
    explanation: 'Most APCSA array problems use a loop plus a running count, sum, min, or max.',
  },
  {
    prompt: 'What is usually the role of the inner loop in 2D array traversal?',
    options: ['Move across columns within one row', 'Choose the number of rows', 'Declare the array type', 'Return the final answer immediately'],
    answerIndex: 0,
    explanation: 'The inner loop typically moves across the columns in the selected row.',
  },
  {
    prompt: 'What does `values.add(2, 99)` do in an ArrayList?',
    options: ['Replaces index 2', 'Inserts 99 at index 2 and shifts later elements right', 'Removes index 2', 'Checks whether 99 is in the list'],
    answerIndex: 1,
    explanation: 'add with an index inserts and shifts existing later elements.',
  },
  {
    prompt: 'Which line correctly accesses the element in row 2, column 1 of `board`?',
    options: ['board[1][2]', 'board[2][1]', 'board(2, 1)', 'board.get(2, 1)'],
    answerIndex: 1,
    explanation: 'The first index selects the row, and the second selects the column within that row.',
  },
];

const unit4FillSpecs: FillSpec[] = [
  {
    prompt: 'Complete the array traversal so it sums every element.',
    snippet: ['int total = 0;', 'for (int i = 0; i < nums.__size__; i++) {', '  total += nums[__slot__];', '}'],
    blanks: [
      { id: 'size', label: 'array length field', answer: 'length' },
      { id: 'slot', label: 'current index variable', answer: 'i' },
    ],
    explanation: 'Arrays use the `length` field and are accessed with the current loop index.',
  },
  {
    prompt: 'Finish the ArrayList traversal that reads each current element.',
    snippet: ['for (int i = 0; i < words.size(); i++) {', '  String current = words.__read__(i);', '}'],
    blanks: [{ id: 'read', label: 'ArrayList access method', answer: 'get' }],
    explanation: 'Use `get(i)` to read the current element from an ArrayList.',
  },
  {
    prompt: 'Complete the ArrayList method that replaces an existing entry.',
    snippet: ['prizes.__method__(1, "star");'],
    blanks: [{ id: 'method', label: 'replacement method', answer: 'set' }],
    explanation: 'Use `set` to replace the element already stored at an index.',
  },
  {
    prompt: 'Use the correct wrapper class in the declaration.',
    snippet: ['ArrayList<__type__> scores = new ArrayList<__type__>();'],
    blanks: [{ id: 'type', label: 'wrapper class for int', answer: 'Integer' }],
    explanation: 'ArrayList generic types use wrapper classes rather than primitives.',
  },
  {
    prompt: 'Complete the nested loops so the inner loop uses the column bound of the current row.',
    snippet: ['for (int row = 0; row < grid.length; row++) {', '  for (int col = 0; col < grid[__rowRef__].length; col++) {', '    total += grid[row][col];', '  }', '}'],
    blanks: [{ id: 'rowRef', label: 'row reference', answer: 'row' }],
    explanation: 'The current row variable is used when checking the column length.',
  },
  {
    prompt: 'Finish the linear search return statement when the target is found.',
    snippet: ['if (nums[i] == target) {', '  return __value__;', '}'],
    blanks: [{ id: 'value', label: 'boolean result', answer: 'true' }],
    explanation: 'A found match usually returns true immediately in a boolean search method.',
  },
  {
    prompt: 'Complete the 2D array access so it reads the current column variable.',
    snippet: ['total += board[row][__colRef__];'],
    blanks: [{ id: 'colRef', label: 'column variable', answer: 'col' }],
    explanation: 'The second index in a 2D traversal should use the current column variable.',
  },
  {
    prompt: 'Fill in the comparison so binary search keeps the left half when the middle value is too large.',
    snippet: ['if (target __cmp__ data[mid]) {', '  high = mid - 1;', '}'],
    blanks: [{ id: 'cmp', label: 'comparison operator', answer: '<' }],
    explanation: 'If the target is smaller than the middle value, the upper bound moves left.',
  },
];

const mixedQuizSpecs: QuizSpec[] = [
  {
    prompt: 'Which APCSA exam structure matches the current Course and Exam Description?',
    options: ['42 multiple-choice and 4 free-response questions', '40 multiple-choice and 4 free-response questions', '50 multiple-choice and 2 free-response questions', '4 multiple-choice and 42 free-response questions'],
    answerIndex: 0,
    explanation: 'The Fall 2025 CED uses 42 MCQs and 4 FRQs.',
  },
  {
    prompt: 'Which FRQ type most directly targets class constructors and methods?',
    options: ['Methods and Control Structures', 'Class Design', 'Data Analysis with ArrayList', '2D Array'],
    answerIndex: 1,
    explanation: 'FRQ 2 is the class design problem.',
  },
  {
    prompt: 'What is the base case in recursion?',
    options: ['The line that repeats forever', 'The stopping condition that returns without another recursive call', 'The first element of an array', 'A constructor with no parameters'],
    answerIndex: 1,
    explanation: 'The base case prevents infinite recursion by stopping further calls.',
  },
  {
    prompt: 'What is printed by `int[] nums = {1, 3, 5}; System.out.println(nums[1]);`?',
    options: ['1', '3', '5', 'compile error'],
    answerIndex: 1,
    explanation: 'Index 1 is the second element in the array.',
  },
  {
    prompt: 'If `String s = "loop";`, what is `s.substring(1, 3)`?',
    options: ['lo', 'oo', 'oop', 'op'],
    answerIndex: 1,
    explanation: 'The substring begins at index 1 and stops before index 3.',
  },
  {
    prompt: 'Which condition correctly checks whether an index is still valid for an array named `data`?',
    options: ['index <= data.length', 'index < data.length', 'index < data.size()', 'index == data.length'],
    answerIndex: 1,
    explanation: 'The final valid index is one less than `data.length`.',
  },
  {
    prompt: 'Which statement about selection sort and insertion sort is correct?',
    options: ['Both are covered as formal named algorithms in APCSA.', 'Only binary search is covered, not sorting.', 'Searching and sorting appear in Unit 4 review content.', 'Sorting only appears in the Java Quick Reference.'],
    answerIndex: 2,
    explanation: 'The current CED includes searching and sorting algorithms in Unit 4.',
  },
  {
    prompt: 'What does `ArrayList<Integer> vals = new ArrayList<Integer>();` create?',
    options: ['A fixed-size array of ints', 'A resizable list of Integer objects', 'A 2D array', 'A primitive variable'],
    answerIndex: 1,
    explanation: 'ArrayList creates a dynamic collection of the specified reference type.',
  },
  {
    prompt: 'Which loop pattern is safest for summing all rows and columns of a 2D array?',
    options: ['One while loop with no update', 'A single if statement', 'Nested loops with rows outside and columns inside', 'A constructor'],
    answerIndex: 2,
    explanation: '2D array summation usually uses a row loop outside and a column loop inside.',
  },
  {
    prompt: 'What is a common bug when removing items from an ArrayList while moving forward by index?',
    options: ['The removed item becomes 0.', 'The next item shifts left and may be skipped.', 'The list changes into a 2D array.', 'The loop becomes recursive.'],
    answerIndex: 1,
    explanation: 'After removal, later elements shift left, so a simple `i++` can skip one.',
  },
  {
    prompt: 'Which is the best first move on a free-response question?',
    options: ['Add extra helper classes immediately.', 'Match the prompt specification and method headers first.', 'Skip directly to recursion.', 'Rewrite the question in Python.'],
    answerIndex: 1,
    explanation: 'The easiest points usually come from matching the required class or method structure correctly.',
  },
  {
    prompt: 'Which unit carries the largest multiple-choice weight in the current CED?',
    options: ['Unit 1: Using Objects and Methods', 'Unit 2: Selection and Iteration', 'Unit 3: Class Creation', 'Unit 4: Data Collections'],
    answerIndex: 3,
    explanation: 'Unit 4 has the largest weighting range at 30–40%.',
  },
  {
    prompt: 'What is printed by `for (int i = 0; i < 2; i++) { System.out.print(i); }`?',
    options: ['01', '12', '02', '0011'],
    answerIndex: 0,
    explanation: 'The loop prints 0 and then 1.',
  },
  {
    prompt: 'If `boolean ok = false;`, what does `!ok` evaluate to?',
    options: ['false', 'true', '0', 'compile error'],
    answerIndex: 1,
    explanation: 'Logical NOT flips false to true.',
  },
  {
    prompt: 'Which method call is correct for reading the size of an ArrayList named `tasks`?',
    options: ['tasks.length', 'tasks.length()', 'tasks.size()', 'tasks.getSize()'],
    answerIndex: 2,
    explanation: 'ArrayLists use `size()`.',
  },
  {
    prompt: 'Which statement about object references is correct?',
    options: ['They are only used for primitive types.', 'They can call instance methods on created objects.', 'They replace all constructors.', 'They cannot be stored in variables.'],
    answerIndex: 1,
    explanation: 'Reference variables store references to objects and are used to call their instance methods.',
  },
  {
    prompt: 'What does `return` do in a non-void method?',
    options: ['Declares a field', 'Ends the method and sends back a value', 'Starts a loop', 'Imports Java classes'],
    answerIndex: 1,
    explanation: 'A return statement provides the value the method produces.',
  },
  {
    prompt: 'Which is a correct reason to trace code with small examples?',
    options: ['It slows down debugging on purpose.', 'It helps reveal execution order and boundary mistakes.', 'It removes the need for loops.', 'It turns comments into code.'],
    answerIndex: 1,
    explanation: 'The CED repeatedly emphasizes tracing and testing code behavior.',
  },
  {
    prompt: 'What is the result of `3 < 5 && 8 < 2`?',
    options: ['true', 'false', '3', '8'],
    answerIndex: 1,
    explanation: 'One side is false, so the entire AND expression is false.',
  },
  {
    prompt: 'Which statement about arrays and ArrayLists is correct?',
    options: ['Both use `.size()`.', 'Arrays are fixed length while ArrayLists can change size.', 'ArrayLists cannot store Strings.', 'Arrays require wrapper classes for all values.'],
    answerIndex: 1,
    explanation: 'That is one of the key contrasts between the two collection types.',
  },
];

const mixedFillSpecs: FillSpec[] = [
  {
    prompt: 'Complete the recursive base case return value.',
    snippet: ['public int sumDown(int n) {', '  if (n == 0) {', '    return __base__;', '  }', '  return n + sumDown(n - 1);', '}'],
    blanks: [{ id: 'base', label: 'base-case value', answer: '0' }],
    explanation: 'Returning 0 is the standard additive base case for this recursion pattern.',
  },
  {
    prompt: 'Fill in the loop condition so every array index is visited safely.',
    snippet: ['for (int i = 0; i __bound__ scores.length; i++) {', '  total += scores[i];', '}'],
    blanks: [{ id: 'bound', label: 'comparison operator', answer: '<' }],
    explanation: 'Stop before `scores.length` because the final valid index is one less than length.',
  },
  {
    prompt: 'Complete the method call that reads an ArrayList element.',
    snippet: ['String item = rewards.__read__(i);'],
    blanks: [{ id: 'read', label: 'ArrayList method', answer: 'get' }],
    explanation: 'Use `get(i)` to access an existing list element.',
  },
  {
    prompt: 'Use the keyword for the false branch of a selection statement.',
    snippet: ['if (passed) {', '  level++;', '} __branch__ {', '  retries++;', '}'],
    blanks: [{ id: 'branch', label: 'keyword', answer: 'else' }],
    explanation: 'An else branch handles the false case.',
  },
  {
    prompt: 'Complete the constructor assignment using the current object reference.',
    snippet: ['public Quest(String name) {', '  __self__.name = name;', '}'],
    blanks: [{ id: 'self', label: 'keyword', answer: 'this' }],
    explanation: 'Use `this` to refer to the current object field.',
  },
  {
    prompt: 'Fill in the 2D traversal update for the inner column loop.',
    snippet: ['for (int col = 0; col < map[row].length; __move__) {', '  count++;', '}'],
    blanks: [{ id: 'move', label: 'inner update', answer: 'col++', alternates: ['col += 1'] }],
    explanation: 'The inner loop should update the inner control variable.',
  },
  {
    prompt: 'Complete the String comparison so it checks character content.',
    snippet: ['if (guess.__same__(answer)) {', '  score++;', '}'],
    blanks: [{ id: 'same', label: 'String method', answer: 'equals' }],
    explanation: 'String contents are compared with equals.',
  },
  {
    prompt: 'Use the correct wrapper class in this list declaration.',
    snippet: ['ArrayList<__type__> levels = new ArrayList<__type__>();'],
    blanks: [{ id: 'type', label: 'wrapper class', answer: 'Integer' }],
    explanation: 'Generic ArrayLists use reference types such as Integer.',
  },
  {
    prompt: 'Complete the boolean result when the search target is missing.',
    snippet: ['for (int n : data) {', '  if (n == target) {', '    return true;', '  }', '}', 'return __miss__;',],
    blanks: [{ id: 'miss', label: 'result when absent', answer: 'false' }],
    explanation: 'If no element matches, the search method should return false.',
  },
  {
    prompt: 'Fill in the current row reference used to get the column length.',
    snippet: ['for (int row = 0; row < board.length; row++) {', '  for (int col = 0; col < board[__row__].length; col++) {', '    total += board[row][col];', '  }', '}'],
    blanks: [{ id: 'row', label: 'row variable', answer: 'row' }],
    explanation: 'Use the current row variable to access the inner array length.',
  },
];

export const sectionPracticeDecks: PracticeSection[] = [
  {
    id: 'unit-1',
    unit: 'Unit 1',
    title: 'Unit 1 Deep Drill Pack',
    sourceNote:
      'Built around CED Topics 1.1–1.15, Java Quick Reference fluency, and prep-book tracing patterns for objects, methods, Strings, casting, and Math.',
    challenges: [
      ...buildQuizSet('unit1', unit1QuizSpecs),
      ...buildFillSet('unit1', unit1FillSpecs),
    ],
  },
  {
    id: 'unit-2',
    unit: 'Unit 2',
    title: 'Unit 2 Selection and Iteration Pack',
    sourceNote:
      'Built from the Unit 2 CED emphasis on boolean expressions, if-statements, loops, code tracing, and algorithm testing plus review-book bug-fix drills.',
    challenges: [
      ...buildQuizSet('unit2', unit2QuizSpecs),
      ...buildFillSet('unit2', unit2FillSpecs),
    ],
  },
  {
    id: 'unit-3',
    unit: 'Unit 3',
    title: 'Unit 3 Class Design Pack',
    sourceNote:
      'Focused on FRQ 2 class-design skills from the CED and review books: constructors, fields, scope, accessors, mutators, and the `this` keyword.',
    challenges: [
      ...buildQuizSet('unit3', unit3QuizSpecs),
      ...buildFillSet('unit3', unit3FillSpecs),
    ],
  },
  {
    id: 'unit-4',
    unit: 'Unit 4',
    title: 'Unit 4 Data Collections Pack',
    sourceNote:
      'Centered on the heaviest exam section: arrays, ArrayLists, 2D arrays, searching, sorting, wrapper classes, and standard traversal algorithms.',
    challenges: [
      ...buildQuizSet('unit4', unit4QuizSpecs),
      ...buildFillSet('unit4', unit4FillSpecs),
    ],
  },
  {
    id: 'mixed-review',
    unit: 'Units 2-4',
    title: 'Mixed Review Forge',
    sourceNote:
      'A mixed score-5 review pack using the current CED exam format and the recurring patterns from the provided study guides and practice books.',
    challenges: [
      ...buildQuizSet('mixed', mixedQuizSpecs),
      ...buildFillSet('mixed', mixedFillSpecs),
    ],
  },
];
