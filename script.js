// Medbook - Medical Appointment Booking System
// JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page-specific functionality
    initPage();
    
    // Common functionality for all pages
    initCommonFeatures();
});

function initPage() {
    // Get current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Initialize page-specific features
    switch(currentPage) {
        case 'index.html':
        case '':
            initHomePage();
            break;
        case 'find-doctor.html':
            initFindDoctorPage();
            break;
        case 'specialties.html':
            initSpecialtiesPage();
            break;
        case 'about.html':
            initAboutPage();
            break;
        case 'login.html':
            initLoginPage();
            break;
        case 'signup.html':
            initSignupPage();
            break;
        case 'dashboard.html':
            initDashboardPage();
            break;
    }
}

function initCommonFeatures() {
    // Navigation active state
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if ((currentPage === '' || currentPage === 'index.html') && linkHref === 'index.html') {
            link.classList.add('active');
        } else if (linkHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Auth buttons active state
    const authButtons = document.querySelectorAll('.auth-buttons a');
    authButtons.forEach(button => {
        const buttonHref = button.getAttribute('href');
        if (buttonHref === currentPage) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Check if user is logged in and update header
    updateHeaderForLoggedInUser();
}

function updateHeaderForLoggedInUser() {
    const user = JSON.parse(localStorage.getItem('medbook_user') || 'null');
    const authButtonsContainer = document.querySelector('.auth-buttons');
    
    if (user && user.isLoggedIn && authButtonsContainer) {
        // Replace auth buttons with user menu
        authButtonsContainer.innerHTML = `
            <a href="dashboard.html" class="btn btn-outline">
                <i class="fas fa-user"></i> ${user.name.split(' ')[0]}
            </a>
            <button id="headerLogoutBtn" class="btn btn-primary">Log Out</button>
        `;
        
        // Add logout functionality
        document.getElementById('headerLogoutBtn').addEventListener('click', function() {
            localStorage.removeItem('medbook_user');
            showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
}

function initHomePage() {
    // Search functionality - Add to index.html first
    const searchBtn = document.querySelector('#searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleHomeSearch);
    }
    
    // Get Started button
    const getStartedBtn = document.querySelector('#getStartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            window.location.href = 'signup.html';
        });
    }
    
    // Specialty cards
    const specialtyCards = document.querySelectorAll('.specialty-card');
    specialtyCards.forEach(card => {
        card.addEventListener('click', function() {
            const specialtyName = this.querySelector('h3').textContent;
            showNotification(`Searching for ${specialtyName} specialists...`, 'info');
            setTimeout(() => {
                window.location.href = `find-doctor.html?specialty=${encodeURIComponent(specialtyName.toLowerCase())}`;
            }, 1000);
        });
    });
}

function handleHomeSearch() {
    const searchInput = document.querySelector('#searchInput');
    const locationSelect = document.querySelector('#locationSelect');
    const specialtySelect = document.querySelector('#specialtySelect');
    
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    const location = locationSelect ? locationSelect.value : '';
    const specialty = specialtySelect ? specialtySelect.value : '';
    
    if (!searchTerm && !location && !specialty) {
        showNotification('Please enter search criteria to find doctors.', 'warning');
    } else {
        showNotification('Searching for doctors...', 'info');
        setTimeout(() => {
            let url = 'find-doctor.html?';
            if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
            if (location) url += `location=${location}&`;
            if (specialty) url += `specialty=${specialty}&`;
            window.location.href = url.slice(0, -1); // Remove last &
        }, 1000);
    }
}

function initFindDoctorPage() {
    // Filter helpers
    const doctorsGrid = document.querySelector('.doctors-grid');
    const specialtyFilter = document.getElementById('specialtyFilter');
    const locationFilter = document.getElementById('locationFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');

    const normalize = str => (str || '').toString().trim().toLowerCase();

    const specialtyMap = {
        cardiology: ['cardiologist','cardiology'],
        dentistry: ['dentist','dentistry','dental'],
        dermatology: ['dermatologist','dermatology'],
        neurology: ['neurologist','neurology'],
        pediatrics: ['pediatrician','pediatrics'],
        orthopedics: ['orthopedist','orthopedics','orthopedic'],
        ophthalmology: ['ophthalmologist','ophthalmology'],
        pulmonology: ['pulmonologist','pulmonology'],
        allergy: ['allergist','allergy','immunology']
    };

    function matchesSpecialty(cardSpecialty, param) {
        if (!param) return true;
        const p = normalize(param).replace(/-/g, ' ');
        const text = normalize(cardSpecialty);
        if (text.includes(p) || p.includes(text)) return true;
        const variants = specialtyMap[p];
        if (variants) return variants.some(v => text.includes(v));
        return text.includes(p.replace(/y$/,'ist')) || text.includes(p.replace(/s$/,''));
    }

    function matchesLocation(cardLocation, param) {
        if (!param) return true;
        const p = normalize(param).replace(/-/g, ' ');
        const text = normalize(cardLocation);
        return text.includes(p) || p.includes(text);
    }

    function matchesSearch(cardName, cardSpecialty, param) {
        if (!param) return true;
        const p = normalize(param);
        return normalize(cardName).includes(p) || normalize(cardSpecialty).includes(p);
    }

    function applyFiltersFrom({specialtyParam, locationParam, searchParam}) {
        const cards = document.querySelectorAll('.doctor-card');
        let visibleCount = 0;
        cards.forEach(card => {
            const cardSpecialty = card.querySelector('.specialty') ? card.querySelector('.specialty').textContent : '';
            const cardLocation = card.querySelector('.location') ? card.querySelector('.location').textContent : '';
            const cardName = card.querySelector('h3') ? card.querySelector('h3').textContent : '';

            const okSpecialty = matchesSpecialty(cardSpecialty, specialtyParam);
            const okLocation = matchesLocation(cardLocation, locationParam);
            const okSearch = matchesSearch(cardName, cardSpecialty, searchParam);

            if (okSpecialty && okLocation && okSearch) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Manage no-results message
        let noMsg = doctorsGrid.querySelector('.no-results');
        if (!noMsg) {
            noMsg = document.createElement('div');
            noMsg.className = 'no-results';
            noMsg.style.padding = '20px';
            noMsg.style.textAlign = 'center';
            noMsg.style.color = '#666';
            doctorsGrid.appendChild(noMsg);
        }
        noMsg.textContent = visibleCount ? '' : 'No doctors found matching your criteria.';
    }

    // Apply Filters button behavior
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            const specialtyVal = specialtyFilter ? specialtyFilter.value : '';
            const locationVal = locationFilter ? locationFilter.value : '';
            const availabilityVal = availabilityFilter ? availabilityFilter.value : '';
            applyFiltersFrom({specialtyParam: specialtyVal, locationParam: locationVal, searchParam: ''});
            showNotification('Filters applied!', 'info');
        });
    }

    // Book appointment buttons
    const bookButtons = document.querySelectorAll('.doctor-card .btn-primary');
    bookButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            handleBookAppointment(this);
        });
    });

    // Check for URL parameters and apply initial filters
    const urlParams = new URLSearchParams(window.location.search);
    const specialtyParam = urlParams.get('specialty');
    const searchParam = urlParams.get('search');
    const locationParam = urlParams.get('location');

    if (specialtyParam || searchParam || locationParam) {
        showNotification('Searching for doctors with your criteria...', 'info');
        if (specialtyParam && specialtyFilter) specialtyFilter.value = specialtyParam;
        if (locationParam && locationFilter) locationFilter.value = locationParam;
        applyFiltersFrom({specialtyParam, locationParam, searchParam});
    }
}

