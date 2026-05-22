<?php
require_once "db.php";

header("Content-Type: application/json");

if (!isset($_GET["id"]) || empty($_GET["id"])) {
  echo json_encode([
    "status" => "error",
    "message" => "ID laporan tidak ditemukan."
  ]);
  exit;
}

$id = intval($_GET["id"]);

$sql = "SELECT 
          id,
          user_id,
          type,
          nama_barang,
          deskripsi,
          lokasi,
          tanggal,
          gambar,
          kontak
        FROM reports
        WHERE id = ?
        LIMIT 1";

$stmt = $conn->prepare($sql);

if (!$stmt) {
  echo json_encode([
    "status" => "error",
    "message" => "Query gagal disiapkan."
  ]);
  exit;
}

$stmt->bind_param("i", $id);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
  echo json_encode([
    "status" => "error",
    "message" => "Laporan tidak ditemukan."
  ]);
  exit;
}

$data = $result->fetch_assoc();

echo json_encode([
  "status" => "success",
  "data" => $data
]);