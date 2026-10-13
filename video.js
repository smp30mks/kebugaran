
/* =========================================================
   FIREBASE AUTH
========================================================= */

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


/* =========================================================
   FIREBASE FIRESTORE
========================================================= */

import {
    doc,
    getDoc,
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

import {
    app,
    auth
} from "./firebase-config.js";


/* =========================================================
   FIRESTORE INSTANCE
========================================================= */

const firestore = getFirestore(app);


/* =========================================================
   ELEMENT SIDEBAR
========================================================= */

const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const logoutButton = document.getElementById("logoutButton");


/* =========================================================
   ELEMENT PROFIL PENGGUNA
========================================================= */

const topUserName = document.getElementById("topUserName");
const topUserClass = document.getElementById("topUserClass");
const topProfilePhoto = document.getElementById("topProfilePhoto");

const topProfilePlaceholder = document.getElementById(
    "topProfilePlaceholder"
);


/* =========================================================
   ELEMENT VIDEO
========================================================= */

const searchVideo = document.getElementById("searchVideo");
const videoGrid = document.getElementById("videoGrid");

const videoCards = Array.from(
    document.querySelectorAll(".video-card")
);

const videoCount = document.getElementById("videoCount");
const heroTotalVideo = document.getElementById("heroTotalVideo");
const emptyState = document.getElementById("emptyState");


/* =========================================================
   TOMBOL KATEGORI VIDEO
========================================================= */

const categoryButtons = Array.from(
    document.querySelectorAll(".video-category-card")
);


/* =========================================================
   ELEMENT MODAL VIDEO
========================================================= */

const videoModal = document.getElementById("videoModal");

const videoModalOverlay = document.getElementById(
    "videoModalOverlay"
);

const videoModalClose = document.getElementById(
    "videoModalClose"
);

const videoModalTitle = document.getElementById(
    "videoModalTitle"
);

const videoPlayer = document.getElementById("videoPlayer");

const videoPlayerEmpty = document.getElementById(
    "videoPlayerEmpty"
);

const youtubePlayer = document.getElementById("youtubePlayer");


/* =========================================================
   MENGAMBIL ID VIDEO YOUTUBE
========================================================= */

function extractYouTubeId(url) {
    if (!url) return "";

    try {
        const parsed = new URL(String(url).trim());

        const host = parsed.hostname
            .replace(/^www\./i, "")
            .toLowerCase();

        let id = "";

        if (host === "youtu.be") {
            id = parsed.pathname
                .split("/")
                .filter(Boolean)[0] || "";

        } else if (
            [
                "youtube.com",
                "m.youtube.com",
                "youtube-nocookie.com"
            ].includes(host)
        ) {
            if (parsed.pathname === "/watch") {
                id = parsed.searchParams.get("v") || "";

            } else {
                const parts = parsed.pathname
                    .split("/")
                    .filter(Boolean);

                if (
                    ["embed", "shorts", "live"].includes(parts[0])
                ) {
                    id = parts[1] || "";
                }
            }
        }

        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : "";

    } catch (error) {
        console.error("Gagal membaca URL YouTube:", error);
        return "";
    }
}


/* =========================================================
   MEMUAT THUMBNAIL YOUTUBE
========================================================= */

function loadYouTubeThumbnails() {
    document.querySelectorAll(".video-card").forEach((card) => {
        const image = card.querySelector(
            "img.youtube-thumbnail"
        );

        if (!image) return;

        const videoUrl = card.dataset.video || "";
        const videoId = extractYouTubeId(videoUrl);

        if (!videoId) {
            image.removeAttribute("src");

            image.alt =
                `Thumbnail belum tersedia: ${card.dataset.title || "Video"}`;

            image.dataset.thumbnailReady = "false";
            return;
        }

        image.src =
            `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        image.alt =
            `Thumbnail YouTube: ${card.dataset.title || "Video pembelajaran"}`;

        image.dataset.thumbnailReady = "true";

        image.onerror = () => {
            image.onerror = null;

            image.src =
                `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        };
    });
}


/* =========================================================
   TOTAL VIDEO
========================================================= */

const totalVideo = videoCards.length;


/* =========================================================
   MEMPERBARUI TOTAL VIDEO
========================================================= */

function updateTotalVideo() {
    if (heroTotalVideo) {
        heroTotalVideo.textContent =
            String(totalVideo).padStart(2, "0");
    }
}


