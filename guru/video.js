// ============================================================
// VIDEO.JS
// Portal Guru - Aplikasi Kebugaran
// UPT SPF SMP Negeri 30 Makassar
//
// Fungsi:
// 1. Memeriksa autentikasi guru
// 2. Menampilkan profil pengguna
// 3. Logout
// 4. Sidebar responsif
// 5. Pencarian video
// 6. Filter kategori video
// 7. Menghitung jumlah video yang tampil
//
// Catatan:
// Data dan URL video ditulis langsung di video.html.
// File ini tidak mengambil atau menyimpan data video di Firestore.
// ============================================================

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { auth } from "./firebase-config.js";

// ============================================================
// 1. AMBIL ELEMEN HTML
// ============================================================

const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");
const sidebarOverlay = document.getElementById("sidebarOverlay");

const logoutButton = document.getElementById("logoutButton");

const topUserName = document.getElementById("topUserName");
const topProfilePhoto = document.getElementById("topProfilePhoto");
const topProfilePlaceholder = document.getElementById(
  "topProfilePlaceholder"
);

const searchInput = document.getElementById("searchVideo");
const clearSearchButton = document.getElementById("clearSearch");
const videoCount = document.getElementById("videoCount");

const videoCards = Array.from(
  document.querySelectorAll(".video-card")
);

const videoCategoryButtons = Array.from(
  document.querySelectorAll("[data-video-category]")
);

const videoEmptyState = document.getElementById("videoEmptyState");

// ============================================================
// 2. STATUS HALAMAN
// ============================================================

let currentUser = null;
let selectedCategory = "all";

// ============================================================
// 3. FUNGSI BANTUAN
// ============================================================

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim();
}

// ============================================================
// 4. PROFIL GURU
// ============================================================

function tampilkanProfil(user) {
  if (!user) {
    setText(topUserName, "Guru");

    if (topProfilePhoto) {
      topProfilePhoto.removeAttribute("src");
      topProfilePhoto.hidden = true;
    }

    if (topProfilePlaceholder) {
      topProfilePlaceholder.hidden = false;
    }

    return;
  }

  const namaGuru =
    user.displayName ||
    user.email?.split("@")[0] ||
    "Guru";

  setText(topUserName, namaGuru);

  const fotoURL = user.photoURL;

  if (topProfilePhoto && fotoURL) {
    topProfilePhoto.src = fotoURL;
    topProfilePhoto.alt = "Foto profil " + namaGuru;
    topProfilePhoto.hidden = false;

    if (topProfilePlaceholder) {
      topProfilePlaceholder.hidden = true;
    }

    topProfilePhoto.onerror = () => {
      topProfilePhoto.hidden = true;

      if (topProfilePlaceholder) {
        topProfilePlaceholder.hidden = false;
      }
    };
  } else {
    if (topProfilePhoto) {
      topProfilePhoto.removeAttribute("src");
      topProfilePhoto.hidden = true;
    }

    if (topProfilePlaceholder) {
      topProfilePlaceholder.hidden = false;
    }
  }
}

// ============================================================
// 5. AUTENTIKASI FIREBASE
// ============================================================

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Pengguna belum login.
    window.location.replace("../index.html");
    return;
  }

  currentUser = user;
  tampilkanProfil(user);
});

// ============================================================
// 6. LOGOUT
// ============================================================

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    const yakin = window.confirm(
      "Apakah Anda yakin ingin keluar dari akun?"
    );

    if (!yakin) return;

    logoutButton.disabled = true;

    try {
      await signOut(auth);
      window.location.replace("../index.html");
    } catch (error) {
      console.error("Gagal logout:", error);

      window.alert(
        "Gagal keluar dari akun. Silakan coba kembali."
      );

      logoutButton.disabled = false;
    }
  });
}

// ============================================================
// 7. SIDEBAR RESPONSIF
// ============================================================

function bukaSidebar() {
  if (sidebar) {
    sidebar.classList.add("open");
    sidebar.classList.add("active");
  }

  if (sidebarOverlay) {
    sidebarOverlay.classList.add("show");
    sidebarOverlay.classList.add("active");
    sidebarOverlay.hidden = false;
  }

  document.body.classList.add("sidebar-open");
}

function tutupSidebar() {
  if (sidebar) {
    sidebar.classList.remove("open");
    sidebar.classList.remove("active");
    sidebar.classList.remove("show");
  }

  if (sidebarOverlay) {
    sidebarOverlay.classList.remove("show");
    sidebarOverlay.classList.remove("active");
    sidebarOverlay.hidden = true;
  }

  document.body.classList.remove("sidebar-open");
}

