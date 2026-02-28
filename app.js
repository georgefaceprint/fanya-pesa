import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, setDoc, doc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

// TODO: Replace this with your actual Firebase config from the console
const firebaseConfig = {
    apiKey: "AIzaSyCmoiuwbDodIELIj-TptuEYlIJbVSAKkuQ",
    authDomain: "fanya-pesa.firebaseapp.com",
    projectId: "fanya-pesa",
    storageBucket: "fanya-pesa.firebasestorage.app",
    messagingSenderId: "719005341578",
    appId: "1:719005341578:web:da45b21b454c52a7671a73",
    measurementId: "G-KXN6S8DXB9"
};

// Initialize Firebase & Firestore
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();
const storage = getStorage(firebaseApp);

const STORE_KEY = 'fanya_pesa_user';

const app = {
    user: JSON.parse(localStorage.getItem(STORE_KEY)) || null,
    docTypes: [],
    fundingCategories: [],
    notifications: [],
    deals: [],
    rfqs: [],
    currentView: 'home',

    async notifySupplierCategory(category, message) {
        try {
            const usersSnap = await getDocs(collection(db, "users"));
            usersSnap.forEach(async (uSnap) => {
                const ud = uSnap.data();
                if (ud.type === 'SUPPLIER' && (ud.industry === category || category === 'All')) {
                    const docRef = doc(db, "user_notifications", ud.id);
                    const notifSnap = await getDoc(docRef);
                    let notifs = notifSnap.exists() ? notifSnap.data().data : [];
                    notifs.unshift({ id: Date.now(), text: message, read: false, time: "Just now" });
                    await setDoc(docRef, { data: notifs }, { merge: true });
                }
            });
        } catch (error) { console.error(error); }
    },

    saveDocTypes() {
        setDoc(doc(db, "system_config", "doctypes"), { data: this.docTypes }).catch(console.error);
    },

    saveFundingCategories() {
        setDoc(doc(db, "system_config", "categories"), { data: this.fundingCategories }).catch(console.error);
    },

    saveNotifications() {
        if (this.user) {
            setDoc(doc(db, "user_notifications", this.user.id), { data: this.notifications }).catch(console.error);
        }
    },

    initUserDB() {
        onSnapshot(doc(db, "system_config", "doctypes"), (docSnap) => {
            if (docSnap.exists()) {
                this.docTypes = docSnap.data().data;
            } else {
                this.docTypes = [
                    { id: 1, name: 'CSD Registration Report', description: 'Central Supplier Database summary report', requiredFor: ['SME', 'SUPPLIER'] },
                    { id: 2, name: 'Valid Tax Clearance', description: 'SARS Tax Clearance Certificate with PIN', requiredFor: ['SME', 'SUPPLIER'] },
                    { id: 3, name: '6 Months Bank Statements', description: 'Recent bank statements for affordability assessment', requiredFor: ['SME'] },
                    { id: 4, name: 'Directors ID Copies', description: 'Certified copies of all active directors', requiredFor: ['SME', 'SUPPLIER'] }
                ];
                this.saveDocTypes();
            }
        });

        onSnapshot(doc(db, "system_config", "categories"), (docSnap) => {
            if (docSnap.exists()) {
                this.fundingCategories = docSnap.data().data;
            } else {
                this.fundingCategories = [
                    { id: 1, name: 'Tender Execution (PO Financing)', description: 'Government or corporate purchase orders' },
                    { id: 2, name: 'Asset Finance (Equipment/Vehicles)', description: 'Machinery and commercial vehicles' },
                    { id: 3, name: 'Working Capital / Cash Flow', description: 'Short-term bridging finance' },
                    { id: 4, name: 'Merchant Cash Advance', description: 'Based on card terminal sales' }
                ];
                this.saveFundingCategories();
            }
        });

        if (this.user) {
            onSnapshot(doc(db, "user_notifications", this.user.id), (docSnap) => {
                if (docSnap.exists()) {
                    this.notifications = docSnap.data().data;
                } else {
                    this.notifications = [{ id: 1, text: "Welcome to Fanya Pesa! Complete your profile to get started.", read: false, time: "Just now" }];
                    this.saveNotifications();
                }
                this.renderNavbar();
            });

            onSnapshot(collection(db, "deals"), (snapshot) => {
                this.deals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (this.currentView === 'dashboard') this.showDashboard();
            });

            onSnapshot(collection(db, "rfqs"), (snapshot) => {
                this.rfqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (this.currentView === 'dashboard') this.showDashboard();
            });
        }
    },

    init() {
        this.initUserDB();
        this.renderNavbar();

        // Handle initial routing based on user state
        if (this.user) {
            this.showDashboard();
        } else {
            this.renderHome();
        }
    },

    // --- State & Auth ---

    async login(intentType = 'SME') {
        try {
            const result = await signInWithPopup(auth, provider);
            const userRef = doc(db, "users", result.user.uid);
            const docSnap = await getDoc(userRef);

            let userData;
            if (docSnap.exists()) {
                userData = docSnap.data();
            } else {
                // First time login - set up the profile mapped to their intent 
                userData = {
                    id: result.user.uid,
                    name: result.user.displayName,
                    email: result.user.email,
                    type: intentType, // SME, FUNDER, SUPPLIER, or ADMIN
                    subscribed: false
                };
                await setDoc(userRef, userData);
            }

            this.user = userData;
            localStorage.setItem(STORE_KEY, JSON.stringify(userData));
            this.init();
        } catch (error) {
            console.error("Auth Error:", error);
            alert("Login Failed: " + error.message);
        }
    },

    async logout() {
        try {
            await signOut(auth);
            this.user = null;
            localStorage.removeItem(STORE_KEY);
            this.init();
        } catch (error) {
            console.error("Logout Error:", error);
        }
    },

    // --- Navigation & Rendering ---

    renderNavbar() {
        const authContainer = document.getElementById('auth-container');
        if (this.user) {
            const unreadCount = this.notifications.filter(n => !n.read).length;

            authContainer.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="position: relative; cursor: pointer; padding: 0.5rem;" onclick="app.showNotifications()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-color)" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        ${unreadCount > 0 ? `<span style="position: absolute; top: 0; right: 0; background: var(--primary); color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; font-weight: bold;">${unreadCount}</span>` : ''}
                    </div>
                    <span style="font-weight: 500; display: none; @media (min-width: 600px) { display: block; }">Hi, ${this.user.name}</span>
                    <button class="btn btn-secondary" onclick="app.logout()">Sign Out</button>
                    <button class="btn btn-primary" onclick="app.showDashboard()">Dashboard</button>
                </div>
            `;
        } else {
            authContainer.innerHTML = `
                <button class="btn btn-secondary" onclick="app.showAuth()">Sign In</button>
                <button class="btn btn-primary" onclick="app.showAuth()">Get Started</button>
            `;
        }
    },

    setView(html) {
        document.getElementById('main-view').innerHTML = html;
        window.scrollTo(0, 0);
    },

    // --- Views ---

    renderHome() {
        this.setView(`
            <section class="hero hero-enter">
                <div class="hero-content">
                    <span class="badge">South Africa's #1 SME Platform</span>
                    <h1 class="gradient-text">Empowering South African Businesses.</h1>
                    <p>Fast, transparent business and tender funding. Get matched directly with verified funders or receive quotes from national database suppliers.</p>
                    <div class="hero-actions">
                        <button class="btn btn-primary btn-large" onclick="app.showAuth('SME')">Apply as SME</button>
                        <button class="btn btn-outline btn-large" onclick="app.showAuth('FUNDER')">I am a Funder</button>
                    </div>
                </div>
                <div class="hero-visual">
                    <div class="glass-card float-anim">
                        <div class="card-header">
                            <span class="status pulse">Active Request</span>
                        </div>
                        <h3>R250,000 Tender Funding</h3>
                        <p class="subtext">Category: Construction Equipment</p>
                        <div class="progress-bar"><div class="progress" style="width: 85%"></div></div>
                        <p class="status-text">Matched with 3 Funders</p>
                    </div>
                </div>
            </section>
            
            <footer style="text-align: center; padding: 2rem; border-top: 1px solid var(--border); margin-top: 4rem;">
                <p class="subtext">
                    &copy; 2026 Fanya Pesa. <a href="#" onclick="event.preventDefault(); app.showAuth('ADMIN')" style="color: var(--primary); text-decoration: none; margin-left: 1rem;">Admin Portal Access</a>
                </p>
            </footer>
        `);
    },

    showAuth(intentType = 'SME') {
        this.setView(`
            <div class="auth-wrapper hero-enter" style="max-width: 450px; margin: 4rem auto;">
                <h2 style="margin-bottom: 1rem; font-size: 2rem;">Sign In / Join</h2>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">Use your Google account to access the Fanya Pesa platform.</p>
                
                <div class="glass-card" style="text-align: center; padding: 3rem 2rem;">
                    <!-- Placeholder for Real Google Sign In -->
                    <button class="btn btn-primary btn-large" style="width: 100%; display: flex; justify-content: center; gap: 1rem;" onclick="app.login('${intentType}')">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>
                    <p style="margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted);">
                        By continuing, you agree to our Terms and Privacy Policy.
                    </p>
                </div>
            </div>
        `);
    },

    showDashboard() {
        if (!this.user) return this.showAuth();

        this.setView(`
            <div class="hero-enter" style="margin-top: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>Welcome, ${this.user.name}</h2>
                    ${this.user.type === 'SME' && this.user.subscribed ? `
                        <div style="display: flex; gap: 1rem;">
                            <button class="btn btn-secondary" onclick="app.showQuoteRequest()">Request Quote</button>
                            <button class="btn btn-primary" onclick="app.showFundingRequest()">Apply for Funding</button>
                        </div>
                    ` : ''}
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    
                    ${this.user.type === 'SME' ? `
                    <div class="glass-card">
                        <h3>Your Profile</h3>
                        <p class="subtext" style="margin-bottom: 1rem;">Complete your details to increase trust.</p>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>Status</span> <span style="color: var(--accent); font-weight: bold;">Verified</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Company Type</span> <span>Pty Ltd</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                            <button class="btn btn-outline" style="width: 50%;" onclick="app.showProfileEdit()">Edit Profile</button>
                            <button class="btn btn-secondary" style="width: 50%;" onclick="app.showDocumentRepo()">Doc Vault</button>
                        </div>
                    </div>
                    ` : ''}

                    ${this.user.type === 'SME' ? (
                !this.user.subscribed ? `
                        <div class="glass-card" style="grid-column: 1 / -1; margin-top: 1rem;">
                            <div style="text-align: center; padding: 2rem 1rem; background: var(--secondary); border-radius: 8px;">
                                <h2 style="margin-bottom: 1rem;">Unlock Premium Access</h2>
                                <p style="margin-bottom: 2rem; max-width: 400px; margin-inline: auto;">Subscribe to request accurate quotes from verified national database suppliers and apply directly for funder capital.</p>
                                
                                <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;">
                                    <div class="glass-card" style="text-align: left; min-width: 250px;">
                                        <h4 style="margin-bottom: 0.5rem;">SME Growth Plan</h4>
                                        <h2>R299<span style="font-size: 1rem; color: var(--text-muted); font-weight: 500;">/mo</span></h2>
                                        <ul style="margin: 1.5rem 0; padding-left: 1.5rem; text-align: left; line-height: 1.8;">
                                            <li>Unlimited quote requests</li>
                                            <li>Direct funding facility applications</li>
                                            <li>Fanya Pesa milestone tracking mapping</li>
                                        </ul>
                                        <button class="btn btn-primary" style="width: 100%;" onclick="app.user.subscribed = true; app.showDashboard();">Subscribe Now</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ` : `
                        <div class="glass-card">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <h3>Active Requests</h3>
                                <span class="status pulse">SME Pro Active</span>
                            </div>
                            <div style="margin-top: 1rem; border: 1px solid var(--border); padding: 1rem; border-radius: 8px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <strong>Tender Funding (R500k)</strong>
                                    <span class="status pulse">Pending</span>
                                </div>
                                <p class="subtext">Category: Tech Infrastructure</p>
                            </div>
                            <div style="margin-top: 1rem; border: 1px solid var(--border); padding: 1rem; border-radius: 8px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <strong>Supplier Quote Request</strong>
                                    <span class="status" style="background: rgba(59,130,246,0.1); color: var(--primary);">2 Quotes Received</span>
                                </div>
                                <p class="subtext">Required: 50x Laptops (HP/Dell)</p>
                                <button class="btn btn-secondary" style="width: 100%; margin-top: 0.8rem; padding: 0.4rem;" onclick="app.showMilestones()">Track Milestones</button>
                            </div>
                        </div>
                        `
            ) : ''}

                    ${this.user.type === 'FUNDER' ? `
                    <div class="glass-card" style="grid-column: 1 / -1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                            <div>
                                <h3>Deal Flow Pipeline</h3>
                                <p class="subtext">Review SME funding requests, structure deals, and generate binding contracts automatically.</p>
                            </div>
                            <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--accent); border-color: rgba(16, 185, 129, 0.2);">Capital Deployed: R4.2M</span>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                            ${this.deals.length > 0 ? this.deals.map(deal => `
                            <div class="glass-card" style="background: var(--bg-color);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <strong>${deal.smeName || 'SME'}</strong>
                                    <span class="status pulse" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">${deal.status}</span>
                                </div>
                                <h4>Request: R${Number(deal.amount).toLocaleString()}</h4>
                                <p class="subtext" style="margin-bottom: 1rem;">Category: ${deal.category}</p>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-secondary" style="flex: 1; padding: 0.5rem; font-size: 0.85rem;" onclick="app.showFunderDocReview('${deal.smeId}')">Review Docs</button>
                                    <button class="btn btn-primary" style="flex: 1; padding: 0.5rem; font-size: 0.85rem;" onclick="app.showFunderOffer('${deal.id}')">Structure Deal</button>
                                </div>
                            </div>
                            `).join('') : '<p class="subtext">No active deals right now.</p>'}
                        </div>
                    </div>
                    ` : ''}

                    ${this.user.type === 'SUPPLIER' ? (
                !this.user.subscribed ? `
                        <div class="glass-card" style="grid-column: 1 / -1; margin-top: 1rem;">
                            <div style="text-align: center; padding: 2rem 1rem; background: var(--secondary); border-radius: 8px;">
                                <h2 style="margin-bottom: 1rem;">Start Quoting on Tenders</h2>
                                <p style="margin-bottom: 2rem; max-width: 400px; margin-inline: auto;">Subscribe as a Verified Supplier to receive direct quotation requests from funded SMEs and secure guaranteed payouts via Fanya Pesa escrow.</p>
                                
                                <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;">
                                    <div class="glass-card" style="text-align: left; min-width: 250px;">
                                        <h4 style="margin-bottom: 0.5rem;">Verified Supplier Plan</h4>
                                        <h2>R499<span style="font-size: 1rem; color: var(--text-muted); font-weight: 500;">/mo</span></h2>
                                        <ul style="margin: 1.5rem 0; padding-left: 1.5rem; text-align: left; line-height: 1.8;">
                                            <li>Instant RFQ Notifications</li>
                                            <li>Submit Unlimited Quotes</li>
                                            <li>Guaranteed Milestone Payouts</li>
                                        </ul>
                                        <button class="btn btn-primary" style="width: 100%;" onclick="app.user.subscribed = true; app.showDashboard();">Become Verified</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ` : `
                        <div class="glass-card" style="grid-column: 1 / -1;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                                <div>
                                    <h3>Live RFQ Feed</h3>
                                    <p class="subtext">Available quotation requests matching your verified industry mandate.</p>
                                </div>
                                <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--accent); border-color: rgba(16, 185, 129, 0.2);">Supplier ID: SA-9281</span>
                            </div>

                            ${this.rfqs.filter(r => r.category === 'All' || r.category === this.user.industry || !this.user.industry).map(rfq => `
                            <div style="border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; position: relative;">
                                <span class="badge" style="position: absolute; top: 1.5rem; right: 1.5rem; margin: 0; background: rgba(59,130,246,0.1); color: var(--primary);">Expires: 48h</span>
                                
                                <div style="margin-bottom: 1rem; max-width: 80%;">
                                    <h4 style="margin: 0 0 0.5rem 0;">${rfq.title}</h4>
                                    <p class="subtext" style="margin: 0;">Buyer: ${rfq.smeName} • Delivery: ${rfq.location}</p>
                                </div>

                                <p style="font-size: 0.95rem; margin-bottom: 1.5rem; color: var(--text-color);">${rfq.specs}</p>

                                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 1rem;">
                                    <span class="subtext" style="font-size: 0.85rem;">RFQ ID: ${rfq.id.substring(0, 8)} • ${rfq.quotes ? rfq.quotes.length : 0} Quotes Received</span>
                                    <button class="btn btn-primary btn-sm" onclick="app.showSubmitQuote('${rfq.id}')">Submit Custom Quote</button>
                                </div>
                            </div>
                            `).join('') || '<p class="subtext">No RFQs matching your category currently.</p>'}
                        </div>

                        <div class="glass-card" style="grid-column: 1 / -1; margin-top: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                                <div>
                                    <h3>Escrow Payouts & Active Contracts</h3>
                                    <p class="subtext">Upload proof of delivery (waybills) to trigger automatic milestone releases from the Funder Escrow.</p>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                                ${this.deals.filter(d => (d.status === 'Capital Secured' || d.status === 'Delivery Confirmed') && d.supplierName === this.user.name).map(deal => `
                                <div class="glass-card" style="background: var(--bg-color); border: 1px solid var(--accent);">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <strong>Active Contract: ${deal.category}</strong>
                                        <span class="status" style="background: rgba(16, 185, 129, 0.1); color: var(--accent);">${deal.status === 'Delivery Confirmed' ? '100% Paid' : '30% Paid (Upfront)'}</span>
                                    </div>
                                    <p class="subtext" style="margin-bottom: 1rem;">Funder: ${deal.funderName}<br>SME: ${deal.smeName}</p>
                                    <button class="btn btn-${deal.status === 'Delivery Confirmed' ? 'outline' : 'secondary'}" style="width: 100%; padding: 0.5rem;" onclick="app.showSupplierMilestones('${deal.id}')">${deal.status === 'Delivery Confirmed' ? 'View Details' : 'Upload Waybill'}</button>
                                </div>
                                `).join('') || '<p class="subtext">No active funded contracts yet.</p>'}
                            </div>
                        </div>
                        `
            ) : ''}

                ${this.user.type === 'ADMIN' ? `
                    <div style="grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 0.5rem;">
                        <div class="glass-card" style="text-align: center; border-left: 4px solid var(--primary);">
                            <h3 style="font-size: 2.2rem; margin: 0; color: var(--primary);">${this.deals.length}</h3>
                            <p class="subtext">Active Funding Deals</p>
                        </div>
                        <div class="glass-card" style="text-align: center; border-left: 4px solid var(--accent);">
                            <h3 style="font-size: 2.2rem; margin: 0; color: var(--accent);">${this.rfqs.length}</h3>
                            <p class="subtext">Live Escrow RFQs</p>
                        </div>
                        <div class="glass-card" style="text-align: center; border-left: 4px solid #f59e0b;">
                            <h3 style="font-size: 2.2rem; margin: 0; color: #f59e0b;">${app.fundingCategories ? app.fundingCategories.length : 0}</h3>
                            <p class="subtext">Mandate Categories</p>
                        </div>
                    </div>

                    <div class="glass-card" style="grid-column: 1 / -1; margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <div>
                                <h3>Platform Configuration Engine</h3>
                                <p class="subtext">Manage core logic, compliance routing, and supplier matching criteria.</p>
                            </div>
                            <span class="badge" style="background: rgba(220, 38, 38, 0.1); color: #dc2626; border-color: rgba(220, 38, 38, 0.2);">Super Admin Access</span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                            <div class="glass-card" style="background: var(--bg-color); cursor: pointer; border: 1px solid var(--border); transition: border-color 0.2s;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'" onclick="app.showAdminDashboard()">
                                <h4 style="margin-bottom: 0.5rem;">Compliance Documents &rarr;</h4>
                                <p class="subtext" style="font-size: 0.85rem;">Dictate mandatory Vault uploads (CSD, Tax, FICA) dynamically enforced for SMEs and Suppliers.</p>
                            </div>
                            <div class="glass-card" style="background: var(--bg-color); cursor: pointer; border: 1px solid var(--border); transition: border-color 0.2s;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'" onclick="app.showAdminCategories()">
                                <h4 style="margin-bottom: 0.5rem;">Funding Categories &rarr;</h4>
                                <p class="subtext" style="font-size: 0.85rem;">Manage platform taxonomies used for AI matching between SME Requests, RFQs, and Funder Mandates.</p>
                            </div>
                        </div>
                    </div>
                ` : ''}

                </div>
            </div>
        `);
    },

    async submitFundingRequest(event) {
        event.preventDefault();
        const form = event.target;
        const amount = form.querySelector('input[type="number"]').value;
        const category = form.querySelector('select').value;
        const desc = form.querySelector('textarea').value;

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="status pulse" style="background: rgba(255,255,255,0.2);">Submitting...</span>';
        btn.disabled = true;

        try {
            await addDoc(collection(db, "deals"), {
                smeId: this.user.id,
                smeName: this.user.name,
                amount: amount,
                category: category,
                description: desc,
                status: 'Pending Review',
                createdAt: new Date().toISOString()
            });
            alert('Funding Request Submitted Successfully!');
            this.showDashboard();
        } catch (error) {
            console.error("Error submitting deal:", error);
            alert("Failed to submit request.");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    async submitQuoteRequest(event) {
        event.preventDefault();
        const form = event.target;
        const title = form.querySelector('input[type="text"]').value;
        const category = form.querySelector('select').value;
        const specs = form.querySelector('textarea').value;
        const location = form.querySelectorAll('input[type="text"]')[1].value;

        const btn = form.querySelector('button[type="submit"]');
        btn.innerHTML = 'Broadcasting...';
        btn.disabled = true;

        try {
            await addDoc(collection(db, "rfqs"), {
                smeId: this.user.id,
                smeName: this.user.name,
                title: title,
                category: category,
                specs: specs,
                location: location,
                status: 'Open',
                quotes: [],
                createdAt: new Date().toISOString()
            });
            // Send ping to suppliers in this category
            await this.notifySupplierCategory(category, `New RFQ: ${title}`);

            alert('Quotation request securely broadcasted to Verified Suppliers!');
            this.showDashboard();
        } catch (error) {
            console.error("Error submitting RFQ:", error);
            alert("Failed to broadcast RFQ.");
            btn.innerHTML = 'Broadcast Request';
            btn.disabled = false;
        }
    },

    showProfileEdit() {
        this.setView(`
             <div class="hero-enter" style="max-width: 600px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.showDashboard()">&larr; Back to Dashboard</button>
                <h2>Complete Your Profile</h2>
                <p class="subtext" style="margin-bottom: 2rem;">Fleshing out your profile ensures faster matching with funders and suppliers.</p>

                <div class="glass-card">
                    <form onsubmit="event.preventDefault(); alert('Profile Saved!'); app.showDashboard();">
                        <div class="form-group">
                            <label>Company Name</label>
                            <input type="text" class="form-control" value="My Awesome SME" required>
                        </div>
                        <div class="form-group">
                            <label>Registration Number (CIPC)</label>
                            <input type="text" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label>Industry</label>
                            <select class="form-control">
                                <option>Construction</option>
                                <option>Technology</option>
                                <option>Agriculture</option>
                                <option>Retail</option>
                            </select>
                        </div>
                        <p class="subtext" style="margin-bottom: 1rem;">Note: Compliance documents (CSD, Tax) should be uploaded via the Document Vault.</p>
                        <button type="submit" class="btn btn-primary btn-large" style="width: 100%; margin-top: 1rem;">Save Profile</button>
                    </form>
                </div>
             </div>
        `);
    },

    showFundingRequest() {
        this.setView(`
             <div class="hero-enter" style="max-width: 600px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.showDashboard()">&larr; Back</button>
                <h2>Apply for Funding</h2>
                <p class="subtext" style="margin-bottom: 2rem;">Submit details to be matched with our verified funders.</p>

                <div class="glass-card">
                    <form onsubmit="app.submitFundingRequest(event)">
                        <div class="form-group">
                            <label>Funding Amount (ZAR)</label>
                            <input type="number" class="form-control" placeholder="e.g. 250000" required>
                        </div>
                        <div class="form-group">
                            <label>Funding Category</label>
                            <select class="form-control" required>
                                <option value="">Select Category...</option>
                                ${app.fundingCategories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Purpose of Funding (Brief Description)</label>
                            <textarea class="form-control" rows="4" required></textarea>
                        </div>
                         <div class="form-group">
                            <label>Upload Supporting Docs (PO, Invoices, Bank Statements)</label>
                            <input type="file" class="form-control" style="padding: 0.5rem;" multiple>
                        </div>
                        <button type="submit" class="btn btn-primary btn-large" style="width: 100%; margin-top: 1rem;">Submit Request</button>
                    </form>
                </div>
             </div>
        `);
    },

    showQuoteRequest() {
        this.setView(`
             <div class="hero-enter" style="max-width: 600px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.showDashboard()">&larr; Back</button>
                
                <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--accent); border-color: rgba(16, 185, 129, 0.2);">Supplier Network</span>
                <h2 style="margin-top: 0.5rem;">Request a Quotation</h2>
                <p class="subtext" style="margin-bottom: 2rem;">Need materials or services to fulfill a tender? Your request will be sent to matched, verified suppliers on the platform.</p>

                <div class="glass-card">
                    <form onsubmit="app.submitQuoteRequest(event)">
                        <div class="form-group">
                            <label>What do you need?</label>
                            <input type="text" class="form-control" placeholder="e.g. 50 Dell Laptops, or 20 Tons Cement" required>
                        </div>
                        <div class="form-group">
                            <label>Supplier Category</label>
                            <select class="form-control" required>
                                <option value="">Select Category...</option>
                                ${app.fundingCategories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Detailed Specifications</label>
                            <textarea class="form-control" rows="4" placeholder="Mention specific grades, delivery timelines, etc." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Delivery Location</label>
                            <input type="text" class="form-control" placeholder="City/Province" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-large" style="width: 100%; margin-top: 1rem;">
                            Broadcast Request
                        </button>
                    </form>
                </div>
             </div>
        `);
    },
    showMilestones() {
        this.setView(`
             <div class="hero-enter" style="max-width: 600px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.showDashboard()">&larr; Back to Dashboard</button>
                
                <h2>Active Funding & Payments</h2>
                <p class="subtext" style="margin-bottom: 2rem;">Fanya Pesa ensures security mapping. Your allocated funds go directly to the verified supplier as project milestones are met.</p>

                <div class="glass-card">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                        <div>
                            <h3 style="margin: 0;">Supply of 50 HP Laptops</h3>
                            <p class="subtext">Supplier: AfriTek Solutions (Verified ID: SA-9281)</p>
                            <p class="subtext">Funder: BlueCape Capital</p>
                        </div>
                        <span class="badge" style="background: rgba(59,130,246,0.1); color: var(--primary);">In Progress</span>
                    </div>

                    <div style="position: relative; padding-left: 1.5rem; margin-top: 1.5rem;">
                        <!-- Timeline Line -->
                        <div style="position: absolute; left: 6px; top: 8px; bottom: 8px; width: 2px; background: var(--secondary); z-index: 1;"></div>
                        
                        <!-- Milestone 1 -->
                        <div style="position: relative; margin-bottom: 2rem; z-index: 2;">
                            <div style="position: absolute; left: -24px; top: 4px; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); border: 2px solid var(--bg-color);"></div>
                            <h4 style="margin: 0;">Milestone 1: Deposit Paid</h4>
                            <p class="subtext">30% upfront payment sent directly to Supplier.</p>
                        </div>

                        <!-- Milestone 2 -->
                        <div style="position: relative; margin-bottom: 2rem; z-index: 2;">
                            <div style="position: absolute; left: -24px; top: 4px; width: 14px; height: 14px; border-radius: 50%; background: var(--primary); border: 2px solid var(--bg-color); box-shadow: 0 0 0 4px rgba(59,130,246,0.2);"></div>
                            <h4 style="margin: 0;">Milestone 2: Dispatch Confirmation</h4>
                            <p class="subtext">Awaiting supplier to upload waybill / proof of dispatch. Funder will release next 40% chunk.</p>
                            <button class="btn btn-secondary btn-sm" style="margin-top: 0.5rem; padding: 0.3rem 0.6rem; font-size: 0.8rem;">Review Supplier Docs</button>
                        </div>

                        <!-- Milestone 3 -->
                        <div style="position: relative; z-index: 2;">
                            <div style="position: absolute; left: -24px; top: 4px; width: 14px; height: 14px; border-radius: 50%; background: var(--secondary-hover); border: 2px solid var(--bg-color);"></div>
                            <h4 style="margin: 0;">Milestone 3: Final Delivery Sign-off</h4>
                            <p class="subtext">You (SME) must sign off on delivery. Funder releases remaining 30% retention to supplier.</p>
                        </div>
                    </div>
                </div>
             </div>
        `);
    },

    showFunderOffer() {
        this.setView(`
             <div class="hero-enter" style="max-width: 700px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.showDashboard()">&larr; Back to Pipeline</button>
                
                <h2>Structure Deal: My Awesome SME</h2>
                <p class="subtext" style="margin-bottom: 2rem;">Draft the funding terms for this R250,000 IT Hardware Tender request. Once approved, the platform automatically generates a tripartite contract involving you, the SME, and the selected Verified Supplier.</p>

                <div class="glass-card">
                    <form id="funderDealForm" onsubmit="app.generateContract('${dealId}')">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                            <div class="form-group">
                                <label>Principal Amount (ZAR)</label>
                                <input type="number" class="form-control" value="250000" id="dealPrincipal" required>
                            </div>
                            <div class="form-group">
                                <label>Interest Rate (%)</label>
                                <input type="number" step="0.1" class="form-control" value="12.5" id="dealInterest" required>
                            </div>
                            <div class="form-group">
                                <label>Platform/Origination Fee (ZAR)</label>
                                <input type="number" class="form-control" value="4500" id="dealFees" required>
                            </div>
                            <div class="form-group">
                                <label>Repayment Term</label>
                                <select class="form-control" id="dealTerm" required>
                                    <option value="Net 30 Days (Tender Payout)">Net 30 Days (Tender Payout)</option>
                                    <option value="Net 60 Days">Net 60 Days</option>
                                    <option value="Net 90 Days">Net 90 Days</option>
                                    <option value="6 Months Amortized">6 Months Amortized</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-top: 1rem;">
                            <label>Link to Verified Supplier (Currently Hardcoded Example)</label>
                            <select class="form-control" id="dealSupplier" required>
                                <option value="Tech Innovators (Pty) Ltd">Tech Innovators (Pty) Ltd - R${Number(deal.amount).toLocaleString()} Quote</option>
                                <option value="BuildItRight Construction">BuildItRight Construction</option>
                            </select>
                        </div>

                        <div class="form-group" style="margin-top: 1rem;">
                            <label>Default Terms & Conditions Appendage</label>
                            <div style="padding: 1rem; border: 1px solid var(--border); background: var(--secondary); border-radius: 8px; font-size: 0.85rem; height: 100px; overflow-y: auto;">
                                1. Fanya Pesa acts as the escrow layer. <br>
                                2. Upon execution, Funder pays 30% upfront to the Supplier.<br>
                                3. Funder pays 40% upon Waybill completion.<br>
                                4. Funder pays 30% upon final delivery sign-off by the SME.<br>
                                5. SME cedes the government/corporate tender invoice payment directly into the designated Fanya Pesa joint-account until the facility is settled.
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary btn-large" style="width: 100%; margin-top: 1rem;">
                            Generate Binding Smart Contract
                        </button>
                    </form>
                </div>
             </div>
        `);
    },

    async generateContract(dealId) {
        // Collect mock data from form
        const deal = this.deals.find(d => d.id === dealId) || { amount: 250000, smeName: 'My Awesome SME (Pty) Ltd' };
        const principal = document.getElementById('dealPrincipal').value || deal.amount;
        const interest = document.getElementById('dealInterest').value || 12.5;
        const fees = document.getElementById('dealFees').value || 4500;
        const term = document.getElementById('dealTerm').value || "Net 30 Days";
        const supplierSelect = document.getElementById('dealSupplier');
        const supplierName = supplierSelect.options[supplierSelect.selectedIndex].text;

        // Calculate total 
        const total = parseFloat(principal) + (parseFloat(principal) * (parseFloat(interest) / 100)) + parseFloat(fees);

        const btn = document.querySelector('#funderDealForm button[type="submit"]');
        const ogText = btn.innerHTML;
        btn.innerHTML = '<span class="status pulse">Generating Smart Contract...</span>';
        btn.disabled = true;

        try {
            if (deal.id) {
                // Lock the deal and deploy capital virtually
                await setDoc(doc(db, "deals", deal.id), {
                    status: 'Capital Secured',
                    funderId: this.user.id,
                    funderName: this.user.name,
                    supplierName: supplierSelect.value, // Used value for simplicity
                    dealTerms: { principal, interest, fees, total, term }
                }, { merge: true });

                // Ping the SME
                const smeRef = doc(db, "user_notifications", deal.smeId);
                const smeSnap = await getDoc(smeRef);
                let smeNotifs = smeSnap.exists() ? smeSnap.data().data : [];
                smeNotifs.unshift({ id: Date.now(), text: `🎉 Deal APPROVED! ${this.user.name} has secured R${Number(principal).toLocaleString()} in Fanya Pesa escrow for your contract.`, read: false, time: "Just now" });
                await setDoc(smeRef, { data: smeNotifs }, { merge: true });
            }

            this.setView(`
             <div class="hero-enter" style="max-width: 800px; margin: 2rem auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>Contract Generated Successfully</h2>
                    <button class="btn btn-secondary" onclick="app.showDashboard()">Return to Dashboard</button>
                </div>

                <div class="glass-card" style="background: white; color: black; border-radius: 4px; border-left: 8px solid var(--primary); padding: 3rem;">
                    
                    <div style="text-align: center; margin-bottom: 3rem;">
                        <h1 style="font-family: serif; color: black; font-size: 2rem;">Funding Facility Agreement</h1>
                        <p style="color: #666; margin-top: 0.5rem;">Auto-generated via Fanya Pesa Engine on ${new Date().toLocaleDateString()}</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; font-family: serif;">
                        <div>
                            <strong style="display: block; font-size: 0.8rem; text-transform: uppercase; color: #666;">The Funder</strong>
                            <span style="font-size: 1.1rem;">${this.user.name}</span>
                        </div>
                        <div>
                            <strong style="display: block; font-size: 0.8rem; text-transform: uppercase; color: #666;">The SME (Borrower)</strong>
                            <span style="font-size: 1.1rem;">My Awesome SME (Pty) Ltd</span>
                        </div>
                        <div>
                            <strong style="display: block; font-size: 0.8rem; text-transform: uppercase; color: #666;">The Designated Supplier</strong>
                            <span style="font-size: 1.1rem;">${supplier}</span>
                        </div>
                    </div>

                    <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 2rem;">

                    <h3 style="font-family: serif; font-size: 1.2rem; margin-bottom: 1rem;">1. Financial Terms</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem; font-family: monospace; font-size: 0.95rem;">
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 0.8rem 0;">Principal Facility Amount</td>
                            <td style="text-align: right; font-weight: bold;">R ${Number(principal).toLocaleString()}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 0.8rem 0;">Interest Rate Applied</td>
                            <td style="text-align: right;">${interest}%</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 0.8rem 0;">Origination Fees</td>
                            <td style="text-align: right;">R ${Number(fees).toLocaleString()}</td>
                        </tr>
                        <tr style="border-bottom: 2px solid #000; background: #fafafa;">
                            <td style="padding: 1rem 0; font-weight: bold;">Total Repayment Due (${term})</td>
                            <td style="text-align: right; font-weight: bold; font-size: 1.1rem;">R ${total.toLocaleString()}</td>
                        </tr>
                    </table>

                    <h3 style="font-family: serif; font-size: 1.2rem; margin-bottom: 1rem;">2. Disbursement & Supplier Cession</h3>
                    <p style="font-family: serif; line-height: 1.6; color: #333; margin-bottom: 2rem;">
                        The Funder agrees to deploy the Principal Facility directly to the Designated Supplier (${supplierName}) across platform-managed milestones (30% Upfront, 40% Waybill, 30% Delivery). The SME cedes all rights to the initial tender invoice payout to the Funder until the Total Repayment Due is settled in full.
                    </p>

                    <div style="background: rgba(59, 130, 246, 0.05); padding: 1.5rem; text-align: center; border: 1px dashed var(--primary);">
                        <p style="font-weight: 500; margin-bottom: 1rem; color: var(--primary);">Currently Pending SME Electronic Signature</p>
                        <button class="btn btn-outline" disabled style="background: white;">Awaiting SME Acceptance</button>
                    </div>

                </div>
             </div>
        `);
        } catch (error) {
            console.error("Error generating contract:", error);
            alert("Failed to secure capital and generate contract.");
            btn.innerHTML = ogText;
            btn.disabled = false;
        }
    },

    showSubmitQuote(rfqId) {
        const rfq = this.rfqs.find(r => r.id === rfqId);
        if (!rfq) return alert("RFQ not found!");

        this.setView(`
             <div class="hero-enter" style="max-width: 600px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.showDashboard()">&larr; Back</button>
                
                <span class="badge" style="background: rgba(59, 130, 246, 0.1); color: var(--primary); border-color: rgba(59, 130, 246, 0.2);">Quote Request</span>
                <h2 style="margin-top: 0.5rem;">${rfq.title}</h2>
                <p class="subtext" style="margin-bottom: 2rem;">Requested by ${rfq.smeName}. Delivery to ${rfq.location}. ${rfq.specs}</p>

                <div class="glass-card">
                    <form onsubmit="app.submitQuote(event, '${rfq.id}')">
                        <div class="form-group">
                            <label>Total Supply Cost (ZAR)</label>
                            <input type="number" class="form-control" placeholder="e.g. 250000" required>
                        </div>
                        <div class="form-group">
                            <label>Estimated Delivery Time</label>
                            <select class="form-control" required>
                                <option value="">Select Timeline...</option>
                                <option>1 - 3 Days</option>
                                <option>3 - 7 Days</option>
                                <option>1 - 2 Weeks</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Quote Proposal Details</label>
                            <textarea class="form-control" rows="4" placeholder="Mention exact specs being quoted, warranty info, etc." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Upload Official Quote (PDF)</label>
                            <input type="file" class="form-control" style="padding: 0.5rem;" accept=".pdf">
                        </div>
                        <button type="submit" class="btn btn-primary btn-large" style="width: 100%; margin-top: 1rem;">
                            Submit Formal Quote
                        </button>
                    </form>
                </div>
             </div>
        `);
    },

    async submitQuote(event, rfqId) {
        event.preventDefault();
        const form = event.target;
        const price = form.querySelectorAll('input')[0].value;
        const timeframe = form.querySelector('select').value;
        const terms = form.querySelector('textarea').value;

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="status pulse">Submitting...</span>';
        btn.disabled = true;

        try {
            const rfq = this.rfqs.find(r => r.id === rfqId);
            if (!rfq) throw new Error("RFQ not found");

            const quotes = rfq.quotes || [];
            quotes.push({
                supplierId: this.user.id,
                supplierName: this.user.name,
                price: price,
                timeframe: timeframe,
                terms: terms,
                submittedAt: new Date().toISOString()
            });

            await setDoc(doc(db, "rfqs", rfqId), { quotes }, { merge: true });

            // Ping the SME that they received a quote
            const notifRef = doc(db, "user_notifications", rfq.smeId);
            const notifSnap = await getDoc(notifRef);
            let notifs = notifSnap.exists() ? notifSnap.data().data : [];
            notifs.unshift({ id: Date.now(), text: `You received a new quote of R${Number(price).toLocaleString()} from ${this.user.name} on your RFQ: ${rfq.title}`, read: false, time: "Just now" });
            await setDoc(notifRef, { data: notifs }, { merge: true });

            alert('Your formal quote was securely submitted to the SME!');
            this.showDashboard();
        } catch (error) {
            console.error("Error submitting quote:", error);
            alert("Failed to submit quote.");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    showSupplierMilestones(dealId) {
        const deal = this.deals.find(d => d.id === dealId) || { category: '20T Cement', smeName: 'SME', funderName: 'Funder', amount: 0, status: 'Capital Secured' };
        const upfront = deal.amount * 0.30;
        const nextPayout = deal.amount * 0.40;

        window.handleWaybillUpload = async (fileInput) => {
            const file = fileInput.files[0];
            if (!file) return;

            const btn = document.getElementById('waybillBtn');
            btn.innerHTML = '<span class="status pulse">Uploading...</span>';
            btn.disabled = true;

            try {
                // Upload to Storage
                const storageRef = ref(storage, `waybills/${deal.id}_${file.name}`);
                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);

                // Update Deal status
                await setDoc(doc(db, "deals", deal.id), {
                    status: 'Delivery Confirmed',
                    waybillUrl: downloadURL
                }, { merge: true });

                alert('Waybill uploaded! Escrow has automatically disbursed the next payment.');
                this.showDashboard();
            } catch (e) { console.error(e); alert('Upload failed'); btn.disabled = false; btn.innerHTML = 'Upload Waybill'; }
        }

        this.setView(`
             <div class="hero-enter" style="max-width: 600px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.showDashboard()">&larr; Back to Dashboard</button>
                
                <h2>Active Contract: ${deal.category}</h2>
                <p class="subtext" style="margin-bottom: 2rem;">Upload your proof of dispatch to unlock the next 40% milestone payment directly from the Funder's escrow layer.</p>

                <div class="glass-card">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                        <div>
                            <h3 style="margin: 0;">Contract Execution</h3>
                            <p class="subtext">SME: ${deal.smeName}</p>
                            <p class="subtext">Funder: ${deal.funderName}</p>
                        </div>
                        <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--accent);">${deal.status === 'Delivery Confirmed' ? '100% Paid' : '30% Upfront Paid'}</span>
                    </div>

                    <div style="position: relative; padding-left: 1.5rem; margin-top: 1.5rem;">
                        <div style="position: absolute; left: 6px; top: 8px; bottom: 8px; width: 2px; background: var(--secondary); z-index: 1;"></div>
                        
                        <div style="position: relative; margin-bottom: 2rem; z-index: 2;">
                            <div style="position: absolute; left: -24px; top: 4px; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); border: 2px solid var(--bg-color);"></div>
                            <h4 style="margin: 0;">Milestone 1: Deposit (Completed)</h4>
                            <p class="subtext">30% upfront payment (R${upfront.toLocaleString()}) received.</p>
                        </div>

                        <div style="position: relative; margin-bottom: 2rem; z-index: 2;">
                            <div style="position: absolute; left: -24px; top: 4px; width: 14px; height: 14px; border-radius: 50%; ${deal.status === 'Delivery Confirmed' ? 'background: var(--accent);' : 'background: var(--primary); box-shadow: 0 0 0 4px rgba(59,130,246,0.2);'} border: 2px solid var(--bg-color);"></div>
                            <h4 style="margin: 0;">Milestone 2: Dispatch Confirmation</h4>
                            ${deal.status === 'Delivery Confirmed' ?
                `<p class="subtext" style="color: var(--accent); font-weight: bold;">Waybill Confirmed! R${nextPayout.toLocaleString()} released from Escrow.</p>
                                 <a href="${deal.waybillUrl}" target="_blank" class="btn btn-outline btn-sm">View Waybill</a>` :
                `<p class="subtext">Upload proof of dispatch/waybill to request the next 40% chunk (R${nextPayout.toLocaleString()}).</p>
                                <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-color); border-radius: 8px; border: 1px dashed var(--border);">
                                    <input type="file" id="waybillInput" class="form-control" style="padding: 0.5rem; margin-bottom: 0.5rem;" accept=".pdf,.jpg,.png">
                                    <button id="waybillBtn" class="btn btn-primary btn-sm" onclick="window.handleWaybillUpload(document.getElementById('waybillInput'))">Upload Waybill</button>
                                </div>`
            }
                        </div>
                    </div>
                </div>
             </div>
        `);
    },

    showFunderDocReview() {
        const smeDocs = this.docTypes.filter(d => d.requiredFor.includes('SME'));

        const renderSmeDocs = () => {
            if (smeDocs.length === 0) return '<p class="subtext">No documents required for this SME.</p>';
            return smeDocs.map(doc => `
                <div style="background: var(--bg-color); border: 1px solid var(--border); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="display: block; margin-bottom: 0.2rem;">${doc.name}</strong>
                        <span class="subtext" style="font-size: 0.85rem;">Uploaded on 12 Oct 2026</span>
                    </div>
                    <div>
                        <button class="btn btn-outline btn-sm" onclick="alert('Downloading ${doc.name} (Simulated)...')">View File</button>
                    </div>
                </div>
            `).join('');
        };

        this.setView(`
             <div class="hero-enter" style="max-width: 700px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.showDashboard()">&larr; Back to Pipeline</button>
                
                <h2>Review Documents: My Awesome SME</h2>
                <p class="subtext" style="margin-bottom: 2rem;">As a funder, verify the SME's identity, tax status, and affordability before structuring a deal.</p>

                <div class="glass-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                        <h3 style="margin: 0;">SME Vault Contents</h3>
                        <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--accent);">Complete</span>
                    </div>

                    ${renderSmeDocs()}

                    <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                        <button class="btn btn-outline" style="flex: 1;" onclick="alert('Declining SME application.'); app.showDashboard();">Decline Application</button>
                        <button class="btn btn-primary" style="flex: 1;" onclick="app.showFunderOffer()">Approve & Structure Deal</button>
                    </div>
                </div>
             </div>
        `);
    },

    showAdminDashboard() {
        const renderDocTypes = () => {
            return this.docTypes.map(doc => `
                <div style="background: var(--bg-color); border: 1px solid var(--border); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0; margin-bottom: 0.2rem;">${doc.name}</h4>
                        <p class="subtext" style="margin: 0;">${doc.description}</p>
                        <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                            ${doc.requiredFor.map(role => `<span class="badge" style="background: rgba(59, 130, 246, 0.1); color: var(--primary); padding: 0.2rem 0.4rem; font-size: 0.7rem;">For ${role}</span>`).join('')}
                        </div>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="app.docTypes = app.docTypes.filter(d => d.id !== ${doc.id}); app.saveDocTypes(); app.showAdminDashboard();">Remove</button>
                </div>
            `).join('');
        };

        this.setView(`
             <div class="hero-enter" style="max-width: 800px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.showDashboard()">&larr; Back to Admin Panel</button>
                
                <h2>Compliance Document Types</h2>
                <p class="subtext" style="margin-bottom: 2rem;">Manage the mandatory documents that SMEs and Suppliers must upload to get verified on the platform.</p>

                <div style="display: grid; grid-template-columns: 1fr 300px; gap: 2rem;">
                    <div>
                        <h3>Current Requirements</h3>
                        ${renderDocTypes()}
                    </div>
                    
                    <div>
                        <div class="glass-card" style="position: sticky; top: 100px;">
                            <h3>Add New Document Type</h3>
                            <form onsubmit="event.preventDefault(); app.addDocType(this);">
                                <div class="form-group">
                                    <label>Document Name</label>
                                    <input type="text" name="name" class="form-control" required placeholder="e.g. B-BBEE Certificate">
                                </div>
                                <div class="form-group">
                                    <label>Description</label>
                                    <textarea name="desc" class="form-control" rows="2" required placeholder="Explain why it's needed"></textarea>
                                </div>
                                <div class="form-group">
                                    <label>Required For</label>
                                    <div style="display: flex; gap: 1rem; align-items: center; margin-top: 0.5rem;">
                                        <label style="display: flex; align-items: center; gap: 0.3rem;"><input type="checkbox" name="req_sme" value="SME" checked> SME</label>
                                        <label style="display: flex; align-items: center; gap: 0.3rem;"><input type="checkbox" name="req_sup" value="SUPPLIER"> Supplier</label>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Add Requirement</button>
                            </form>
                        </div>
                    </div>
                </div>
             </div>
        `);
    },

    addDocType(form) {
        const name = form.name.value;
        const desc = form.desc.value;
        const requiredFor = [];
        if (form.req_sme.checked) requiredFor.push('SME');
        if (form.req_sup.checked) requiredFor.push('SUPPLIER');

        if (requiredFor.length === 0) {
            alert("Please select at least one role role (SME or Supplier).");
            return;
        }

        const newId = this.docTypes.length ? Math.max(...this.docTypes.map(d => d.id)) + 1 : 1;
        this.docTypes.push({ id: newId, name, description: desc, requiredFor });
        this.saveDocTypes();
        this.showAdminDashboard();
    },

    showAdminCategories() {
        const renderCategories = () => {
            return this.fundingCategories.map(cat => `
                <div style="background: var(--bg-color); border: 1px solid var(--border); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0; margin-bottom: 0.2rem;">${cat.name}</h4>
                        <p class="subtext" style="margin: 0;">${cat.description}</p>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="app.fundingCategories = app.fundingCategories.filter(c => c.id !== ${cat.id}); app.saveFundingCategories(); app.showAdminCategories();">Remove</button>
                </div>
            `).join('');
        };

        this.setView(`
             <div class="hero-enter" style="max-width: 800px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.showDashboard()">&larr; Back to Admin Panel</button>
                
                <h2>Funding Categories</h2>
                <p class="subtext" style="margin-bottom: 2rem;">Manage the funding options that SMEs can apply for.</p>

                <div style="display: grid; grid-template-columns: 1fr 300px; gap: 2rem;">
                    <div>
                        <h3>Current Categories</h3>
                        ${renderCategories()}
                    </div>
                    
                    <div>
                        <div class="glass-card" style="position: sticky; top: 100px;">
                            <h3>Add New Category</h3>
                            <form onsubmit="event.preventDefault(); app.addFundingCategory(this);">
                                <div class="form-group">
                                    <label>Category Name</label>
                                    <input type="text" name="name" class="form-control" required placeholder="e.g. Invoice Factoring">
                                </div>
                                <div class="form-group">
                                    <label>Brief Description</label>
                                    <textarea name="desc" class="form-control" rows="2" required placeholder="Unlocking cash from unpaid invoices"></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Add Category</button>
                            </form>
                        </div>
                    </div>
                </div>
             </div>
        `);
    },

    addFundingCategory(form) {
        const name = form.name.value;
        const desc = form.desc.value;
        const newId = this.fundingCategories.length ? Math.max(...this.fundingCategories.map(c => c.id)) + 1 : 1;

        this.fundingCategories.push({ id: newId, name, description: desc });
        this.saveFundingCategories();
        this.showAdminCategories();
    },

    showDocumentRepo() {
        const userType = this.user.type; // 'SME' or 'SUPPLIER'
        const requiredDocs = this.docTypes.filter(doc => doc.requiredFor.includes(userType));

        window.handleCloudUpload = async (docId, fileInput) => {
            const file = fileInput.files[0];
            if (!file) return;

            const btnContainer = fileInput.parentElement;
            btnContainer.innerHTML = '<span class="status pulse" style="background: rgba(59, 130, 246, 0.1); color: var(--primary);">Uploading to Cloud...</span>';

            try {
                // Upload to Storage
                const storageRef = ref(storage, `userData/${this.user.id}/documents/${docId}_${file.name}`);
                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);

                // Save reference link to DB
                await setDoc(doc(db, "user_documents", `${this.user.id}_${docId}`), {
                    uid: this.user.id,
                    docTypeId: docId,
                    url: downloadURL,
                    uploadedAt: new Date().toISOString()
                });

                btnContainer.innerHTML = `<a href="${downloadURL}" target="_blank" class="status" style="background: rgba(16, 185, 129, 0.1); color: var(--accent); text-decoration: none;">View Document</a>`;
            } catch (error) {
                console.error("Upload failed", error);
                btnContainer.innerHTML = '<span class="status pulse" style="background: rgba(220, 38, 38, 0.1); color: #dc2626;">Upload Failed</span>';
            }
        };

        const renderDocs = () => {
            if (requiredDocs.length === 0) {
                return `<p class="subtext">No compliance documents are required currently.</p>`;
            }

            return requiredDocs.map(docType => `
                <div style="background: var(--bg-color); border: 1px solid var(--border); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="display: block; margin-bottom: 0.2rem;">${docType.name}</strong>
                        <span class="subtext" style="font-size: 0.85rem;">${docType.description}</span>
                    </div>
                    <div style="text-align: right;">
                        <input type="file" id="file-${docType.id}" style="display: none;" onchange="window.handleCloudUpload(${docType.id}, this);">
                        <button class="btn btn-primary btn-sm" onclick="document.getElementById('file-${docType.id}').click();">Upload File</button>
                    </div>
                </div>
            `).join('');
        };

        this.setView(`
             <div class="hero-enter" style="max-width: 600px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.showDashboard()">&larr; Back to Dashboard</button>
                
                <h2>Secure Document Vault</h2>
                <p class="subtext" style="margin-bottom: 2rem;">Upload your required compliance documents here. These are stored securely via Fanya Pesa and are shared with Funders structured in your active deals.</p>

                <div class="glass-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                        <h3 style="margin: 0;">Required Documents</h3>
                        <span class="badge" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">Verification Pending</span>
                    </div>

                    ${renderDocs()}
                    
                    <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(59, 130, 246, 0.05); border: 1px dashed var(--primary); border-radius: 8px; text-align: center;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="margin-bottom: 0.5rem;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        <h4 style="margin-bottom: 0.5rem;">Bank-grade Encryption</h4>
                        <p class="subtext" style="font-size: 0.85rem;">Your uploaded files are encrypted at rest using AES-256 and stored securely via Google Cloud Storage.</p>
                    </div>
                </div>
             </div>
        `);
    },

    showNotifications() {
        // Mark all as read when opening
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.renderNavbar(); // Update bell icon

        const renderNotifs = () => {
            if (this.notifications.length === 0) return '<p class="subtext" style="text-align: center; padding: 2rem;">No new notifications</p>';

            return this.notifications.map(n => `
                <div style="padding: 1rem; border-bottom: 1px solid var(--border); display: flex; gap: 1rem; align-items: start;">
                    <div style="background: rgba(59, 130, 246, 0.1); color: var(--primary); border-radius: 50%; padding: 0.5rem; display: flex; align-items: center; justify-content: center;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <div style="flex: 1;">
                        <p style="margin: 0; font-size: 0.95rem; color: var(--text-color);">${n.text}</p>
                        <span class="subtext" style="font-size: 0.8rem; display: block; margin-top: 0.2rem;">${n.time}</span>
                    </div>
                </div>
            `).join('');
        };

        this.setView(`
             <div class="hero-enter" style="max-width: 600px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.showDashboard()">&larr; Back to Dashboard</button>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="margin: 0;">Inbox & Alerts</h2>
                    <button class="btn btn-outline btn-sm" onclick="app.notifications = []; app.saveNotifications(); app.showNotifications();">Clear All</button>
                </div>

                <div class="glass-card" style="padding: 0;">
                    ${renderNotifs()}
                </div>
             </div>
        `);
    },

    showHowItWorks() {
        this.setView(`
            <div class="hero-enter" style="max-width: 800px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.renderHome()">&larr; Home</button>
                <h2>How Fanya Pesa Works</h2>
                <p class="subtext" style="margin-bottom: 2rem;">A seamless ecosystem empowering SMEs, connecting Funders, and managing Verified Suppliers built on escrow security.</p>
                
                <div style="display: grid; gap: 1.5rem; grid-template-columns: 1fr;">
                    <div class="glass-card">
                        <h3 style="color: var(--primary);">1. Apply & Verify</h3>
                        <p class="subtext">SMEs sign up and upload compliance documents (CSD, Tax PIN, etc.) to the secure Document Vault. Verified Suppliers subscribe to access the national database of RFQs.</p>
                    </div>
                    <div class="glass-card">
                        <h3 style="color: var(--accent);">2. Get Matched</h3>
                        <p class="subtext">Funders review verified SMEs within their mandate and structure capital deals. SMEs leverage the platform to request RFQs directly from Verified Suppliers.</p>
                    </div>
                    <div class="glass-card">
                        <h3 style="color: #f59e0b;">3. Milestone Payments & Escrow</h3>
                        <p class="subtext">Capital is locked into Fanya Pesa escrow. Instead of cash hitting the SME's account, Fanya Pesa directly pays the Verified Supplier upon proof of dispatch/waybill upload, neutralizing fund mismanagement.</p>
                    </div>
                </div>
            </div>
        `);
    },

    showFundingCategories() {
        this.setView(`
            <div class="hero-enter" style="max-width: 800px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.renderHome()">&larr; Home</button>
                <h2>Funding Categories</h2>
                <p class="subtext" style="margin-bottom: 2rem;">Explore the capital structures and mandates available on the Fanya Pesa platform.</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                    <div class="glass-card" style="background: var(--bg-color);">
                        <h3>Tender/PO Funding</h3>
                        <p class="subtext">Up to R5M directly injected into Verified Suppliers to fulfill your government/corporate Purchase Orders.</p>
                        <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="app.showAuth('SME')">Apply</button>
                    </div>
                    <div class="glass-card" style="background: var(--bg-color);">
                        <h3>Asset Finance</h3>
                        <p class="subtext">Equipment, machinery, and commercial vehicles structured with favorable asset-backed rates.</p>
                        <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="app.showAuth('SME')">Apply</button>
                    </div>
                    <div class="glass-card" style="background: var(--bg-color);">
                        <h3>Working Capital</h3>
                        <p class="subtext">Short-term bridging finance to manage operational cash flow gaps based on steady historical revenue.</p>
                        <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="app.showAuth('SME')">Apply</button>
                    </div>
                </div>
            </div>
        `);
    },

    showVerifiedSuppliers() {
        this.setView(`
            <div class="hero-enter" style="max-width: 800px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.renderHome()">&larr; Home</button>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h2>National Supplier Database</h2>
                        <p class="subtext">Access our verified ecosystem of suppliers to request instant quotes.</p>
                    </div>
                    <button class="btn btn-primary" onclick="app.showAuth('SUPPLIER')">Join as Supplier</button>
                </div>
                
                <div class="glass-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border);">
                        <div><strong>Tech Innovators (Pty) Ltd</strong> <br><span class="subtext">IT Hardware & Software</span></div>
                        <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--accent); margin: 0;">Verified</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--border);">
                        <div><strong>BuildItRight Construction</strong> <br><span class="subtext">Building Materials & Cement</span></div>
                        <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--accent); margin: 0;">Verified</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;">
                        <div><strong>AgriGrow Solutions</strong> <br><span class="subtext">Farming Equipment</span></div>
                        <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--accent); margin: 0;">Verified</span>
                    </div>
                </div>
            </div>
        `);
    }
};

window.app = app;
document.addEventListener('DOMContentLoaded', () => app.init());
