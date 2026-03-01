import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function FunderDashboard({ user, onNavigate }) {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user.id) return;

        // Fetch all deals that are pending funding or being reviewed
        const q = query(collection(db, "deals"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allDeals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Funder Matching: Filter by category if funder has preferences, otherwise show all
            const userCats = Array.isArray(user.preferredCategories) ? user.preferredCategories :
                (Array.isArray(user.industry) ? user.industry : []);

            const matchedDeals = allDeals.filter(deal => {
                if (userCats.length === 0) return true; // Show all if no preference
                return userCats.includes(deal.category);
            });

            setDeals(matchedDeals);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user.id, user.preferredCategories, user.industry]);

    const totalCapital = deals
        .filter(d => d.status === 'Capital Secured' || d.status === 'Disbursed')
        .reduce((sum, d) => sum + Number(d.amount || 0), 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Deal Flow Pipeline</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Review SME funding requests and structure verified contracts.</p>
                </div>
                <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex flex-col items-end">
                    <span className="text-[10px] uppercase font-black tracking-widest leading-none mb-1">Portfolio Value</span>
                    <span className="text-xl font-black font-mono text-gray-900 dark:text-white">R{(totalCapital / 1000000).toFixed(1)}M</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deals.length > 0 ? deals.map(deal => (
                    <div key={deal.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm hover:translate-y-[-4px] transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-150"></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{deal.smeName}</h4>
                                <p className="text-xs text-gray-400 uppercase font-black tracking-widest mt-1">{deal.category}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${deal.status === 'Pending Review'
                                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 animation-pulse'
                                }`}>
                                {deal.status}
                            </span>
                        </div>

                        <div className="mb-8 relative z-10">
                            <span className="text-gray-400 text-xs font-medium">Request Amount</span>
                            <div className="text-3xl font-black text-gray-900 dark:text-white font-mono mt-1">
                                R{Number(deal.amount || 0).toLocaleString()}
                            </div>
                        </div>

                        <div className="flex gap-3 relative z-10">
                            <button
                                onClick={() => onNavigate('funder-review', { dealId: deal.id })}
                                className="flex-1 py-3 text-xs font-bold border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                Review Docs
                            </button>
                            <button
                                onClick={() => onNavigate('structure-deal', { dealId: deal.id })}
                                className="flex-1 py-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                            >
                                Structure Deal
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="text-6xl mb-4 opacity-10">📉</div>
                        <p className="text-xl text-gray-400 italic">No active deals matching your mandate.</p>
                        {loading && <p className="text-xs text-blue-500 mt-2 animate-pulse">Fetching deal flow...</p>}
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl">📊</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Funder Portfolio Insights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Active Deals</span>
                        <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{deals.length}</div>
                    </div>
                    <div>
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Yield (Avg)</span>
                        <div className="text-2xl font-black text-emerald-500 dark:text-emerald-400 mt-1">14.2%</div>
                    </div>
                    <div>
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Risk Score</span>
                        <div className="text-2xl font-black text-amber-500 mt-1">A- Stable</div>
                    </div>
                    <div>
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Deployment Limit</span>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">R10M</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
