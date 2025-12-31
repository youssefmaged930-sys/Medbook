// API Configuration
const API_BASE = '';  // Changed from 'api/' to empty


// AJAX Helper Function
function apiRequest(endpoint, method = 'GET', data = null) {
    return $.ajax({
        url: endpoint,  // Removed API_BASE prefix
        method: method,
        data: method === 'GET' ? data : JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json'
    });
}

// Doctor API Functions
const DoctorAPI = {
    getAll: function(filters = {}) {
        return apiRequest('doctors.php', 'GET', filters);
    },
    
    getBySpecialty: function(specialty) {
        return this.getAll({ specialty: specialty });
    },
    
    search: function(query) {
        return this.getAll({ search: query });
    }
};

// Specialty API Functions
const SpecialtyAPI = {
    getAll: function() {
        return apiRequest('specialties.php');
    }
};

// Auth API Functions
const AuthAPI = {
    login: function(email, password) {
        return apiRequest('login.php', 'POST', { email, password });
    },
    
    register: function(userData) {
        return apiRequest('register.php', 'POST', userData);
    },
    
    logout: function() {
        // Clear session data
        localStorage.removeItem('user');
        document.cookie = "PHPSESSID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = 'index.html';
    },
    
    isLoggedIn: function() {
        return localStorage.getItem('user') !== null;
    },
    
    getCurrentUser: function() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

// Appointment API Functions
const AppointmentAPI = {
    book: function(doctorId, date, time, reason = '') {
        return apiRequest('book-appointment.php', 'POST', {
            doctorId,
            date,
            time,
            reason
        });
    },
    
    getUserAppointments: function() {
        return apiRequest('user-appointments.php');
    }
};

// Global API object
window.MedbookAPI = {
    doctors: DoctorAPI,
    specialties: SpecialtyAPI,
    auth: AuthAPI,
    appointments: AppointmentAPI
};