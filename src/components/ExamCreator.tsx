import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Question, TestCase } from '../types';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ExamCreator() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      description: '',
      language: 'python',
      testCases: [],
      starterCode: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const addTestCase = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const newTestCase: TestCase = { input: '', expectedOutput: '' };
    updatedQuestions[questionIndex].testCases.push(newTestCase);
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create exam
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert([{ title, description }])
        .select()
        .single();

      if (examError) throw examError;

      // Create questions and test cases
      for (const [index, question] of questions.entries()) {
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert([{
            exam_id: exam.id,
            title: question.title,
            description: question.description,
            language: question.language,
            starter_code: question.starterCode,
            order: index
          }])
          .select()
          .single();

        if (questionError) throw questionError;

        // Create test cases for this question
        const testCasesData = question.testCases.map((testCase, testIndex) => ({
          question_id: questionData.id,
          input: testCase.input,
          expected_output: testCase.expectedOutput,
          order: testIndex
        }));

        const { error: testCasesError } = await supabase
          .from('test_cases')
          .insert(testCasesData);

        if (testCasesError) throw testCasesError;
      }

      // Show success message and redirect
      alert('Exam created successfully!');
      navigate('/take-exam');
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Failed to create exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create New Exam</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Exam Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <PlusCircle size={20} />
              Add Question
            </button>
          </div>

          {questions.map((question, index) => (
            <div key={question.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">Question {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={question.title}
                  onChange={(e) => updateQuestion(index, 'title', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={question.description}
                  onChange={(e) => updateQuestion(index, 'description', e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Programming Language</label>
                <select
                  value={question.language}
                  onChange={(e) => updateQuestion(index, 'language', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Starter Code</label>
                <textarea
                  value={question.starterCode}
                  onChange={(e) => updateQuestion(index, 'starterCode', e.target.value)}
                  className="w-full p-2 border rounded font-mono"
                  rows={4}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Test Cases</label>
                  <button
                    type="button"
                    onClick={() => addTestCase(index)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add Test Case
                  </button>
                </div>
                {question.testCases.map((testCase, testIndex) => (
                  <div key={testIndex} className="grid grid-cols-2 gap-4 mb-2">
                    <input
                      type="text"
                      placeholder="Input"
                      value={testCase.input}
                      onChange={(e) => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[index].testCases[testIndex].input = e.target.value;
                        setQuestions(updatedQuestions);
                      }}
                      className="p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Expected Output"
                      value={testCase.expectedOutput}
                      onChange={(e) => {
                        const updatedQuestions = [...questions];
                        updatedQuestions[index].testCases[testIndex].expectedOutput = e.target.value;
                        setQuestions(updatedQuestions);
                      }}
                      className="p-2 border rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating Exam...' : 'Create Exam'}
        </button>
      </form>
    </div>
  );
}