function handleBookAppointment(button) {
    // Check if user is logged in (simplified for Phase I)
    const isLoggedIn = localStorage.getItem('medbook_user');
    
    if (!isLoggedIn) {
        showNotification('Please log in to book an appointment', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // Get doctor info from the card
    const card = button.closest('.doctor-card');
    const doctorName = card.querySelector('h3').textContent;
    const specialty = card.querySelector('.specialty').textContent;
    
    showBookingModal(doctorName, specialty);
}

function showBookingModal(doctorName, specialty) {
    // Create modal HTML
    const modalHTML = `
        <div class="modal-overlay" id="bookingModal">
            <div class="modal">
                <div class="modal-header">
                    <h3>Book Appointment with ${doctorName}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Specialty:</strong> ${specialty}</p>
                    <form id="bookingForm">
                        <div class="form-group">
                            <label for="appointmentDate">Date</label>
                            <input type="date" id="appointmentDate" required>
                        </div>
                        <div class="form-group">
                            <label for="appointmentTime">Preferred Time</label>
                            <select id="appointmentTime" required>
                                <option value="">Select Time</option>
                                <option value="09:00">9:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="15:00">3:00 PM</option>
                                <option value="16:00">4:00 PM</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="reason">Reason for Visit (Optional)</label>
                            <textarea id="reason" rows="3" placeholder="Briefly describe your symptoms or reason for visit"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">Book Appointment</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add modal styles
    addModalStyles();
    
    // Setup form submission
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const date = document.getElementById('appointmentDate').value;
        const time = document.getElementById('appointmentTime').value;
        const reason = document.getElementById('reason').value;
        
        if (!date || !time) {
            showNotification('Please select date and time', 'warning');
            return;
        }
        
        // Store in localStorage for dashboard FIRST
        // Attach the appointment to the currently logged-in user
        const currentUser = JSON.parse(localStorage.getItem('medbook_user') || 'null');
        if (!currentUser || !currentUser.isLoggedIn) {
            showNotification('Please log in to book an appointment', 'warning');
            return;
        }

        const appointment = {
            id: Date.now(),
            userId: currentUser.id,
            doctorName: doctorName,
            specialty: specialty,
            date: date,
            time: time,
            reason: reason,
            status: 'confirmed'
        };
        
        let appointments = JSON.parse(localStorage.getItem('medbook_appointments') || '[]');
        appointments.push(appointment);
        localStorage.setItem('medbook_appointments', JSON.stringify(appointments));
        
        // Close modal and show success message
        closeModal();
        showNotification('Appointment booked successfully! You will receive a confirmation email.', 'success');
        
        // Optionally redirect to dashboard after a delay
        setTimeout(() => {
            if (confirm('Would you like to view your appointments in the dashboard?')) {
                window.location.href = 'dashboard.html';
            }
        }, 2000);
    });
    
    // Setup close button
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.querySelector('.modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
}

function addModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .modal {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            margin: 0;
            color: #343a40;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6c757d;
            line-height: 1;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .modal-body p {
            margin-bottom: 20px;
        }
        
        #bookingForm textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            font-family: inherit;
            resize: vertical;
        }
    `;
    document.head.appendChild(style);
}

function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.remove();
    }
}

