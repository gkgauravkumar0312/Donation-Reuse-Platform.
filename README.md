# Donation & Reuse Platform for Clothes and Household Items

A complete, professional-grade web application that connects donors with NGOs for donation and reuse of clothes and household items. Built with vanilla HTML, CSS, and JavaScript using localStorage as a mock database.

## 🚀 Features

### Role-Based System
- **Donor**: Register, donate items, track donation status
- **NGO**: View donation requests, accept/reject donations, manage pickup/delivery
- **Admin**: Verify NGOs, view reports, manage platform

### Core Functionality
- User authentication with role-based access control
- Donation management with real-time status tracking
- NGO verification system
- Real-time dashboards and statistics
- Mobile-responsive design with touch support

### 🎨 Professional UI/UX
- **Modern Design**: Clean, gradient-based color scheme
- **Smooth Animations**: Fade-in effects, hover states, loading skeletons
- **Interactive Elements**: Ripple effects on buttons, smooth transitions
- **Mobile-First**: Hamburger menu, touch-optimized interactions
- **Professional Typography**: Consistent font hierarchy and spacing
- **Status Visualization**: Color-coded badges with progress indicators
- **Toast Notifications**: Modern notification system replacing alerts
- **Loading States**: Skeleton screens and animated spinners
- **Micro-interactions**: Hover effects, focus states, smooth transforms

## 📁 Project Structure

```
donation-reuse-platform/
│
├── index.html                 # Landing page with hero section
├── login.html                 # Enhanced login with validation
├── register.html              # Registration with NGO-specific fields
│
├── donor/                     # Donor dashboard and features
│   ├── donor-dashboard.html   # Animated statistics dashboard
│   ├── donate.html            # Enhanced donation form
│   └── donor-history.html     # Filterable donation history
│
├── ngo/                       # NGO management pages
│   ├── ngo-dashboard.html      # NGO statistics dashboard
│   └── donation-requests.html # Request management interface
│
├── admin/                     # Admin management pages
│   ├── admin-dashboard.html    # System overview dashboard
│   ├── verify-ngo.html        # NGO verification interface
│   └── reports.html           # Comprehensive reporting system
│
├── css/                        # Professional styling
│   ├── common.css            # Base styles and animations
│   ├── auth.css              # Authentication-specific styles
│   └── dashboard.css         # Dashboard component styles
│
├── js/                         # JavaScript functionality
│   ├── storage.js           # localStorage management
│   ├── auth.js              # Authentication system
│   ├── utils.js              # Utility functions
│   ├── donor.js             # Donor functionality
│   ├── ngo.js               # NGO functionality
│   └── admin.js             # Admin functionality
│
└── README.md                   # Complete documentation
```

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage**: localStorage with JSON serialization
- **Styling**: CSS Grid, Flexbox, CSS Variables, Animations
- **Authentication**: Session-based with role management
- **Design**: Mobile-first responsive design
- **Animations**: CSS keyframes, transitions, transforms

## 🔐 Demo Credentials

The application comes with pre-seeded demo users:

### Admin
- **Email**: admin@demo.com
- **Password**: admin123
- **Role**: Admin

### Donor
- **Email**: donor@demo.com
- **Password**: donor123
- **Role**: Donor

### NGO (Verified)
- **Email**: ngo@demo.com
- **Password**: ngo123
- **Role**: NGO
- **Status**: Verified

### NGO (Pending Verification)
- **Email**: testngo@demo.com
- **Password**: test123
- **Role**: NGO
- **Status**: Pending (requires admin verification)

## 📋 Donation Status Flow

1. **Pending** → Donation submitted by donor
2. **Accepted** → NGO accepts donation request
3. **Picked Up** → Items collected from donor
4. **Delivered** → Items delivered to NGO

## 🎯 Key Features Implemented

