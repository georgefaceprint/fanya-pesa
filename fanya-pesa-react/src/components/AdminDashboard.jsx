import React from 'react';

export default function AdminDashboard({ user, onNavigate }) {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-10 flex justify-between items-center shadow-sm">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">Admin Dashboard</h2>
                    <p className="text-gray-500 mt-2">Welcome back, {user.name}. View system summary or enter the control center.</p>
                </div>
                <button
                    onClick={() => onNavigate('admin-panel')}
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black shadow-xl shadow-red-600/20 transition-all active:scale-95"
                >
                    Enter Control Center &rarr;
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', val: '1,280', color: 'blue' },
                    { label: 'Active Deals', val: '42', color: 'emerald' },
                    { label: 'Total RFQs', val: '890', color: 'amber' },
                    { label: 'System Health', val: '99.9%', color: 'purple' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{stat.label}</p>
                        <div className={`text-2xl font-black text-${stat.color}-600 dark:text-${stat.color}-400 font-mono`}>{stat.val}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
