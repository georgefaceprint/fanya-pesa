const STORE_KEY = 'fanya_pesa_user';

const app = {
    user: JSON.parse(localStorage.getItem(STORE_KEY)) || null,
    docTypes: JSON.parse(localStorage.getItem('fanya_pesa_doctypes')) || [
        { id: 1, name: 'CSD Registration Report', description: 'Central Supplier Database summary report', requiredFor: ['SME', 'SUPPLIER'] },
        { id: 2, name: 'Valid Tax Clearance', description: 'SARS Tax Clearance Certificate with PIN', requiredFor: ['SME', 'SUPPLIER'] },
        { id: 3, name: '6 Months Bank Statements', description: 'Recent bank statements for affordability assessment', requiredFor: ['SME'] },
        { id: 4, name: 'Directors ID Copies', description: 'Certified copies of all active directors', requiredFor: ['SME', 'SUPPLIER'] }
    ],
    notifications: JSON.parse(localStorage.getItem('fanya_pesa_notifications')) || [
        { id: 1, text: "Welcome to Fanya Pesa! Complete your profile to get started.", read: false, time: "Just now" },
        { id: 2, text: "New Funders have joined the Construction category.", read: true, time: "2 hours ago" }
    ],

    saveDocTypes() {
        localStorage.setItem('fanya_pesa_doctypes', JSON.stringify(this.docTypes));
    },

    saveNotifications() {
        localStorage.setItem('fanya_pesa_notifications', JSON.stringify(this.notifications));
    },

    init() {
        this.renderNavbar();

        // Handle initial routing based on user state
        if (this.user) {
            this.showDashboard();
        } else {
            this.renderHome();
        }
    },

    // --- State & Auth ---

    login(type = 'SME') {
        // Mock Google login for now
        const mockUser = {
            id: '123' + Math.floor(Math.random() * 1000),
            name: type === 'SME' ? 'My Awesome SME' : type === 'FUNDER' ? 'BlueCape Capital' : type === 'ADMIN' ? 'Platform Admin' : 'AfriTek Solutions',
            email: type === 'ADMIN' ? 'admin@fanyapesa.co.za' : 'user@example.com',
            type: type, // SME, FUNDER, SUPPLIER, or ADMIN
            subscribed: false // For suppliers
        };
        this.user = mockUser;
        localStorage.setItem(STORE_KEY, JSON.stringify(mockUser));
        this.init();
    },

    logout() {
        this.user = null;
        localStorage.removeItem(STORE_KEY);
        this.init();
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
                            <div class="glass-card" style="background: var(--bg-color);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <strong>My Awesome SME (Pty) Ltd</strong>
                                    <span class="status pulse" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">Reviewing Docs</span>
                                </div>
                                <h4>Request: R250,000</h4>
                                <p class="subtext" style="margin-bottom: 1rem;">Category: Tender Execution (IT Hardware)</p>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-secondary" style="flex: 1; padding: 0.5rem; font-size: 0.85rem;" onclick="app.showFunderDocReview()">Review Docs</button>
                                    <button class="btn btn-primary" style="flex: 1; padding: 0.5rem; font-size: 0.85rem;" onclick="app.showFunderOffer()">Structure Deal</button>
                                </div>
                            </div>
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
                                    <h3>Supplier Dashboard</h3>
                                    <p class="subtext">Review requests, submit quotes, and upload waybills to trigger your milestone payments.</p>
                                </div>
                                <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--accent); border-color: rgba(16, 185, 129, 0.2);">Verified Supplier</span>
                            </div>

                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                                <div class="glass-card" style="background: var(--bg-color);">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <strong>50x Dell/HP Laptops</strong>
                                        <span class="status pulse" style="background: rgba(59, 130, 246, 0.1); color: var(--primary);">New RFQ</span>
                                    </div>
                                    <p class="subtext" style="margin-bottom: 1rem;">From: Tech Innovators SME<br>Delivery: Johannesburg</p>
                                    <button class="btn btn-primary" style="width: 100%; padding: 0.5rem;" onclick="app.showSubmitQuote()">View & Submit Quote</button>
                                </div>
                                <div class="glass-card" style="background: var(--bg-color); border: 1px solid var(--accent);">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <strong>Active Contract: 20t Cement</strong>
                                        <span class="status" style="background: rgba(16, 185, 129, 0.1); color: var(--accent);">30% Paid</span>
                                    </div>
                                    <p class="subtext" style="margin-bottom: 1rem;">Next Milestone: Waybill Upload<br>Pending Payout: R85,000</p>
                                    <button class="btn btn-secondary" style="width: 100%; padding: 0.5rem;" onclick="app.showSupplierMilestones()">Upload Waybill</button>
                                </div>
                            </div>
                        </div>
                        `
                ) : ''}

                ${this.user.type === 'ADMIN' ? `
                    <div class="glass-card" style="grid-column: 1 / -1; margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div>
                                <h3>Platform Administration</h3>
                                <p class="subtext">Manage system configurations and compliance requirements.</p>
                            </div>
                            <span class="badge" style="background: rgba(220, 38, 38, 0.1); color: #dc2626; border-color: rgba(220, 38, 38, 0.2);">Super Admin</span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                            <div class="glass-card" style="background: var(--bg-color); cursor: pointer;" onclick="app.showAdminDashboard()">
                                <h4>Compliance Documents</h4>
                                <p class="subtext">Configure required documents for SMEs and Suppliers</p>
                            </div>
                            <div class="glass-card" style="background: var(--bg-color); opacity: 0.7;">
                                <h4>User Management</h4>
                                <p class="subtext">Review platform applicants</p>
                            </div>
                        </div>
                    </div>
                ` : ''}

                </div>
            </div>
        `);
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
                    <form onsubmit="event.preventDefault(); alert('Funding Request Submitted!'); app.showDashboard();">
                        <div class="form-group">
                            <label>Funding Amount (ZAR)</label>
                            <input type="number" class="form-control" placeholder="e.g. 250000" required>
                        </div>
                        <div class="form-group">
                            <label>Funding Category</label>
                            <select class="form-control" required>
                                <option value="">Select Category...</option>
                                <option>Tender Execution (PO Financing)</option>
                                <option>Asset Finance (Equipment/Vehicles)</option>
                                <option>Working Capital / Cash Flow</option>
                                <option>Merchant Cash Advance</option>
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
                    <form onsubmit="event.preventDefault(); alert('Quotation request broadcasted to suppliers!'); app.showDashboard();">
                        <div class="form-group">
                            <label>What do you need?</label>
                            <input type="text" class="form-control" placeholder="e.g. 50 Dell Laptops, or 20 Tons Cement" required>
                        </div>
                        <div class="form-group">
                            <label>Supplier Category</label>
                            <select class="form-control" required>
                                <option value="">Select Category...</option>
                                <option>IT Hardware & Software</option>
                                <option>Construction Materials</option>
                                <option>Office Furniture</option>
                                <option>Cleaning Supplies & PPE</option>
                                <option>Logistics & Transport</option>
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
                            <p class="subtext">30% upfront payment (R45,000) sent directly to AfriTek Solutions by BlueCape Capital.</p>
                            <span style="font-size: 0.8rem; color: var(--accent); font-weight: bold;">Completed on 12/10/2026</span>
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
                    <form id="funderDealForm" onsubmit="event.preventDefault(); app.generateContract();">
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
                            <label>Link to Verified Supplier</label>
                            <select class="form-control" id="dealSupplier" required>
                                <option value="AfriTek Solutions (SA-9281)">AfriTek Solutions (SA-9281) - R250,000 Quote Selected by SME</option>
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

    generateContract() {
        // Collect mock data from form
        const principal = document.getElementById('dealPrincipal').value || 250000;
        const interest = document.getElementById('dealInterest').value || 12.5;
        const fees = document.getElementById('dealFees').value || 4500;
        const term = document.getElementById('dealTerm').value || "Net 30 Days";
        const supplier = document.getElementById('dealSupplier').value || "AfriTek Solutions";

        // Calculate total 
        const total = parseFloat(principal) + (parseFloat(principal) * (parseFloat(interest) / 100)) + parseFloat(fees);

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
                        The Funder agrees to deploy the Principal Facility directly to the Designated Supplier (${supplier}) across platform-managed milestones (30% Upfront, 40% Waybill, 30% Delivery). The SME cedes all rights to the initial tender invoice payout to the Funder until the Total Repayment Due is settled in full.
                    </p>

                    <div style="background: rgba(59, 130, 246, 0.05); padding: 1.5rem; text-align: center; border: 1px dashed var(--primary);">
                        <p style="font-weight: 500; margin-bottom: 1rem; color: var(--primary);">Currently Pending SME Electronic Signature</p>
                        <button class="btn btn-outline" disabled style="background: white;">Awaiting SME Acceptance</button>
                    </div>

                </div>
             </div>
        `);
    },

    showSubmitQuote() {
        this.setView(`
             <div class="hero-enter" style="max-width: 600px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.showDashboard()">&larr; Back</button>
                
                <span class="badge" style="background: rgba(59, 130, 246, 0.1); color: var(--primary); border-color: rgba(59, 130, 246, 0.2);">Quote Request</span>
                <h2 style="margin-top: 0.5rem;">50x Dell/HP Laptops</h2>
                <p class="subtext" style="margin-bottom: 2rem;">Requested by Tech Innovators SME. Delivery to Johannesburg. Need minimum i5, 8GB RAM, 256GB SSD.</p>

                <div class="glass-card">
                    <form onsubmit="event.preventDefault(); alert('Quotation securely submitted to SME!'); app.showDashboard();">
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
                            <input type="file" class="form-control" style="padding: 0.5rem;" accept=".pdf" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-large" style="width: 100%; margin-top: 1rem;">
                            Submit Formal Quote
                        </button>
                    </form>
                </div>
             </div>
        `);
    },

    showSupplierMilestones() {
        this.setView(`
             <div class="hero-enter" style="max-width: 600px; margin: 2rem auto;">
                <button class="btn btn-secondary" style="margin-bottom: 2rem;" onclick="app.showDashboard()">&larr; Back to Dashboard</button>
                
                <h2>Active Payout: 20t Cement</h2>
                <p class="subtext" style="margin-bottom: 2rem;">Upload your proof of dispatch to unlock the next 40% milestone payment directly from the Funder's escrow layer.</p>

                <div class="glass-card">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem;">
                        <div>
                            <h3 style="margin: 0;">Supply of 20T Portland Cement</h3>
                            <p class="subtext">SME: BuildItRight Construction</p>
                            <p class="subtext">Funder: BlueCape Capital</p>
                        </div>
                        <span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--accent);">30% Upfront Paid</span>
                    </div>

                    <div style="position: relative; padding-left: 1.5rem; margin-top: 1.5rem;">
                        <div style="position: absolute; left: 6px; top: 8px; bottom: 8px; width: 2px; background: var(--secondary); z-index: 1;"></div>
                        
                        <div style="position: relative; margin-bottom: 2rem; z-index: 2;">
                            <div style="position: absolute; left: -24px; top: 4px; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); border: 2px solid var(--bg-color);"></div>
                            <h4 style="margin: 0;">Milestone 1: Deposit (Completed)</h4>
                            <p class="subtext">30% upfront payment (R35,000) received from BlueCape Capital.</p>
                        </div>

                        <div style="position: relative; margin-bottom: 2rem; z-index: 2;">
                            <div style="position: absolute; left: -24px; top: 4px; width: 14px; height: 14px; border-radius: 50%; background: var(--primary); border: 2px solid var(--bg-color); box-shadow: 0 0 0 4px rgba(59,130,246,0.2);"></div>
                            <h4 style="margin: 0;">Milestone 2: Dispatch Confirmation (Current)</h4>
                            <p class="subtext">Upload proof of dispatch/waybill to request the next 40% chunk (R46,600).</p>
                            <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-color); border-radius: 8px; border: 1px dashed var(--border);">
                                <input type="file" class="form-control" style="padding: 0.5rem; margin-bottom: 0.5rem;" accept=".pdf,.jpg,.png">
                                <button class="btn btn-primary btn-sm" onclick="alert('Waybill uploaded! Next payout initiated.'); app.showDashboard();">Upload Waybill</button>
                            </div>
                        </div>

                        <div style="position: relative; z-index: 2;">
                            <div style="position: absolute; left: -24px; top: 4px; width: 14px; height: 14px; border-radius: 50%; background: var(--secondary-hover); border: 2px solid var(--bg-color);"></div>
                            <h4 style="margin: 0;">Milestone 3: Final Delivery</h4>
                            <p class="subtext">Remaining 30% retention to be paid upon final delivery sign-off by SME.</p>
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

    showDocumentRepo() {
        const userType = this.user.type; // 'SME' or 'SUPPLIER'
        const requiredDocs = this.docTypes.filter(doc => doc.requiredFor.includes(userType));

        const renderMockDocs = () => {
            if (requiredDocs.length === 0) {
                return `<p class="subtext">No compliance documents are required currently.</p>`;
            }

            return requiredDocs.map(doc => `
                <div style="background: var(--bg-color); border: 1px solid var(--border); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="display: block; margin-bottom: 0.2rem;">${doc.name}</strong>
                        <span class="subtext" style="font-size: 0.85rem;">${doc.description}</span>
                    </div>
                    <div style="text-align: right;">
                        <input type="file" id="file-${doc.id}" style="display: none;" onchange="alert('Simulated Upload: ' + this.files[0].name + ' uploaded successfully.'); this.parentElement.innerHTML = '<span class=\\'status pulse\\' style=\\'background: rgba(16, 185, 129, 0.1); color: var(--accent);\\'>Uploaded / Pending Verification</span>';">
                        <button class="btn btn-primary btn-sm" onclick="document.getElementById('file-${doc.id}').click();">Upload File</button>
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

                    ${renderMockDocs()}
                    
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
