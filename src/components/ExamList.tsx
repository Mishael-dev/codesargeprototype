import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Exam } from '../types';
import { PlusCircle } from 'lucide-react';

export default function ExamList() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExams() {
      try {
        const { data, error } = await supabase
          .from('exams')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setExams(data || []);
      } catch (error) {
        console.error('Error fetching exams:', error);
        alert('Failed to load exams');
      } finally {
        setLoading(false);
      }
    }

    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Available Exams</h1>
        <Link
          to="/create-exam/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} />
          Create New Exam
        </Link>
      </div>

      <div className="grid gap-4">
        {exams.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No exams available yet.</p>
          </div>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{exam.title}</h2>
              <p className="text-gray-600 mb-4">{exam.description}</p>
              <div className="flex gap-3">
                <Link
                  to={`/take-exam/${exam.id}`}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Take Exam
                </Link>
                <Link
                  to={`/view-results/${exam.id}`}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  View Results
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}