# Public Welfare Petition App

A comprehensive mobile-responsive web application that allows citizens to report local civic issues, create petitions, and track their progress. The app includes Aadhaar-based user verification and GPS location services.

## Features

### 🔐 User Authentication
- **Registration**: Complete user registration with Aadhaar verification
- **Login**: Secure login using Aadhaar number and OTP
- **User Details**: Collects name, gender, age, locality, city, state, phone, and email

### 📱 Mobile-Responsive Design
- Beautiful linear gradient backgrounds
- Responsive design that works on all devices
- Touch-friendly interface for mobile users
- Modern UI with smooth animations

### 📸 Camera Integration
- Direct camera access for taking photos of issues
- Photo upload functionality
- Image preview before submission

### 🗺️ Location Services
- GPS-based location detection
- Manual location entry option
- Location validation for petitions

### 📋 Petition Management
- **Create Petitions**: Report issues with photos and detailed descriptions
- **Petition Categories**: Road & Infrastructure, Water Supply, Electricity, Sanitation, Public Transport, Safety, and Others
- **Unique Petition IDs**: Auto-generated IDs (e.g., #PET001, #PET002)
- **Status Tracking**: Pending, In Progress, Resolved

### 🔍 Search & Discovery
- Search petitions by ID or keywords
- View local petitions in your area
- Support petitions from other users
- Track your own petitions

### 👥 Community Features
- Support system for petitions
- Supporter count tracking
- Community-driven issue resolution

## File Structure

```
public-welfare-app/
├── index.html          # Main HTML file with all pages
├── styles.css          # Complete CSS with mobile responsiveness
├── script.js           # JavaScript functionality
└── README.md          # This documentation
```

## How to Use

### 1. Registration
1. Open `index.html` in a web browser
2. Fill in the registration form with your details
3. Enter your 12-digit Aadhaar number
4. Click "Register & Continue"
5. Wait for Aadhaar verification (simulated)

### 2. Login
1. Enter your Aadhaar number
2. Click "Send OTP" to receive verification code
3. Enter the 6-digit OTP
4. Click "Login"

### 3. Creating a Petition
1. Click "Post Picture of Issue" or navigate to "Create Petition"
2. Fill in the petition details:
   - Issue title
   - Detailed description
   - Category selection
   - Location (use GPS or enter manually)
   - Upload/take a photo
3. Submit the petition
4. Receive a unique Petition ID

### 4. Managing Petitions
- **Your Petitions**: View and track your submitted petitions
- **Local Petitions**: Browse and support petitions in your area
- **Search**: Find specific petitions by ID or keywords

## Technical Features

### Camera Access
- Uses `capture="environment"` for rear camera on mobile
- File input with `accept="image/*"` for image files
- Real-time photo preview

### GPS Integration
- Uses `navigator.geolocation` API
- Fallback to manual location entry
- Coordinate display with reverse geocoding

### Data Persistence
- Uses `localStorage` for data storage
- User sessions persist across browser sessions
- Petition data is saved locally

### Responsive Design
- CSS Grid and Flexbox for layouts
- Mobile-first approach
- Breakpoints at 768px and 480px
- Touch-friendly button sizes

## Browser Compatibility

- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires HTTPS for camera and GPS access
- Works offline after initial load

## Security Features

- Aadhaar number validation (12-digit format)
- Phone number validation (10-digit format)
- OTP verification system
- Input sanitization and validation

## Sample Data

The app includes sample petitions to demonstrate functionality:
- Broken Streetlight (Pending)
- Garbage Collection Issues (In Progress)
- Speed Breakers Needed (Resolved)

## Future Enhancements

- Backend integration for real data storage
- Real Aadhaar verification API
- SMS OTP integration
- Email notifications
- Admin dashboard for authorities
- Push notifications
- Social sharing features

## Getting Started

1. Download all files to a local directory
2. Open `index.html` in a web browser
3. Start with the registration process
4. Explore the different sections of the app

## Notes

- This is a frontend-only implementation
- Aadhaar verification is simulated for demo purposes
- GPS and camera features require HTTPS in production
- Data is stored locally in browser storage

## Support

For issues or questions about the app, please refer to the code comments or create an issue in the project repository.
