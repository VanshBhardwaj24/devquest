import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Video, Mic, FileText, Users, BrainCircuit, X } from 'lucide-react';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

const behavioralQuestions = [
  "Tell me about yourself.",
  "What is your greatest strength?",
  "What is your greatest weakness?",
  "Describe a challenging situation and how you handled it.",
  "Where do you see yourself in 5 years?",
  "Why do you want to work here?",
  "Tell me about a time you failed.",
  "How do you handle conflict in a team?",
];

const technicalQuestions = [
  "Explain the difference between process and thread.",
  "What is polymorphism? Give an example.",
  "Explain ACID properties in databases.",
  "What happens when you type a URL in the browser?",
  "Explain the concept of RESTful APIs.",
  "What is the difference between TCP and UDP?",
  "Explain the difference between stack and heap memory.",
  "What is a deadlock? How can it be prevented?",
];

export function InterviewPrep() {
  const { state, dispatch } = useApp();
  const { darkMode } = state;
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<'behavioral' | 'technical' | null>(null);
  const [practiceStats, setPracticeStats] = useState({
    behavioral: { completed: 0, total: behavioralQuestions.length },
    technical: { completed: 0, total: technicalQuestions.length },
    streak: 0,
    lastPractice: null as string | null
  });
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const startPractice = (type: 'behavioral' | 'technical') => {
    setMode(type);
    const questions = type === 'behavioral' ? behavioralQuestions : technicalQuestions;
    setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
    setModalOpen(true);
  };

  const nextQuestion = () => {
    if (!mode) return;
    const questions = mode === 'behavioral' ? behavioralQuestions : technicalQuestions;
    let next = currentQuestion;
    while (next === currentQuestion) {
      next = questions[Math.floor(Math.random() * questions.length)];
    }
    setCurrentQuestion(next);
    
    // Award XP for practice
    dispatch({ 
      type: 'ADD_XP', 
      payload: { 
        amount: 10, 
        source: 'Interview Practice' 
      } 
    });
    
    // Update stats
    setPracticeStats(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        completed: prev[mode].completed + 1
      },
      streak: prev.lastPractice === new Date().toDateString() ? prev.streak + 1 : 1,
      lastPractice: new Date().toDateString()
    }));
  };

  const completeSession = () => {
    // Award bonus XP for completing a session
    const bonusXP = 25;
    dispatch({ 
      type: 'ADD_XP', 
      payload: { 
        amount: bonusXP, 
        source: 'Interview Session Complete' 
      } 
    });
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        type: 'achievement',
        title: 'Session Complete!',
        message: `+${bonusXP} XP for completing interview practice`,
        timestamp: new Date()
      }
    });
    
    setModalOpen(false);
    setTimer(0);
    setIsTimerRunning(false);
  };

  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-mono uppercase tracking-tight">
            Interview <span className="text-purple-500">Prep</span>
          </h2>
          <p className="text-gray-500 font-mono text-sm">Master the art of cracking interviews.</p>
        </div>
        <Button 
          className="border-2 border-black bg-purple-500 text-white hover:bg-purple-600"
          onClick={() => startPractice('behavioral')}
        >
          Start Mock Interview
        </Button>
      </div>

      {/* Practice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 border-2 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-black'}`}>
          <div className="text-2xl font-black text-purple-500">{practiceStats.behavioral.completed}/{practiceStats.behavioral.total}</div>
          <div className="text-xs font-mono uppercase text-gray-500">Behavioral</div>
        </div>
        <div className={`p-4 border-2 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-black'}`}>
          <div className="text-2xl font-black text-purple-500">{practiceStats.technical.completed}/{practiceStats.technical.total}</div>
          <div className="text-xs font-mono uppercase text-gray-500">Technical</div>
        </div>
        <div className={`p-4 border-2 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-black'}`}>
          <div className="text-2xl font-black text-orange-500">{practiceStats.streak}</div>
          <div className="text-xs font-mono uppercase text-gray-500">Day Streak</div>
        </div>
        <div className={`p-4 border-2 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-black'}`}>
          <div className="text-2xl font-black text-cyan-500">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</div>
          <div className="text-xs font-mono uppercase text-gray-500">Practice Time</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'} rounded-none`}>
          <CardHeader className="p-4 border-b-2 border-black flex flex-row items-center gap-2">
            <Video className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg font-bold">Behavioral</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-4">Prepare for "Tell me about yourself", "Strengths/Weaknesses", and situational questions.</p>
            <Button 
              variant="outline" 
              className="w-full border-2 border-black"
              onClick={() => startPractice('behavioral')}
            >
              Practice Now
            </Button>
          </CardContent>
        </Card>

        <Card variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'} rounded-none`}>
          <CardHeader className="p-4 border-b-2 border-black flex flex-row items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg font-bold">Technical</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-4">Deep dive into System Design, OS, DBMS, and core CS concepts.</p>
            <Button 
              variant="outline" 
              className="w-full border-2 border-black"
              onClick={() => startPractice('technical')}
            >
              Practice Now
            </Button>
          </CardContent>
        </Card>

        <Card variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'} rounded-none`}>
          <CardHeader className="p-4 border-b-2 border-black flex flex-row items-center gap-2">
            <Mic className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg font-bold">Mock Interviews</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-4">Schedule peer-to-peer mock interviews or AI-driven practice sessions.</p>
            <Button variant="outline" className="w-full border-2 border-black">Schedule</Button>
          </CardContent>
        </Card>
      </div>

      <Card variant="brutal" className={`${darkMode ? 'bg-zinc-900 border-white' : 'bg-white border-black'} rounded-none`}>
        <CardHeader className="p-4 border-b-2 border-black">
          <CardTitle className="text-lg font-bold">Recent Resources</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>Top 50 HR Interview Questions PDF</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>System Design Primer for Juniors</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className={`${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-black text-black'} sm:max-w-lg`}>
          <DialogHeader>
            <DialogTitle className="font-mono text-xl uppercase flex items-center gap-2">
              {mode === 'behavioral' ? <Video className="h-5 w-5 text-purple-500" /> : <BrainCircuit className="h-5 w-5 text-purple-500" />}
              {mode} Practice
            </DialogTitle>
          </DialogHeader>
          
          {/* Timer Display */}
          <div className={`p-4 border-2 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'} text-center`}>
            <div className="text-3xl font-black font-mono text-purple-500">
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-xs font-mono uppercase text-gray-500">Session Time</div>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? 'Pause' : 'Start'} Timer
            </Button>
          </div>
          
          <div className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-4 font-mono">{currentQuestion}</h3>
            <p className="text-gray-500 text-sm">Take a moment to structure your answer.</p>
          </div>
          
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
            <Button className="bg-purple-500 text-white hover:bg-purple-600" onClick={nextQuestion}>Next Question</Button>
            <Button className="bg-lime-500 text-black hover:bg-lime-400" onClick={completeSession}>Complete Session</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
