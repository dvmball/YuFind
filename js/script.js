// ================= HELPER PATH =================
function isInsidePages() {
  return window.location.pathname.includes("/pages/");
}

function toRootPath(path) {
  return isInsidePages() ? `../${path}` : path;
}

// ================= REPORT FORM =================
function handleReportForm() {
  const title = document.getElementById("form-title");
  if (!title) return;

  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") === "found" ? "found" : "lost";

  const jenisInput = document.getElementById("reportType");
  const jenisDisplay = document.getElementById("jenisDisplay");

  title.innerText = type === "found" ? "Form Penemuan" : "Form Kehilangan";

  if (jenisInput) jenisInput.value = type;
  if (jenisDisplay) jenisDisplay.value = type;
}

// ================= REGISTER =================
function handleRegister() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const message = document.getElementById("registerMessage");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const nim = formData.get("nim");

    if (!/^\d{12}$/.test(nim)) {
      message.style.color = "red";
      message.innerText = "NIM harus 12 digit angka!";
      return;
    }

    try {
      const res = await fetch("../api/register.php", {
        method: "POST",
        body: formData,
      });

      const result = await res.text();

      if (result.trim() === "success") {
        message.style.color = "green";
        message.innerText = "Berhasil daftar! Redirect ke login...";

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);
      } else {
        message.style.color = "red";
        message.innerText = result;
      }
    } catch (error) {
      message.style.color = "red";
      message.innerText = "Gagal terhubung ke server.";
    }
  });
}

// ================= LOGIN =================
function handleLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const message = document.getElementById("loginMessage");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const nim = formData.get("nim");

    if (!/^\d{12}$/.test(nim)) {
      message.style.color = "red";
      message.innerText = "NIM harus 12 digit angka!";
      return;
    }

    try {
      const res = await fetch("../api/login.php", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();

      try {
        const data = JSON.parse(text);

        if (data.status === "success") {
          localStorage.setItem("user_id", data.user_id);
          localStorage.setItem("nama", data.nama);

          window.location.href = "../index.html";
        } else {
          message.style.color = "red";
          message.innerText = data.message || "Login gagal.";
        }
      } catch {
        message.style.color = "red";
        message.innerText = text;
      }
    } catch (error) {
      message.style.color = "red";
      message.innerText = "Gagal terhubung ke server.";
    }
  });
}

// ================= NAVBAR PATH FIX =================
function fixNavbarPaths() {
  const linkElements = document.querySelectorAll("[data-link-root]");
  const imageElements = document.querySelectorAll("[data-src-root]");

  linkElements.forEach((el) => {
    const path = el.getAttribute("data-link-root");
    el.setAttribute("href", toRootPath(path));
  });

  imageElements.forEach((el) => {
    const path = el.getAttribute("data-src-root");
    el.setAttribute("src", toRootPath(path));
  });
}

// ================= NAVBAR USER =================
function handleNavbarUser() {
  const nama = localStorage.getItem("nama");
  const navUser = document.getElementById("navUser");

  if (!navUser) return;

  if (!nama) {
    navUser.innerText = "Login";
    navUser.href = toRootPath("pages/login.html");
    return;
  }

  const firstName = nama.split(" ")[0];

  navUser.innerText = firstName;
  navUser.href = "#";

  navUser.addEventListener("click", function (e) {
    e.preventDefault();

    const yakinLogout = confirm("Yakin mau logout?");

    if (yakinLogout) {
      localStorage.clear();
      window.location.href = toRootPath("index.html");
    }
  });
}

// ================= LOAD NAVBAR =================
function loadNavbar() {
  const container = document.getElementById("navbar-container");
  if (!container) return;

  const navbarPath = toRootPath("components/navbar.html");

  fetch(navbarPath)
    .then((res) => {
      if (!res.ok) throw new Error("Navbar tidak ditemukan.");
      return res.text();
    })
    .then((data) => {
      container.innerHTML = data;
      fixNavbarPaths();
      handleNavbarUser();
    })
    .catch(() => {
      container.innerHTML = "<p style='color:red'>Navbar gagal dimuat.</p>";
    });
}