/* =========================================================
   MEMBUKA SIDEBAR
========================================================= */

function openSidebar() {
    if (sidebar) {
        sidebar.classList.add("active");
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.add("active");
    }

    document.body.classList.add("sidebar-open");
}


/* =========================================================
   MENUTUP SIDEBAR
========================================================= */

function closeSidebar() {
    if (sidebar) {
        sidebar.classList.remove("active");
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("active");
    }

    document.body.classList.remove("sidebar-open");
}


/* =========================================================
   MENU MOBILE
========================================================= */

if (menuButton) {
    menuButton.addEventListener("click", () => {
        const isOpen =
            sidebar?.classList.contains("active");

        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
}


/* =========================================================
   OVERLAY SIDEBAR
========================================================= */

if (sidebarOverlay) {
    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );
}


/* =========================================================
   TUTUP SIDEBAR SETELAH MENU DIKLIK
========================================================= */

document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", closeSidebar);
});


/* =========================================================
   MENAMPILKAN FOTO PROFIL
========================================================= */

function showTopProfilePhoto(url) {
    if (!topProfilePhoto || !topProfilePlaceholder) {
        return;
    }

    if (url) {
        topProfilePhoto.src = url;
        topProfilePhoto.style.display = "block";

        topProfilePlaceholder.style.display = "none";

        topProfilePhoto.onerror = () => {
            topProfilePhoto.onerror = null;

            topProfilePhoto.removeAttribute("src");
            topProfilePhoto.style.display = "none";

            topProfilePlaceholder.style.display = "flex";
        };

    } else {
        topProfilePhoto.removeAttribute("src");
        topProfilePhoto.style.display = "none";

        topProfilePlaceholder.style.display = "flex";
    }
}


/* =========================================================
   MEMUAT DATA PENGGUNA DARI FIRESTORE
========================================================= */

async function loadUser(user) {
    try {
        console.log(
            "Mengambil data user:",
            `users/${user.uid}`
        );

        const userRef = doc(
            firestore,
            "users",
            user.uid
        );

        const snapshot = await getDoc(userRef);


        /* -----------------------------------------------------
           JIKA DOKUMEN PENGGUNA TIDAK DITEMUKAN
        ----------------------------------------------------- */

        if (!snapshot.exists()) {
            console.error(
                "Dokumen users/{uid} tidak ditemukan."
            );

            alert(
                "Data akun tidak ditemukan. Silakan login kembali."
            );

            await signOut(auth);

            window.location.href = "index.html";

            return false;
        }


        const data = snapshot.data() || {};

        console.log("Data user:", data);


        /* -----------------------------------------------------
           VALIDASI ROLE
        ----------------------------------------------------- */

        const role = String(data.role || "")
            .toLowerCase()
            .trim();

        // Halaman video ini khusus untuk siswa.

        if (role !== "siswa") {
            if (role === "guru") {
                window.location.href = "guru/dashboard.html";

            } else {
                console.error("Role tidak valid:", role);

                alert("Role akun tidak dikenali.");

                await signOut(auth);

                window.location.href = "index.html";
            }

            return false;
        }


        /* -----------------------------------------------------
           DATA NAMA DAN KELAS
        ----------------------------------------------------- */

        const nama = String(
            data.nama ||
            user.displayName ||
            "Murid"
        ).trim() || "Murid";

        const kelas = String(
            data.kelas || "-"
        ).trim() || "-";


        /* -----------------------------------------------------
           MENAMPILKAN NAMA
        ----------------------------------------------------- */

        if (topUserName) {
            topUserName.textContent = nama;
        }


        /* -----------------------------------------------------
           MENAMPILKAN KELAS
        ----------------------------------------------------- */

        if (topUserClass) {
            topUserClass.textContent = kelas;
        }


        /* -----------------------------------------------------
           MENAMPILKAN FOTO PROFIL
        ----------------------------------------------------- */

        showTopProfilePhoto(data.photoURL || "");

        return true;

    } catch (error) {
        console.error("LOAD USER ERROR:", error);

        if (
            error?.code === "permission-denied" ||
            error?.code === "firestore/permission-denied"
        ) {
            alert(
                "Akses data pengguna ditolak oleh Firebase Rules."
            );

        } else {
            alert("Gagal memuat data pengguna.");
        }

        return false;
    }
}


