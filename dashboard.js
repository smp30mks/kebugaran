// =========================================================
// DASHBOARD.JS - SISWA
// Firebase Project: projekkepemimpinan-9d557
// =========================================================


// =========================================================
// FIREBASE AUTHENTICATION
// =========================================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// =========================================================
// FIREBASE FIRESTORE
// =========================================================

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =========================================================
// FIREBASE CONFIG
// =========================================================

import {
    auth,
    db
} from "./firebase-config.js";


// =========================================================
// ELEMENT SIDEBAR
// =========================================================

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const menuButton =
    document.getElementById("menuButton");

const logoutButton =
    document.getElementById("logoutButton");


// =========================================================
// ELEMENT USER
// =========================================================

const welcomeName =
    document.getElementById("welcomeName");

const topUserName =
    document.getElementById("topUserName");

const topUserClass =
    document.getElementById("topUserClass");

const profileName =
    document.getElementById("profileName");

const profileNisn =
    document.getElementById("profileNisn");

const profileClass =
    document.getElementById("profileClass");

const profileYear =
    document.getElementById("profileYear");


// =========================================================
// SIDEBAR OPEN
// =========================================================

function openSidebar() {

    if (sidebar) {

        sidebar.classList.add(
            "active"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "active"
        );

    }


    document.body.classList.add(
        "sidebar-open"
    );

}


// =========================================================
// SIDEBAR CLOSE
// =========================================================

function closeSidebar() {

    if (sidebar) {

        sidebar.classList.remove(
            "active"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "active"
        );

    }


    document.body.classList.remove(
        "sidebar-open"
    );

}


// =========================================================
// MENU BUTTON
// =========================================================

if (menuButton) {

    menuButton.addEventListener(
        "click",
        openSidebar
    );

}


// =========================================================
// OVERLAY
// =========================================================

if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


// =========================================================
// CLOSE SIDEBAR SAAT KLIK LINK
// =========================================================

if (sidebar) {

    const menuLinks =
        sidebar.querySelectorAll(
            "a"
        );


    menuLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                closeSidebar
            );

        }
    );

}


// =========================================================
// ESCAPE UNTUK MENUTUP SIDEBAR
// =========================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            closeSidebar();

        }

    }
);


// =========================================================
// FORMAT DATA
// =========================================================

function getText(
    value,
    defaultValue = "-"
) {

    const text =
        String(
            value ?? ""
        ).trim();


    return text ||
        defaultValue;

}


// =========================================================
// TAMPILKAN DATA SISWA
// =========================================================

function displayStudentData(
    data
) {

    const nama =
        getText(
            data.nama,
            "Siswa"
        );


    const nisn =
        getText(
            data.nisn
        );


    const kelas =
        getText(
            data.kelas
        );


    const tahunAjaran =
        getText(
            data.tahunAjaran
        );


    // =====================================================
    // WELCOME
    // =====================================================

    if (welcomeName) {

        welcomeName.textContent =
            nama;

    }


    // =====================================================
    // TOPBAR
    // =====================================================

    if (topUserName) {

        topUserName.textContent =
            nama;

    }


    if (topUserClass) {

        if (
            kelas === "-"
        ) {

            topUserClass.textContent =
                "-";

        } else {

            topUserClass.textContent =
                `Kelas ${kelas}`;

        }

    }


    // =====================================================
    // PROFIL SINGKAT
    // =====================================================

    if (profileName) {

        profileName.textContent =
            nama;

    }


    if (profileNisn) {

        profileNisn.textContent =
            nisn;

    }


    if (profileClass) {

        profileClass.textContent =
            kelas;

    }


    if (profileYear) {

        profileYear.textContent =
            tahunAjaran;

    }

}


// =========================================================
// LOAD DATA USER
// =========================================================

async function loadStudentData(
    user
) {

    try {

        console.log(
            "Mengambil data:",
            `users/${user.uid}`
        );


        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnapshot =
            await getDoc(
                userRef
            );


        // =================================================
        // USER DOCUMENT TIDAK ADA
        // =================================================

        if (
            !userSnapshot.exists()
        ) {

            console.error(
                "Dokumen users/{uid} tidak ditemukan."
            );


            alert(
                "Data akun tidak ditemukan. Silakan login kembali."
            );


            await signOut(
                auth
            );


            window.location.href =
                "index.html";


            return;

        }


        // =================================================
        // DATA USER
        // =================================================

        const userData =
            userSnapshot.data() || {};


        console.log(
            "Data user:",
            userData
        );


        // =================================================
        // CEK ROLE
        // =================================================

        const role =
            String(
                userData.role || ""
            )
                .trim()
                .toLowerCase();


        // =================================================
        // JIKA GURU
        // =================================================

        if (
            role === "guru"
        ) {

            window.location.href =
                "guru/dashboard.html";

            return;

        }


        // =================================================
        // JIKA BUKAN SISWA
        // =================================================

        if (
            role !== "siswa"
        ) {

            console.error(
                "Role tidak valid:",
                role
            );


            alert(
                "Role akun tidak dikenali."
            );


            await signOut(
                auth
            );


            window.location.href =
                "index.html";


            return;

        }


        // =================================================
        // TAMPILKAN DATA
        // =================================================

        displayStudentData(
            userData
        );


    } catch (error) {

        console.error(
            "Gagal memuat data siswa:",
            error
        );


        if (
            error?.code ===
            "permission-denied"
        ) {

            alert(
                "Akses data pengguna ditolak oleh Firebase Rules."
            );

        } else {

            alert(
                "Gagal memuat data pengguna."
            );

        }

    }

}


// =========================================================
// AUTH STATE
// =========================================================

onAuthStateChanged(
    auth,
    async (user) => {

        console.log(
            "Auth state:",
            user
                ? user.uid
                : "Tidak login"
        );


        // =================================================
        // BELUM LOGIN
        // =================================================

        if (!user) {

            window.location.href =
                "index.html";

            return;

        }


        // =================================================
        // USER SUDAH LOGIN
        // =================================================

        await loadStudentData(
            user
        );

    }
);


// =========================================================
// LOGOUT
// =========================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            const yakin =
                window.confirm(
                    "Apakah Anda yakin ingin logout?"
                );


            if (!yakin) {

                return;

            }


            try {

                logoutButton.disabled =
                    true;


                logoutButton.textContent =
                    "Logout...";


                await signOut(
                    auth
                );


                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(
                    "Gagal logout. Silakan coba lagi."
                );


                logoutButton.disabled =
                    false;


                logoutButton.textContent =
                    "Logout";

            }

        }
    );

}