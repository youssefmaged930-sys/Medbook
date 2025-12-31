<?php
require_once 'config/database.php';
header('Content-Type: application/json');

$conn = getDBConnection();

$sql = "SELECT * FROM specialties";
$result = $conn->query($sql);

$specialties = [];
while ($row = $result->fetch_assoc()) {
    $specialties[] = $row;
}

echo json_encode([
    'success' => true,
    'specialties' => $specialties
]);

closeDBConnection($conn);
?>