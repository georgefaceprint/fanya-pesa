import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from './Toast';

const ADMIN_MODULES = [
    { id: 'compliance', title: 'Compliance Engine', desc: 'Manage mandatory CSD, Tax, and FICA document requirements across all roles.', icon: '📄', color: 'blue' },
    { id: 'categories', title: 'Funding Categories', desc: 'Update the platform taxonomy and matching logic for SME funding requests.', icon: '🏷️', color: 'emerald' },
    { id: 'users', title: 'User Management', desc: 'Audit the entire user base including SMEs, Funders, and Suppliers.', icon: '👥', color: 'amber' },
    { id: 'funder_approval', title: 'Funder Verification', desc: 'Approve or reject high-net-worth individuals and corporate funding entities.', icon: '🛡️', color: 'purple' },
    { id: 'activity', title: 'System Activity', desc: 'Live feed of platform notifications, deal statuses, and user sign-ups.', icon: '🔔', color: 'red' },
    { id: 'secrets', title: 'API & Secrets', desc: 'Manage backend keys, Firestore limits, and third-party integration secrets.', icon: '🔑', color: 'gray' }
];

export default function AdminPanel({ user, onBack }) {
    const [currentModule, setCurrentModule] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const [stats] = useState({
        deals: 24,
        rfqs: 156,
        categories: 12
    });

    useEffect(() => {
        if (currentModule === 'users' || currentModule === 'funder_approval') {
            setLoading(true);
            const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
                const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUsers(userList);
                setLoading(false);
            });
            return () => unsub();
        }
    }, [currentModule]);

    const toggleVerification = async (userId, currentStatus) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                verified: !currentStatus
            });
            toast.success(`User ${currentStatus ? 'unverified' : 'verified'} successfully!`);
        } catch (error) {
            console.error("Error toggling verification:", error);
            toast.error('Failed to update user status.');
        }
    };

    if (currentModule === 'users') {
        return (
            <div className="max-w-6xl mx-auto py-10 animate-fade-in">
                <button onClick={() => setCurrentModule(null)} className="mb-8 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">&larr; Back to Control Center</button>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">User Management</h2>
                <p className="text-gray-500 mb-10">Audit and verify platform participants.</p>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">User / Entity</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Email</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white">{u.name || 'Unknown'}</div>
                                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{u.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${u.type === 'SME' ? 'bg-blue-50 text-blue-600' :
                                            u.type === 'SUPPLIER' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                                            }`}>
                                            {u.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1.5 text-xs font-bold ${u.verified ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${u.verified ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                            {u.verified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => toggleVerification(u.id, u.verified)}
                                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${u.verified
                                                ? 'border border-red-200 text-red-600 hover:bg-red-50'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
                                                }`}
                                        >
                                            {u.verified ? 'Revoke' : 'Approve'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {loading && <div className="p-10 text-center text-gray-400 italic">Scanning decentralized database...</div>}
                </div>
            </div>
        );
    }

    if (currentModule === 'funder_approval') {
        const funders = users.filter(u => u.type === 'FUNDER');
        return (
            <div className="max-w-6xl mx-auto py-10 animate-fade-in">
                <button onClick={() => setCurrentModule(null)} className="mb-8 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">&larr; Back to Control Center</button>
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Funder Verification</h2>
                        <p className="text-gray-500">Authorize capital partners to deploy liquidity on the platform.</p>
                    </div>
                    <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-purple-100 dark:border-purple-800">
                        {funders.length} Registered Funders
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {funders.map(f => (
                        <div key={f.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center shadow-sm">
                            <div className="flex items-center gap-6 mb-4 md:mb-0">
                                <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-2xl">
                                    💎
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">{f.name || f.email.split('@')[0]}</h4>
                                        {f.verified && <span className="text-blue-500 text-sm">🛡️</span>}
                                    </div>
                                    <p className="text-sm text-gray-500">{f.email}</p>
                                    <div className="mt-2 flex gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-gray-50 dark:bg-gray-900 py-1 px-2 rounded text-gray-400 border border-gray-100 dark:border-gray-700">AUM: R{f.aum || '0'}M</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-gray-50 dark:bg-gray-900 py-1 px-2 rounded text-gray-400 border border-gray-100 dark:border-gray-700">HNWI Verified</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-bold ${f.verified ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {f.verified ? 'Authorized' : 'Pending Authorization'}
                                </span>
                                <button
                                    onClick={() => toggleVerification(f.id, f.verified)}
                                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${f.verified
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-lg shadow-purple-600/20'
                                        }`}
                                >
                                    {f.verified ? 'Revoke Access' : 'Approve Funder'}
                                </button>
                            </div>
                        </div>
                    ))}
                    {funders.length === 0 && !loading && (
                        <div className="py-20 text-center bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                            <div className="text-5xl mb-4 opacity-20">🛡️</div>
                            <p className="text-gray-400 italic">No funder applications pending review.</p>
                        </div>
                    )}
                    {loading && <div className="p-10 text-center text-gray-400 italic">Synchronizing with capital markets...</div>}
                </div>
            </div>
        );
    }

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
                    <div
                        key={module.id}
                        onClick={() => setCurrentModule(module.id)}
                        className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/50 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all cursor-pointer"
                    >
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