if (menuButton) {
  menuButton.addEventListener("click", () => {
    const sidebarTerbuka =
      sidebar?.classList.contains("open") ||
      sidebar?.classList.contains("active");

    if (sidebarTerbuka) {
      tutupSidebar();
    } else {
      bukaSidebar();
    }
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", tutupSidebar);
}

// Tutup sidebar setelah memilih menu pada layar kecil.
if (sidebar) {
  sidebar.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        tutupSidebar();
      }
    });
  });
}

// Jika ukuran layar kembali menjadi desktop, hapus overlay.
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    tutupSidebar();
  }
});

// ============================================================
// 8. MENGAMBIL INFORMASI VIDEO DARI HTML
// ============================================================

function ambilJudulVideo(card) {
  const elemenJudul = card.querySelector(
    ".video-title, h3, h2"
  );

  return elemenJudul?.textContent || "";
}

function ambilKategoriVideo(card) {
  // Prioritas pertama: atribut data-category pada kartu.
  const kategoriAtribut = card.dataset.category;

  if (kategoriAtribut) {
    return normalizeText(kategoriAtribut);
  }

  // Alternatif: kategori yang ditampilkan pada kartu.
  const elemenKategori = card.querySelector(
    ".video-category-label"
  );

  return normalizeText(elemenKategori?.textContent || "");
}

function cocokKategori(card) {
  if (selectedCategory === "all") {
    return true;
  }

  const kategori = ambilKategoriVideo(card);

  return kategori === normalizeText(selectedCategory);
}

function cocokPencarian(card, kataKunci) {
  if (!kataKunci) {
    return true;
  }

  const judul = normalizeText(ambilJudulVideo(card));
  const isiKartu = normalizeText(card.textContent);
  const kategori = ambilKategoriVideo(card);

  return (
    judul.includes(kataKunci) ||
    isiKartu.includes(kataKunci) ||
    kategori.includes(kataKunci)
  );
}

// ============================================================
// 9. PENCARIAN DAN FILTER VIDEO
// ============================================================

function perbaruiDaftarVideo() {
  const kataKunci = normalizeText(searchInput?.value || "");

  let jumlahTampil = 0;

  videoCards.forEach((card) => {
    const sesuaiKategori = cocokKategori(card);
    const sesuaiPencarian = cocokPencarian(
      card,
      kataKunci
    );

    const tampil =
      sesuaiKategori && sesuaiPencarian;

    card.hidden = !tampil;

    if (tampil) {
      jumlahTampil++;
    }
  });

  // Perbarui jumlah video.
  if (videoCount) {
    videoCount.textContent = `${jumlahTampil} video`;
  }

  // Tampilkan pesan jika tidak ada video.
  if (videoEmptyState) {
    videoEmptyState.hidden = jumlahTampil !== 0;
  }

  // Tombol hapus pencarian.
  if (clearSearchButton) {
    clearSearchButton.hidden = !kataKunci;
  }
}

if (searchInput) {
  searchInput.addEventListener(
    "input",
    perbaruiDaftarVideo
  );
}

if (clearSearchButton) {
  clearSearchButton.addEventListener("click", () => {
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }

    perbaruiDaftarVideo();
  });
}

// ============================================================
// 10. FILTER KATEGORI
// ============================================================

videoCategoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory =
      button.dataset.videoCategory || "all";

    // Perbarui tampilan tombol kategori.
    videoCategoryButtons.forEach((item) => {
      const aktif = item === button;

      item.classList.toggle("active", aktif);
      item.setAttribute(
        "aria-pressed",
        String(aktif)
      );
    });

    perbaruiDaftarVideo();
  });
});

// ============================================================
// 11. KARTU VIDEO
// ============================================================

// URL video tetap dikelola oleh video.html.
// Kode ini tidak membuat ulang kartu dan tidak mengubah URL.
videoCards.forEach((card) => {
  const tautan = card.querySelector(
    'a[href*="youtube.com"], a[href*="youtu.be"]'
  );

  if (tautan) {
    tautan.target = "_blank";
    tautan.rel = "noopener noreferrer";
  }
});

// ============================================================
// 12. TAHAP AWAL
// ============================================================

perbaruiDaftarVideo();

console.info(
  `Halaman video siap. Total video di HTML: ${videoCards.length}.`
);