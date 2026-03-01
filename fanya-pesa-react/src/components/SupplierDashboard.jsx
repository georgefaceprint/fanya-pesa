import React, { useState } from 'react';

export default function SupplierDashboard({ user, onNavigate }) {
    const [rfqs, setRfqs] = useState([
        {
            id: "rfq_9281",
            title: "Supply of 50 HP Laptops",
            smeName: "Cape Logistics Ltd",
            location: "Johannesburg, GP",
            specs: "Intel Core i7, 16GB RAM, 512GB SSD. Required within 14 days.",
            status: "Requested",
            quotes: 4,
            category: "IT Hardware"
        }
    ]);

    const [activeDeals, setActiveDeals] = useState([]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Supplier Portal</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Matched RFQs and active fulfillment contracts.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => onNavigate('vault')}
                        className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                    >
                        <span>📁</span> Vault
                    </button>
                    {!user.subscribed && (
                        <button
                            onClick={() => onNavigate('subscription')}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                        >
                            <span>🛡️</span> Become Verified
                        </button>
                    )}
                </div>
            </div>

            {!user.subscribed ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-10 text-center shadow-sm">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Start Quoting on Tenders</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            Subscribe as a Verified Supplier to receive direct quotation requests from funded SMEs and secure guaranteed payouts via Fanya Pesa escrow.
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 text-left">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Verified Supplier Plan</h4>
                            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-6 font-mono">R499<span className="text-sm font-medium text-gray-400">/mo</span></div>
                            <ul className="space-y-4 mb-8">
                                {["Instant RFQ Notifications", "Submit Unlimited Quotes", "Guaranteed Milestone Payouts"].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="text-emerald-500 font-bold">✓</span> {item}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => onNavigate('subscription')} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all">Get Verified Now</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Live RFQ Feed</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Quotation requests matching your verified criteria.</p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-800">Supplier Verified</span>
                            </div>

                            <div className="space-y-4">
                                {rfqs.map(rfq => (
                                    <div key={rfq.id} className="border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:shadow-md transition-shadow relative">
                                        <span className="absolute top-6 right-6 text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">{rfq.status}</span>
                                        <div className="max-w-[80%] mb-4">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{rfq.title}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                <span>Buyer: {rfq.smeName}</span>
                                                <span>•</span>
                                                <span>Delivery: {rfq.location}</span>
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                            {rfq.specs}
                                        </p>
                                        <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-gray-700/50">
                                            <div className="text-xs text-gray-400">
                                                RFQ ID: {rfq.id.toUpperCase()} • {rfq.quotes} Quotes Received
                                            </div>
                                            <button className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity">Submit Custom Quote</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Escrow Payouts & Active Contracts</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Upload proof of delivery to trigger automatic milestone releases.</p>

                            {activeDeals.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="text-4xl mb-4 opacity-10">📄</div>
                                    <p className="text-gray-400 text-sm italic">No active funded contracts yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Deal items would go here */}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-sm">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <span>📋</span> Supplier Profile
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Official Name</span>
                                    <span className="font-bold text-right">{user.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Supplier ID</span>
                                    <span className="font-mono text-blue-600 dark:text-blue-400">SA-9281</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Categories</span>
                                    <span className="text-right max-w-[50%]">{Array.isArray(user.industry) ? user.industry.join(', ') : (user.industry || 'All')}</span>
                                </div>
                            </div>
                            <button className="w-full mt-8 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-white rounded-xl text-sm font-bold border border-gray-100 dark:border-gray-700">Update Match Criteria</button>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white">
                            <h4 className="text-lg font-bold mb-2">Guaranteed Payment</h4>
                            <p className="text-white/70 text-sm mb-6 leading-relaxed">
                                All RFQs on Fanya Pesa are pre-funded or backed by verified funding facilities. Your payment is held in escrow from the moment you accept a contract.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/50">
                                <span>Secure Escrow v2.4</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
