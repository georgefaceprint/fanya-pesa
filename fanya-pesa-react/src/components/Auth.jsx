import React, { useState } from 'react';

export default function Auth({ initialIntent = null, onBack }) {
    const [intent, setIntent] = useState(initialIntent);
    const [method, setMethod] = useState('select');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (provider) => {
        alert(`Simulating ${provider} login for intent: ${intent}`);
    };

    const processEmailAuth = (e, action) => {
        e.preventDefault();
        alert(`Processing ${action} for ${email} as ${intent}`);
    };

    if (!intent) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a2e] flex flex-col items-center pt-24 px-6 transition-colors duration-300">
                <div className="max-w-3xl w-full text-center animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">Welcome to Fanya Pesa</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-12 text-lg max-w-xl mx-auto">Please select how you want to use the platform to continue.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                        <div
                            onClick={() => setIntent('SME')}
                            className="bg-white dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl p-8 cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                                🏢
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Business (SME)</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">Apply for funding & tenders, and connect with suppliers.</p>
                        </div>

                        <div
                            onClick={() => setIntent('FUNDER')}
                            className="bg-white dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl p-8 cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform text-purple-600">
                                💎
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Funder</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">Deploy capital securely by funding active SME contracts.</p>
                        </div>

                        <div
                            onClick={() => setIntent('SUPPLIER')}
                            className="bg-white dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl p-8 cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                                🚚
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Supplier</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">Join the verified database and quote directly on SME RFQs.</p>
                        </div>
                    </div>
                    <button onClick={onBack} className="mt-12 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors underline underline-offset-4">
                        &larr; Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (method === 'email') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a2e] flex flex-col items-center pt-24 px-6 transition-colors duration-300">
                <div className="w-full max-w-md animate-fade-in-up">
                    <button onClick={() => setMethod('select')} className="mb-8 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors">
                        <span>&larr;</span> Back to Options
                    </button>

                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Email Access</h2>
                        <div className="mt-2 inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-blue-100 dark:border-blue-800">
                            Accessing as: {intent}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none">
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                    required
                                    placeholder="you@company.com"
                                />
                            </div>
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                    required
                                    minLength="6"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={(e) => processEmailAuth(e, 'login')} className="flex-1 bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 py-3 rounded-lg font-medium transition-colors">
                                    Log In
                                </button>
                                <button type="button" onClick={(e) => processEmailAuth(e, 'register')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 py-3 rounded-lg font-medium transition-all">
                                    Register
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a2e] flex flex-col items-center pt-24 px-6 transition-colors duration-300">
            <div className="w-full max-w-md text-center animate-fade-in-up">
                <div className="text-left mb-8">
                    <button onClick={() => setIntent(null)} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 transition-colors">
                        <span>&larr;</span> Change Role
                    </button>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sign In / Join</h2>
                <div className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-blue-100 dark:border-blue-800 mb-6">
                    Accessing as: {intent}
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Please choose an authentication method to log into your Fanya Pesa account.</p>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none">
                    <button
                        onClick={() => handleLogin('google')}
                        className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-xl font-medium transition-all shadow-md shadow-blue-500/20 mb-3"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="bg-white rounded-full p-1">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <button
                        onClick={() => handleLogin('apple')}
                        className="w-full flex items-center justify-center gap-3 bg-transparent border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200 py-3.5 px-4 rounded-xl font-medium transition-colors mb-3"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M16.365 20.675C15.115 21.6 13.905 22.025 12 22C10.155 22.025 8.875 21.6 7.635 20.675C5.165 18.845 2.625 14.185 4.305 9.775C5.145 7.575 7.035 6.125 9.175 6.125C10.745 6.125 11.975 6.845 12.875 6.845C13.805 6.845 15.255 5.995 17.155 5.995C18.675 5.995 20.465 6.675 21.575 8.045C21.495 8.105 18.825 9.685 18.825 12.845C18.825 16.595 22.155 17.895 22.195 17.915C22.145 18.065 21.655 19.825 20.575 21.415C19.555 22.925 18.435 24.365 16.825 24.365C15.225 24.365 14.735 23.365 12.865 23.365C10.985 23.365 10.425 24.325 8.905 24.325C7.385 24.325 6.135 22.755 5.075 21.235C2.885 18.085.875 12.385 3.125 9.145C4.245 7.525 5.985 6.545 7.825 6.545C9.375 6.545 10.745 7.575 11.725 7.575C12.705 7.575 14.395 6.325 16.295 6.325C17.655 6.325 19.505 6.945 20.655 8.415L20.665 8.425C18.155 9.945 18.415 13.575 21.105 14.715C20.505 16.395 19.335 18.445 18.065 20.275C17.585 20.945 17.125 21.565 16.715 22.055L16.365 20.675ZM15.265 4.185C16.095 3.165 16.655 1.835 16.505.495C15.355.545 13.935 1.285 13.085 2.305C12.335 3.205 11.665 4.585 11.835 5.885C13.115 5.985 14.435 5.205 15.265 4.185Z" /></svg>
                        Continue with Apple
                    </button>

                    <button
                        onClick={() => setMethod('email')}
                        className="w-full flex items-center justify-center gap-3 bg-transparent border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200 py-3.5 px-4 rounded-xl font-medium transition-colors mb-3"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" ry="2" /><polyline points="3 7 12 13 21 7" /></svg>
                        Continue with Email
                    </button>

                    <button
                        onClick={() => handleLogin('phone')}
                        className="w-full flex items-center justify-center gap-3 bg-transparent border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200 py-3.5 px-4 rounded-xl font-medium transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                        Continue with Phone
                    </button>

                    <p className="mt-8 text-xs text-gray-400 dark:text-gray-500 leading-relaxed max-w-xs mx-auto">
                        By continuing, you agree to our Terms and Privacy Policy. All major authentication providers supported.
                    </p>
                </div>
            </div>
        </div>
    );
}
