import React from 'react';

export default function WeeklyPage({
    currentWeekTasks,
    pastMissedTasks,
    toggleWeeklyTask,
    addWeeklyTask,
    deleteWeeklyTask,
    newWeeklyTaskText,
    setNewWeeklyTaskText,
    weeklyTaskPercentage,
    timeExpiredPercentage,
    currentDayIndex,
    formatPastTaskDate,
    onBack,
}) {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-4">
                <button
                    onClick={onBack}
                    className="bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-xs px-4 py-2 rounded-xl font-bold transition inline-flex items-center gap-2"
                >
                    ← Back to Home
                </button>
            </div>

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
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
                    <div className="mt-8 pt-6 border-t border-slate-800/60 mb-6">
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

                <form onSubmit={addWeeklyTask} className="flex gap-2 pt-4 border-t border-slate-800">
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
        </div>
    );
}