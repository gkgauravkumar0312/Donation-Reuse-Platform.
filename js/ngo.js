// NGO functionality for Donation & Reuse Platform
class NgoManager {
    constructor() {
        this.initializeNgo();
    }

    // Initialize NGO dashboard
    initializeNgo() {
        // Protect route
        if (!auth.protectRoute('ngo')) {
            return;
        }

        // Initialize page-specific functionality
        this.initializePage();
    }

    // Initialize page-specific functionality
    initializePage() {
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('ngo-dashboard.html')) {
            this.loadDashboard();
        } else if (currentPage.includes('donation-requests.html')) {
            this.loadDonationRequests();
        }
    }

    // Load NGO dashboard
    loadDashboard() {
        const currentUser = auth.getCurrentUser();
        const donations = storage.getDonationsByNgo(currentUser.id);
        
        // Calculate statistics
        const stats = {
            total: donations.length,
            pending: donations.filter(d => d.status === 'pending').length,
            accepted: donations.filter(d => d.status === 'accepted').length,
            completed: donations.filter(d => d.status === 'delivered').length
        };

        // Update statistics
        document.getElementById('totalRequests').textContent = stats.total;
        document.getElementById('pendingRequests').textContent = stats.pending;
        document.getElementById('acceptedRequests').textContent = stats.accepted;
        document.getElementById('completedPickups').textContent = stats.completed;

        // Load recent requests
        this.loadRecentRequests(donations.slice(0, 5));
    }

    // Load recent donation requests
    loadRecentRequests(donations) {
        const container = document.getElementById('recentRequests');
        
        if (donations.length === 0) {
            container.innerHTML = '<p>No donation requests yet.</p>';
            return;
        }

        container.innerHTML = donations.map(donation => this.createRequestCard(donation)).join('');
    }

    // Load all donation requests
    loadDonationRequests() {
        const currentUser = auth.getCurrentUser();
        const donations = storage.getDonationsByNgo(currentUser.id);
        
        this.displayRequests(donations);
    }

    // Display donation requests
    displayRequests(donations) {
        const container = document.getElementById('donationRequests');
        const noRequestsElement = document.getElementById('noRequests');
        
        if (donations.length === 0) {
            container.innerHTML = '';
            noRequestsElement.style.display = 'block';
            return;
        }

        noRequestsElement.style.display = 'none';
        container.innerHTML = donations.map(donation => this.createRequestCard(donation, true)).join('');
    }

    // Create request card HTML
    createRequestCard(donation, showActions = false) {
        const statusBadge = this.getStatusBadge(donation.status);
        const statusFlow = this.getStatusFlow(donation.status);
        
        return `
            <div class="donation-item">
                <div class="item-header">
                    <div class="item-title">${donation.itemName}</div>
                    ${statusBadge}
                </div>
                <div class="item-meta">
                    <span><strong>Donor:</strong> ${donation.donorName}</span>
                    <span><strong>Email:</strong> ${donation.donorEmail}</span>
                    <span><strong>Type:</strong> ${donation.itemType}</span>
                    <span><strong>Quantity:</strong> ${donation.quantity}</span>
                </div>
                <div class="item-meta">
                    <span><strong>Pickup Date:</strong> ${new Date(donation.pickupDate).toLocaleDateString()}</span>
                    <span><strong>Time:</strong> ${this.getTimeDisplay(donation.pickupTime)}</span>
                </div>
                ${donation.description ? `<p><strong>Description:</strong> ${donation.description}</p>` : ''}
                <p><strong>Pickup Address:</strong> ${donation.pickupAddress}</p>
                <p><strong>Contact:</strong> ${donation.contactPhone}</p>
                ${statusFlow}
                <div class="item-meta">
                    <small><strong>Requested:</strong> ${new Date(donation.createdAt).toLocaleDateString()}</small>
                    ${donation.updatedAt !== donation.createdAt ? 
                        `<small><strong>Updated:</strong> ${new Date(donation.updatedAt).toLocaleDateString()}</small>` : ''}
                </div>
                ${showActions ? this.getRequestActions(donation) : ''}
            </div>
        `;
    }

    // Get status badge HTML
    getStatusBadge(status) {
        const badges = {
            pending: '<span class="status-badge status-pending">Pending</span>',
            accepted: '<span class="status-badge status-accepted">Accepted</span>',
            picked_up: '<span class="status-badge status-picked_up">Picked Up</span>',
            delivered: '<span class="status-badge status-delivered">Delivered</span>'
        };
        
        return badges[status] || badges.pending;
    }

    // Get status flow HTML
    getStatusFlow(currentStatus) {
        const steps = [
            { id: 'pending', label: 'Pending' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'picked_up', label: 'Picked Up' },
            { id: 'delivered', label: 'Delivered' }
        ];

        const currentIndex = steps.findIndex(step => step.id === currentStatus);
        
        const flowHtml = steps.map((step, index) => {
            let className = 'status-step';
            if (index < currentIndex) {
                className += ' completed';
            } else if (index === currentIndex) {
                className += ' active';
            }
            
            return `<span class="${className}">${step.label}</span>`;
        }).join('<span class="arrow">→</span>');

        return `<div class="status-flow">${flowHtml}</div>`;
    }

    // Get time display
    getTimeDisplay(time) {
        const timeMap = {
            morning: 'Morning (9 AM - 12 PM)',
            afternoon: 'Afternoon (12 PM - 4 PM)',
            evening: 'Evening (4 PM - 7 PM)'
        };
        
        return timeMap[time] || time;
    }

    // Get request actions based on status
    getRequestActions(donation) {
        let actions = '';
        
        if (donation.status === 'pending') {
            actions += `
                <button class="btn btn-success" onclick="ngoManager.acceptDonation(${donation.id})">
                    Accept
                </button>
                <button class="btn btn-danger" onclick="ngoManager.rejectDonation(${donation.id})">
                    Reject
                </button>
            `;
        } else if (donation.status === 'accepted') {
            actions += `
                <button class="btn btn-primary" onclick="ngoManager.markAsPickedUp(${donation.id})">
                    Mark as Picked Up
                </button>
                <button class="btn btn-danger" onclick="ngoManager.rejectDonation(${donation.id})">
                    Reject
                </button>
            `;
        } else if (donation.status === 'picked_up') {
            actions += `
                <button class="btn btn-success" onclick="ngoManager.markAsDelivered(${donation.id})">
                    Mark as Delivered
                </button>
            `;
        }
        
        actions += `
            <button class="btn btn-secondary" onclick="ngoManager.viewRequestDetails(${donation.id})">
                View Details
            </button>
        `;
        
        return `<div class="item-actions">${actions}</div>`;
    }

    // Accept donation
    acceptDonation(donationId) {
        if (confirm('Are you sure you want to accept this donation request?')) {
            storage.updateDonation(donationId, { status: 'accepted' });
            this.showMessage('success', 'Donation accepted successfully');
            this.refreshCurrentPage();
        }
    }

    // Reject donation
    rejectDonation(donationId) {
        const reason = prompt('Please provide a reason for rejection (optional):');
        
        storage.updateDonation(donationId, { 
            status: 'rejected',
            rejectionReason: reason || 'Rejected by NGO'
        });
        
        this.showMessage('success', 'Donation rejected');
        this.refreshCurrentPage();
    }

    // Mark as picked up
    markAsPickedUp(donationId) {
        if (confirm('Are you sure you want to mark this donation as picked up?')) {
            storage.updateDonation(donationId, { status: 'picked_up' });
            this.showMessage('success', 'Donation marked as picked up');
            this.refreshCurrentPage();
        }
    }

    // Mark as delivered
    markAsDelivered(donationId) {
        if (confirm('Are you sure you want to mark this donation as delivered?')) {
            storage.updateDonation(donationId, { status: 'delivered' });
            this.showMessage('success', 'Donation marked as delivered');
            this.refreshCurrentPage();
        }
    }

    // View request details
    viewRequestDetails(donationId) {
        const donation = storage.getDonationById(donationId);
        if (donation) {
            const details = `
                Donation Request Details:
                
                Donor: ${donation.donorName}
                Email: ${donation.donorEmail}
                Item: ${donation.itemName}
                Type: ${donation.itemType}
                Quantity: ${donation.quantity}
                Status: ${donation.status}
                Pickup Date: ${new Date(donation.pickupDate).toLocaleDateString()}
                Pickup Time: ${this.getTimeDisplay(donation.pickupTime)}
                Pickup Address: ${donation.pickupAddress}
                Contact Phone: ${donation.contactPhone}
                Description: ${donation.description || 'N/A'}
                Requested: ${new Date(donation.createdAt).toLocaleDateString()}
                ${donation.updatedAt !== donation.createdAt ? 
                    `Updated: ${new Date(donation.updatedAt).toLocaleDateString()}` : ''}
                ${donation.rejectionReason ? `Rejection Reason: ${donation.rejectionReason}` : ''}
            `;
            
            alert(details);
        }
    }

    // Filter requests
    filterRequests() {
        const statusFilter = document.getElementById('statusFilter').value;
        const currentUser = auth.getCurrentUser();
        let donations = storage.getDonationsByNgo(currentUser.id);
        
        if (statusFilter !== 'all') {
            donations = donations.filter(d => d.status === statusFilter);
        }
        
        this.displayRequests(donations);
    }

    // Refresh current page
    refreshCurrentPage() {
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('ngo-dashboard.html')) {
            this.loadDashboard();
        } else if (currentPage.includes('donation-requests.html')) {
            this.loadDonationRequests();
        }
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

    // Get NGO statistics
    getNgoStatistics() {
        const currentUser = auth.getCurrentUser();
        const donations = storage.getDonationsByNgo(currentUser.id);
        
        return {
            totalRequests: donations.length,
            pendingRequests: donations.filter(d => d.status === 'pending').length,
            acceptedRequests: donations.filter(d => d.status === 'accepted').length,
            pickedUpRequests: donations.filter(d => d.status === 'picked_up').length,
            completedRequests: donations.filter(d => d.status === 'delivered').length,
            totalItems: donations.reduce((sum, d) => sum + (d.quantity || 0), 0),
            itemsByType: this.getItemsByType(donations)
        };
    }

    // Get items by type statistics
    getItemsByType(donations) {
        const stats = {};
        
        donations.forEach(donation => {
            const type = donation.itemType || 'other';
            if (!stats[type]) {
                stats[type] = { count: 0, items: 0 };
            }
            stats[type].count++;
            stats[type].items += donation.quantity || 0;
        });
        
        return stats;
    }
}

// Global NGO manager instance
const ngoManager = new NgoManager();

// Global function for filtering requests
function filterRequests() {
    ngoManager.filterRequests();
}