/* =========================================================
   NORMALISASI TEKS PENCARIAN
========================================================= */

function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .trim();
}


/* =========================================================
   FILTER VIDEO
   PERBAIKAN UTAMA ADA DI FUNGSI INI
========================================================= */

function filterVideo() {

    // Kata kunci yang dimasukkan pada kolom pencarian.
    const keyword = normalizeText(searchVideo?.value);


    // Mencari tombol kategori yang sedang aktif.
    const activeCategoryButton = categoryButtons.find(
        (button) => button.classList.contains("active")
    );


    // Mengambil kategori aktif.
    const category = normalizeText(
        activeCategoryButton?.dataset.category
    );


    // Menghitung jumlah video yang ditampilkan.
    let visibleCount = 0;


    /* -----------------------------------------------------
       FILTER SETIAP KARTU VIDEO
    ----------------------------------------------------- */

    videoCards.forEach((card) => {

        const title = normalizeText(card.dataset.title);

        const cardCategory = normalizeText(
            card.dataset.category
        );

        const cardText = normalizeText(card.textContent);


        /* -------------------------------------------------
           FILTER PENCARIAN
        ------------------------------------------------- */

        const matchKeyword =
            !keyword ||
            title.includes(keyword) ||
            cardCategory.includes(keyword) ||
            cardText.includes(keyword);


        /* -------------------------------------------------
           FILTER KATEGORI
        ------------------------------------------------- */

        /*
         * PERBAIKAN:
         * Kategori "all" berarti semua video ditampilkan.
         * Kategori selain "all" hanya menampilkan video
         * yang sesuai dengan kategori tersebut.
         */

        const matchCategory =
            !category ||
            category === "all" ||
            cardCategory === category;


        /* -------------------------------------------------
           MENENTUKAN VIDEO DITAMPILKAN ATAU DISEMBUNYIKAN
        ------------------------------------------------- */

        const visible =
            matchKeyword && matchCategory;

        if (visible) {
            card.style.display = "";
            visibleCount++;

        } else {
            card.style.display = "none";
        }
    });


    /* -----------------------------------------------------
       MEMPERBARUI JUMLAH VIDEO YANG TERLIHAT
    ----------------------------------------------------- */

    if (videoCount) {
        videoCount.textContent = String(visibleCount);
    }


    /* -----------------------------------------------------
       MENAMPILKAN PESAN JIKA VIDEO TIDAK DITEMUKAN
    ----------------------------------------------------- */

    if (emptyState) {

        const noVideosFound = visibleCount === 0;

        // hidden harus disesuaikan dengan hasil filter.
        emptyState.hidden = !noVideosFound;

        emptyState.style.display = noVideosFound
            ? "block"
            : "none";
    }
}


/* =========================================================
   MENGATUR KATEGORI AKTIF
========================================================= */

function setActiveCategory(activeButton) {

    categoryButtons.forEach((button) => {
        button.classList.remove("active");
    });

    if (activeButton) {
        activeButton.classList.add("active");
    }
}


/* =========================================================
   EVENT TOMBOL KATEGORI
========================================================= */

categoryButtons.forEach((button) => {

    button.addEventListener("click", () => {

        // Mengaktifkan kategori yang dipilih.
        setActiveCategory(button);

        // Memfilter video sesuai kategori.
        filterVideo();
    });
});


/* =========================================================
   EVENT PENCARIAN VIDEO
========================================================= */

if (searchVideo) {
    searchVideo.addEventListener(
        "input",
        filterVideo
    );
}


/* =========================================================
   VALIDASI URL VIDEO
========================================================= */

function isValidVideoUrl(url) {
    if (!url) return false;

    const normalized = String(url).trim();

    if (!normalized) return false;

    // Menolak tautan contoh yang belum diganti.
    if (
        normalized.startsWith("TEMPEL_LINK_YOUTUBE_") ||
        normalized.startsWith("VIDEO_URL_") ||
        normalized.includes("GANTI_LINK") ||
        normalized.includes("GANTI_ID_VIDEO")
    ) {
        return false;
    }

    return true;
}


/* =========================================================
   MENGUBAH LINK YOUTUBE MENJADI LINK EMBED
========================================================= */

