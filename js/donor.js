// Donor functionality for Donation & Reuse Platform
class DonorManager {
    constructor() {
        this.initializeDonor();
    }

    // Initialize donor dashboard
    initializeDonor() {
        // Protect route
        if (!auth.protectRoute('donor')) {
            return;
        }

        // Initialize page-specific functionality
        this.initializePage();
    }

    // Initialize page-specific functionality
    initializePage() {
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('donor-dashboard.html')) {
            this.loadDashboard();
        } else if (currentPage.includes('donate.html')) {
            this.loadDonationForm();
        } else if (currentPage.includes('donor-history.html')) {
            this.loadDonationHistory();
        }
    }

    // Load donor dashboard
    loadDashboard() {
        const currentUser = auth.getCurrentUser();
        const donations = storage.getDonationsByDonor(currentUser.id);
        
        // Calculate statistics
        const stats = {
            total: donations.length,
            pending: donations.filter(d => d.status === 'pending').length,
            completed: donations.filter(d => d.status === 'delivered').length
        };

        // Animate statistics counting
        Utils.animateNumber(document.getElementById('totalDonations'), stats.total, 1500);
        Utils.animateNumber(document.getElementById('pendingPickups'), stats.pending, 1500);
        Utils.animateNumber(document.getElementById('completedDonations'), stats.completed, 1500);

        // Load recent donations
        this.loadRecentDonations(donations.slice(0, 5));
    }

    // Load recent donations
    loadRecentDonations(donations) {
        const container = document.getElementById('recentDonations');
        
        if (donations.length === 0) {
            container.innerHTML = '<p>No donations yet. <a href="donate.html">Make your first donation</a></p>';
            return;
        }

        container.innerHTML = donations.map(donation => this.createDonationCard(donation)).join('');
    }

    // Load donation form
    loadDonationForm() {
        this.loadNgoSelect();
        this.setupDonationForm();
        this.setMinDate();
    }

    // Load NGOs for selection
    loadNgoSelect() {
        const ngos = storage.getVerifiedNgos();
        const ngoSelect = document.getElementById('ngo');
        
        ngoSelect.innerHTML = '<option value="">Select NGO</option>' +
            ngos.map(ngo => `<option value="${ngo.id}">${ngo.organizationName}</option>`).join('');
    }

    // Set minimum date for pickup
    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('pickupDate').setAttribute('min', today);
    }

    // Setup donation form submission
    setupDonationForm() {
        const form = document.getElementById('donationForm');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currentUser = auth.getCurrentUser();
            const formData = new FormData(form);
            
            const donationData = {
                donorId: currentUser.id,
                donorName: currentUser.name,
                donorEmail: currentUser.email,
                ngoId: parseInt(formData.get('ngo')),
                ngoName: this.getNgoName(formData.get('ngo')),
                itemType: formData.get('itemType'),
                itemName: formData.get('itemName'),
                quantity: parseInt(formData.get('quantity')),
                description: formData.get('description'),
                pickupAddress: formData.get('pickupAddress'),
                pickupDate: formData.get('pickupDate'),
                pickupTime: formData.get('pickupTime'),
                contactPhone: formData.get('contactPhone')
            };

            // Validate form data
            if (!this.validateDonationData(donationData)) {
                return;
            }

            // Save donation
            const donation = storage.addDonation(donationData);
            
            // Show success message
            this.showMessage('success', 'Donation submitted successfully! NGO will review your request.');
            
            // Reset form
            form.reset();
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = 'donor-dashboard.html';
            }, 2000);
        });
    }

    // Validate donation data
    validateDonationData(data) {
        if (!data.ngoId || !data.itemType || !data.itemName || !data.quantity || 
            !data.pickupAddress || !data.pickupDate || !data.pickupTime || !data.contactPhone) {
            this.showMessage('error', 'Please fill in all required fields');
            return false;
        }

        if (data.quantity < 1) {
            this.showMessage('error', 'Quantity must be at least 1');
            return false;
        }

        return true;
    }

    // Get NGO name by ID
    getNgoName(ngoId) {
        const ngo = storage.getUserById(ngoId);
        return ngo ? ngo.organizationName : 'Unknown NGO';
    }

    // Load donation history
    loadDonationHistory() {
        const currentUser = auth.getCurrentUser();
        const donations = storage.getDonationsByDonor(currentUser.id);
        
        this.displayDonations(donations);
    }

    // Display donations
    displayDonations(donations) {
        const container = document.getElementById('donationHistory');
        const noDonationsElement = document.getElementById('noDonations');
        
        if (donations.length === 0) {
            container.innerHTML = '';
            noDonationsElement.style.display = 'block';
            return;
        }

        noDonationsElement.style.display = 'none';
        container.innerHTML = donations.map(donation => this.createDonationCard(donation, true)).join('');
    }

    // Create donation card HTML
    createDonationCard(donation, showActions = false) {
        const statusBadge = this.getStatusBadge(donation.status);
        const statusFlow = this.getStatusFlow(donation.status);
        
        return `
            <div class="donation-item">
                <div class="item-header">
                    <div class="item-title">${donation.itemName}</div>
                    ${statusBadge}
                </div>
                <div class="item-meta">
                    <span><strong>Type:</strong> ${donation.itemType}</span>
                    <span><strong>Quantity:</strong> ${donation.quantity}</span>
                    <span><strong>NGO:</strong> ${donation.ngoName}</span>
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
                    <small><strong>Created:</strong> ${new Date(donation.createdAt).toLocaleDateString()}</small>
                    ${donation.updatedAt !== donation.createdAt ? 
                        `<small><strong>Updated:</strong> ${new Date(donation.updatedAt).toLocaleDateString()}</small>` : ''}
                </div>
                ${showActions ? this.getDonationActions(donation) : ''}
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

    // Get donation actions
    getDonationActions(donation) {
        let actions = '';
        
        if (donation.status === 'pending') {
            actions += `
                <button class="btn btn-danger" onclick="donorManager.cancelDonation(${donation.id})">
                    Cancel Donation
                </button>
            `;
        }
        
        actions += `
            <button class="btn btn-secondary" onclick="donorManager.viewDonationDetails(${donation.id})">
                View Details
            </button>
        `;
        
        return `<div class="item-actions">${actions}</div>`;
    }

    // Cancel donation
    cancelDonation(donationId) {
        if (confirm('Are you sure you want to cancel this donation?')) {
            storage.updateDonation(donationId, { status: 'cancelled' });
            this.showMessage('success', 'Donation cancelled successfully');
            this.loadDonationHistory(); // Refresh the list
        }
    }

    // View donation details
    viewDonationDetails(donationId) {
        const donation = storage.getDonationById(donationId);
        if (donation) {
            const details = `
                Donation Details:
                
                Item: ${donation.itemName}
                Type: ${donation.itemType}
                Quantity: ${donation.quantity}
                NGO: ${donation.ngoName}
                Status: ${donation.status}
                Pickup Date: ${new Date(donation.pickupDate).toLocaleDateString()}
                Pickup Time: ${this.getTimeDisplay(donation.pickupTime)}
                Pickup Address: ${donation.pickupAddress}
                Contact Phone: ${donation.contactPhone}
                Description: ${donation.description || 'N/A'}
                Created: ${new Date(donation.createdAt).toLocaleDateString()}
                ${donation.updatedAt !== donation.createdAt ? 
                    `Updated: ${new Date(donation.updatedAt).toLocaleDateString()}` : ''}
            `;
            
            alert(details);
        }
    }

    // Filter donations
    filterDonations() {
        const statusFilter = document.getElementById('statusFilter').value;
        const currentUser = auth.getCurrentUser();
        let donations = storage.getDonationsByDonor(currentUser.id);
        
        if (statusFilter !== 'all') {
            donations = donations.filter(d => d.status === statusFilter);
        }
        
        this.displayDonations(donations);
    }

    // Show message
    showMessage(type, message) {
        if (type === 'error') {
            Utils.showToast(message, 'error');
        } else {
            Utils.showToast(message, 'success');
        }
    }
}

// Global donor manager instance
const donorManager = new DonorManager();

// Global function for filtering donations
function filterDonations() {
    donorManager.filterDonations();
}
