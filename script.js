// Global variables
let currentUser = null;
let petitions = [];
let petitionCounter = 1;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSampleData();
});

// Initialize app state
function initializeApp() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showPage('homePage');
        updateUserInfo();
    } else {
        showPage('welcomePage');
    }
    
    // Load saved petitions
    const savedPetitions = localStorage.getItem('petitions');
    if (savedPetitions) {
        petitions = JSON.parse(savedPetitions);
        petitionCounter = Math.max(...petitions.map(p => parseInt(p.id.replace('PET', ''))), 0) + 1;
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Registration form
    document.getElementById('registrationForm').addEventListener('submit', handleRegistration);
    
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('sendOtpBtn').addEventListener('click', sendOTP);
    document.getElementById('showRegistration').addEventListener('click', showRegistration);
    
    // Home page navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            showSection(section);
            updateActiveNav(this);
        });
    });
    
    // Petition form
    document.getElementById('petitionForm').addEventListener('submit', handlePetitionSubmission);
    document.getElementById('photoUpload').addEventListener('change', handlePhotoUpload);
    document.getElementById('getLocationBtn').addEventListener('click', getCurrentLocation);
    document.getElementById('createPetitionBtn').addEventListener('click', function() {
        showSection('create');
    });
    
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Close modal when clicking outside
    document.getElementById('successModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// Page management
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId + 'Section').classList.add('active');
    
    // Update relevant data when switching sections
    if (currentUser) {
        if (sectionId === 'create') {
            updatePetitionLimitInfo();
        } else if (sectionId === 'my-petitions') {
            updateMyPetitionsList();
        } else if (sectionId === 'local-petitions') {
            updateLocalPetitionsList();
        }
    }
}

function updateActiveNav(activeBtn) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

// Registration handling
function handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData);
    
    // Validate Aadhaar number
    if (!validateAadhaar(userData.aadhaar)) {
        alert('Please enter a valid 12-digit Aadhaar number');
        return;
    }
    
    // Validate phone number
    if (!validatePhone(userData.phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    // Simulate Aadhaar verification
    showLoading();
    setTimeout(() => {
        hideLoading();
        
        // Store user data
        currentUser = {
            ...userData,
            id: 'USER' + Date.now(),
            registeredAt: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Show success message and redirect to home
        alert('Registration successful! Your Aadhaar has been verified.');
        showPage('homePage');
        updateUserInfo();
    }, 2000);
}

// Login handling
function handleLogin(e) {
    e.preventDefault();
    
    const aadhaar = document.getElementById('loginAadhaar').value;
    const otp = document.getElementById('otp').value;
    
    if (!validateAadhaar(aadhaar)) {
        alert('Please enter a valid 12-digit Aadhaar number');
        return;
    }
    
    if (!validateOTP(otp)) {
        alert('Please enter a valid 6-digit OTP');
        return;
    }
    
    showLoading();
    setTimeout(() => {
        hideLoading();
        
        // Simulate login verification
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            if (currentUser.aadhaar === aadhaar) {
                showPage('homePage');
                updateUserInfo();
            } else {
                alert('Aadhaar number not found. Please register first.');
            }
        } else {
            alert('No account found. Please register first.');
        }
    }, 1500);
}

// OTP functionality
function sendOTP() {
    const aadhaar = document.getElementById('loginAadhaar').value;
    
    if (!validateAadhaar(aadhaar)) {
        alert('Please enter a valid 12-digit Aadhaar number first');
        return;
    }
    
    const btn = document.getElementById('sendOtpBtn');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.textContent = 'OTP Sent!';
        alert('OTP sent to your registered mobile number: 123456');
        setTimeout(() => {
            btn.textContent = 'Send OTP';
            btn.disabled = false;
        }, 3000);
    }, 1000);
}

// Show registration page
function showRegistration() {
    showPage('welcomePage');
}

// Update user info display
function updateUserInfo() {
    if (currentUser) {
        document.getElementById('userName').textContent = `Welcome, ${currentUser.fullName}`;
        updatePetitionLimitInfo();
    }
}