function getYouTubeEmbedUrl(url) {
    try {
        const parsed = new URL(String(url).trim());

        const host = parsed.hostname
            .replace(/^www\./, "")
            .toLowerCase();

        let videoId = "";


        if (host === "youtu.be") {

            videoId =
                parsed.pathname.split("/").filter(Boolean)[0] || "";

        } else if (
            host === "youtube.com" ||
            host === "m.youtube.com" ||
            host === "youtube-nocookie.com"
        ) {

            if (parsed.pathname === "/watch") {

                videoId = parsed.searchParams.get("v") || "";

            } else {

                const parts = parsed.pathname
                    .split("/")
                    .filter(Boolean);

                if (
                    ["embed", "shorts", "live"].includes(parts[0])
                ) {
                    videoId = parts[1] || "";
                }
            }
        }


        // ID YouTube normal terdiri atas 11 karakter.
        if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
            return "";
        }


        return (
            "https://www.youtube-nocookie.com/embed/" +
            videoId +
            "?autoplay=1&rel=0"
        );

    } catch (error) {
        console.error("URL YouTube tidak valid:", error);
        return "";
    }
}


/* =========================================================
   MEMBUKA MODAL VIDEO
========================================================= */

function openVideoModal(videoUrl, title) {

    if (!videoModal) {
        return;
    }


    /* -----------------------------------------------------
       JUDUL VIDEO
    ----------------------------------------------------- */

    const cleanTitle = String(
        title || "Video Pembelajaran"
    ).trim();

    if (videoModalTitle) {
        videoModalTitle.textContent = cleanTitle;
    }


    /* -----------------------------------------------------
       RESET PEMUTAR VIDEO SEBELUM MEMUAT VIDEO BARU
    ----------------------------------------------------- */

    if (videoPlayer) {
        videoPlayer.pause();

        videoPlayer.removeAttribute("src");

        videoPlayer.load();

        videoPlayer.style.display = "none";
    }

    if (youtubePlayer) {
        youtubePlayer.src = "about:blank";
        youtubePlayer.style.display = "none";
    }


    /* -----------------------------------------------------
       PESAN PEMUATAN VIDEO
    ----------------------------------------------------- */

    if (videoPlayerEmpty) {

        videoPlayerEmpty.style.display = "flex";

        const message = videoPlayerEmpty.querySelector("p");

        if (message) {
            message.textContent = "Memuat video...";
        }
    }


    /* -----------------------------------------------------
       MEMILIH PEMUTAR YOUTUBE ATAU FILE VIDEO LANGSUNG
    ----------------------------------------------------- */

    if (isValidVideoUrl(videoUrl)) {

        const youtubeEmbedUrl =
            getYouTubeEmbedUrl(videoUrl);


        // Jika link adalah YouTube.
        if (youtubeEmbedUrl && youtubePlayer) {

            youtubePlayer.src = youtubeEmbedUrl;
            youtubePlayer.style.display = "block";

            if (videoPlayerEmpty) {
                videoPlayerEmpty.style.display = "none";
            }


        // Jika link berupa file video MP4, WebM, atau OGG.
        } else if (
            /\.(mp4|webm|ogg)(\?.*)?$/i.test(
                String(videoUrl).trim()
            ) &&
            videoPlayer
        ) {

            videoPlayer.src = videoUrl;
            videoPlayer.style.display = "block";

            if (videoPlayerEmpty) {
                videoPlayerEmpty.style.display = "none";
            }

            videoPlayer.load();


        // Jika format link tidak dikenali.
        } else if (videoPlayerEmpty) {

            videoPlayerEmpty.style.display = "flex";

            const message =
                videoPlayerEmpty.querySelector("p");

            if (message) {
                message.textContent =
                    "Link belum dikenali. Gunakan link YouTube atau URL file MP4/WebM langsung.";
            }
        }


    // Jika tautan belum diisi.
    } else if (videoPlayerEmpty) {

        videoPlayerEmpty.style.display = "flex";

        const message =
            videoPlayerEmpty.querySelector("p");

        if (message) {
            message.textContent =
                "Link video belum diisi. Tempel tautan YouTube yang benar pada atribut data-video.";
        }
    }


    /* -----------------------------------------------------
       MENAMPILKAN MODAL
    ----------------------------------------------------- */

    videoModal.classList.add("active");

    videoModal.setAttribute("aria-hidden", "false");

    document.body.classList.add("video-modal-open");


    /* -----------------------------------------------------
       FOKUS KE TOMBOL TUTUP
    ----------------------------------------------------- */

    if (videoModalClose) {
        setTimeout(() => {
            videoModalClose.focus();
        }, 50);
    }
}