// ================= SEARCH =================
function handleSearch() {
  const btnCari = document.getElementById("btnCari");
  if (!btnCari) return;

  btnCari.addEventListener("click", function () {
    const keyword = document.getElementById("keyword").value;
    const kategori = document.getElementById("kategori").value;
    const lokasi = document.getElementById("lokasi").value;

    const params = new URLSearchParams();

    if (keyword) params.append("keyword", keyword);
    if (kategori) params.append("kategori", kategori);
    if (lokasi) params.append("lokasi", lokasi);

    window.location.href = `pages/reports.html?${params.toString()}`;
  });
}

// ================= SUBMIT REPORT =================
function handleSubmitReport() {
  const form = document.getElementById("reportForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const userId = localStorage.getItem("user_id");

    if (!userId) {
      alert("Kamu harus login dulu sebelum membuat laporan.");
      window.location.href = "login.html";
      return;
    }

    const formData = new FormData(form);
    formData.append("user_id", userId);

    try {
      const res = await fetch("../api/create-report.php", {
        method: "POST",
        body: formData,
      });

      const result = await res.text();

      if (result.trim() === "success") {
        alert("Laporan berhasil dikirim!");
        window.location.href = "my-reports.html";
      } else {
        alert(result);
      }
    } catch (error) {
      alert("Gagal terhubung ke server.");
    }
  });
}