// Update petition limit information
function updatePetitionLimitInfo() {
    if (!currentUser) return;
    
    const limitInfo = checkPetitionLimits();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // Count petitions created by user in last 30 days
    const userPetitionsInLast30Days = petitions.filter(petition => {
        if (petition.createdBy !== currentUser.id) return false;
        const petitionDate = new Date(petition.createdAt);
        return petitionDate >= thirtyDaysAgo;
    });
    
    const maxPetitions = 2;
    const remainingPetitions = maxPetitions - userPetitionsInLast30Days.length;
    
    // Update the create petition section header with limit info
    const sectionHeader = document.querySelector('#createSection .section-header');
    if (sectionHeader) {
        const limitInfoElement = sectionHeader.querySelector('.limit-info') || document.createElement('div');
        limitInfoElement.className = 'limit-info';
        limitInfoElement.style.cssText = 'margin-top: 10px; padding: 10px; border-radius: 8px; font-size: 0.9rem;';
        
        if (remainingPetitions > 0) {
            limitInfoElement.style.background = '#e8f5e8';
            limitInfoElement.style.color = '#2e7d32';
            limitInfoElement.style.border = '1px solid #4caf50';
            limitInfoElement.innerHTML = `<i class="fas fa-info-circle"></i> You can create ${remainingPetitions} more petition${remainingPetitions > 1 ? 's' : ''} in the next 30 days.`;
        } else {
            limitInfoElement.style.background = '#fff3e0';
            limitInfoElement.style.color = '#f57c00';
            limitInfoElement.style.border = '1px solid #ff9800';
            limitInfoElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> You have reached the limit of ${maxPetitions} petitions per 30 days.`;
        }
        
        if (!sectionHeader.querySelector('.limit-info')) {
            sectionHeader.appendChild(limitInfoElement);
        }
    }
}

// Petition submission
function handlePetitionSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const petitionData = Object.fromEntries(formData);
    
    // Validate required fields
    if (!petitionData.title || !petitionData.description || !petitionData.category || !petitionData.location) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Check if photo is uploaded
    const photoFile = document.getElementById('photoUpload').files[0];
    if (!photoFile) {
        alert('Please upload a photo of the issue');
        return;
    }
    
    // Check petition limits
    const petitionLimit = checkPetitionLimits();
    if (!petitionLimit.canCreate) {
        alert(petitionLimit.message);
        return;
    }
    
    showLoading();
    
    // Simulate petition creation
    setTimeout(() => {
        const petitionId = generatePetitionId();
        const newPetition = {
            id: petitionId,
            title: petitionData.title,
            description: petitionData.description,
            category: petitionData.category,
            location: petitionData.location,
            photo: URL.createObjectURL(photoFile),
            createdBy: currentUser.id,
            createdByName: currentUser.fullName,
            createdAt: new Date().toISOString(),
            status: 'pending',
            supporters: 1,
            supportersList: [currentUser.id]
        };
        
        petitions.push(newPetition);
        localStorage.setItem('petitions', JSON.stringify(petitions));
        
        hideLoading();
        showSuccessModal(petitionId);
        
        // Reset form
        e.target.reset();
        document.getElementById('photoPreview').innerHTML = '';
        
        // Update my petitions list and limit info
        updateMyPetitionsList();
        updatePetitionLimitInfo();
    }, 2000);
}

// Photo upload handling
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('photoPreview');
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Petition photo" style="max-width: 100%; max-height: 200px; border-radius: 10px;">
                <p style="margin-top: 10px; color: #666; font-size: 0.9rem;">Photo uploaded successfully</p>
            `;
        };
        reader.readAsDataURL(file);
    }
}

// GPS Location
function getCurrentLocation() {
    const btn = document.getElementById('getLocationBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
    btn.disabled = true;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Reverse geocoding (simplified)
                const location = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
                document.getElementById('location').value = location;
                
                btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Location Set';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Use Current Location';
                    btn.disabled = false;
                }, 2000);
            },
            function(error) {
                alert('Unable to get your location. Please enter manually.');
                btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Use Current Location';
                btn.disabled = false;
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
        btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Use Current Location';
        btn.disabled = false;
    }
}

// Search functionality
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('searchResults');
    
    if (!searchTerm) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>Enter a Petition ID or keywords to search</p>
            </div>
        `;
        return;
    }
    
    // Search in petitions
    const results = petitions.filter(petition => 
        petition.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        petition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        petition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        petition.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No petitions found matching "${searchTerm}"</p>
            </div>
        `;
    } else {
        resultsContainer.innerHTML = results.map(petition => createPetitionCard(petition)).join('');
    }
}