function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim().toLowerCase();
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                showNotification('Please fill in all fields', 'warning');
                return;
            }
            
            // Get registered users from localStorage
            const registeredUsers = JSON.parse(localStorage.getItem('medbook_registered_users') || '[]');
            
            // Find user by email
            const user = registeredUsers.find(u => u.email.toLowerCase() === email);
            
            if (!user) {
                showNotification('User not found. Please sign up first.', 'error');
                return;
            }
            
            // Verify password
            if (user.password !== password) {
                showNotification('Invalid password. Please try again.', 'error');
                return;
            }
            
            showNotification('Login successful! Redirecting...', 'success');
            
            // Store logged in user data in localStorage
            const loggedInUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isLoggedIn: true
            };
            localStorage.setItem('medbook_user', JSON.stringify(loggedInUser));
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        });
    }
    
    // Social login buttons
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('btn-google') ? 'Google' : 'Facebook';
            showNotification(`Note: ${provider} authentication would be implemented in production`, 'info');
        });
    });
}

function initSignupPage() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim().toLowerCase();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.querySelector('input[name="terms"]').checked;
            
            // Validation
            if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
                showNotification('Please fill in all fields', 'warning');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'warning');
                return;
            }
            
            if (!terms) {
                showNotification('Please agree to the Terms of Service and Privacy Policy', 'warning');
                return;
            }
            
            if (password.length < 8) {
                showNotification('Password must be at least 8 characters long', 'warning');
                return;
            }
            
            // Check if email already exists
            const registeredUsers = JSON.parse(localStorage.getItem('medbook_registered_users') || '[]');
            const existingUser = registeredUsers.find(u => u.email.toLowerCase() === email);
            
            if (existingUser) {
                showNotification('An account with this email already exists. Please log in.', 'error');
                return;
            }
            
            showNotification('Creating your account...', 'info');
            
            // Simulate signup process
            setTimeout(() => {
                // Create user object with password for storage
                const newUser = {
                    id: Date.now(),
                    name: `${firstName} ${lastName}`,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phone: phone,
                    password: password,  // In production, this should be hashed
                    createdAt: new Date().toISOString()
                };
                
                // Add to registered users list
                registeredUsers.push(newUser);
                localStorage.setItem('medbook_registered_users', JSON.stringify(registeredUsers));
                
                // Auto-login the new user
                const loggedInUser = {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    isLoggedIn: true
                };
                localStorage.setItem('medbook_user', JSON.stringify(loggedInUser));
                
                showNotification('Account created successfully! Redirecting to dashboard...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }, 1500);
        });
    }
    
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strengthBar = document.querySelector('.strength-bar');
            const strengthText = document.querySelector('.strength-text');
            
            let strength = 0;
            let color = '#de1d31'; // danger
            
            if (password.length >= 8) strength += 25;
            if (/[A-Z]/.test(password)) strength += 25;
            if (/[0-9]/.test(password)) strength += 25;
            if (/[^A-Za-z0-9]/.test(password)) strength += 25;
            
            if (strength <= 25) {
                color = '#de1d31';
                strengthText.textContent = 'Weak';
            } else if (strength <= 50) {
                color = '#ffc107';
                strengthText.textContent = 'Fair';
            } else if (strength <= 75) {
                color = '#ffa500';
                strengthText.textContent = 'Good';
            } else {
                color = '#28a745';
                strengthText.textContent = 'Strong';
            }
            
            strengthBar.style.width = `${strength}%`;
            strengthBar.style.backgroundColor = color;
        });
    }
    
    // Social signup buttons
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('btn-google') ? 'Google' : 'Facebook';
            showNotification(`Note: ${provider} signup would be implemented in production`, 'info');
        });
    });
}