/* =========================================================
   MENUTUP MODAL VIDEO
========================================================= */

function closeVideoModal() {

    if (!videoModal) {
        return;
    }


    /* -----------------------------------------------------
       MENGHENTIKAN PEMUTAR VIDEO
    ----------------------------------------------------- */

    if (videoPlayer) {

        videoPlayer.pause();

        videoPlayer.removeAttribute("src");

        videoPlayer.load();
    }


    if (youtubePlayer) {

        // Menghentikan video YouTube yang sedang diputar.
        youtubePlayer.src = "about:blank";

        youtubePlayer.style.display = "none";
    }


    /* -----------------------------------------------------
       MENYEMBUNYIKAN MODAL
    ----------------------------------------------------- */

    videoModal.classList.remove("active");

    videoModal.setAttribute("aria-hidden", "true");

    document.body.classList.remove("video-modal-open");
}


/* =========================================================
   TOMBOL PUTAR VIDEO
========================================================= */

const videoPlayTriggers = document.querySelectorAll(
    ".video-play-trigger"
);

videoPlayTriggers.forEach((button) => {

    button.addEventListener("click", () => {

        const buttonUrl = button.dataset.video || "";

        const cardUrl =
            button.closest(".video-card")?.dataset.video || "";


        // Menggunakan link tombol jika tersedia.
        // Jika tidak ada, menggunakan link pada kartu video.
        const videoUrl = isValidVideoUrl(buttonUrl)
            ? buttonUrl
            : cardUrl;


        const title =
            button.dataset.title ||
            button.closest(".video-card")?.dataset.title ||
            "Video Pembelajaran";


        openVideoModal(videoUrl, title);
    });
});


/* =========================================================
   TOMBOL TUTUP MODAL
========================================================= */

if (videoModalClose) {
    videoModalClose.addEventListener(
        "click",
        closeVideoModal
    );
}


/* =========================================================
   TUTUP MODAL KETIKA OVERLAY DIKLIK
========================================================= */

if (videoModalOverlay) {
    videoModalOverlay.addEventListener(
        "click",
        closeVideoModal
    );
}


/* =========================================================
   TOMBOL ESCAPE PADA KEYBOARD
========================================================= */

document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        videoModal?.classList.contains("active")
    ) {

        closeVideoModal();

    } else if (
        event.key === "Escape" &&
        !videoModal?.classList.contains("active")
    ) {

        closeSidebar();
    }
});


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        const confirmed = window.confirm(
            "Apakah Anda yakin ingin logout?"
        );

        if (!confirmed) {
            return;
        }


        try {

            logoutButton.disabled = true;

            logoutButton.innerHTML =
                "<span>⏳</span><span>Logout...</span>";


            await signOut(auth);

            window.location.href = "index.html";


        } catch (error) {

            console.error("LOGOUT ERROR:", error);

            logoutButton.disabled = false;

            logoutButton.innerHTML =
                "<span>🚪</span><span>Logout</span>";


            alert("Logout gagal. Silakan coba lagi.");
        }
    });
}


/* =========================================================
   PEMERIKSAAN STATUS LOGIN FIREBASE
========================================================= */

onAuthStateChanged(auth, async (user) => {


    /* -----------------------------------------------------
       JIKA PENGGUNA BELUM LOGIN
    ----------------------------------------------------- */

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    console.log("Auth state:", user.uid);


    /* -----------------------------------------------------
       MEMUAT DATA PENGGUNA
    ----------------------------------------------------- */

    const validUser = await loadUser(user);

    if (!validUser) {
        return;
    }


    /* -----------------------------------------------------
       MEMPERBARUI JUMLAH VIDEO
    ----------------------------------------------------- */

    updateTotalVideo();


    /* -----------------------------------------------------
       MEMUAT THUMBNAIL YOUTUBE
    ----------------------------------------------------- */

    loadYouTubeThumbnails();


    /* -----------------------------------------------------
       MENJALANKAN FILTER VIDEO PERTAMA KALI
    ----------------------------------------------------- */

    filterVideo();

});