// Update my petitions list
function updateMyPetitionsList() {
    const container = document.getElementById('myPetitionsList');
    
    if (!currentUser) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Please login to view your petitions</p>
            </div>
        `;
        return;
    }
    
    const userPetitions = petitions.filter(p => p.createdBy === currentUser.id);
    
    console.log('Current user ID:', currentUser.id);
    console.log('All petitions:', petitions);
    console.log('User petitions:', userPetitions);
    
    if (userPetitions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No petitions created yet</p>
                <button class="btn-primary" onclick="showSection('create')">Create Your First Petition</button>
            </div>
        `;
    } else {
        container.innerHTML = userPetitions.map(petition => createPetitionCard(petition, true)).join('');
    }
}

// Create petition card HTML
function createPetitionCard(petition, isOwner = false) {
    const statusClass = petition.status.replace(' ', '-');
    const categoryLabels = {
        'road': 'Road & Infrastructure',
        'water': 'Water Supply',
        'electricity': 'Electricity',
        'sanitation': 'Sanitation & Garbage',
        'transport': 'Public Transport',
        'safety': 'Safety & Security',
        'other': 'Other'
    };
    
    // Format creation date
    const createdDate = new Date(petition.createdAt);
    const formattedDate = createdDate.toLocaleDateString() + ' ' + createdDate.toLocaleTimeString();
    
    return `
        <div class="petition-card">
            <div class="petition-header">
                <h3>${petition.title}</h3>
                <span class="petition-id">#${petition.id}</span>
            </div>
            <p class="petition-description">${petition.description}</p>
            <div class="petition-meta">
                <span class="category">${categoryLabels[petition.category] || petition.category}</span>
                <span class="supporters">${petition.supporters} supporters</span>
                <span class="status ${statusClass}">${petition.status}</span>
            </div>
            <div class="petition-details">
                <small style="color: #666;">
                    <i class="fas fa-map-marker-alt"></i> ${petition.location}
                </small>
                <small style="color: #666; margin-left: 15px;">
                    <i class="fas fa-calendar"></i> Created: ${formattedDate}
                </small>
            </div>
            <div class="petition-actions">
                <button class="btn-secondary" onclick="viewPetitionDetails('${petition.id}')">View Details</button>
                ${!isOwner ? `<button class="btn-primary" onclick="supportPetition('${petition.id}')">Support</button>` : ''}
            </div>
        </div>
    `;
}

// Support petition
function supportPetition(petitionId) {
    const petition = petitions.find(p => p.id === petitionId);
    if (petition && !petition.supportersList.includes(currentUser.id)) {
        petition.supporters++;
        petition.supportersList.push(currentUser.id);
        localStorage.setItem('petitions', JSON.stringify(petitions));
        
        // Update the display
        updateLocalPetitionsList();
        alert('Thank you for supporting this petition!');
    } else if (petition && petition.supportersList.includes(currentUser.id)) {
        alert('You have already supported this petition!');
    }
}

// View petition details
function viewPetitionDetails(petitionId) {
    const petition = petitions.find(p => p.id === petitionId);
    if (petition) {
        alert(`Petition Details:\n\nTitle: ${petition.title}\nDescription: ${petition.description}\nLocation: ${petition.location}\nStatus: ${petition.status}\nSupporters: ${petition.supporters}`);
    }
}

// Update local petitions list
function updateLocalPetitionsList() {
    const container = document.getElementById('localPetitionsList');
    
    if (!currentUser) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-map-marker-alt"></i>
                <p>Please login to view local petitions</p>
            </div>
        `;
        return;
    }
    
    // Filter petitions from the same locality
    const localPetitions = petitions.filter(petition => {
        // Check if petition location contains user's locality or city
        const userLocality = currentUser.locality.toLowerCase();
        const userCity = currentUser.city.toLowerCase();
        const petitionLocation = petition.location.toLowerCase();
        
        return petitionLocation.includes(userLocality) || 
               petitionLocation.includes(userCity) ||
               petition.createdBy === currentUser.id; // Include user's own petitions
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first
    
    if (localPetitions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-map-marker-alt"></i>
                <p>No petitions found in your locality (${currentUser.locality})</p>
                <button class="btn-primary" onclick="showSection('create')">Create First Petition</button>
            </div>
        `;
    } else {
        container.innerHTML = localPetitions.map(petition => createPetitionCard(petition)).join('');
    }
}

