import React, { useState } from 'react';

export default function SmeDashboard({ user, onNavigate }) {
    const [rfqs, setRfqs] = useState([]); // Placeholder for RFQs

    const renderSuggestiveActions = () => {
        const actions = [];

        if (!user.industry || (Array.isArray(user.industry) && user.industry.length === 0)) {
            actions.push({
                title: "Complete Your Matching Profile",
                desc: "Select up to 5 categories to get matched with the right suppliers.",
                icon: "🏷️",
                action: () => onNavigate('profile-edit'),
                color: "blue"
            });
        }

        if (!user.subscribed) {
            actions.push({
                title: "Unlock Premium Access",
                desc: "Subscribe to request quotes from the national database.",
                icon: "💎",
                action: () => onNavigate('subscription'),
                color: "emerald"
            });
        } else if (rfqs.length === 0) {
            actions.push({
                title: "Create Your First RFQ",
                desc: "Broadcast a request to verified suppliers for your business needs.",
                icon: "🚚",
                action: () => onNavigate('quote-request'),
                color: "purple"
            });
        }

        if (actions.length === 0) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {actions.map((action, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={action.action}>
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl bg-${action.color}-50 dark:bg-${action.color}-900/20 text-${action.color}-600 dark:text-${action.color}-400 text-xl`}>
                                {action.icon}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{action.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{action.desc}</p>
                                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                    Take Action <span>&rarr;</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome, {user.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your business funding and supply chain from one secure dashboard.</p>
                </div>
                {user.subscribed && (
                    <div className="flex gap-3">
                        <button onClick={() => onNavigate('quote-request')} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Request Quote</button>
                        <button onClick={() => onNavigate('funding-request')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all">Apply for Funding</button>
                    </div>
                )}
            </div>

            {renderSuggestiveActions()}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Info Card */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                            🏢
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{user.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest mt-1">SME Representative</p>
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-gray-100 dark:border-gray-700/50 pt-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Account Status</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Verified SME</span>
                        </div>
                        <div className="flex justify-between items-start text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Categories</span>
                            <span className="font-medium text-gray-900 dark:text-white text-right max-w-[60%]">
                                {Array.isArray(user.industry) ? user.industry.join(', ') : (user.industry || 'None')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Official Email</span>
                            <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Fanya ID</span>
                            <span className="font-mono text-xs bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded text-blue-600 dark:text-blue-400">FP-{user.id?.substring(0, 8).toUpperCase() || 'NEW'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-10">
                        <button onClick={() => onNavigate('profile-edit')} className="py-3 text-sm font-bold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">Edit Profile</button>
                        <button onClick={() => onNavigate('vault')} className="py-3 text-sm font-bold bg-gray-900 dark:bg-blue-600 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10">My Vault</button>
                    </div>
                </div>

                {/* RFQ / Funding List */}
                <div className="lg:col-span-2 space-y-6">
                    {!user.subscribed ? (
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                            <div className="relative z-10 max-w-md">
                                <h3 className="text-3xl font-bold mb-4">Unlock Premium Growth Plan</h3>
                                <p className="text-white/80 mb-8 leading-relaxed">
                                    Subscribe for R299/mo to request accurate quotes from verified national suppliers and apply for direct funding facilities.
                                </p>
                                <button
                                    onClick={() => onNavigate('subscription')}
                                    className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-xl active:scale-95"
                                >
                                    Subscribe Now &rarr;
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-3xl p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Active Quotation Requests (RFQs)</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Track quotes from verified suppliers in real-time.</p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-800">SME Pro Active</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {rfqs.length > 0 ? rfqs.map((rfq, i) => (
                                    <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:border-blue-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 dark:text-white">{rfq.title}</h4>
                                            <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded font-bold">{rfq.status}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-4 truncate">{rfq.specs}</p>
                                        <button className="w-full py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">View Quotes ({rfq.quotes?.length || 0})</button>
                                    </div>
                                )) : (
                                    <div className="col-span-2 py-12 text-center">
                                        <div className="text-4xl mb-4 opacity-20">📦</div>
                                        <p className="text-gray-400 text-sm italic">You have no active quotation requests.</p>
                                        <button
                                            onClick={() => onNavigate('quote-request')}
                                            className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline"
                                        >
                                            Create your first RFQ
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
