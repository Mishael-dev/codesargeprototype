/*
  # Add submissions table

  1. New Tables
    - `submissions`
      - `id` (uuid, primary key)
      - `exam_id` (uuid, references exams)
      - `question_id` (uuid, references questions)
      - `code` (text, the submitted code)
      - `status` (text, submission status)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `submissions` table
    - Add policy for public access (MVP phase)
*/

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access to submissions"
  ON submissions
  FOR ALL
  USING (true);