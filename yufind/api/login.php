<?php
include "db.php";

$nim = $_POST['nim'];
$password = $_POST['password'];

// validasi NIM
if (!preg_match('/^\d{12}$/', $nim)) {
    echo "NIM harus 12 digit angka";
    exit;
}

// ambil user
$result = $conn->query("SELECT * FROM users WHERE nim='$nim'");

if ($result->num_rows === 0) {
    echo "User tidak ditemukan";
    exit;
}

$user = $result->fetch_assoc();

// cek password
if (password_verify($password, $user['password'])) {
    echo json_encode([
        "status" => "success",
        "user_id" => $user['id'],
        "nama" => $user['nama']
    ]);
} else {
    echo "Password salah";
}
?>