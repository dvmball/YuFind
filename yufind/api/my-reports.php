<?php
include "db.php";

$user_id = $_GET["user_id"] ?? "";

if (empty($user_id)) {
    echo json_encode([
        "status" => "error",
        "message" => "User belum login."
    ]);
    exit;
}

$query = "SELECT id, type, nama_barang, lokasi, tanggal, gambar, created_at 
          FROM reports 
          WHERE user_id = ? 
          ORDER BY created_at DESC";

$stmt = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt, "i", $user_id);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

$reports = [];

while ($row = mysqli_fetch_assoc($result)) {
    $reports[] = $row;
}

echo json_encode([
    "status" => "success",
    "data" => $reports
]);
?>