import React from 'react';

export default function TimetablePage({
    daysOfWeek,
    selectedDay,
    setSelectedDay,
    currentSlots,
    toggleSlot,
    addSlot,
    deleteSlot,
    newSlotTime,
    setNewSlotTime,
    newSlotTask,
    setNewSlotTask,
    timetablePercentage,
    timetableAvatar,
    onBack,
}) {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-4">
                <button
                    onClick={onBack}
                    className="bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 text-xs px-4 py-2 rounded-xl font-bold transition inline-flex items-center gap-2"
                >
                    ← Back to Home
                </button>
            </div>

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
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
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${selectedDay === day ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {day}
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

                <div className="space-y-3 mb-6">
                    {currentSlots.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-6 text-center">No slots scheduled for {selectedDay}.</p>
                    ) : (
                        currentSlots.map((slot) => (
                            <div key={slot.id} className="flex items-center justify-between bg-slate-800/40 border border-slate-800 p-3.5 rounded-xl hover:border-slate-700 transition">
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

                <form onSubmit={addSlot} className="flex gap-2 pt-4 border-t border-slate-800">
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
                        Add Slot
                    </button>
                </form>
            </section>
        </div>
    );
}