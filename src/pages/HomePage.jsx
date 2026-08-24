import React from 'react';

export default function HomePage({
    onNavigate,
    habitPercentage,
    habitAvatar,
    timetablePercentage,
    timetableAvatar,
    selectedDay,
    weeklyTaskPercentage,
    currentWeekTasksCount,
}) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white mb-1">Hero Control Center</h2>
                <p className="text-xs text-slate-400">Select a category to view and manage your goals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* CARD 1: HABITS */}
                <div
                    onClick={() => onNavigate('habits')}
                    className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 shadow-xl hover:shadow-cyan-500/10 transition cursor-pointer group flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-4xl">{habitAvatar.emoji}</span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 ${habitAvatar.text}`}>
                                {habitAvatar.title}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition mb-2">
                            Daily Habit Engine
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">Track 21-day streaks and daily discipline milestones.</p>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-semibold mb-2">
                            <span className="text-slate-400">Today's Progress</span>
                            <span className={habitAvatar.text}>{habitPercentage}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                            <div className={`h-full bg-gradient-to-r ${habitAvatar.color} transition-all duration-500`} style={{ width: `${habitPercentage}%` }} />
                        </div>
                        <div className="bg-cyan-500/10 group-hover:bg-cyan-500 text-cyan-400 group-hover:text-slate-950 text-xs font-bold py-2.5 rounded-xl text-center transition">
                            Open Habits →
                        </div>
                    </div>
                </div>

                {/* CARD 2: TIMETABLE */}
                <div
                    onClick={() => onNavigate('timetable')}
                    className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 shadow-xl hover:shadow-indigo-500/10 transition cursor-pointer group flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-4xl">{timetableAvatar.emoji}</span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 ${timetableAvatar.text}`}>
                                {timetableAvatar.title}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition mb-2">
                            7-Day Timetable
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">Hourly task slot scheduling for every day of the week.</p>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-semibold mb-2">
                            <span className="text-slate-400">{selectedDay} Schedule</span>
                            <span className={timetableAvatar.text}>{timetablePercentage}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                            <div className={`h-full bg-gradient-to-r ${timetableAvatar.color} transition-all duration-500`} style={{ width: `${timetablePercentage}%` }} />
                        </div>
                        <div className="bg-indigo-500/10 group-hover:bg-indigo-600 text-indigo-400 group-hover:text-white text-xs font-bold py-2.5 rounded-xl text-center transition">
                            Open Timetable →
                        </div>
                    </div>
                </div>

                {/* CARD 3: WEEKLY SPRINT */}
                <div
                    onClick={() => onNavigate('weekly')}
                    className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 shadow-xl hover:shadow-emerald-500/10 transition cursor-pointer group flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-4xl">🎯</span>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400">
                                {currentWeekTasksCount} Sprint Tasks
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition mb-2">
                            Weekly Task Sprint
                        </h3>
                        <p className="text-xs text-slate-400 mb-6">Conquer high-impact sprint goals before the week resets.</p>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-semibold mb-2">
                            <span className="text-slate-400">Sprint Progress</span>
                            <span className="text-emerald-400">{weeklyTaskPercentage}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${weeklyTaskPercentage}%` }} />
                        </div>
                        <div className="bg-emerald-500/10 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-slate-950 text-xs font-bold py-2.5 rounded-xl text-center transition">
                            Open Sprint →
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}