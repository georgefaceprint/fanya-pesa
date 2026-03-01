import React, { useState } from 'react';

const ADMIN_MODULES = [
    { id: 'compliance', title: 'Compliance Engine', desc: 'Manage mandatory CSD, Tax, and FICA document requirements across all roles.', icon: '📄', color: 'blue' },
    { id: 'categories', title: 'Funding Categories', desc: 'Update the platform taxonomy and matching logic for SME funding requests.', icon: '🏷️', color: 'emerald' },
    { id: 'users', title: 'User Management', desc: 'Audit the entire user base including SMEs, Funders, and Suppliers.', icon: '👥', color: 'amber' },
    { id: 'funder_approval', title: 'Funder Verification', desc: 'Approve or reject high-net-worth individuals and corporate funding entities.', icon: '🛡️', color: 'purple' },
    { id: 'activity', title: 'System Activity', desc: 'Live feed of platform notifications, deal statuses, and user sign-ups.', icon: '🔔', color: 'red' },
    { id: 'secrets', title: 'API & Secrets', desc: 'Manage backend keys, Firestore limits, and third-party integration secrets.', icon: '🔑', color: 'gray' }
];

export default function AdminPanel({ user, onBack }) {
    const [stats] = useState({
        deals: 24,
        rfqs: 156,
        categories: 12
    });

    return (
        <div className="max-w-6xl mx-auto py-10 animate-fade-in">
            <button onClick={onBack} className="mb-8 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">&larr; Back to Dashboard</button>

            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white">Platform Control Center</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Internal administration engine for Fanya Pesa operations.</p>
                </div>
                <span className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest rounded-full border border-red-100 dark:border-red-900/50">Root Admin Access</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white dark:bg-gray-800 border-l-4 border-blue-600 rounded-2xl p-6 shadow-sm">
                    <div className="text-3xl font-black text-blue-600 font-mono">{stats.deals}</div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Active Funding Deals</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border-l-4 border-emerald-500 rounded-2xl p-6 shadow-sm">
                    <div className="text-3xl font-black text-emerald-500 font-mono">{stats.rfqs}</div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Live Escrow RFQs</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border-l-4 border-amber-500 rounded-2xl p-6 shadow-sm">
                    <div className="text-3xl font-black text-amber-500 font-mono">{stats.categories}</div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Mandate Categories</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ADMIN_MODULES.map(module => (
                    <div key={module.id} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/50 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all cursor-pointer">
                        <div className={`w-14 h-14 rounded-2xl bg-${module.color}-50 dark:bg-${module.color}-900/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-6`}>
                            {module.icon}
                        </div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{module.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{module.desc}</p>
                        <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-700/50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <span>Manager Module</span>
                            <span className="group-hover:text-blue-600">&rarr;</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-20 pt-10 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Engine Security Operations v12.66</p>
                <div className="flex justify-center gap-4">
                    <button className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-black shadow-lg shadow-red-600/20 hover:opacity-90 transition-opacity">Global System Shutdown</button>
                    <button className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-xl text-xs font-black hover:bg-gray-100 transition-colors">Audit Trails (SOC2)</button>
                </div>
            </div>
        </div>
    );
}
