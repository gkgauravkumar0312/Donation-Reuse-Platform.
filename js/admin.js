// Admin functionality for Donation & Reuse Platform
class AdminManager {
    constructor() {
        this.initializeAdmin();
    }

    // Initialize admin dashboard
    initializeAdmin() {
        // Protect route
        if (!auth.protectRoute('admin')) {
            return;
        }

        // Initialize page-specific functionality
        this.initializePage();
    }

    // Initialize page-specific functionality
    initializePage() {
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('admin-dashboard.html')) {
            this.loadDashboard();
        } else if (currentPage.includes('verify-ngo.html')) {
            this.loadNgoVerification();
        } else if (currentPage.includes('reports.html')) {
            this.loadReports();
        }
    }

    // Load admin dashboard
    loadDashboard() {
        const stats = storage.getStats();
        
        // Update statistics
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('totalNgos').textContent = stats.totalNgos;
        document.getElementById('pendingNgos').textContent = stats.pendingNgos;
        document.getElementById('totalDonations').textContent = stats.totalDonations;

        // Load recent activity
        this.loadRecentActivity();
    }

    // Load recent activity
    loadRecentActivity() {
        const container = document.getElementById('recentActivity');
        const donations = storage.getDonations();
        const users = storage.getUsers();
        
        // Combine and sort recent activities
        const activities = [];
        
        // Add donation activities
        donations.slice(0, 10).forEach(donation => {
            activities.push({
                type: 'donation',
                title: `New donation: ${donation.itemName}`,
                description: `by ${donation.donorName} to ${donation.ngoName}`,
                timestamp: donation.createdAt,
                status: donation.status
            });
        });
        
        // Add user registration activities
        users.slice(-10).forEach(user => {
            activities.push({
                type: 'user',
                title: `New ${user.role} registered`,
                description: user.name,
                timestamp: user.createdAt,
                status: user.verified ? 'verified' : 'pending'
            });
        });
        
        // Sort by timestamp (most recent first)
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Display recent activities
        if (activities.length === 0) {
            container.innerHTML = '<p>No recent activity</p>';
            return;
        }

        container.innerHTML = activities.slice(0, 5).map(activity => 
            this.createActivityCard(activity)
        ).join('');
    }

    // Create activity card HTML
    createActivityCard(activity) {
        const statusBadge = activity.type === 'donation' ? 
            this.getDonationStatusBadge(activity.status) :
            this.getVerificationStatusBadge(activity.status);
        
        return `
            <div class="activity-item">
                <div class="activity-time">${new Date(activity.timestamp).toLocaleDateString()}</div>
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                ${statusBadge}
            </div>
        `;
    }

    // Get donation status badge
    getDonationStatusBadge(status) {
        const badges = {
            pending: '<span class="status-badge status-pending">Pending</span>',
            accepted: '<span class="status-badge status-accepted">Accepted</span>',
            picked_up: '<span class="status-badge status-picked_up">Picked Up</span>',
            delivered: '<span class="status-badge status-delivered">Delivered</span>'
        };
        
        return badges[status] || '';
    }

    // Get verification status badge
    getVerificationStatusBadge(status) {
        const badges = {
            verified: '<span class="status-badge status-verified">Verified</span>',
            pending: '<span class="status-badge status-pending">Pending</span>'
        };
        
        return badges[status] || '';
    }

    // Load NGO verification page
    loadNgoVerification() {
        const users = storage.getUsers();
        const ngos = users.filter(user => user.role === 'ngo');
        
        this.displayNgos(ngos);
    }

    // Display NGOs for verification
    displayNgos(ngos) {
        const container = document.getElementById('ngoList');
        const noNgosElement = document.getElementById('noNgos');
        
        if (ngos.length === 0) {
            container.innerHTML = '';
            noNgosElement.style.display = 'block';
            return;
        }

        noNgosElement.style.display = 'none';
        container.innerHTML = ngos.map(ngo => this.createNgoCard(ngo)).join('');
    }

    // Create NGO card HTML
    createNgoCard(ngo) {
        const statusClass = ngo.verified ? 'verified' : 'pending';
        const statusBadge = ngo.verified ? 
            '<span class="status-badge status-verified">Verified</span>' :
            '<span class="status-badge status-pending">Pending Verification</span>';
        
        return `
            <div class="ngo-item ${statusClass}">
                <div class="ngo-header">
                    <div class="ngo-info">
                        <h4>${ngo.organizationName}</h4>
                        <p><strong>Contact:</strong> ${ngo.name}</p>
                        <p><strong>Email:</strong> ${ngo.email}</p>
                        <p><strong>Phone:</strong> ${ngo.organizationPhone}</p>
                        <p><strong>Address:</strong> ${ngo.organizationAddress}</p>
                        <p><small><strong>Registered:</strong> ${new Date(ngo.createdAt).toLocaleDateString()}</small></p>
                    </div>
                    <div class="ngo-actions">
                        ${statusBadge}
                        ${this.getNgoActions(ngo)}
                    </div>
                </div>
            </div>
        `;
    }

    // Get NGO actions based on verification status
    getNgoActions(ngo) {
        if (ngo.verified) {
            return `
                <button class="btn btn-danger" onclick="adminManager.revokeNgoVerification(${ngo.id})">
                    Revoke Verification
                </button>
                <button class="btn btn-secondary" onclick="adminManager.viewNgoDetails(${ngo.id})">
                    View Details
                </button>
            `;
        } else {
            return `
                <button class="btn btn-success" onclick="adminManager.verifyNgo(${ngo.id})">
                    Verify NGO
                </button>
                <button class="btn btn-danger" onclick="adminManager.rejectNgo(${ngo.id})">
                    Reject NGO
                </button>
                <button class="btn btn-secondary" onclick="adminManager.viewNgoDetails(${ngo.id})">
                    View Details
                </button>
            `;
        }
    }

    // Verify NGO
    verifyNgo(ngoId) {
        if (confirm('Are you sure you want to verify this NGO?')) {
            storage.updateUser(ngoId, { verified: true });
            this.showMessage('success', 'NGO verified successfully');
            this.loadNgoVerification(); // Refresh the list
        }
    }

    // Reject NGO
    rejectNgo(ngoId) {
        const reason = prompt('Please provide a reason for rejection (optional):');
        
        if (confirm('Are you sure you want to reject this NGO? This will remove them from the system.')) {
            const users = storage.getUsers();
            const updatedUsers = users.filter(user => user.id !== ngoId);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            
            this.showMessage('success', 'NGO rejected and removed from system');
            this.loadNgoVerification(); // Refresh the list
        }
    }

    // Revoke NGO verification
    revokeNgoVerification(ngoId) {
        if (confirm('Are you sure you want to revoke this NGO\'s verification? They will not be able to login until re-verified.')) {
            storage.updateUser(ngoId, { verified: false });
            this.showMessage('success', 'NGO verification revoked');
            this.loadNgoVerification(); // Refresh the list
        }
    }

    // View NGO details
    viewNgoDetails(ngoId) {
        const ngo = storage.getUserById(ngoId);
        if (ngo) {
            const details = `
                NGO Details:
                
                Organization Name: ${ngo.organizationName}
                Contact Person: ${ngo.name}
                Email: ${ngo.email}
                Phone: ${ngo.organizationPhone}
                Address: ${ngo.organizationAddress}
                Verification Status: ${ngo.verified ? 'Verified' : 'Pending'}
                Registered: ${new Date(ngo.createdAt).toLocaleDateString()}
                User ID: ${ngo.id}
            `;
            
            alert(details);
        }
    }

    // Filter NGOs
    filterNgos() {
        const verificationFilter = document.getElementById('verificationFilter').value;
        const users = storage.getUsers();
        let ngos = users.filter(user => user.role === 'ngo');
        
        if (verificationFilter === 'pending') {
            ngos = ngos.filter(ngo => !ngo.verified);
        } else if (verificationFilter === 'verified') {
            ngos = ngos.filter(ngo => ngo.verified);
        } else if (verificationFilter === 'rejected') {
            // Rejected NGOs are removed from system, so this would be empty
            ngos = [];
        }
        
        this.displayNgos(ngos);
    }

    // Load reports page
    loadReports() {
        const stats = storage.getStats();
        const donations = storage.getDonations();
        const donationStats = storage.getDonationStatsByType();
        const topNgos = storage.getTopNgos();
        
        // Update report statistics
        document.getElementById('totalDonationsReport').textContent = stats.totalDonations;
        document.getElementById('pendingPickupsReport').textContent = stats.pendingDonations;
        document.getElementById('completedDonationsReport').textContent = stats.completedDonations;
        document.getElementById('activeDonorsReport').textContent = stats.totalDonors;
        document.getElementById('activeNgosReport').textContent = stats.verifiedNgos;
        document.getElementById('itemsDonatedReport').textContent = stats.totalItems;

        // Load recent donations
        this.loadRecentDonationsReport(donations.slice(0, 10));
        
        // Load donation by type statistics
        this.loadDonationByType(donationStats);
        
        // Load top NGOs
        this.loadTopNgos(topNgos);
    }

    // Load recent donations for reports
    loadRecentDonationsReport(donations) {
        const container = document.getElementById('recentDonationsReport');
        
        if (donations.length === 0) {
            container.innerHTML = '<p>No donations found</p>';
            return;
        }

        container.innerHTML = donations.map(donation => `
            <div class="donation-item">
                <div class="item-header">
                    <div class="item-title">${donation.itemName}</div>
                    ${this.getDonationStatusBadge(donation.status)}
                </div>
                <div class="item-meta">
                    <span><strong>Donor:</strong> ${donation.donorName}</span>
                    <span><strong>NGO:</strong> ${donation.ngoName}</span>
                    <span><strong>Quantity:</strong> ${donation.quantity}</span>
                </div>
                <div class="item-meta">
                    <span><strong>Date:</strong> ${new Date(donation.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }

    // Load donation by type statistics
    loadDonationByType(stats) {
        const container = document.getElementById('donationByType');
        
        if (Object.keys(stats).length === 0) {
            container.innerHTML = '<p>No donation data available</p>';
            return;
        }

        container.innerHTML = Object.entries(stats).map(([type, data]) => `
            <div class="type-stat-item">
                <span>${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                <strong>${data.count} donations (${data.items} items)</strong>
            </div>
        `).join('');
    }

    // Load top NGOs
    loadTopNgos(ngos) {
        const container = document.getElementById('topNgos');
        
        if (ngos.length === 0) {
            container.innerHTML = '<p>No NGO data available</p>';
            return;
        }

        container.innerHTML = ngos.map(ngo => `
            <div class="ngo-stat-item">
                <span>${ngo.organizationName}</span>
                <strong>${ngo.donationCount} donations (${ngo.totalItems} items)</strong>
            </div>
        `).join('');
    }

    // Show message
    showMessage(type, message) {
        const errorElement = document.getElementById('error-message');
        const successElement = document.getElementById('success-message');
        
        if (type === 'error') {
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
            if (successElement) {
                successElement.textContent = '';
                successElement.style.display = 'none';
            }
        } else {
            if (successElement) {
                successElement.textContent = message;
                successElement.style.display = 'block';
            }
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        }
        
        // Clear message after 5 seconds
        setTimeout(() => {
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
            if (successElement) {
                successElement.textContent = '';
                successElement.style.display = 'none';
            }
        }, 5000);
    }

    // Get admin statistics
    getAdminStatistics() {
        return storage.getStats();
    }

    // Export data (for admin use)
    exportData() {
        const data = {
            users: storage.getUsers(),
            donations: storage.getDonations(),
            stats: storage.getStats(),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `donation-platform-export-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Clear all data (admin only - for testing)
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone and will reset the entire system.')) {
            if (confirm('This will delete all users, donations, and reset the system. Are you absolutely sure?')) {
                storage.clearAllData();
                this.showMessage('success', 'All data cleared and demo data restored');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        }
    }
}

// Global admin manager instance
const adminManager = new AdminManager();

// Global function for filtering NGOs
function filterNgos() {
    adminManager.filterNgos();
}

// Add admin utility functions to global scope
window.exportData = () => adminManager.exportData();
window.clearAllData = () => adminManager.clearAllData();
