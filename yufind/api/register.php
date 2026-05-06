<?php
include "db.php";

$nama = $_POST['nama'];
$nim = $_POST['nim'];
$jurusan = $_POST['jurusan'];
$password = $_POST['password'];

// validasi NIM (12 digit angka)
if (!preg_match('/^\d{12}$/', $nim)) {
    echo "NIM harus 12 digit angka";
    exit;
}

// hash password
$hashed = password_hash($password, PASSWORD_DEFAULT);

// cek nim sudah ada
$check = $conn->query("SELECT * FROM users WHERE nim='$nim'");
if ($check->num_rows > 0) {
    echo "NIM sudah terdaftar";
    exit;
}

// insert ke database
$sql = "INSERT INTO users (nama, nim, jurusan, password)
        VALUES ('$nama', '$nim', '$jurusan', '$hashed')";

if ($conn->query($sql)) {
    echo "success";
} else {
    echo "error";
}
?>