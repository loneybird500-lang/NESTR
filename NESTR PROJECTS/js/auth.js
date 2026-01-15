// Enhanced Authentication Service with Backend API Integration
console.log('Loading auth.js...');

class AuthService {
    static init() {
        console.log('AuthService initialized');
        this.updateNavigation();
    }

    // Login user
    static async login(email, password) {
        try {
            Utils.showLoading();
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            // Store user and token
            localStorage.setItem('user_token', data.token);
            Utils.setCurrentUser(data.user);
            
            Utils.showNotification('Login successful!', 'success');
            this.updateNavigation();
            return data.user;
        } catch (error) {
            console.error('Login error:', error);
            Utils.showNotification(error.message, 'error');
            return null;
        } finally {
            Utils.hideLoading();
        }
    }

    // Register new user
    static async register(userData) {
        try {
            Utils.showLoading();
            
            // Validate data
            if (!Utils.validateEmail(userData.email)) {
                throw new Error('Please enter a valid email address');
            }

            if (!Utils.validatePhone(userData.phone)) {
                throw new Error('Please enter a valid Nigerian phone number');
            }

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            
            // Store user and token
            localStorage.setItem('user_token', data.token);
            Utils.setCurrentUser(data.user);
            
            Utils.showNotification('Account created successfully!', 'success');
            this.updateNavigation();
            return data.user;
        } catch (error) {
            console.error('Registration error:', error);
            Utils.showNotification(error.message, 'error');
            return null;
        } finally {
            Utils.hideLoading();
        }
    }

    // Logout user
    static logout() {
        try {
            localStorage.removeItem('user_token');
            Utils.removeCurrentUser();
            Utils.showNotification('Logged out successfully', 'info');
            this.updateNavigation();
            if (window.Router) {
                Router.navigate('/');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Update navigation based on auth state
    static updateNavigation() {
        try {
            const navAuth = document.getElementById('navAuth');
            if (!navAuth) {
                console.warn('navAuth element not found');
                return;
            }

            const user = Utils.getCurrentUser();
            
            if (user) {
                navAuth.innerHTML = `
                    <div class="user-menu">
                        <span class="user-greeting">Hello, ${Utils.escapeHtml(user.name)}</span>
                        <div class="dropdown">
                            <button class="dropdown-toggle">
                                👤
                            </button>
                            <div class="dropdown-menu">
                                <a href="#${user.role}" class="dropdown-item">Dashboard</a>
                                <a href="#profile" class="dropdown-item">Profile</a>
                                <button onclick="AuthService.logout()" class="dropdown-item">Logout</button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                navAuth.innerHTML = `
                    <a href="#login" class="nav-link">Login</a>
                    <a href="#signup" class="btn btn-primary">Sign Up</a>
                `;
            }
        } catch (error) {
            console.error('Error updating navigation:', error);
        }
    }
}

// Make AuthService available globally
window.AuthService = AuthService;
console.log('AuthService loaded successfully');