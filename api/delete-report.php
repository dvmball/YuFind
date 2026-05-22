<?php
require_once "db.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  echo json_encode([
    "status" => "error",
    "message" => "Metode request tidak valid."
  ]);
  exit;
}

if (
  !isset($_POST["report_id"]) ||
  !isset($_POST["user_id"]) ||
  empty($_POST["report_id"]) ||
  empty($_POST["user_id"])
) {
  echo json_encode([
    "status" => "error",
    "message" => "Data tidak lengkap."
  ]);
  exit;
}

$reportId = intval($_POST["report_id"]);
$userId = intval($_POST["user_id"]);

/*
  Ambil data laporan dulu.
  Tujuannya:
  1. memastikan laporan ada
  2. memastikan laporan milik user yang sedang login
  3. mengambil path gambar kalau nanti mau ikut dihapus
*/
$checkSql = "SELECT id, user_id, gambar FROM reports WHERE id = ? AND user_id = ? LIMIT 1";
$checkStmt = $conn->prepare($checkSql);

if (!$checkStmt) {
  echo json_encode([
    "status" => "error",
    "message" => "Query pengecekan gagal."
  ]);
  exit;
}

$checkStmt->bind_param("ii", $reportId, $userId);
$checkStmt->execute();

$result = $checkStmt->get_result();

if ($result->num_rows === 0) {
  echo json_encode([
    "status" => "error",
    "message" => "Laporan tidak ditemukan atau bukan milik akun ini."
  ]);
  exit;
}

$report = $result->fetch_assoc();
$imagePath = $report["gambar"];

/*
  Hapus laporan dari database
*/
$deleteSql = "DELETE FROM reports WHERE id = ? AND user_id = ?";
$deleteStmt = $conn->prepare($deleteSql);

if (!$deleteStmt) {
  echo json_encode([
    "status" => "error",
    "message" => "Query hapus gagal."
  ]);
  exit;
}

$deleteStmt->bind_param("ii", $reportId, $userId);

if ($deleteStmt->execute()) {
  /*
    Opsional: hapus file gambar juga dari folder uploads.
    Ini aman selama path gambar tersimpan seperti:
    uploads/namafile.jpg
  */
  if (!empty($imagePath)) {
    $fullImagePath = "../" . $imagePath;

    if (file_exists($fullImagePath) && is_file($fullImagePath)) {
      unlink($fullImagePath);
    }
  }

  echo json_encode([
    "status" => "success",
    "message" => "Laporan berhasil dihapus."
  ]);
} else {
  echo json_encode([
    "status" => "error",
    "message" => "Gagal menghapus laporan."
  ]);
}