// Show success modal
function showSuccessModal(petitionId) {
    document.getElementById('petitionId').textContent = `#${petitionId}`;
    document.getElementById('successModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

// Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        showPage('welcomePage');
    }
}

// Check petition limits
function checkPetitionLimits() {
    if (!currentUser) {
        return { canCreate: false, message: 'Please login to create petitions' };
    }
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // Count petitions created by user in last 30 days
    const userPetitionsInLast30Days = petitions.filter(petition => {
        if (petition.createdBy !== currentUser.id) return false;
        const petitionDate = new Date(petition.createdAt);
        return petitionDate >= thirtyDaysAgo;
    });
    
    const maxPetitions = 2;
    
    if (userPetitionsInLast30Days.length >= maxPetitions) {
        const oldestPetition = userPetitionsInLast30Days.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
        const oldestDate = new Date(oldestPetition.createdAt);
        const daysUntilNext = Math.ceil((oldestDate.getTime() + (30 * 24 * 60 * 60 * 1000) - now.getTime()) / (24 * 60 * 60 * 1000));
        
        return {
            canCreate: false,
            message: `You have reached the limit of ${maxPetitions} petitions per 30 days. You can create a new petition in ${daysUntilNext} days.`
        };
    }
    
    return { canCreate: true, message: '' };
}

// Utility functions
function generatePetitionId() {
    const id = `PET${petitionCounter.toString().padStart(3, '0')}`;
    petitionCounter++;
    return id;
}

function validateAadhaar(aadhaar) {
    return /^[0-9]{12}$/.test(aadhaar);
}

function validatePhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

function validateOTP(otp) {
    return /^[0-9]{6}$/.test(otp);
}

function showLoading() {
    document.body.classList.add('loading');
}

function hideLoading() {
    document.body.classList.remove('loading');
}

// Load sample data
function loadSampleData() {
    if (petitions.length === 0) {
        const samplePetitions = [
            {
                id: 'PET001',
                title: 'Broken Streetlight on Park Road',
                description: 'Streetlight has been broken for 2 weeks, making the area unsafe at night.',
                category: 'road',
                location: 'Park Road, Sector 15, Gurgaon',
                photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==',
                createdBy: 'sample1',
                createdByName: 'John Doe',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                status: 'pending',
                supporters: 45,
                supportersList: []
            },
            {
                id: 'PET002',
                title: 'Garbage Collection Issues',
                description: 'Irregular garbage collection causing health hazards in Sector 15.',
                category: 'sanitation',
                location: 'Sector 15, Gurgaon',
                photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==',
                createdBy: 'sample2',
                createdByName: 'Jane Smith',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                status: 'in-progress',
                supporters: 78,
                supportersList: []
            },
            {
                id: 'PET003',
                title: 'Need for Speed Breakers',
                description: 'High-speed vehicles near school area need speed breakers for safety.',
                category: 'safety',
                location: 'Near ABC School, Sector 12, Delhi',
                photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==',
                createdBy: 'sample3',
                createdByName: 'Mike Johnson',
                createdAt: new Date(Date.now() - 259200000).toISOString(),
                status: 'resolved',
                supporters: 32,
                supportersList: []
            }
        ];
        
        petitions = samplePetitions;
        petitionCounter = 4;
        localStorage.setItem('petitions', JSON.stringify(petitions));
    }
    
    // Update displays
    updateLocalPetitionsList();
    if (currentUser) {
        updateMyPetitionsList();
        updatePetitionLimitInfo();
    }
}

// Global functions for onclick handlers
window.showSection = showSection;
window.supportPetition = supportPetition;
window.viewPetitionDetails = viewPetitionDetails;

// Debug function to clear all data (for testing)
window.clearAllData = function() {
    localStorage.clear();
    petitions = [];
    petitionCounter = 1;
    currentUser = null;
    alert('All data cleared. Please refresh the page.');
};

// Debug function to show current data
window.showDebugInfo = function() {
    console.log('Current User:', currentUser);
    console.log('All Petitions:', petitions);
    console.log('Petition Counter:', petitionCounter);
    alert('Debug info logged to console. Press F12 to view.');
};
