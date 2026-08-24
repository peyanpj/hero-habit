import React from 'react';

export default function HabitsPage({
    habits,
    toggleHabit,
    addHabit,
    deleteHabit,
    newHabitText,
    setNewHabitText,
    calculateHabitDay,
    habitPercentage,
    habitAvatar,
    onBack,
}) {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-4">
                <button
                    onClick={onBack}
                    className="bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 text-xs px-4 py-2 rounded-xl font-bold transition inline-flex items-center gap-2"
                >
                    ← Back to Home
                </button>
            </div>

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
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
                        <span className="text-slate-400">Today's Completion</span>
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

                <form onSubmit={addHabit} className="flex gap-2 pt-4 border-t border-slate-800">
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
                        Add Habit
                    </button>
                </form>
            </section>
        </div>
    );
}