import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const PLANS = {
    SME: {
        name: 'SME Growth Plan',
        price: 299,
        color: 'blue',
        icon: '🏢',
        perks: [
            'Broadcast unlimited RFQs to verified suppliers',
            'Apply for direct funding from vetted funders',
            'Real-time bid tracking dashboard',
            'Escrow-backed supplier contracts',
            'Priority matching for your categories',
        ]
    },
    SUPPLIER: {
        name: 'Verified Supplier Plan',
        price: 499,
        color: 'emerald',
        icon: '🚚',
        perks: [
            'Receive live RFQ notifications in your category',
            'Submit unlimited custom quotes',
            'Guaranteed milestone payouts via escrow',
            'Priority listing in supplier search',
            'SME & Funder verified badge',
        ]
    },
    FUNDER: {
        name: 'Funder Access Plan',
        price: 999,
        color: 'violet',
        icon: '💼',
        perks: [
            'Full deal flow pipeline access',
            'Structure & approve funding requests',
            'Due diligence document review',
            'Capital deployment analytics',
            'Co-funding network access',
        ]
    }
};

export default function Subscription({ user, onBack, onSuccess }) {
    const plan = PLANS[user.type] || PLANS.SME;
    const [step, setStep] = useState('review'); // 'review' | 'payment' | 'success'
    const [loading, setLoading] = useState(false);
    const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });
    const [cardFocused, setCardFocused] = useState(null);

    const formatCardNumber = (val) => {
        return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    };

    const formatExpiry = (val) => {
        const clean = val.replace(/\D/g, '').slice(0, 4);
        if (clean.length >= 3) return clean.slice(0, 2) + '/' + clean.slice(2);
        return clean;
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate payment processing (1.5s)
        await new Promise(r => setTimeout(r, 1500));

        try {
            await setDoc(doc(db, 'users', user.uid || user.id), {
                subscribed: true,
                plan: plan.name,
                subscribedAt: new Date().toISOString(),
            }, { merge: true });

            setStep('success');

            // Auto-redirect after 2.5s
            setTimeout(() => {
                onSuccess && onSuccess();
            }, 2500);
        } catch (err) {
            console.error('Subscription activation failed:', err);
            alert('Payment succeeded but activation failed. Contact support@fanyapesa.co.za');
        } finally {
            setLoading(false);
        }
    };

    const colorMap = {
        blue: { badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20', ring: 'focus:ring-blue-500', border: 'border-blue-200 dark:border-blue-800', glow: 'from-blue-600 to-indigo-700' },
        emerald: { badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20', ring: 'focus:ring-emerald-500', border: 'border-emerald-200 dark:border-emerald-800', glow: 'from-emerald-500 to-teal-600' },
        violet: { badge: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400', btn: 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/20', ring: 'focus:ring-violet-500', border: 'border-violet-200 dark:border-violet-800', glow: 'from-violet-600 to-purple-700' },
    };
    const c = colorMap[plan.color];

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a2e] flex items-center justify-center px-6">
                <div className="text-center max-w-sm animate-fade-in-up">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${c.glow} flex items-center justify-center mx-auto mb-6 shadow-xl`}>
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">You're Verified! 🎉</h2>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                        Your <strong>{plan.name}</strong> is now active. Redirecting to your dashboard...
                    </p>
                    <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a2e] py-10 px-6 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                <button onClick={onBack} className="mb-8 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2">
                    <span>&larr;</span> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                    {/* Plan Summary */}
                    <div className="lg:col-span-2">
                        <div className={`bg-gradient-to-br ${c.glow} rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                            <div className="relative z-10">
                                <div className="text-5xl mb-4">{plan.icon}</div>
                                <h2 className="text-2xl font-black mb-1">{plan.name}</h2>
                                <p className="text-white/70 text-sm mb-6">Unlock the full Fanya Pesa experience</p>
                                <div className="text-5xl font-black font-mono mb-1">R{plan.price}</div>
                                <p className="text-white/60 text-xs uppercase font-bold tracking-widest">Per Month — Cancel Anytime</p>

                                <ul className="mt-8 space-y-3">
                                    {plan.perks.map((perk, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-white/90">
                                            <span className="mt-0.5 w-5 h-5 flex-shrink-0 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">✓</span>
                                            {perk}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-8 pt-6 border-t border-white/20 flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest">
                                    <span>🔒</span> Secured by PayFast
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                                All subscriptions are processed securely. Your card details are encrypted and never stored on our servers.
                            </p>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Secure Payment</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Enter your card details to activate your plan.</p>

                            {/* Mock Card Visual */}
                            <div className={`relative bg-gradient-to-br ${c.glow} rounded-2xl p-6 mb-8 text-white shadow-lg overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="flex justify-between items-start mb-8">
                                    <div className="text-xs font-bold uppercase tracking-widest opacity-70">Fanya Pesa</div>
                                    <div className="text-2xl opacity-80">💳</div>
                                </div>
                                <div className="font-mono text-xl tracking-widest mb-6 min-h-[1.5rem]">
                                    {card.number ? card.number.padEnd(19, '•').replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] opacity-50 uppercase font-bold mb-0.5">Card Holder</p>
                                        <p className="font-bold text-sm">{card.name || user.name || 'YOUR NAME'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] opacity-50 uppercase font-bold mb-0.5">Expires</p>
                                        <p className="font-bold text-sm font-mono">{card.expiry || 'MM/YY'}</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handlePayment} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Name on Card</label>
                                    <input
                                        type="text"
                                        required
                                        value={card.name}
                                        onChange={e => setCard({ ...card, name: e.target.value })}
                                        onFocus={() => setCardFocused('name')}
                                        onBlur={() => setCardFocused(null)}
                                        placeholder="e.g. George Faceprint"
                                        className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none transition-all ${cardFocused === 'name' ? `${c.ring} ring-2 border-transparent` : 'border-gray-200 dark:border-gray-700'}`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={card.number}
                                        onChange={e => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                                        onFocus={() => setCardFocused('number')}
                                        onBlur={() => setCardFocused(null)}
                                        placeholder="4000 1234 5678 9010"
                                        maxLength={19}
                                        className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-xl px-4 py-3 text-gray-900 dark:text-white font-mono outline-none transition-all ${cardFocused === 'number' ? `${c.ring} ring-2 border-transparent` : 'border-gray-200 dark:border-gray-700'}`}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
                                        <input
                                            type="text"
                                            required
                                            value={card.expiry}
                                            onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                                            onFocus={() => setCardFocused('expiry')}
                                            onBlur={() => setCardFocused(null)}
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-xl px-4 py-3 text-gray-900 dark:text-white font-mono outline-none transition-all ${cardFocused === 'expiry' ? `${c.ring} ring-2 border-transparent` : 'border-gray-200 dark:border-gray-700'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">CVV / CVC</label>
                                        <input
                                            type="password"
                                            required
                                            value={card.cvv}
                                            onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                            onFocus={() => setCardFocused('cvv')}
                                            onBlur={() => setCardFocused(null)}
                                            placeholder="•••"
                                            maxLength={4}
                                            className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none transition-all ${cardFocused === 'cvv' ? `${c.ring} ring-2 border-transparent` : 'border-gray-200 dark:border-gray-700'}`}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 ${c.btn} text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 mt-4 disabled:opacity-50 flex items-center justify-center gap-3`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                            Processing securely...
                                        </>
                                    ) : (
                                        <>🔒 Pay R{plan.price}.00 / month</>
                                    )}
                                </button>
                            </form>
                        </div>

                        <p className="text-center text-[10px] text-gray-400 uppercase font-bold tracking-tighter mt-4">
                            256-bit SSL Encrypted · PCI DSS Compliant · Cancel Anytime
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
