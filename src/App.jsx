import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';

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
  const [habits, setHabits] = useState([]);
  const [newHabitText, setNewHabitText] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotTask, setNewSlotTask] = useState('');
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [newWeeklyTaskText, setNewWeeklyTaskText] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getTodayName = () => {
    const dayIdx = new Date().getDay();
    return daysOfWeek[dayIdx === 0 ? 6 : dayIdx - 1];
  };
  const [selectedDay, setSelectedDay] = useState(getTodayName());

  // Listen for Supabase Authentication state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data only when user is logged in
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

  // --- Habit Operations ---
  const toggleHabit = async (id, currentStatus) => {
    setHabits(habits.map((h) => (h.id === id ? { ...h, completed_today: !currentStatus } : h)));
    await supabase.from('habits').update({ completed_today: !currentStatus }).eq('id', id);
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

  // --- Timetable Operations ---
  const currentSlots = timeSlots.filter((s) => s.day_of_week === selectedDay);
  const toggleSlot = async (id, currentStatus) => {
    setTimeSlots(timeSlots.map((s) => (s.id === id ? { ...s, done: !currentStatus } : s)));
    await supabase.from('timetable_slots').update({ done: !currentStatus }).eq('id', id);
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

  // --- Weekly Tasks Operations ---
  const toggleWeeklyTask = async (id, currentStatus) => {
    setWeeklyTasks(weeklyTasks.map((t) => (t.id === id ? { ...t, done: !currentStatus } : t)));
    await supabase.from('weekly_tasks').update({ done: !currentStatus }).eq('id', id);
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

  // Show Sign In / Sign Up screen if not authenticated
  if (!session) {
    return <Auth />;
  }

  // Calculations
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
      <header className="max-w-6xl mx-auto mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
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
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full font-medium transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse">Loading dashboard...</div>
      ) : (
        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* HABIT TRACKER */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Daily Habit Engine</h2>
                  <span className="text-xs text-slate-400">21-Day Challenge ({habits.length}/10 Active)</span>
                </div>

                <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                  <span className="text-3xl">{habitAvatar.emoji}</span>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-medium">Habit Rank</p>
                    <p className={`text-sm font-bold ${habitAvatar.text}`}>{habitAvatar.title}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-400">Today's Habit Completion</span>
                  <span className={habitAvatar.text}>{habitPercentage}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${habitAvatar.color} transition-all duration-500`} style={{ width: `${habitPercentage}%` }} />
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {habits.map((habit) => {
                  const daysStayed = calculateHabitDay(habit.created_at);
                  const isCompleted21Days = daysStayed > 21;

                  return (
                    <li key={habit.id} className="flex items-center justify-between bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl hover:border-slate-700 transition">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={habit.completed_today}
                          onChange={() => toggleHabit(habit.id, habit.completed_today)}
                          className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                        />
                        <span className={`text-sm font-medium ${habit.completed_today ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {habit.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCompleted21Days ? (
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
                            21-Day Master 🎉
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-cyan-400/80 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
                            Day {daysStayed}/21
                          </span>
                        )}
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 transition"
                          title="Delete habit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <form onSubmit={addHabit} className="flex gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                placeholder={habits.length >= 10 ? 'Habit limit reached (10/10)' : 'Add new habit...'}
                disabled={habits.length >= 10}
                value={newHabitText}
                onChange={(e) => setNewHabitText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={habits.length >= 10}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-50"
              >
                Add
              </button>
            </form>
          </section>

          {/* 7-DAY TIMETABLE */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">7-Day Timetable</h2>
                  <span className="text-xs text-slate-400">Hourly Task Slots</span>
                </div>

                <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                  <span className="text-3xl">{timetableAvatar.emoji}</span>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-medium">Schedule Rank</p>
                    <p className={`text-sm font-bold ${timetableAvatar.text}`}>{timetableAvatar.title}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${selectedDay === day ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-400">{selectedDay} Progress</span>
                  <span className={timetableAvatar.text}>{timetablePercentage}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${timetableAvatar.color} transition-all duration-500`} style={{ width: `${timetablePercentage}%` }} />
                </div>
              </div>

              <div className="space-y-3">
                {currentSlots.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">No slots scheduled for {selectedDay}.</p>
                ) : (
                  currentSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between bg-slate-800/40 border border-slate-800 p-3 rounded-xl hover:border-slate-700 transition">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={slot.done}
                          onChange={() => toggleSlot(slot.id, slot.done)}
                          className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                        />
                        <div>
                          <p className={`text-sm font-medium ${slot.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {slot.task}
                          </p>
                          <span className="text-xs text-indigo-400 font-mono">{slot.time}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Delete slot"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={addSlot} className="flex gap-2 pt-4 mt-6 border-t border-slate-800">
              <input
                type="text"
                placeholder="Time (09:00 AM)"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Task description..."
                value={newSlotTask}
                onChange={(e) => setNewSlotTask(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition"
              >
                Add
              </button>
            </form>
          </section>

          {/* WEEKLY SPRINT */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Weekly Task Sprint</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-400">Weekly Tasks Completed</span>
                  <span className="text-emerald-400">{weeklyTaskPercentage}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${weeklyTaskPercentage}%` }} />
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-slate-400">Week Expired (Mon–Sun)</span>
                  <span className="text-rose-400">{timeExpiredPercentage}% ({currentDayIndex}/7 Days)</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${timeExpiredPercentage}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentWeekTasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center md:col-span-2">No weekly tasks scheduled for this week.</p>
              ) : (
                currentWeekTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between bg-slate-800/30 border border-slate-800 p-3.5 rounded-xl hover:border-slate-700 transition">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleWeeklyTask(task.id, task.done)}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />
                      <span className={`text-sm ${task.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteWeeklyTask(task.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="Delete task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {pastMissedTasks.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800/60">
                <h3 className="text-lg font-semibold text-rose-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Past Tasks You Missed
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pastMissedTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between bg-rose-950/10 border border-rose-950/30 p-3.5 rounded-xl hover:border-rose-900/50 transition">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleWeeklyTask(task.id, task.done)}
                          className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                        />
                        <div>
                          <p className={`text-sm ${task.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {task.title}
                          </p>
                          <span className="text-xs text-rose-400/80 font-mono">Added: {formatPastTaskDate(task.created_at)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteWeeklyTask(task.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="Delete task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={addWeeklyTask} className="flex gap-2 pt-4 mt-6 border-t border-slate-800">
              <input
                type="text"
                placeholder="Add new weekly task..."
                value={newWeeklyTaskText}
                onChange={(e) => setNewWeeklyTaskText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition"
              >
                Add Task
              </button>
            </form>
          </section>

        </main>
      )}
    </div>
  );
}