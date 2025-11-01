// ================================
// 📘 Modul Data Viewer (Sinonim / Antonim)
// ================================

// Simpan tipe modul yang dipilih
let currentModul = "antonim";

// ================================
// Memuat file JSON
// ================================
async function loadModul(modulType) {
  currentModul = modulType; // simpan tipe
  let jsonFile = "";

  if (modulType === "antonim") jsonFile = "data/antonim.json";
  else if (modulType === "sinonim") jsonFile = "data/sinonim.json";
  else {
    console.error("Modul tidak dikenal:", modulType);
    document.getElementById("modulContainer").innerHTML =
      `<tr><td colspan="3">⚠️ Modul tidak ditemukan</td></tr>`;
    return;
  }

  try {
    const response = await fetch(jsonFile);
    const data = await response.json();
    window.modulData = data; // simpan global
    renderTable(data);
    setupDownloadButtons();
  } catch (error) {
    console.error("Gagal memuat data:", error);
    document.getElementById("modulContainer").innerHTML =
      `<tr><td colspan="3">⚠️ Gagal memuat data dari ${jsonFile}</td></tr>`;
  }
}

// ================================
// Menampilkan tabel data
// ================================
function renderTable(list) {
  const container = document.getElementById("modulContainer");
  container.innerHTML = "";

  if (!list || list.length === 0) {
    container.innerHTML =
      `<tr><td colspan="3" style="text-align:center;">Tidak ada data ditemukan.</td></tr>`;
    return;
  }

  list.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.kata}</td>
      <td>${item.jawaban}</td>
    `;
    container.appendChild(row);
  });
}

// ================================
// Pencarian Realtime
// ================================
document.addEventListener("input", (e) => {
  if (e.target.id === "searchInput") {
    const value = e.target.value.toLowerCase();
    const filtered = window.modulData.filter(
      (item) =>
        item.kata.toLowerCase().includes(value) ||
        item.jawaban.toLowerCase().includes(value)
    );
    renderTable(filtered);
  }
});

// ================================
// Tombol navigasi / ganti modul
// ================================
function switchModul(modulType) {
  document.getElementById("searchInput").value = ""; // reset search
  loadModul(modulType);
}

// ================================
// 🔽 Fungsi Export & Download
// ================================
function setupDownloadButtons() {
  const existing = document.getElementById("downloadButtons");
  if (existing) return;

  const tableWrapper = document.querySelector(".table-wrapper");
  if (!tableWrapper) return;

  const btnContainer = document.createElement("div");
  btnContainer.id = "downloadButtons";
  btnContainer.style.textAlign = "right";
  btnContainer.style.marginBottom = "10px";

  btnContainer.innerHTML = `
    <button class="btn btn-purple" onclick="downloadFile()">📄 Unduh File PDF Modul</button>
  `;

  tableWrapper.parentNode.insertBefore(btnContainer, tableWrapper);
}

// ================================
// Ekspor CSV dari JSON
// ================================
function downloadCSV() {
  if (!window.modulData || window.modulData.length === 0) return;

  const rows = [
    ["No", "Kata", "Jawaban"],
    ...window.modulData.map((item, i) => [i + 1, item.kata, item.jawaban]),
  ];

  const csvContent = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${currentModul}_data.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ================================
// Ekspor PDF dari JSON
// ================================
function downloadPDF() {
  if (!window.modulData || window.modulData.length === 0) return;

  const content = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Data Modul</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #eee; }
        </style>
      </head>
      <body>
        <h2>Data Modul (${currentModul})</h2>
        <table>
          <tr><th>No</th><th>Kata</th><th>Jawaban</th></tr>
          ${window.modulData
            .map(
              (d, i) =>
                `<tr><td>${i + 1}</td><td>${d.kata}</td><td>${d.jawaban}</td></tr>`
            )
            .join("")}
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([content], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${currentModul}_data.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

// ================================
// Download file PDF statis
// ================================
function downloadFile() {
  const fileURL = "aset/sinonim-antonim.pdf"; // path ke file PDF
  const link = document.createElement("a");
  link.href = fileURL;
  link.download = fileURL.split("/").pop(); // tetap pakai nama file asli
  link.click();
}

// ================================
// 🔹 Load modul default sesuai halaman
// ================================
document.addEventListener("DOMContentLoaded", () => {
  if (typeof defaultModul !== "undefined") {
    loadModul(defaultModul);
  } else {
    loadModul("antonim"); // fallback
  }
});
