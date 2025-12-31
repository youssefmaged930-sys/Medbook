<?php
require_once 'config/database.php';
header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Please login to book appointments']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $doctorId = $data['doctorId'] ?? 0;
    $date = $data['date'] ?? '';
    $time = $data['time'] ?? '';
    $reason = $data['reason'] ?? '';
    
    $conn = getDBConnection();
    
    // Validate
    if (empty($doctorId) || empty($date) || empty($time)) {
        echo json_encode(['success' => false, 'message' => 'Please fill all required fields']);
        exit;
    }
    
    // Check if doctor exists
    $doctorStmt = $conn->prepare("SELECT name FROM doctors WHERE id = ?");
    $doctorStmt->bind_param("i", $doctorId);
    $doctorStmt->execute();
    $doctorResult = $doctorStmt->get_result();
    
    if ($doctorResult->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Doctor not found']);
        exit;
    }
    
    // Check for conflicting appointments
    $checkStmt = $conn->prepare("SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?");
    $checkStmt->bind_param("iss", $doctorId, $date, $time);
    $checkStmt->execute();
    
    if ($checkStmt->get_result()->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Time slot already booked']);
        exit;
    }
    
    // Book appointment
    $stmt = $conn->prepare("INSERT INTO appointments (user_id, doctor_id, appointment_date, appointment_time, reason) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("iisss", $_SESSION['user_id'], $doctorId, $date, $time, $reason);
    
    if ($stmt->execute()) {
        // Get doctor name for response
        $doctor = $doctorResult->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'message' => 'Appointment booked successfully',
            'appointment' => [
                'id' => $stmt->insert_id,
                'doctorName' => $doctor['name'],
                'date' => $date,
                'time' => $time
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to book appointment']);
    }
    
    closeDBConnection($conn);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>