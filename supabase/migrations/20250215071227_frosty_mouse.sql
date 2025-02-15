/*
  # Create grades table for exam submissions

  1. New Tables
    - `grades`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, foreign key to submissions, unique)
      - `score` (integer, 0-100)
      - `feedback` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `grades` table
    - Add policy for public access (temporary for MVP)

  3. Features
    - Automatic updated_at timestamp updates
    - Score range validation (0-100)
    - Unique constraint on submission_id to prevent multiple grades per submission
*/

CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,
  score integer CHECK (score >= 0 AND score <= 100),
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access to grades"
  ON grades
  FOR ALL
  USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_grades_updated_at
  BEFORE UPDATE ON grades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();