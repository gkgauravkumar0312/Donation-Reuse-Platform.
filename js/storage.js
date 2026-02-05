// Storage management for Donation & Reuse Platform
class StorageManager {
    constructor() {
        this.initializeData();
    }

    // Initialize demo data if not exists
    initializeData() {
        if (!localStorage.getItem('users')) {
            this.seedDemoUsers();
        }
        if (!localStorage.getItem('donations')) {
            localStorage.setItem('donations', JSON.stringify([]));
        }
        if (!localStorage.getItem('donationIdCounter')) {
            localStorage.setItem('donationIdCounter', '1');
        }
    }

    // Seed demo users
    seedDemoUsers() {
        const demoUsers = [
            {
                id: 1,
                name: 'Admin User',
                email: 'admin@demo.com',
                password: 'admin123', // In real app, this would be hashed
                role: 'admin',
                verified: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Donor User',
                email: 'donor@demo.com',
                password: 'donor123', // In real app, this would be hashed
                role: 'donor',
                verified: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'NGO Organization',
                email: 'ngo@demo.com',
                password: 'ngo123', // In real app, this would be hashed
                role: 'ngo',
                verified: true,
                organizationName: 'Helping Hands NGO',
                organizationAddress: '123 Charity Street, City, State 12345',
                organizationPhone: '+1-234-567-8900',
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                name: 'Test NGO',
                email: 'testngo@demo.com',
                password: 'test123',
                role: 'ngo',
                verified: false,
                organizationName: 'Test Foundation',
                organizationAddress: '456 Test Avenue, City, State 67890',
                organizationPhone: '+1-987-654-3210',
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(demoUsers));
    }

    // Get all users
    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    // Get user by email
    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email === email);
    }

    // Get user by ID
    getUserById(id) {
        const users = this.getUsers();
        return users.find(user => user.id === parseInt(id));
    }

    // Add new user
    addUser(userData) {
        const users = this.getUsers();
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            ...userData,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return newUser;
    }

    // Update user
    updateUser(id, updates) {
        const users = this.getUsers();
        const index = users.findIndex(user => user.id === parseInt(id));
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('users', JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    // Get all donations
    getDonations() {
        return JSON.parse(localStorage.getItem('donations') || '[]');
    }

    // Get donation by ID
    getDonationById(id) {
        const donations = this.getDonations();
        return donations.find(donation => donation.id === parseInt(id));
    }

    // Add new donation
    addDonation(donationData) {
        const donations = this.getDonations();
        const counter = parseInt(localStorage.getItem('donationIdCounter') || '1');
        
        const newDonation = {
            id: counter,
            ...donationData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        donations.push(newDonation);
        localStorage.setItem('donations', JSON.stringify(donations));
        localStorage.setItem('donationIdCounter', (counter + 1).toString());
        
        return newDonation;
    }

    // Update donation
    updateDonation(id, updates) {
        const donations = this.getDonations();
        const index = donations.findIndex(donation => donation.id === parseInt(id));
        if (index !== -1) {
            donations[index] = { 
                ...donations[index], 
                ...updates, 
                updatedAt: new Date().toISOString() 
            };
            localStorage.setItem('donations', JSON.stringify(donations));
            return donations[index];
        }
        return null;
    }

    // Get donations by donor ID
    getDonationsByDonor(donorId) {
        const donations = this.getDonations();
        return donations.filter(donation => donation.donorId === parseInt(donorId));
    }

    // Get donations by NGO ID
    getDonationsByNgo(ngoId) {
        const donations = this.getDonations();
        console.log('Getting donations for NGO ID:', ngoId, 'Type:', typeof ngoId);
        console.log('All donations:', donations);
        const filtered = donations.filter(donation => {
            console.log('Comparing donation.ngoId:', donation.ngoId, 'Type:', typeof donation.ngoId, 'with ngoId:', ngoId);
            return donation.ngoId === parseInt(ngoId);
        });
        console.log('Filtered donations:', filtered);
        return filtered;
    }

    // Get verified NGOs
    getVerifiedNgos() {
        const users = this.getUsers();
        return users.filter(user => user.role === 'ngo' && user.verified === true);
    }

    // Get pending NGOs (unverified)
    getPendingNgos() {
        const users = this.getUsers();
        return users.filter(user => user.role === 'ngo' && user.verified === false);
    }

    // Get statistics
    getStats() {
        const users = this.getUsers();
        const donations = this.getDonations();
        
        return {
            totalUsers: users.length,
            totalDonors: users.filter(u => u.role === 'donor').length,
            totalNgos: users.filter(u => u.role === 'ngo').length,
            verifiedNgos: users.filter(u => u.role === 'ngo' && u.verified).length,
            pendingNgos: users.filter(u => u.role === 'ngo' && !u.verified).length,
            totalDonations: donations.length,
            pendingDonations: donations.filter(d => d.status === 'pending').length,
            acceptedDonations: donations.filter(d => d.status === 'accepted').length,
            pickedUpDonations: donations.filter(d => d.status === 'picked_up').length,
            completedDonations: donations.filter(d => d.status === 'delivered').length,
            totalItems: donations.reduce((sum, d) => sum + (d.quantity || 0), 0)
        };
    }

    // Get donation statistics by type
    getDonationStatsByType() {
        const donations = this.getDonations();
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

    // Get top NGOs by donations received
    getTopNgos(limit = 5) {
        const donations = this.getDonations();
        const ngos = this.getVerifiedNgos();
        const stats = {};
        
        donations.forEach(donation => {
            if (donation.ngoId) {
                if (!stats[donation.ngoId]) {
                    stats[donation.ngoId] = { count: 0, items: 0 };
                }
                stats[donation.ngoId].count++;
                stats[donation.ngoId].items += donation.quantity || 0;
            }
        });
        
        return ngos
            .map(ngo => ({
                ...ngo,
                donationCount: stats[ngo.id]?.count || 0,
                totalItems: stats[ngo.id]?.items || 0
            }))
            .sort((a, b) => b.donationCount - a.donationCount)
            .slice(0, limit);
    }

    // Clear all data (for testing)
    clearAllData() {
        localStorage.removeItem('users');
        localStorage.removeItem('donations');
        localStorage.removeItem('donationIdCounter');
        this.initializeData();
    }
}

// Global storage instance
const storage = new StorageManager();
