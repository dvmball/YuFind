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

    window.location.href = `pages/search-results.html?${params.toString()}`;
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
          const badgeText = report.type === "lost" ? "Kehilangan" : "Ditemukan";
          const imageSrc = report.gambar
            ? `../${report.gambar}`
            : "https://via.placeholder.com/300x200?text=YuFind";

          return `
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
`;
        })
        .join("");
    })
    .catch(() => {
      list.innerHTML = "<p>Gagal mengambil data laporan.</p>";
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
});
