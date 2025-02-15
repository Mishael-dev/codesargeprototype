import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import Home from './components/Home';
import ExamList from './components/ExamList';
import ExamCreator from './components/ExamCreator';
import ExamTaker from './components/ExamTaker';
import ViewResults from './components/ViewResults';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <Link to="/" className="flex items-center">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold">CodeSarge</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  to="/create-exam"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Create Exam
                </Link>
                <Link
                  to="/take-exam"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Take Exam
                </Link>
                <Link
                  to="/view-results"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  View Results
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-exam" element={<ExamList />} />
            <Route path="/create-exam/new" element={<ExamCreator />} />
            <Route path="/take-exam" element={<ExamList />} />
            <Route path="/take-exam/:examId" element={<ExamTaker />} />
            <Route path="/view-results" element={<ExamList />} />
            <Route path="/view-results/:examId" element={<ViewResults />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}