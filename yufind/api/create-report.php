<?php
include "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo "Method tidak diizinkan.";
    exit;
}

$user_id = $_POST["user_id"] ?? "";
$type = $_POST["type"] ?? "";
$nama_barang = $_POST["nama_barang"] ?? "";
$deskripsi = $_POST["deskripsi"] ?? "";
$lokasi = $_POST["lokasi"] ?? "";
$tanggal = $_POST["tanggal"] ?? "";
$kontak = $_POST["kontak"] ?? "";

if (
    empty($user_id) ||
    empty($type) ||
    empty($nama_barang) ||
    empty($deskripsi) ||
    empty($lokasi) ||
    empty($tanggal) ||
    empty($kontak)
) {
    echo "Semua field wajib diisi.";
    exit;
}

if ($type !== "lost" && $type !== "found") {
    echo "Jenis laporan tidak valid.";
    exit;
}

$gambar = null;

if (isset($_FILES["gambar"]) && $_FILES["gambar"]["error"] === UPLOAD_ERR_OK) {
    $uploadDir = "../uploads/";

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileTmp = $_FILES["gambar"]["tmp_name"];
    $fileName = $_FILES["gambar"]["name"];
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    $allowedExt = ["jpg", "jpeg", "png", "webp"];

    if (!in_array($fileExt, $allowedExt)) {
        echo "Format gambar harus JPG, JPEG, PNG, atau WEBP.";
        exit;
    }

    $newFileName = "report_" . time() . "_" . rand(1000, 9999) . "." . $fileExt;
    $targetPath = $uploadDir . $newFileName;

    if (move_uploaded_file($fileTmp, $targetPath)) {
        $gambar = "uploads/" . $newFileName;
    } else {
        echo "Gagal upload gambar.";
        exit;
    }
}

$query = "INSERT INTO reports 
(user_id, type, nama_barang, deskripsi, lokasi, tanggal, gambar, kontak) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = mysqli_prepare($conn, $query);

if (!$stmt) {
    echo "Query gagal disiapkan.";
    exit;
}

mysqli_stmt_bind_param(
    $stmt,
    "isssssss",
    $user_id,
    $type,
    $nama_barang,
    $deskripsi,
    $lokasi,
    $tanggal,
    $gambar,
    $kontak
);

if (mysqli_stmt_execute($stmt)) {
    echo "success";
} else {
    echo "Gagal menyimpan laporan.";
}
?>