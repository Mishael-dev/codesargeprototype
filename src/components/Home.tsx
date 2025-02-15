import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, PenSquare, Trophy } from 'lucide-react';

export default function Home() {
  const cards = [
    {
      title: 'Create Exam',
      description: 'Create new programming exams with custom test cases',
      icon: <PenSquare className="h-8 w-8 text-blue-600" />,
      link: '/create-exam',
      color: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      title: 'Take Exam',
      description: 'Take available programming exams and submit your solutions',
      icon: <GraduationCap className="h-8 w-8 text-green-600" />,
      link: '/take-exam',
      color: 'bg-green-50 hover:bg-green-100',
    },
    {
      title: 'View Results',
      description: 'Check your exam results and review your submissions',
      icon: <Trophy className="h-8 w-8 text-purple-600" />,
      link: '/view-results',
      color: 'bg-purple-50 hover:bg-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto pt-16 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to CodeSarge
          </h1>
          <p className="text-xl text-gray-600">
            Your platform for creating and taking programming exams
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className={`${card.color} p-6 rounded-xl shadow-sm transition-all duration-200 transform hover:scale-105`}
            >
              <div className="flex flex-col items-center text-center">
                {card.icon}
                <h2 className="text-xl font-semibold mt-4 mb-2">{card.title}</h2>
                <p className="text-gray-600">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}