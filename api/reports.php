<?php
require_once "db.php";

header("Content-Type: application/json");

$keyword = isset($_GET["keyword"]) ? trim($_GET["keyword"]) : "";
$kategori = isset($_GET["kategori"]) ? trim($_GET["kategori"]) : "";
$lokasi = isset($_GET["lokasi"]) ? trim($_GET["lokasi"]) : "";
$sort = isset($_GET["sort"]) ? trim($_GET["sort"]) : "newest";

/*
  Mapping ini penting karena di index.html value lokasi kamu masih:
  uud, nkri, bti, nusantara, parkiran, others

  Sedangkan di database kemungkinan tersimpan:
  Gedung UUD 1945, Gedung NKRI, dst.
*/
$lokasiMap = [
  "uud" => "Gedung UUD 1945",
  "nkri" => "Gedung NKRI",
  "bti" => "Gedung BTI",
  "nusantara" => "Gedung Nusantara",
  "parkiran" => "Parkiran",
  "others" => "Area Lain"
];

if (array_key_exists($lokasi, $lokasiMap)) {
  $lokasi = $lokasiMap[$lokasi];
}

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
        WHERE 1=1";

$params = [];
$types = "";

// filter keyword
if ($keyword !== "") {
  $sql .= " AND (
              nama_barang LIKE ?
              OR deskripsi LIKE ?
              OR lokasi LIKE ?
            )";

  $searchKeyword = "%" . $keyword . "%";
  $params[] = $searchKeyword;
  $params[] = $searchKeyword;
  $params[] = $searchKeyword;
  $types .= "sss";
}

// filter kategori
if ($kategori === "lost" || $kategori === "found") {
  $sql .= " AND type = ?";
  $params[] = $kategori;
  $types .= "s";
}

// filter lokasi
if ($lokasi !== "") {
  $sql .= " AND lokasi = ?";
  $params[] = $lokasi;
  $types .= "s";
}

// sort
if ($sort === "oldest") {
  $sql .= " ORDER BY tanggal ASC, id ASC";
} else {
  $sql .= " ORDER BY tanggal DESC, id DESC";
}

$stmt = $conn->prepare($sql);

if (!$stmt) {
  echo json_encode([
    "status" => "error",
    "message" => "Query gagal disiapkan."
  ]);
  exit;
}

if (!empty($params)) {
  $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$data = [];

while ($row = $result->fetch_assoc()) {
  $data[] = $row;
}

echo json_encode([
  "status" => "success",
  "data" => $data
]);