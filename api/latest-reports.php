<?php
require_once "db.php";

header("Content-Type: application/json");

function getLatestReports($conn, $type) {
  $sql = "SELECT 
            id,
            type,
            nama_barang,
            lokasi,
            tanggal,
            gambar
          FROM reports
          WHERE type = ?
          ORDER BY tanggal DESC, id DESC
          LIMIT 3";

  $stmt = $conn->prepare($sql);

  if (!$stmt) {
    return [];
  }

  $stmt->bind_param("s", $type);
  $stmt->execute();

  $result = $stmt->get_result();
  $data = [];

  while ($row = $result->fetch_assoc()) {
    $data[] = $row;
  }

  return $data;
}

$lostReports = getLatestReports($conn, "lost");
$foundReports = getLatestReports($conn, "found");

echo json_encode([
  "status" => "success",
  "data" => [
    "lost" => $lostReports,
    "found" => $foundReports
  ]
]);