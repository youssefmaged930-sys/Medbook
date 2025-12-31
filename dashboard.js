// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('medbook_user'));
    if (!user || !user.isLoggedIn) {
        showNotification('Please log in to access dashboard', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // Update welcome message
    const welcomeElement = document.getElementById('userWelcome');
    if (welcomeElement) {
        welcomeElement.textContent = `Welcome, ${user.name}`;
    }
    
    // Load appointments from localStorage
    loadAppointments();
    
    // Setup logout button
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
    
    // Setup quick action buttons
    const bookNewBtn = document.getElementById('bookNewBtn');
    if (bookNewBtn) {
        bookNewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'find-doctor.html';
        });
    }
});

function loadAppointments() {
    const allAppointments = JSON.parse(localStorage.getItem('medbook_appointments') || '[]');
    const user = JSON.parse(localStorage.getItem('medbook_user') || 'null');

    // Only show appointments for the logged-in user
    const appointments = allAppointments.filter(a => user && a.userId && a.userId === user.id);
    renderAppointments(appointments);
    updateStats(appointments);
}

function renderAppointments(appointments) {
    const tableBody = document.getElementById('appointmentsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (appointments.length === 0) {
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
        return;
    }
    
    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        
        // Format date
        const appointmentDate = new Date(appointment.date);
        const formattedDate = appointmentDate.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Status badge
        let statusClass = '';
        switch(appointment.status) {
            case 'confirmed': statusClass = 'status-confirmed'; break;
            case 'pending': statusClass = 'status-pending'; break;
            case 'cancelled': statusClass = 'status-cancelled'; break;
            case 'completed': statusClass = 'status-completed'; break;
        }
        
        row.innerHTML = `
            <td>${appointment.doctorName}</td>
            <td>${appointment.specialty}</td>
            <td>${formattedDate}</td>
            <td>${appointment.time}</td>
            <td><span class="status-badge ${statusClass}">${appointment.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline view-details-btn">
                    Details
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function updateStats(appointments) {
    const total = appointments.length;
    const upcoming = appointments.filter(a => 
        new Date(a.date) >= new Date() && 
        a.status !== 'cancelled' && 
        a.status !== 'completed'
    ).length;
    
    const completed = appointments.filter(a => 
        a.status === 'completed'
    ).length;
    
    const totalElement = document.getElementById('totalAppointments');
    const upcomingElement = document.getElementById('upcomingAppointments');
    const completedElement = document.getElementById('completedAppointments');
    
    if (totalElement) totalElement.textContent = total;
    if (upcomingElement) upcomingElement.textContent = upcoming;
    if (completedElement) completedElement.textContent = completed;
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
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
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
