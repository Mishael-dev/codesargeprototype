export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  language: 'python' | 'javascript';
  testCases: TestCase[];
  starterCode: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}