function initSpecialtiesPage() {
    // Specialty detail cards
    const specialtyCards = document.querySelectorAll('.specialty-detail-card .btn');
    specialtyCards.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.specialty-detail-card');
            const specialtyName = card.querySelector('h3').textContent;
            showNotification(`Finding ${specialtyName} specialists...`, 'info');
            
            setTimeout(() => {
                window.location.href = `find-doctor.html?specialty=${encodeURIComponent(specialtyName.toLowerCase())}`;
            }, 1000);
        });
    });
}

function initAboutPage() {
    // No specific functionality needed for about page
}

function initDashboardPage() {
    // Check login
    const user = JSON.parse(localStorage.getItem('medbook_user') || 'null');
    if (!user || !user.isLoggedIn) {
        showNotification('Please log in to access dashboard', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // Display user name
    const welcomeElement = document.getElementById('userWelcome');
    if (welcomeElement) {
        welcomeElement.textContent = `Welcome, ${user.name}`;
    }
    
    // Load appointments
    loadDashboardAppointments();
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('medbook_user');
            showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
}

function loadDashboardAppointments() {
    const allAppointments = JSON.parse(localStorage.getItem('medbook_appointments') || '[]');
    const user = JSON.parse(localStorage.getItem('medbook_user') || 'null');

    // Only show appointments for the current user
    const appointments = allAppointments.filter(apt => user && apt.userId && apt.userId === user.id);
    
    // Update stats
    document.getElementById('totalAppointments').textContent = appointments.length;
    
    const upcoming = appointments.filter(apt => 
        new Date(apt.date) >= new Date() && apt.status !== 'cancelled'
    ).length;
    document.getElementById('upcomingAppointments').textContent = upcoming;
    
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    document.getElementById('completedAppointments').textContent = completed;
    
    // Populate table
    const tableBody = document.getElementById('appointmentsTableBody');
    if (tableBody && appointments.length > 0) {
        tableBody.innerHTML = appointments.map(appointment => `
            <tr>
                <td>${appointment.doctorName}</td>
                <td>${appointment.specialty}</td>
                <td>${formatDate(appointment.date)}</td>
                <td>${appointment.time}</td>
                <td><span class="status-badge status-${appointment.status}">${appointment.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline">Details</button>
                </td>
            </tr>
        `).join('');
    } else if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-calendar-times" style="font-size: 3rem; color: #6c757d; margin-bottom: 15px;"></i>
                    <p>No appointments found</p>
                    <a href="find-doctor.html" class="btn btn-primary" style="margin-top: 10px;">
                        Book Your First Appointment
                    </a>
                </td>
            </tr>
        `;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '8px';
    notification.style.color = 'white';
    notification.style.fontWeight = '600';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    notification.style.transition = 'all 0.3s ease';
    
    // Set background color based on type
    switch(type) {
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            break;
        case 'info':
            notification.style.backgroundColor = '#9e2cb8';
            break;
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#de1d31';
            break;
        default:
            notification.style.backgroundColor = '#9e2cb8';
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}