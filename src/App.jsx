import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from './supabaseClient';
import Auth from './Auth';

import HomePage from './pages/HomePage';
import HabitsPage from './pages/HabitsPage';
import TimetablePage from './pages/TimetablePage';
import WeeklyPage from './pages/WeeklyPage';

const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (type === 'complete') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'levelup') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.25);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    }
  } catch (e) {
    console.error(e);
  }
};

const triggerConfetti = () => {
  confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
};

const getAvatarTier = (percentage) => {
  if (percentage >= 80) return { title: 'Legend', emoji: '👑', color: 'from-amber-400 to-yellow-600', text: 'text-amber-400' };
  if (percentage >= 60) return { title: 'Pro', emoji: '⚔️', color: 'from-purple-500 to-indigo-600', text: 'text-purple-400' };
  if (percentage >= 40) return { title: 'Semi-Pro', emoji: '🗡️', color: 'from-blue-400 to-cyan-600', text: 'text-blue-400' };
  if (percentage >= 20) return { title: 'Amateur', emoji: '🐣', color: 'from-emerald-400 to-green-600', text: 'text-emerald-400' };
  return { title: 'Lazy', emoji: '💤', color: 'from-slate-500 to-gray-700', text: 'text-slate-400' };
};

const isCurrentWeek = (dateInput) => {
  if (!dateInput) return false;
  const date = new Date(dateInput);
  const today = new Date();
  const todayDay = today.getDay();
  const todayDiff = today.getDate() - todayDay + (todayDay === 0 ? -6 : 1);
  const currentMonday = new Date(today.setDate(todayDiff));
  currentMonday.setHours(0, 0, 0, 0);
  const currentSunday = new Date(currentMonday);
  currentSunday.setDate(currentMonday.getDate() + 6);
  currentSunday.setHours(23, 59, 59, 999);
  return date >= currentMonday && date <= currentSunday;
};

const formatPastTaskDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function App() {
  const [session, setSession] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [habits, setHabits] = useState([]);
  const [newHabitText, setNewHabitText] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotTask, setNewSlotTask] = useState('');
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [newWeeklyTaskText, setNewWeeklyTaskText] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [levelUpMessage, setLevelUpMessage] = useState(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getTodayName = () => {
    const dayIdx = new Date().getDay();
    return daysOfWeek[dayIdx === 0 ? 6 : dayIdx - 1];
  };
  const [selectedDay, setSelectedDay] = useState(getTodayName());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    const { data: habitsData } = await supabase.from('habits').select('*').order('id', { ascending: true });
    const { data: slotsData } = await supabase.from('timetable_slots').select('*').order('id', { ascending: true });
    const { data: weeklyData } = await supabase.from('weekly_tasks').select('*').order('id', { ascending: true });

    if (habitsData) setHabits(habitsData);
    if (slotsData) setTimeSlots(slotsData);
    if (weeklyData) setWeeklyTasks(weeklyData);
    setLoading(false);
  };

  const calculateHabitDay = (createdAtTimestamp) => {
    if (!createdAtTimestamp) return 1;
    const createdDate = new Date(createdAtTimestamp);
    const today = new Date();
    createdDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today - createdDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Habit operations
  const toggleHabit = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    setHabits(habits.map((h) => (h.id === id ? { ...h, completed_today: newStatus } : h)));

    if (newStatus) {
      playSound('complete');
      const updated = habits.map((h) => (h.id === id ? { ...h, completed_today: true } : h));
      const doneCount = updated.filter((h) => h.completed_today).length;
      if (Math.round((doneCount / updated.length) * 100) === 100) {
        triggerConfetti();
        playSound('levelup');
        setLevelUpMessage("🎉 100% Daily Habits Cleared! You've achieved LEGEND Rank!");
      }
    }
    await supabase.from('habits').update({ completed_today: newStatus }).eq('id', id);
  };

  const addHabit = async (e) => {
    e.preventDefault();
    if (!newHabitText.trim() || habits.length >= 10) return;
    const { data } = await supabase
      .from('habits')
      .insert([{ name: newHabitText, completed_today: false, user_id: session.user.id }])
      .select();

    if (data) {
      setHabits([...habits, data[0]]);
      setNewHabitText('');
    }
  };

  const deleteHabit = async (id) => {
    setHabits(habits.filter((h) => h.id !== id));
    await supabase.from('habits').delete().eq('id', id);
  };

  // Timetable operations
  const currentSlots = timeSlots.filter((s) => s.day_of_week === selectedDay);
  const toggleSlot = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    setTimeSlots(timeSlots.map((s) => (s.id === id ? { ...s, done: newStatus } : s)));
    if (newStatus) {
      playSound('complete');
      const updated = currentSlots.map((s) => (s.id === id ? { ...s, done: true } : s));
      if (updated.every((s) => s.done)) {
        triggerConfetti();
        playSound('levelup');
        setLevelUpMessage(`⚔️ All slots completed for ${selectedDay}! Schedule Mastered!`);
      }
    }
    await supabase.from('timetable_slots').update({ done: newStatus }).eq('id', id);
  };

  const addSlot = async (e) => {
    e.preventDefault();
    if (!newSlotTask.trim() || !newSlotTime.trim()) return;
    const { data } = await supabase
      .from('timetable_slots')
      .insert([{
        day_of_week: selectedDay,
        time: newSlotTime,
        task: newSlotTask,
        done: false,
        user_id: session.user.id
      }])
      .select();

    if (data) {
      setTimeSlots([...timeSlots, data[0]]);
      setNewSlotTime('');
      setNewSlotTask('');
    }
  };

  const deleteSlot = async (id) => {
    setTimeSlots(timeSlots.filter((s) => s.id !== id));
    await supabase.from('timetable_slots').delete().eq('id', id);
  };

  // Weekly operations
  const toggleWeeklyTask = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    setWeeklyTasks(weeklyTasks.map((t) => (t.id === id ? { ...t, done: newStatus } : t)));
    if (newStatus) {
      playSound('complete');
      triggerConfetti();
    }
    await supabase.from('weekly_tasks').update({ done: newStatus }).eq('id', id);
  };

  const addWeeklyTask = async (e) => {
    e.preventDefault();
    if (!newWeeklyTaskText.trim()) return;
    const { data } = await supabase
      .from('weekly_tasks')
      .insert([{ title: newWeeklyTaskText, done: false, user_id: session.user.id }])
      .select();

    if (data) {
      setWeeklyTasks([...weeklyTasks, data[0]]);
      setNewWeeklyTaskText('');
    }
  };

  const deleteWeeklyTask = async (id) => {
    setWeeklyTasks(weeklyTasks.filter((t) => t.id !== id));
    await supabase.from('weekly_tasks').delete().eq('id', id);
  };

  if (!session) return <Auth />;

  // Dynamic calculations
  const completedHabitsCount = habits.filter((h) => h.completed_today).length;
  const habitPercentage = habits.length > 0 ? Math.round((completedHabitsCount / habits.length) * 100) : 0;
  const habitAvatar = getAvatarTier(habitPercentage);

  const completedSlotsCount = currentSlots.filter((s) => s.done).length;
  const timetablePercentage = currentSlots.length > 0 ? Math.round((completedSlotsCount / currentSlots.length) * 100) : 0;
  const timetableAvatar = getAvatarTier(timetablePercentage);

  const currentWeekTasks = weeklyTasks.filter((t) => isCurrentWeek(t.created_at));
  const pastMissedTasks = weeklyTasks.filter((t) => !isCurrentWeek(t.created_at) && !t.done);
  const completedWeeklyCount = currentWeekTasks.filter((t) => t.done).length;
  const weeklyTaskPercentage = currentWeekTasks.length > 0 ? Math.round((completedWeeklyCount / currentWeekTasks.length) * 100) : 0;

  const rawDayIndex = currentDateTime.getDay();
  const currentDayIndex = rawDayIndex === 0 ? 7 : rawDayIndex;
  const timeExpiredPercentage = Math.round((currentDayIndex / 7) * 100);

  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {levelUpMessage && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-cyan-500/50 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl animate-bounce">
            <h3 className="text-3xl font-black bg-gradient-to-r from-amber-300 via-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-4">
              LEVEL UNLOCKED!
            </h3>
            <p className="text-slate-200 text-sm mb-6 leading-relaxed">{levelUpMessage}</p>
            <button
              onClick={() => setLevelUpMessage(null)}
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition text-sm shadow-lg"
            >
              Continue Grinding 🚀
            </button>
          </div>
        </div>
      )}

      <header className="max-w-6xl mx-auto mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1
            onClick={() => setCurrentPage('home')}
            className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent cursor-pointer"
          >
            HeroHabit
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">Level up your daily discipline, conquer your schedule.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-mono text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{formattedDate}</span>
            <span className="text-slate-600">•</span>
            <span>{formattedTime}</span>
          </div>

          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs px-3.5 py-1.5 rounded-full font-medium transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse">Loading dashboard...</div>
      ) : (
        <main className="max-w-6xl mx-auto">
          {currentPage === 'home' && (
            <HomePage
              onNavigate={(page) => setCurrentPage(page)}
              habitPercentage={habitPercentage}
              habitAvatar={habitAvatar}
              timetablePercentage={timetablePercentage}
              timetableAvatar={timetableAvatar}
              selectedDay={selectedDay}
              weeklyTaskPercentage={weeklyTaskPercentage}
              currentWeekTasksCount={currentWeekTasks.length}
            />
          )}

          {currentPage === 'habits' && (
            <HabitsPage
              habits={habits}
              toggleHabit={toggleHabit}
              addHabit={addHabit}
              deleteHabit={deleteHabit}
              newHabitText={newHabitText}
              setNewHabitText={setNewHabitText}
              calculateHabitDay={calculateHabitDay}
              habitPercentage={habitPercentage}
              habitAvatar={habitAvatar}
              onBack={() => setCurrentPage('home')}
            />
          )}

          {currentPage === 'timetable' && (
            <TimetablePage
              daysOfWeek={daysOfWeek}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              currentSlots={currentSlots}
              toggleSlot={toggleSlot}
              addSlot={addSlot}
              deleteSlot={deleteSlot}
              newSlotTime={newSlotTime}
              setNewSlotTime={setNewSlotTime}
              newSlotTask={newSlotTask}
              setNewSlotTask={setNewSlotTask}
              timetablePercentage={timetablePercentage}
              timetableAvatar={timetableAvatar}
              onBack={() => setCurrentPage('home')}
            />
          )}

          {currentPage === 'weekly' && (
            <WeeklyPage
              currentWeekTasks={currentWeekTasks}
              pastMissedTasks={pastMissedTasks}
              toggleWeeklyTask={toggleWeeklyTask}
              addWeeklyTask={addWeeklyTask}
              deleteWeeklyTask={deleteWeeklyTask}
              newWeeklyTaskText={newWeeklyTaskText}
              setNewWeeklyTaskText={setNewWeeklyTaskText}
              weeklyTaskPercentage={weeklyTaskPercentage}
              timeExpiredPercentage={timeExpiredPercentage}
              currentDayIndex={currentDayIndex}
              formatPastTaskDate={formatPastTaskDate}
              onBack={() => setCurrentPage('home')}
            />
          )}
        </main>
      )}
    </div>
  );
}