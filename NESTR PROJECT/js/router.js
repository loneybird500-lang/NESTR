// Debug Router with Error Handling
console.log('Loading router.js...');

class Router {
    static currentPage = 'home';

    // Initialize router
    static init() {
        console.log('Router initializing...');
        
        try {
            // Handle hash changes
            window.addEventListener('hashchange', this.handleRoute.bind(this));
            
            // Handle initial load
            this.handleRoute();
            
            console.log('Router initialized successfully');
        } catch (error) {
            console.error('Router initialization error:', error);
        }
    }

    // Handle route changes
    static handleRoute() {
        try {
            const hash = window.location.hash.substring(1) || 'home';
            const [page] = hash.split('/');
            
            console.log('Navigating to:', page);
            this.currentPage = page;
            
            this.renderPage(page);
            this.updateNavigation();
            
            if (window.AuthService) {
                AuthService.updateNavigation();
            }
        } catch (error) {
            console.error('Route handling error:', error);
            this.renderErrorPage();
        }
    }

    // Navigate to specific page
    static navigate(path) {
        try {
            console.log('Navigating to path:', path);
            window.location.hash = path;
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }

    // Update navigation active states
    static updateNavigation() {
        try {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === `#${this.currentPage}`) {
                    link.classList.add('active');
                }
            });
        } catch (error) {
            console.error('Navigation update error:', error);
        }
    }

    // Render page based on route
    static renderPage(page) {
        try {
            const mainContent = document.getElementById('main-content');
            if (!mainContent) {
                console.error('Main content element not found');
                return;
            }

            Utils.showLoading();

            switch (page) {
                case 'home':
                    this.renderHomePage();
                    break;
                case 'listings':
                    this.renderListingsPage();
                    break;
                case 'login':
                    this.renderLoginPage();
                    break;
                case 'signup':
                    this.renderSignupPage();
                    break;
                case 'tenant':
                    this.renderTenantDashboard();
                    break;
                case 'landlord':
                    this.renderLandlordDashboard();
                    break;
                case 'property':
                    this.renderPropertyDetail();
                    break;
                default:
                    this.renderHomePage();
            }

            Utils.hideLoading();
        } catch (error) {
            console.error('Page rendering error:', error);
            this.renderErrorPage();
        }
    }

    // Render Home Page
    static async renderHomePage() {
        try {
            const mainContent = document.getElementById('main-content');
            const properties = await PropertyService.getProperties();
            const featuredProps = properties.slice(0, 3);
            
            mainContent.innerHTML = `
                <!-- Hero Section -->
                <section class="hero">
                    <div class="hero-content">
                        <h1>Find Your Perfect  Home in Nigeria</h1>
                        <p>Safe, affordable housing  across Nigeria. Connect directly with verified landlords.</p>
                        <div class="hero-actions">
                            <button class="btn btn-primary btn-large" onclick="Router.navigate('listings')">
                                Browse Properties
                            </button>
                            <button class="btn btn-secondary btn-large" onclick="Router.navigate('signup')">
                                List Your Property
                            </button>
                        </div>
                    </div>
                    <div class="hero-image">
                        <div class="placeholder-image"><img class="placeholder-image" src="uuo.png" alt=""></div>
                    </div>
                </section>

                <!-- Features Section -->
                <section class="features">
                    <div class="container">
                        <h2>Why Choose NESTR?</h2>
                        <div class="features-grid">
                            <div class="feature-card">
                                <div class="feature-icon"><a href="#"><img class="img-icons" src="000.png" alt="listing-icon"></a></div>
                                <h3>Student-Focused</h3>
                                <p>Properties specifically for students near major universities</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon"><a href="#"><img class="img-icons" src="00k.png" alt="listing-icon"></a></div>
                                <h3>Safe & Verified</h3>
                                <p>Direct contact with verified landlords, no agents</p>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon"><a href="#"><img class="img-icons" src="222.png" alt="listing-icon"></a></div>
                                <h3>Budget-Friendly</h3>
                                <p>Affordable options for every student budget</p>
                            </div>
                        </div>
                    </div>
                </section>
                
<section id="analytics" class="section">
  <h2>Our Performance</h2>
  <p>We continue to improve our platform with transparency and real results. Here are a few statistics based on our service performance and user feedback.</p>

  <div class="analytics-container">
    <div class="circle-box">
      <svg class="progress" width="160" height="160">
        <circle cx="80" cy="80" r="70" stroke="#142c44" stroke-width="18" fill="none" />
        <circle cx="80" cy="80" r="70" stroke="#00d4ff" stroke-width="18" fill="none" stroke-dasharray="439" stroke-dashoffset="88" />
      </svg>
      <h3>80% Satisfaction</h3>
      <p>Tenant Success Rate</p>
    </div>

    <div class="circle-box">
      <svg class="progress" width="160" height="160">
        <circle cx="80" cy="80" r="70" stroke="#142c44" stroke-width="18" fill="none" />
        <circle cx="80" cy="80" r="70" stroke="#00ff85" stroke-width="18" fill="none" stroke-dasharray="439" stroke-dashoffset="66" />
      </svg>
      <h3>85% Verified</h3>
      <p>Trusted Listings</p>
    </div>

    <div class="circle-box">
      <svg class="progress" width="160" height="160">
        <circle cx="80" cy="80" r="70" stroke="#142c44" stroke-width="18" fill="none" />
        <circle cx="80" cy="80" r="70" stroke="#ffd000" stroke-width="18" fill="none" stroke-dasharray="439" stroke-dashoffset="110" />
      </svg>
      <h3>75% Faster</h3>
      <p>Communication Speed</p>
    </div>
  </div>
</section>

<section class="section">
  <h2>Why Choose Nestr?</h2>
  <p>We make renting stress-free. No more long searches, hidden fees, or fake listings. Nestr provides verified landlords, secure bookings, easy communication, and transparent pricing.</p>

  <div class="goals">
    <div class="goal-box">
    <a href="#"><img class="img-icons" src="2.png" alt="listing-icon"></a>
      <h3>Verified Listings</h3>
      <p>All properties are checked to ensure authenticity and safety.</p>
    </div>
    <div class="goal-box">
        <a href="#"><img class="img-icons" src="5.png" alt="listing-icon"></a>
      <h3>Secure Payments</h3>
      <p>Pay rent confidently with our protected transaction system.</p>
    </div>
    <div class="goal-box">
        <a href="#"><img class="img-icons" src="333.png" alt="listing-icon"></a>
      <h3>Fast Communication</h3>
      <p>Reach landlords immediately and get real-time updates.</p>
    </div>
  </div>
</section>
</section>

<section id="types" class="section">
  <h2>Homes You Can Find on Nestr</h2>
  <p>From luxury apartments to affordable student lodges, Nestr gives you access to verified real estate options with images, pricing and location details set clearly.</p>
  <div class="home-types">
    <div class="home-card"><div class="img"></div><a href="#"><img class="img-icons" src="99.png" alt="listing-icon"></a>
<h3>Luxury Apartments</h3><p>Comfortable spaces in top Nigerian cities with modern amenities.</p></div>
    <div class="home-card"><div class="img"><a href="#"><img class="img-icons" src="3.png" alt="listing-icon"></a>
</div><h3>Shared Rooms</h3><p>Budget-friendly shared homes for students and young earners.</p></div>
    <div class="home-card"><div class="img"></div><a href="#"><img class="img-icons" src="9.png" alt="listing-icon"></a>
<h3>Family Houses</h3><p>Spacious homes for families, fully documented and verified.</p></div>
  </div>
</section>

<section id="how" class="section">
  <h2 >How Nestr Works</h2>
  <div class="steps">
    <div class="step-box"><a href="#"><img class="img-icons" src="4.png" alt="listing-icon"></a>
<h3>1. Explore Homes</h3><p>Browse verified listings with trusted reviews, clear prices and real photos.</p></div>
    <div class="step-box">    <a href="#"><img class="img-icons" src="001.png" alt="listing-icon"></a>
<h3>2. Contact Landlord</h3><p>Use secure messaging to ask questions, negotiate or arrange inspection.</p></div>
    <div class="step-box">    <a href="#"><img class="img-icons" src="8.png" alt="listing-icon"></a>
<h3>3. Book Securely</h3><p>Pay securely and receive instant confirmation & digital receipt.</p></div>
    <div class="step-box">    <a href="#"><img class="img-icons" src="0.png" alt="listing-icon"></a>
<h3>4. Move In Easily</h3><p>Receive support and updates every step of the way.</p></div>
  </div>
</section>


<section id="cta-big" class="section">
  <h2>Start Your Journey Today</h2>
  <p>Join thousands of Nigerians who use Nestr to find trusted accommodation every month.</p>

</section>


                <!-- Demo Section -->
                <section class="cta">
                    <div class="container">
                        <h2>Get Started Instantly</h2>
                        <p>Use our demo accounts to explore the platform</p>
                        <div class="demo-accounts" style="background: var(--glass); padding: 2rem; border-radius: var(--radius); margin: 2rem 0;">
                            <h3>Demo Accounts</h3>
                            <p><strong>Student:</strong> student@demo.com / demo123</p>
                            <p><strong>Landlord:</strong> landlord@demo.com / demo123</p>
                            <button class="btn btn-primary" onclick="Router.navigate('login')">
                                Try Demo Login
                            </button>
                        </div>
                    </div>
                </section>
            `;
            
            console.log('Home page rendered successfully');
        } catch (error) {
            console.error('Home page rendering error:', error);
            throw error;
        }
    }

    // Render Login Page
    static renderLoginPage() {
        try {
            const mainContent = document.getElementById('main-content');
            
            mainContent.innerHTML = `
                <div class="auth-container">
                    <div class="auth-card">
                        <div class="auth-header">
                            <h1>Welcome Back</h1>
                            <p>Sign in to your account</p>
                        </div>
                        
                        <form id="loginForm">
                            <div class="form-group">
                                <label for="loginEmail">Email Address</label>
                                <input 
                                    type="email" 
                                    id="loginEmail" 
                                    required 
                                    placeholder="your@email.com"
                                    value="student@demo.com"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="loginPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="loginPassword" 
                                    required 
                                    placeholder="Your password"
                                    value="demo123"
                                >
                            </div>
                            
                            <button type="button" class="btn btn-primary btn-full" onclick="handleLogin()">
                                Sign In
                            </button>
                        </form>
                        
                        <div class="auth-footer">
                            <p>Don't have an account? 
                                <a href="#signup" onclick="Router.navigate('signup')">Sign up here</a>
                            </p>
                        </div>
                    </div>
                </div>
            `;
            
            console.log('Login page rendered successfully');
        } catch (error) {
            console.error('Login page rendering error:', error);
            throw error;
        }
    }

    // Render Signup Page
    static renderSignupPage() {
        try {
            const mainContent = document.getElementById('main-content');
            
            mainContent.innerHTML = `
                <div class="auth-container">
                    <div class="auth-card">
                        <div class="auth-header">
                            <h1>Create Account</h1>
                            <p>Join StudentRent today</p>
                        </div>
                        
                        <form id="signupForm">
                            <div class="form-group">
                                <label for="signupName">Full Name</label>
                                <input 
                                    type="text" 
                                    id="signupName" 
                                    required 
                                    placeholder="Your full name"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="signupEmail">Email Address</label>
                                <input 
                                    type="email" 
                                    id="signupEmail" 
                                    required 
                                    placeholder="your@email.com"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="signupPhone">Phone Number</label>
                                <input 
                                    type="tel" 
                                    id="signupPhone" 
                                    required 
                                    placeholder="+2348012345678"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="signupPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="signupPassword" 
                                    required 
                                    placeholder="Create a password"
                                >
                            </div>
                            
                            <div class="form-group">
                                <select id="signupRole" required>
                                    <option value="">Select Role</option>
                                    <option value="tenant">TENANT</option>
                                    <option value="landlord">LANDLORD</option>
                                </select>
                            </div>
                            
                            <button type="button" class="btn btn-primary btn-full" onclick="handleSignup()">
                                Create Account
                            </button>
                        </form>
                        
                        <div class="auth-footer">
                            <p>Already have an account? 
                                <a href="#login" onclick="Router.navigate('login')">Sign in here</a>
                            </p>
                        </div>
                    </div>
                </div>
            `;
            
            console.log('Signup page rendered successfully');
        } catch (error) {
            console.error('Signup page rendering error:', error);
            throw error;
        }
    }

    // Render Tenant Dashboard
    static renderTenantDashboard() {
        try {
            if (!Utils.isAuthenticated() || !Utils.isTenant()) {
                this.navigate('login');
                return;
            }

            const mainContent = document.getElementById('main-content');
            const user = Utils.getCurrentUser();
            
            mainContent.innerHTML = `
                <div class="container">
                    <div class="dashboard-header">
                        <h1>Student Dashboard</h1>
                        <p>Welcome back, ${Utils.escapeHtml(user.name)}</p>
                    </div>
                    
                    <div class="dashboard-grid">
                        <div class="dashboard-section">
                            <h2>Quick Actions</h2>
                            <div class="quick-actions">
                                <button class="btn btn-primary" onclick="Router.navigate('listings')">
                                    Browse Properties
                                </button>
                                <button class="btn btn-secondary" onclick="Utils.showNotification('Feature coming soon!', 'info')">
                                    View Saved Properties
                                </button>
                            </div>
                        </div>
                        
                        <div class="dashboard-section">
                            <h2>Your Activity</h2>
                            <div class="activity-stats">
                                <div class="stat-item">
                                    <span class="stat-number">0</span>
                                    <span class="stat-label">Properties Viewed</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">0</span>
                                    <span class="stat-label">Properties Liked</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">0</span>
                                    <span class="stat-label">Contacts Made</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            console.log('Tenant dashboard rendered successfully');
        } catch (error) {
            console.error('Tenant dashboard rendering error:', error);
            throw error;
        }
    }

    // Render Landlord Dashboard
    static renderLandlordDashboard() {
        try {
            if (!Utils.isAuthenticated() || !Utils.isLandlord()) {
                this.navigate('login');
                return;
            }

            const mainContent = document.getElementById('main-content');
            const user = Utils.getCurrentUser();
            
            mainContent.innerHTML = `
                <div class="container">
                    <div class="dashboard-header">
                        <h1>Landlord Dashboard</h1>
                        <p>Welcome back, ${Utils.escapeHtml(user.name)}</p>
                    </div>
                    
                    <div class="dashboard-grid">
                        <div class="dashboard-section">
                            <h2>Property Management</h2>
                            <div class="quick-actions">
                                <button class="btn btn-primary" onclick="showAddPropertyModal()">
                                    Add New Property
                                </button>
                                <button class="btn btn-secondary" onclick="Router.navigate('listings')">
                                    View All Properties
                                </button>
                            </div>
                        </div>
                        
                        <div class="dashboard-section">
                            <h2>Quick Stats</h2>
                            <div class="activity-stats">
                                <div class="stat-item">
                                    <span class="stat-number">0</span>
                                    <span class="stat-label">Properties Listed</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">0</span>
                                    <span class="stat-label">Total Views</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">0</span>
                                    <span class="stat-label">Inquiries</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="addPropertyModal" class="modal" style="display: none;">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h2>Add New Property</h2>
                                <button class="close-btn" onclick="closeAddPropertyModal()">&times;</button>
                            </div>
                            
                            <form id="addPropertyForm" onsubmit="handleAddProperty(event); return false;">
                                <div class="form-group">
                                    <label for="propTitle">Property Title</label>
                                    <input type="text" id="propTitle" required placeholder="e.g., Spacious 2-Bedroom Apartment">
                                </div>
                                
                                <div class="form-group">
                                    <label for="propDescription">Description</label>
                                    <textarea id="propDescription" required placeholder="Describe the property..."></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label for="propPrice">Monthly Price (₦)</label>
                                    <input type="number" id="propPrice" required placeholder="180000">
                                </div>
                                
                                <div class="form-group">
                                    <label for="propType">Property Type</label>
                                    <select id="propType" required>
                                        <option value="">Select Type</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="house">House</option>
                                        <option value="shared">Shared Room</option>
                                        <option value="studio">Studio</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="propBedrooms">Bedrooms</label>
                                    <input type="number" id="propBedrooms" required placeholder="2">
                                </div>
                                
                                <div class="form-group">
                                    <label for="propBathrooms">Bathrooms</label>
                                    <input type="number" id="propBathrooms" required placeholder="1">
                                </div>
                                
                                <div class="form-group">
                                    <label for="propState">State</label>
                                    <input type="text" id="propState" required placeholder="e.g., Edo">
                                </div>
                                
                                <div class="form-group">
                                    <label for="propCity">City</label>
                                    <input type="text" id="propCity" required placeholder="e.g., Benin City">
                                </div>
                                
                                <div class="form-group">
                                    <label for="propArea">Area</label>
                                    <input type="text" id="propArea" required placeholder="e.g., Ugbowo">
                                </div>
                                
                                <div class="form-group">
                                    <label for="propAddress">Address</label>
                                    <input type="text" id="propAddress" required placeholder="Full address">
                                </div>
                                
                                <div class="form-group">
                                    <label for="propContact">Contact Phone</label>
                                    <input type="tel" id="propContact" required placeholder="+2348012345678">
                                </div>
                                
                                <div class="form-group">
                                    <label for="propImages">Upload Images</label>
                                    <input type="file" id="propImages" multiple accept="image/*" onchange="handleImageUpload(event)">
                                    <div id="imagePreview" style="margin-top: 1rem; display: flex; gap: 1rem; flex-wrap: wrap;"></div>
                                </div>
                                
                                <button type="submit" class="btn btn-primary btn-full">Create Property</button>
                            </form>
                        </div>
                    </div>
                </div>
                
                <style>
                    .modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                    }
                    
                    .modal-content {
                        background: white;
                        padding: 2rem;
                        border-radius: 8px;
                        max-width: 600px;
                        width: 90%;
                        max-height: 90vh;
                        overflow-y: auto;
                    }

                    /* Ensure form inputs in modal are readable */
                    .modal-content input,
                    .modal-content textarea,
                    .modal-content select {
                        color: #222;
                        background: #fff;
                        border: 1px solid rgba(0,0,0,0.08);
                        padding: 0.5rem;
                        border-radius: 4px;
                    }
                    .modal-content textarea { min-height: 100px; }
                    
                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1.5rem;
                    }
                    
                    .close-btn {
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                    }
                </style>
            `;
            
            console.log('Landlord dashboard rendered successfully');
        } catch (error) {
            console.error('Landlord dashboard rendering error:', error);
            throw error;
        }
    }

    // Render Listings Page
    static async renderListingsPage() {
        try {
            const mainContent = document.getElementById('main-content');
            
            mainContent.innerHTML = `
                <div class="container">
                    <div class="page-header">
                        <h1>Browse Properties</h1>
                        <p>Find your perfect student accommodation</p>
                    </div>

                    <div class="search-filters">
                        <div class="search-box">
                            <input type="text" id="searchInput" placeholder="Search by location, property type..." class="search-input">
                            <button class="btn btn-primary" onclick="searchProperties()">Search</button>
                        </div>
                    </div>

                    <div class="properties-section">
                        <div class="properties-header">
                            <h3 id="properties-count">Loading properties...</h3>
                        </div>
                        
                        <div class="properties-grid" id="properties-grid">
                            <div class="loading-spinner">Loading properties...</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Load properties from backend
            const properties = await PropertyService.getProperties();
            const grid = document.getElementById('properties-grid');
            const count = document.getElementById('properties-count');
            
            count.textContent = `${properties.length} Properties Found`;
            grid.innerHTML = this.renderPropertiesGrid(properties);
            
            this.attachSearchHandlers();
            console.log('Listings page rendered successfully');
        } catch (error) {
            console.error('Listings page rendering error:', error);
            throw error;
        }
    }

    // Helper method to render properties grid
    static renderPropertiesGrid(properties) {
        try {
            if (!properties || properties.length === 0) {
                return `
                    <div class="empty-state">
                        <div class="empty-icon">🏠</div>
                        <h3>No properties found</h3>
                        <p>Try adjusting your search filters</p>
                    </div>
                `;
            }

            return properties.map(property => {
                const imageUrl = property.images && property.images.length > 0 
                    ? `/nestr%20images/${encodeURIComponent(property.images[0])}`
                    : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2240%22%3E🏠%3C/text%3E%3C/svg%3E';
                
                return `
                <div class="property-card">
                    <div class="property-image">
                        <img src="${imageUrl}" alt="${Utils.escapeHtml(property.title)}" style="width:100%; height:200px; object-fit:cover; border-radius:8px 8px 0 0;">
                        <div class="property-badge">${Utils.formatPrice(property.price)}/month</div>
                    </div>
                    <div class="property-content">
                        <h3 class="property-title">${Utils.escapeHtml(property.title)}</h3>
                        <p class="property-location">
                            📍 ${Utils.escapeHtml(property.area)}, ${Utils.escapeHtml(property.city)}
                        </p>
                        <div class="property-features">
                            <span>🛏️ ${property.bedrooms} bed</span>
                            <span>🚿 ${property.bathrooms} bath</span>
                            <span>${property.type}</span>
                        </div>
                        <div class="property-actions">
                            <button class="btn-like" onclick="event.stopPropagation(); likeProperty(${property.id})">
                                ❤️ ${property.likes?.length || 0}
                            </button>
                            <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); viewProperty(${property.id})">
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            `}).join('');
        } catch (error) {
            console.error('Properties grid rendering error:', error);
            return '<div class="error">Error loading properties</div>';
        }
    }

    // Attach search handlers
    static attachSearchHandlers() {
        try {
            window.searchProperties = Utils.debounce(function() {
                const searchInput = document.getElementById('searchInput');
                const searchTerm = searchInput ? searchInput.value : '';
                
                Utils.showNotification(`Searching for: ${searchTerm}`, 'info');
            }, 300);

            // Do not overwrite existing global like/view handlers if provided
            if (!window.likeProperty) {
                window.likeProperty = async function(propertyId) {
                    if (!Utils.isAuthenticated()) {
                        Router.navigate('login');
                        return;
                    }
                    try {
                        await PropertyService.likeProperty(propertyId);
                        // Re-render listings to show updated like counts
                        Router.renderListingsPage();
                    } catch (err) {
                        console.error('Like action failed', err);
                        Utils.showNotification('Failed to like property', 'error');
                    }
                };
            }

            if (!window.viewProperty) {
                window.viewProperty = function(propertyId) {
                    Router.navigate(`property/${propertyId}`);
                };
            }
        } catch (error) {
            console.error('Search handlers attachment error:', error);
        }
    }

    // Render individual property detail page
    static async renderPropertyDetail() {
        try {
            const mainContent = document.getElementById('main-content');
            const hash = window.location.hash.substring(1) || '';
            const parts = hash.split('/');
            const id = parts[1];
            if (!id) {
                this.navigate('listings');
                return;
            }

            Utils.showLoading();
            const property = await PropertyService.getPropertyById(id);
            if (!property) {
                mainContent.innerHTML = '<div class="container"><h3>Property not found</h3></div>';
                Utils.hideLoading();
                return;
            }

            const imagesHtml = (property.images || []).map(img => {
                const url = `/nestr%20images/${encodeURIComponent(img)}`;
                return `<img src="${url}" style="max-width:100%; border-radius:8px; margin-bottom:8px;">`;
            }).join('');

            mainContent.innerHTML = `
                <div class="container">
                    <div class="property-detail">
                        <h1>${Utils.escapeHtml(property.title)}</h1>
                        <div class="property-media">${imagesHtml}</div>
                        <div class="property-meta">
                            <p><strong>Price:</strong> ${Utils.formatPrice(property.price)}/month</p>
                            <p><strong>Location:</strong> ${Utils.escapeHtml(property.area)}, ${Utils.escapeHtml(property.city)}</p>
                            <p><strong>Bedrooms:</strong> ${property.bedrooms} · <strong>Bathrooms:</strong> ${property.bathrooms}</p>
                            <p>${Utils.escapeHtml(property.description)}</p>
                            <p><strong>Listed by:</strong> ${Utils.escapeHtml(property.landlord_name || 'Landlord')}</p>
                            <p><strong>Contact:</strong> <a href="tel:${Utils.escapeHtml(property.contact || '')}">${Utils.escapeHtml(property.contact || 'Not provided')}</a></p>
                            <div style="margin-top:1rem; display:flex; gap:1rem; align-items:center;">
                                <button class="btn btn-primary" onclick="viewProperty(${property.id})">Refresh</button>
                                <button class="btn btn-secondary" onclick="likeProperty(${property.id})">❤️ ${property.likes?.length || 0}</button>
                                <button class="btn" onclick="Router.navigate('listings')">⬅ Back</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            Utils.hideLoading();
        } catch (error) {
            console.error('Property detail render error:', error);
            this.renderErrorPage();
        }
    }

    // Render error page
    static renderErrorPage() {
        try {
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="container">
                        <div class="error-page">
                            <h1>😕 Something went wrong</h1>
                            <p>We're having trouble loading the page. Please try refreshing.</p>
                            <button class="btn btn-primary" onclick="window.location.reload()">
                                Refresh Page
                            </button>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error page rendering error:', error);
        }
    }
}

// Make Router available globally
window.Router = Router;
console.log('Router loaded successfully');
 