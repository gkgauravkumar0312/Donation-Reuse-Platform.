// Authentication management for Donation & Reuse Platform
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.initializeAuth();
    }

    // Initialize authentication on page load
    initializeAuth() {
        const sessionUser = sessionStorage.getItem('currentUser');
        if (sessionUser) {
            this.currentUser = JSON.parse(sessionUser);
        }
        
        // Check if current page requires authentication
        this.checkPageAccess();
    }

    // Check if page requires authentication and redirect if needed
    checkPageAccess() {
        const currentPage = window.location.pathname;
        const publicPages = ['/index.html', '/login.html', '/register.html'];
        const isPublicPage = publicPages.some(page => currentPage.includes(page)) || currentPage.endsWith('/');
        
        if (!isPublicPage && !this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Check role-based access
        if (this.currentUser) {
            this.checkRoleAccess(currentPage);
        }

        // Update UI with user info
        this.updateUserUI();
    }

    // Check role-based page access
    checkRoleAccess(currentPage) {
        const role = this.currentUser.role;
        
        // Define page access rules
        const pageAccess = {
            'donor': ['donor/'],
            'ngo': ['ngo/'],
            'admin': ['admin/']
        };

        // Check if user has access to current page
        for (const [userRole, paths] of Object.entries(pageAccess)) {
            if (role === userRole) {
                const hasAccess = paths.some(path => currentPage.includes(path));
                if (!hasAccess && currentPage !== '/index.html' && currentPage !== '/login.html' && currentPage !== '/register.html') {
                    // Redirect to appropriate dashboard
                    this.redirectToDashboard();
                    return;
                }
            } else {
                // Check if user is trying to access another role's pages
                const hasUnauthorizedAccess = paths.some(path => currentPage.includes(path));
                if (hasUnauthorizedAccess) {
                    this.redirectToDashboard();
                    return;
                }
            }
        }
    }

    // Redirect user to their dashboard
    redirectToDashboard() {
        const role = this.currentUser.role;
        const dashboards = {
            'donor': 'donor/donor-dashboard.html',
            'ngo': 'ngo/ngo-dashboard.html',
            'admin': 'admin/admin-dashboard.html'
        };
        
        window.location.href = dashboards[role] || 'index.html';
    }

    // Update UI with current user information
    updateUserUI() {
        const userNameElements = document.querySelectorAll('#userName');
        userNameElements.forEach(element => {
            if (this.currentUser) {
                element.textContent = this.currentUser.name || this.currentUser.email;
            } else {
                element.textContent = '';
            }
        });
    }

    // Login user
    login(email, password, role) {
        const user = storage.getUserByEmail(email);
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Invalid password' };
        }

        if (user.role !== role) {
            return { success: false, message: 'Role mismatch' };
        }

        // Check NGO verification
        if (user.role === 'ngo' && !user.verified) {
            return { success: false, message: 'NGO account not verified by admin' };
        }

        // Set current user
        this.currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));

        return { success: true, user: user };
    }

    // Register new user
    register(userData) {
        const { name, email, password, role, organizationName, organizationAddress, organizationPhone } = userData;

        // Check if user already exists
        const existingUser = storage.getUserByEmail(email);
        if (existingUser) {
            return { success: false, message: 'Email already registered' };
        }

        // Validate password
        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        // Prepare user data
        const newUser = {
            name,
            email,
            password,
            role,
            verified: role === 'donor' || role === 'admin' // NGOs need verification
        };

        // Add NGO specific fields if applicable
        if (role === 'ngo') {
            newUser.organizationName = organizationName;
            newUser.organizationAddress = organizationAddress;
            newUser.organizationPhone = organizationPhone;
        }

        // Save user
        const createdUser = storage.addUser(newUser);

        return { success: true, user: createdUser };
    }

    // Logout user
    logout() {
        // Confirm logout
        if (confirm('Are you sure you want to logout?')) {
            this.currentUser = null;
            sessionStorage.removeItem('currentUser');
            
            // Get current path to determine correct login page location
            const currentPath = window.location.pathname;
            
            if (currentPath.includes('/donor/') || currentPath.includes('/ngo/') || currentPath.includes('/admin/')) {
                // We're in a subdirectory, go up one level
                window.location.href = '../login.html';
            } else {
                // We're in root directory
                window.location.href = 'login.html';
            }
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    // Protect routes (call this on protected pages)
    protectRoute(requiredRole = null) {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }

        if (requiredRole && !this.hasRole(requiredRole)) {
            this.redirectToDashboard();
            return false;
        }

        return true;
    }
}

// Global auth instance
const auth = new AuthManager();

// Handle login form submission
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const errorElement = document.getElementById('error-message');
        
        // Clear previous messages
        errorElement.textContent = '';
        
        // Validate inputs
        if (!email || !password || !role) {
            errorElement.textContent = 'Please fill in all fields';
            return;
        }
        
        // Attempt login
        const result = auth.login(email, password, role);
        
        if (result.success) {
            // Redirect to appropriate dashboard
            auth.redirectToDashboard();
        } else {
            errorElement.textContent = result.message;
        }
    });
}

// Handle registration form submission
if (document.getElementById('registerForm')) {
    const roleSelect = document.getElementById('role');
    const ngoFields = document.getElementById('ngoFields');
    
    // Show/hide NGO fields based on role selection
    roleSelect.addEventListener('change', function() {
        if (this.value === 'ngo') {
            ngoFields.style.display = 'block';
        } else {
            ngoFields.style.display = 'none';
        }
    });
    
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('role').value;
        
        const errorElement = document.getElementById('error-message');
        const successElement = document.getElementById('success-message');
        
        // Clear previous messages
        errorElement.textContent = '';
        successElement.textContent = '';
        
        // Validate inputs
        if (!name || !email || !password || !confirmPassword || !role) {
            errorElement.textContent = 'Please fill in all required fields';
            return;
        }
        
        if (password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            return;
        }
        
        // Prepare user data
        const userData = { name, email, password, role };
        
        if (role === 'ngo') {
            userData.organizationName = document.getElementById('organizationName').value;
            userData.organizationAddress = document.getElementById('organizationAddress').value;
            userData.organizationPhone = document.getElementById('organizationPhone').value;
            
            if (!userData.organizationName || !userData.organizationAddress || !userData.organizationPhone) {
                errorElement.textContent = 'Please fill in all NGO fields';
                return;
            }
        }
        
        // Attempt registration
        const result = auth.register(userData);
        
        if (result.success) {
            successElement.textContent = 'Registration successful! ';
            if (role === 'ngo') {
                successElement.textContent += 'Your NGO account is pending verification by admin. You will be able to login once verified.';
            } else {
                successElement.textContent += 'You can now login with your credentials.';
            }
            
            // Reset form
            this.reset();
            ngoFields.style.display = 'none';
        } else {
            errorElement.textContent = result.message;
        }
    });
}

// Global logout function
function logout() {
    auth.logout();
}

// Initialize page access check on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    auth.checkPageAccess();
});

// Make logout function globally available
window.logout = logout;
