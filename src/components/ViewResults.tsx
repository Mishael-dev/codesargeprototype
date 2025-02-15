import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, XCircle, Clock, Save } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface Grade {
  id: string;
  score: number;
  feedback: string;
}

interface Submission {
  id: string;
  exam_id: string;
  question_id: string;
  code: string;
  status: string;
  created_at: string;
  grade?: Grade;
  question: {
    title: string;
    description: string;
    language: string;
    test_cases: {
      input: string;
      expected_output: string;
    }[];
  };
  exam: {
    title: string;
  };
}

export default function ViewResults() {
  const { examId } = useParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [examId]);

  useEffect(() => {
    if (selectedSubmission?.grade) {
      setScore(selectedSubmission.grade.score);
      setFeedback(selectedSubmission.grade.feedback || '');
    } else {
      setScore(0);
      setFeedback('');
    }
  }, [selectedSubmission]);

  const fetchSubmissions = async () => {
    try {
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          *,
          question:questions (
            title,
            description,
            language,
            test_cases (
              input,
              expected_output
            )
          ),
          exam:exams (
            title
          ),
          grade:grades (
            id,
            score,
            feedback
          )
        `)
        .order('created_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      if (examId) {
        submissionsData?.filter(submission => submission.exam_id === examId);
      }

      setSubmissions(submissionsData || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const saveGrade = async () => {
    if (!selectedSubmission) return;

    setSaving(true);
    try {
      if (selectedSubmission.grade?.id) {
        // Update existing grade
        const { error } = await supabase
          .from('grades')
          .update({
            score,
            feedback
          })
          .eq('id', selectedSubmission.grade.id);

        if (error) throw error;
      } else {
        // Create new grade
        const { error } = await supabase
          .from('grades')
          .insert({
            submission_id: selectedSubmission.id,
            score,
            feedback
          });

        if (error) throw error;
      }

      // Refresh submissions to get updated data
      await fetchSubmissions();
      alert('Grade saved successfully!');
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedSubmission) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={() => setSelectedSubmission(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Results
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {selectedSubmission.exam.title}
              </h1>
              <h2 className="text-xl text-gray-700 mb-2">
                {selectedSubmission.question.title}
              </h2>
              <p className="text-gray-600">
                Submitted on {new Date(selectedSubmission.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(selectedSubmission.status)}
              <span className="capitalize">{selectedSubmission.status}</span>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <h3 className="text-lg font-semibold">Question</h3>
            <p className="text-gray-600 whitespace-pre-wrap">
              {selectedSubmission.question.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border rounded-lg">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Submitted Code</h3>
                <p className="text-sm text-gray-600">
                  Language: {selectedSubmission.question.language}
                </p>
              </div>
              <div className="h-[400px]">
                <Editor
                  height="100%"
                  defaultLanguage={selectedSubmission.question.language}
                  value={selectedSubmission.code}
                  theme="vs-light"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Grading</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) => setScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                      className="w-full p-2 border rounded-md"
                      placeholder="Provide feedback to the student..."
                    />
                  </div>
                  <button
                    onClick={saveGrade}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Grade'}
                  </button>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Test Cases</h3>
                <div className="space-y-4">
                  {selectedSubmission.question.test_cases.map((testCase, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="font-mono text-sm">
                        <strong>Input:</strong> {testCase.input}
                      </div>
                      <div className="font-mono text-sm">
                        <strong>Expected:</strong> {testCase.expected_output}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Exam Results</h1>
      
      {submissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No submissions found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedSubmission(submission)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {submission.exam.title}
                  </h2>
                  <h3 className="text-lg text-gray-700 mb-2">
                    {submission.question.title}
                  </h3>
                  <p className="text-gray-600">
                    Submitted on {new Date(submission.created_at).toLocaleString()}
                  </p>
                  {submission.grade && (
                    <p className="mt-2 text-blue-600 font-medium">
                      Score: {submission.grade.score}/100
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(submission.status)}
                  <span className="capitalize">{submission.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}