<?php
require_once 'config/database.php';
header('Content-Type: application/json');

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$conn = getDBConnection();

$sql = "SELECT a.*, d.name as doctor_name, d.specialty 
        FROM appointments a 
        JOIN doctors d ON a.doctor_id = d.id 
        WHERE a.user_id = ? 
        ORDER BY a.appointment_date DESC, a.appointment_time DESC";
        
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

$appointments = [];
while ($row = $result->fetch_assoc()) {
    $appointments[] = $row;
}

echo json_encode([
    'success' => true,
    'appointments' => $appointments
]);

closeDBConnection($conn);
?>