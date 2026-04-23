// ================= REPORT FORM =================
function handleReportForm() {
  const title = document.getElementById("form-title");
  if (!title) return; // biar gak error di halaman lain

  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");

  const jenisInput = document.getElementById("jenis");
  const jenisDisplay = document.getElementById("jenisDisplay");

  if (type === "found") {
    title.innerText = "Form Penemuan";
    jenisInput.value = "found";
    jenisDisplay.value = "found";
  } else {
    title.innerText = "Form Kehilangan";
    jenisInput.value = "lost";
    jenisDisplay.value = "lost";
  }
}

// jalankan
handleReportForm();