### Enhanced User Experience
- ✅ **Animated Dashboard Statistics** with counting effects
- ✅ **Modern Toast Notifications** system
- ✅ **Skeleton Loading States** for better perceived performance
- ✅ **Mobile Hamburger Menu** with smooth slide-out navigation
- ✅ **Professional Form Validation** with real-time feedback
- ✅ **Enhanced Button Interactions** with ripple effects
- ✅ **Smooth Page Transitions** and micro-animations
- ✅ **Status Flow Visualization** with progress indicators
- ✅ **Responsive Design** optimized for all devices
- ✅ **Accessibility Features** with keyboard navigation

### Advanced CSS Techniques
- ✅ **CSS Grid & Flexbox** for modern layouts
- ✅ **Custom Properties** for maintainable styles
- ✅ **Advanced Animations** using keyframes and transforms
- ✅ **Gradient Backgrounds** with overlay effects
- ✅ **Professional Typography** with proper hierarchy
- ✅ **Component-Based Design** for reusability

### JavaScript Architecture
- ✅ **Modular Class Structure** for maintainability
- ✅ **LocalStorage Management** with JSON serialization
- ✅ **Role-Based Access Control** with route protection
- ✅ **Real-time Data Updates** across all dashboards
- ✅ **Utility Functions** for common operations
- ✅ **Error Handling** with user-friendly messages

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome 60+, Firefox 55+, Safari 12+)
- Local web server (recommended for best experience)

### Installation

1. **Clone or download** project files
2. **Serve project** using local web server:

   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
   
   # Using Live Server (VS Code)
   # Install "Live Server" extension and right-click index.html
   ```

3. **Open browser** and navigate to `http://localhost:8000`
   - Right-click `index.html` and select "Open with Live Server"

3. **Open your browser** and navigate to `http://localhost:8000`

### Direct File Access
You can also open `index.html` directly in your browser, but some features may not work due to browser security restrictions.

## 📖 Usage Guide

### For Donors
1. **Register** as a donor or use demo credentials
2. **Login** to access your dashboard
3. **Create Donation** by filling out the donation form
4. **Track Status** of your donations in real-time
5. **View History** of all your donations

### For NGOs
1. **Register** as an NGO (requires admin verification)
2. **Wait for Verification** by admin
3. **Login** once verified
4. **View Requests** from donors
5. **Accept/Reject** donation requests
6. **Update Status** as items are picked up and delivered

### For Admins
1. **Login** with admin credentials
2. **Verify NGOs** in the verification section
3. **View Reports** and platform statistics
4. **Monitor Activity** across the platform

## 🔧 Key Features Explained

### Authentication System
- Role-based access control
- Session management using sessionStorage
- Automatic route protection
- NGO verification requirement

### Data Management
- localStorage as mock database
- Automatic data seeding on first run
- Real-time data synchronization
- Export functionality for admins

### User Experience
- Responsive design for all devices
- Clean, modern interface
- Real-time status updates
- Intuitive navigation

## 🎨 Design Principles

- **Mobile-First**: Responsive design works on all devices
- **Accessibility**: Semantic HTML and proper ARIA labels
- **Performance**: No external dependencies, fast loading
- **User-Friendly**: Clear navigation and intuitive workflows

## 🔒 Security Notes

This is a demo application with the following limitations:
- Passwords are stored in plain text (for demo purposes only)
- No server-side validation
- No encryption for sensitive data
- localStorage can be cleared by users

**In production, always use:**
- Server-side authentication
- Password hashing (bcrypt)
- HTTPS encryption
- Proper database with security measures

## 🐛 Troubleshooting

### Common Issues

**"Data not persisting"**
- Ensure you're using the same browser
- Check if localStorage is enabled
- Try clearing browser cache

**"Login not working"**
- Verify credentials are correct
- Check if NGO is verified (for NGO login)
- Ensure role selection matches user type

**"Pages not loading"**
- Use a local web server instead of direct file access
- Check browser console for errors
- Verify all files are in correct directories

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

This is a demo project for evaluation purposes. To contribute:

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and evaluation purposes only.

## 📞 Support

For questions or issues related to this demo project, please refer to the documentation or check the browser console for error messages.

---

**Built with ❤️ for Donation & Reuse Platform evaluation - 2026**
