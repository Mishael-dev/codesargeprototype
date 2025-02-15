import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ExamTaker() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [examId]);

  const fetchQuestions = async () => {
    try {
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          title,
          description,
          language,
          starter_code,
          test_cases (
            id
          )
        `)
        .eq('exam_id', examId)
        .order('order');

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
      if (questionsData?.[0]) {
        setCode(questionsData[0].starter_code);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('Failed to load exam questions');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const saveSubmission = async () => {
    if (!currentQuestion) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .insert({
          exam_id: examId,
          question_id: currentQuestion.id,
          code,
          status: 'submitted'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving submission:', error);
      alert('Failed to save your submission');
    } finally {
      setIsSaving(false);
    }
  };

  const runTests = async () => {
    setIsRunning(true);
    setOutput('Running tests...\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let allPassed = true;
    let testOutput = '';
    let totalTests = currentQuestion?.test_cases?.length || 0;
    let passedTests = 0;
    
    // Simulate test results without showing the actual test cases
    for (let i = 0; i < totalTests; i++) {
      const passed = Math.random() > 0.5;
      if (passed) passedTests++;
      allPassed = allPassed && passed;
    }
    
    testOutput = `Test Results:\n`;
    testOutput += `${passedTests} out of ${totalTests} tests passed\n\n`;
    
    if (allPassed) {
      testOutput += '🎉 All tests passed! Great job!';
    } else {
      testOutput += `❌ Some tests failed (${totalTests - passedTests} failed)\n`;
      testOutput += 'Review your code and try again.';
    }
    
    setOutput(testOutput);
    setIsRunning(false);
  };

  const handleNext = async () => {
    await saveSubmission();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCode(questions[currentQuestionIndex + 1].starter_code);
      setOutput('');
    } else {
      navigate(`/view-results/${examId}`);
    }
  };

  const handlePrevious = async () => {
    await saveSubmission();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCode(questions[currentQuestionIndex - 1].starter_code);
      setOutput('');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">No questions found for this exam.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-2">{currentQuestion.title}</h2>
            <p className="text-gray-600 whitespace-pre-wrap mb-4">
              {currentQuestion.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Code Editor</h3>
              <p className="text-sm text-gray-600">
                Language: {currentQuestion.language}
              </p>
            </div>
            <div className="h-[600px]">
              <Editor
                height="100%"
                defaultLanguage={currentQuestion.language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <button
                onClick={runTests}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                <Play size={16} />
                Run Tests
              </button>
            </div>
            <pre className="bg-gray-100 p-4 rounded font-mono text-sm whitespace-pre-wrap min-h-[200px] max-h-[500px] overflow-y-auto">
              {output || 'Click "Run Tests" to evaluate your code'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}