// ================= MY REPORTS =================
function handleMyReports() {
  const list = document.getElementById("myReportsList");
  const empty = document.getElementById("emptyReports");

  if (!list) return;

  const userId = localStorage.getItem("user_id");

  if (!userId) {
    alert("Kamu harus login dulu.");
    window.location.href = "login.html";
    return;
  }

  function loadMyReports() {
    list.innerHTML = "<p class='my-report-loading'>Memuat laporan...</p>";

    fetch(`../api/my-reports.php?user_id=${userId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.status !== "success") {
          list.innerHTML = `<p>${result.message}</p>`;
          return;
        }

        const reports = result.data;

        if (reports.length === 0) {
          empty.style.display = "block";
          list.innerHTML = "";
          return;
        }

        empty.style.display = "none";

        list.innerHTML = reports
          .map((report) => {
            const badgeText =
              report.type === "lost" ? "Kehilangan" : "Ditemukan";

            const imageSrc = report.gambar
              ? `../${report.gambar}`
              : "https://via.placeholder.com/300x200?text=YuFind";

            return `
              <div class="my-report-item">
                <a href="detail.html?id=${report.id}" class="report-card">
                  <img src="${imageSrc}" alt="${report.nama_barang}" />

                  <div class="report-card-body">
                    <span class="report-badge ${report.type}">
                      ${badgeText}
                    </span>

                    <h3>${report.nama_barang}</h3>
                    <p><strong>Lokasi:</strong> ${report.lokasi}</p>
                    <p><strong>Tanggal:</strong> ${report.tanggal}</p>
                  </div>

                  <div class="report-arrow">›</div>
                </a>

                <button 
                  type="button" 
                  class="delete-report-btn"
                  data-id="${report.id}"
                  data-name="${report.nama_barang}"
                >
                  Hapus
                </button>
              </div>
            `;
          })
          .join("");
      })
      .catch(() => {
        list.innerHTML = "<p>Gagal mengambil data laporan.</p>";
      });
  }

  list.addEventListener("click", function (e) {
    const deleteButton = e.target.closest(".delete-report-btn");

    if (!deleteButton) return;

    const reportId = deleteButton.dataset.id;
    const reportName = deleteButton.dataset.name;

    const confirmDelete = confirm(
      `Yakin mau menghapus laporan "${reportName}"? Data yang sudah dihapus tidak bisa dikembalikan.`,
    );

    if (!confirmDelete) return;

    const formData = new FormData();
    formData.append("report_id", reportId);
    formData.append("user_id", userId);

    deleteButton.disabled = true;
    deleteButton.innerText = "Menghapus...";

    fetch("../api/delete-report.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === "success") {
          alert("Laporan berhasil dihapus.");
          loadMyReports();
        } else {
          alert(result.message || "Gagal menghapus laporan.");
          deleteButton.disabled = false;
          deleteButton.innerText = "Hapus";
        }
      })
      .catch(() => {
        alert("Gagal terhubung ke server.");
        deleteButton.disabled = false;
        deleteButton.innerText = "Hapus";
      });
  });

  loadMyReports();
}

// ================= DETAIL REPORT =================
function handleDetailReport() {
  const detailContent = document.getElementById("detailContent");
  const detailLoading = document.getElementById("detailLoading");
  const detailError = document.getElementById("detailError");

  if (!detailContent) return;

  const params = new URLSearchParams(window.location.search);
  const reportId = params.get("id");

  if (!reportId) {
    detailLoading.style.display = "none";
    detailError.style.display = "block";
    return;
  }

  fetch(`../api/report-detail.php?id=${reportId}`)
    .then((res) => res.json())
    .then((result) => {
      detailLoading.style.display = "none";

      if (result.status !== "success") {
        detailError.style.display = "block";
        return;
      }

      const report = result.data;

      const detailImage = document.getElementById("detailImage");
      const detailBadge = document.getElementById("detailBadge");
      const detailNamaBarang = document.getElementById("detailNamaBarang");
      const detailLokasi = document.getElementById("detailLokasi");
      const detailTanggal = document.getElementById("detailTanggal");
      const detailDeskripsi = document.getElementById("detailDeskripsi");
      const detailKontak = document.getElementById("detailKontak");

      const badgeText = report.type === "lost" ? "Kehilangan" : "Ditemukan";

      const imageSrc = report.gambar
        ? `../${report.gambar}`
        : "https://via.placeholder.com/600x400?text=YuFind";

      detailImage.src = imageSrc;
      detailImage.alt = report.nama_barang;

      detailBadge.innerText = badgeText;
      detailBadge.classList.add(report.type);

      detailNamaBarang.innerText = report.nama_barang;
      detailLokasi.innerText = report.lokasi;
      detailTanggal.innerText = report.tanggal;
      detailDeskripsi.innerText = report.deskripsi;
      detailKontak.innerText = report.kontak;

      detailContent.style.display = "grid";
    })
    .catch(() => {
      detailLoading.style.display = "none";
      detailError.style.display = "block";
    });
}

// ================= TEXT SAFETY =================
function escapeHTML(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ================= FORMAT DATE =================
function formatDateID(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ================= REPORTS PAGE =================
function handleReportsPage() {
  const reportsList = document.getElementById("reportsList");
  const reportsLoading = document.getElementById("reportsLoading");
  const reportsError = document.getElementById("reportsError");
  const reportsEmpty = document.getElementById("reportsEmpty");

  if (!reportsList) return;

  const keywordInput = document.getElementById("reportsKeyword");
  const kategoriSelect = document.getElementById("reportsKategori");
  const lokasiSelect = document.getElementById("reportsLokasi");
  const sortSelect = document.getElementById("reportsSort");
  const btnFilter = document.getElementById("btnFilterReports");

  const urlParams = new URLSearchParams(window.location.search);

  const initialKeyword = urlParams.get("keyword") || "";
  const initialKategori = urlParams.get("kategori") || "";
  const initialLokasi = urlParams.get("lokasi") || "";
  const initialSort = urlParams.get("sort") || "newest";

  keywordInput.value = initialKeyword;
  kategoriSelect.value = initialKategori;
  lokasiSelect.value = initialLokasi;
  sortSelect.value = initialSort;

  function loadReports() {
    reportsLoading.style.display = "block";
    reportsError.style.display = "none";
    reportsEmpty.style.display = "none";
    reportsList.innerHTML = "";

    const params = new URLSearchParams();

    const keyword = keywordInput.value.trim();
    const kategori = kategoriSelect.value;
    const lokasi = lokasiSelect.value;
    const sort = sortSelect.value;

    if (keyword) params.append("keyword", keyword);
    if (kategori) params.append("kategori", kategori);
    if (lokasi) params.append("lokasi", lokasi);
    if (sort) params.append("sort", sort);

    const newUrl = `reports.html?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);

    fetch(`../api/reports.php?${params.toString()}`)
      .then((res) => res.json())
      .then((result) => {
        reportsLoading.style.display = "none";

        if (result.status !== "success") {
          reportsError.style.display = "block";
          return;
        }

        const reports = result.data;

        if (reports.length === 0) {
          reportsEmpty.style.display = "block";
          return;
        }

        reportsList.innerHTML = reports
          .map((report) => {
            const type = escapeHTML(report.type);
            const badgeText = type === "lost" ? "Kehilangan" : "Ditemukan";

            const namaBarang = escapeHTML(report.nama_barang);
            const lokasi = escapeHTML(report.lokasi);
            const deskripsi = escapeHTML(report.deskripsi);
            const tanggal = formatDateID(report.tanggal);

            const imageSrc = report.gambar
              ? `../${escapeHTML(report.gambar)}`
              : "https://via.placeholder.com/600x400?text=YuFind";

            return `
              <a href="detail.html?id=${report.id}" class="report-item">
                <div class="report-item-image">
                  <img src="${imageSrc}" alt="${namaBarang}" />
                </div>

                <div class="report-item-body">
                  <div class="report-item-top">
                    <span class="report-item-badge ${type}">
                      ${badgeText}
                    </span>

                    <span class="report-item-date">
                      ${tanggal}
                    </span>
                  </div>

                  <h3>${namaBarang}</h3>

                  <p class="report-item-desc">
                    ${deskripsi}
                  </p>

                  <p class="report-item-location">
                    <strong>Lokasi:</strong> ${lokasi}
                  </p>
                </div>
              </a>
            `;
          })
          .join("");
      })
      .catch(() => {
        reportsLoading.style.display = "none";
        reportsError.style.display = "block";
      });
  }

  btnFilter.addEventListener("click", loadReports);

  keywordInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      loadReports();
    }
  });

  loadReports();
}

