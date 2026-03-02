import React from 'react';

export default function Home({ onNavigate }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a2e] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
            <nav className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 backdrop-blur-md sticky top-0 z-50">
                <div className="text-xl font-bold cursor-pointer flex items-center gap-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <span>💸</span> Fanya Pesa
                </div>
                <div className="hidden md:flex gap-6 text-sm font-medium">
                    <a href="#how" className="hover:text-blue-600 transition">How it Works</a>
                    <a href="#categories" className="hover:text-blue-600 transition">Funding Categories</a>
                    <a href="#suppliers" className="hover:text-blue-600 transition">Verified Suppliers</a>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => onNavigate('auth')} className="text-sm font-medium px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition border border-transparent dark:border-gray-700">Sign In</button>
                    <button onClick={() => onNavigate('auth')} className="text-sm font-medium px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition shadow-md shadow-blue-500/20">Get Started</button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1 space-y-8 animate-fade-in-up">
                    <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border border-blue-200 dark:border-blue-800">
                        South Africa's #1 SME Platform
                    </span>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            Empowering South African Businesses.
                        </span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                        Fast, transparent business and tender funding. Get matched directly with verified funders or receive quotes from national database suppliers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={() => onNavigate('auth', 'SME')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/30 text-center"
                        >
                            Get Funded as SME
                        </button>
                        <button
                            onClick={() => onNavigate('auth', 'FUNDER')}
                            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 px-8 py-4 rounded-lg font-medium transition-all text-center"
                        >
                            Register as Funder
                        </button>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-md perspective-1000">
                    <div className="bg-white dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700 transform md:-rotate-y-12 md:rotate-x-6 hover:rotate-0 transition-transform duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full blur-2xl"></div>
                        <div className="flex justify-between items-center mb-6">
                            <span className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Active Request
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">R250,000 Tender Funding</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Category: Construction Equipment</p>

                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-3 border border-gray-200 dark:border-gray-600">
                            <div className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full w-[85%] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-shimmer" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}></div>
                            </div>
                        </div>
                        <p className="text-right text-xs text-gray-500 font-medium">Matched with 3 Funders</p>
                    </div>
                </div>
            </main>

            {/* How it Works Section */}
            <section id="how" className="py-24 bg-white dark:bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">How Fanya Pesa Works</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">A seamless 3-step process to bridge the capital gap for South African businesses.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { step: '01', title: 'Register & Verify', desc: 'SMEs and Suppliers upload compliance docs to our secure vault for instant verification.' },
                            { step: '02', title: 'Quote & Coordinate', desc: 'Broadcast RFQs to verified suppliers and receive formal quotes within minutes.' },
                            { step: '03', title: 'Secure Funding', desc: 'Get matched with funders who provide the capital directly to fulfill your contracts.' }
                        ].map((item, i) => (
                            <div key={i} className="relative p-8 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-blue-500/30 transition-all group">
                                <div className="text-5xl font-black text-blue-600/10 dark:text-blue-400/10 absolute top-4 right-8 group-hover:text-blue-600/20 transition-colors">{item.step}</div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section id="categories" className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Funding Categories</h2>
                            <p className="text-gray-500 dark:text-gray-400">We support a wide range of industries with specialized funding mandates.</p>
                        </div>
                        <button onClick={() => onNavigate('auth')} className="text-blue-600 font-bold hover:underline">View all categories &rarr;</button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {['Construction', 'Information Tech', 'Agriculture', 'Logistics', 'Healthcare', 'Manufacturing', 'Mining', 'Retail'].map(cat => (
                            <div key={cat} className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:shadow-lg transition-all cursor-pointer group">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">📦</div>
                                <h5 className="font-bold text-gray-900 dark:text-white">{cat}</h5>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Suppliers Section */}
            <section id="suppliers" className="py-24 bg-blue-600 text-white rounded-[4rem] mx-6 mb-24 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="max-w-7xl mx-auto px-12 relative z-10 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-4xl font-black leading-tight">Join the National <br />Supplier Database</h2>
                        <p className="text-white/80 leading-relaxed">
                            Verified suppliers get direct access to funded SME contracts, guaranteed milestone payouts via escrow, and national visibility.
                        </p>
                        <button onClick={() => onNavigate('auth', 'SUPPLIER')} className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-gray-100 transition-all active:scale-95">
                            Register as Supplier
                        </button>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                        {[
                            { label: 'Verified Suppliers', value: '2,400+' },
                            { label: 'Total RFQs', value: '18k+' },
                            { label: 'Capital Secured', value: 'R450M+' },
                            { label: 'Growth rate', value: '24% MoM' }
                        ].map(stat => (
                            <div key={stat.label} className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <div className="text-2xl font-black mb-1">{stat.value}</div>
                                <div className="text-[10px] uppercase font-bold tracking-widest text-white/60">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="text-center p-8 border-t border-gray-200 dark:border-gray-800">
                <p className="text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Fanya Pesa.
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('auth', 'ADMIN'); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 ml-4 font-medium transition-colors">
                        Admin Portal Access
                    </a>
                </p>
            </footer>
        </div>
    );
}

