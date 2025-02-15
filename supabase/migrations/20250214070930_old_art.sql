/*
  # CodeSarge Database Schema

  1. New Tables
    - `exams`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `questions`
      - `id` (uuid, primary key)
      - `exam_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `language` (text)
      - `starter_code` (text)
      - `order` (integer)
    
    - `test_cases`
      - `id` (uuid, primary key)
      - `question_id` (uuid, foreign key)
      - `input` (text)
      - `expected_output` (text)
      - `order` (integer)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since auth is not implemented yet)
*/

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  language text NOT NULL,
  starter_code text NOT NULL DEFAULT '',
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create test cases table
CREATE TABLE IF NOT EXISTS test_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  input text NOT NULL,
  expected_output text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for MVP)
CREATE POLICY "Public access to exams"
  ON exams
  FOR ALL
  USING (true);

CREATE POLICY "Public access to questions"
  ON questions
  FOR ALL
  USING (true);

CREATE POLICY "Public access to test cases"
  ON test_cases
  FOR ALL
  USING (true);