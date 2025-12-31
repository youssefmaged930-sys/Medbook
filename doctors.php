<?php
require_once 'config/database.php';
header('Content-Type: application/json');

$conn = getDBConnection();

// Get filter parameters
$specialty = isset($_GET['specialty']) ? $_GET['specialty'] : '';
$location = isset($_GET['location']) ? $_GET['location'] : '';
$availability = isset($_GET['availability']) ? $_GET['availability'] : '';
$search = isset($_GET['search']) ? $_GET['search'] : '';

// Build query
$sql = "SELECT * FROM doctors WHERE 1=1";
$params = [];
$types = "";

if (!empty($specialty)) {
    $sql .= " AND specialty LIKE ?";
    $params[] = "%$specialty%";
    $types .= "s";
}

if (!empty($location)) {
    $sql .= " AND location LIKE ?";
    $params[] = "%$location%";
    $types .= "s";
}

if (!empty($search)) {
    $sql .= " AND (name LIKE ? OR specialty LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $types .= "ss";
}

$stmt = $conn->prepare($sql);

if ($params) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$doctors = [];
while ($row = $result->fetch_assoc()) {
    $doctors[] = $row;
}

echo json_encode([
    'success' => true,
    'count' => count($doctors),
    'doctors' => $doctors
]);

closeDBConnection($conn);
?>