// ================= LANDING PREVIEW =================
function handleLandingPreview() {
  const lostPreviewCards = document.getElementById("lostPreviewCards");
  const foundPreviewCards = document.getElementById("foundPreviewCards");

  if (!lostPreviewCards || !foundPreviewCards) return;

  function renderPreviewCards(container, reports, emptyText) {
    if (!reports || reports.length === 0) {
      container.innerHTML = `
        <p class="preview-empty">${emptyText}</p>
      `;
      return;
    }

    container.innerHTML = reports
      .map((report) => {
        const namaBarang = escapeHTML(report.nama_barang);
        const tanggal = formatDateID(report.tanggal);

        const imageSrc = report.gambar
          ? escapeHTML(report.gambar)
          : "https://via.placeholder.com/300x200?text=YuFind";

        const labelTanggal = report.type === "lost" ? "Hilang" : "Ditemukan";

        return `
          <a href="pages/detail.html?id=${report.id}" class="card preview-card-link">
            <img src="${imageSrc}" alt="${namaBarang}" />
            <h4>${namaBarang}</h4>
            <p>${labelTanggal}: ${tanggal}</p>
          </a>
        `;
      })
      .join("");
  }

  fetch("api/latest-reports.php")
    .then((res) => res.json())
    .then((result) => {
      if (result.status !== "success") {
        lostPreviewCards.innerHTML = `
          <p class="preview-empty">Gagal memuat laporan kehilangan.</p>
        `;

        foundPreviewCards.innerHTML = `
          <p class="preview-empty">Gagal memuat laporan temuan.</p>
        `;
        return;
      }

      renderPreviewCards(
        lostPreviewCards,
        result.data.lost,
        "Belum ada laporan kehilangan.",
      );

      renderPreviewCards(
        foundPreviewCards,
        result.data.found,
        "Belum ada laporan temuan.",
      );
    })
    .catch(() => {
      lostPreviewCards.innerHTML = `
        <p class="preview-empty">Gagal terhubung ke server.</p>
      `;

      foundPreviewCards.innerHTML = `
        <p class="preview-empty">Gagal terhubung ke server.</p>
      `;
    });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
  loadNavbar();
  handleReportForm();
  handleRegister();
  handleLogin();
  handleSearch();
  handleSubmitReport();
  handleMyReports();
  handleDetailReport();
  handleReportsPage();
  handleLandingPreview();
});
