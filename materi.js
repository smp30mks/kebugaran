/* =========================================================
   MATERI.JS
   PORTAL SISWA
   UPT SPF SMP NEGERI 30 MAKASSAR
   Firebase v12
========================================================= */


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
   ELEMENT
========================================================= */

const sidebar =
    document.getElementById("sidebar");

const menuButton =
    document.getElementById("menuButton");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const logoutButton =
    document.getElementById("logoutButton");

const searchMateri =
    document.getElementById("searchMateri");

const materiGrid =
    document.getElementById("materiGrid");

const emptyState =
    document.getElementById("emptyState");

const materiCount =
    document.getElementById("materiCount");

const heroTotalMateri =
    document.getElementById("heroTotalMateri");


/* =========================================================
   USER ELEMENT
========================================================= */

const topUserName =
    document.getElementById("topUserName");

const topUserClass =
    document.getElementById("topUserClass");

const topProfilePhoto =
    document.getElementById("topProfilePhoto");

const topProfilePlaceholder =
    document.getElementById(
        "topProfilePlaceholder"
    );


/* =========================================================
   MATERI CARDS
========================================================= */

const materiCards =
    Array.from(
        document.querySelectorAll(
            ".materi-card"
        )
    );


/* =========================================================
   CATEGORY BUTTONS
========================================================= */

const categoryButtons =
    Array.from(
        document.querySelectorAll(
            ".category-card"
        )
    );


/* =========================================================
   TOTAL MATERI
========================================================= */

const totalMateri =
    materiCards.length;


/* =========================================================
   SET TOTAL MATERI
========================================================= */

function updateTotalMateri() {

    if (!heroTotalMateri) {

        return;

    }


    heroTotalMateri.textContent =
        String(totalMateri).padStart(
            2,
            "0"
        );

}


/* =========================================================
   SIDEBAR OPEN
========================================================= */

function openSidebar() {

    if (sidebar) {

        sidebar.classList.add(
            "active"
        );

        sidebar.classList.add(
            "open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "active"
        );

        sidebarOverlay.classList.add(
            "show"
        );

    }


    document.body.classList.add(
        "sidebar-open"
    );


    if (menuButton) {

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

    }

}


/* =========================================================
   SIDEBAR CLOSE
========================================================= */

function closeSidebar() {

    if (sidebar) {

        sidebar.classList.remove(
            "active"
        );

        sidebar.classList.remove(
            "open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "active"
        );

        sidebarOverlay.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "sidebar-open"
    );


    if (menuButton) {

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* =========================================================
   SIDEBAR TOGGLE
========================================================= */

function toggleSidebar() {

    if (!sidebar) {

        return;

    }


    const isOpen =
        sidebar.classList.contains(
            "active"
        ) ||
        sidebar.classList.contains(
            "open"
        );


    if (isOpen) {

        closeSidebar();

    } else {

        openSidebar();

    }

}


/* =========================================================
   MOBILE MENU
========================================================= */

if (menuButton) {

    menuButton.setAttribute(
        "aria-expanded",
        "false"
    );


    menuButton.setAttribute(
        "aria-controls",
        "sidebar"
    );


    menuButton.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();

            toggleSidebar();

        }
    );

}


/* =========================================================
   OVERLAY
========================================================= */

if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            closeSidebar();

        }
    );

}


/* =========================================================
   CLOSE SIDEBAR WHEN MENU CLICKED
========================================================= */

document
    .querySelectorAll(".menu-item")
    .forEach(
        (item) => {

            item.addEventListener(
                "click",
                () => {

                    closeSidebar();

                }
            );

        }
    );


/* =========================================================
   ESC CLOSE SIDEBAR
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" ||
            event.key === "Esc"
        ) {

            closeSidebar();

        }

    }
);


/* =========================================================
   CLOSE SIDEBAR AFTER RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 800
        ) {

            closeSidebar();

        }

    }
);


/* =========================================================
   PROFILE PHOTO
========================================================= */

function showTopProfilePhoto(url) {

    if (
        !topProfilePhoto ||
        !topProfilePlaceholder
    ) {

        return;

    }


    const photoURL =
        String(
            url || ""
        ).trim();


    if (photoURL) {

        topProfilePhoto.src =
            photoURL;

        topProfilePhoto.style.display =
            "block";

        topProfilePlaceholder.style.display =
            "none";

    } else {

        topProfilePhoto.removeAttribute(
            "src"
        );

        topProfilePhoto.style.display =
            "none";

        topProfilePlaceholder.style.display =
            "flex";

    }

}


/* =========================================================
   LOAD USER
========================================================= */

async function loadUser(user) {

    try {

        console.log(
            "Mengambil data user:",
            `users/${user.uid}`
        );


        const userRef =
            doc(
                firestore,
                "users",
                user.uid
            );


        const snapshot =
            await getDoc(userRef);


        /* -----------------------------------------------------
           USER TIDAK ADA
        ----------------------------------------------------- */

        if (!snapshot.exists()) {

            console.error(
                "Dokumen users/{uid} tidak ditemukan."
            );


            alert(
                "Data akun tidak ditemukan. Silakan login kembali."
            );


            await signOut(auth);


            window.location.href =
                "index.html";


            return false;

        }


        const data =
            snapshot.data() || {};


        console.log(
            "Data user:",
            data
        );


        /* -----------------------------------------------------
           ROLE
        ----------------------------------------------------- */

        const role =
            String(
                data.role || ""
            )
                .toLowerCase()
                .trim();


        /*
         * Role Firebase:
         *
         * siswa
         * guru
         *
         * Tampilan aplikasi:
         * Murid
         */


        if (role !== "siswa") {

            if (role === "guru") {

                window.location.href =
                    "guru/dashboard.html";

            } else {

                console.error(
                    "Role tidak valid:",
                    role
                );


                alert(
                    "Role akun tidak dikenali."
                );


                await signOut(auth);


                window.location.href =
                    "index.html";

            }


            return false;

        }


        /* -----------------------------------------------------
           DATA USER
        ----------------------------------------------------- */

        const nama =
            String(
                data.nama ||
                user.displayName ||
                "Murid"
            ).trim() || "Murid";


        const kelas =
            String(
                data.kelas || "-"
            ).trim() || "-";


        /* -----------------------------------------------------
           NAMA
        ----------------------------------------------------- */

        if (topUserName) {

            topUserName.textContent =
                nama;

        }


        /* -----------------------------------------------------
           KELAS
        ----------------------------------------------------- */

        if (topUserClass) {

            topUserClass.textContent =
                kelas;

        }


        /* -----------------------------------------------------
           FOTO
        ----------------------------------------------------- */

        showTopProfilePhoto(
            data.photoURL || ""
        );


        return true;

    } catch (error) {

        console.error(
            "LOAD USER ERROR:",
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


        return false;

    }

}


/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(value) {

    return String(
        value || ""
    )
        .toLowerCase()
        .trim();

}


/* =========================================================
   FILTER MATERI
========================================================= */

function filterMateri() {

    const keyword =
        normalizeText(
            searchMateri?.value
        );


    /* -----------------------------------------------------
       KATEGORI AKTIF
    ----------------------------------------------------- */

    const activeCategoryButton =
        categoryButtons.find(
            (button) =>
                button.classList.contains(
                    "active"
                )
        );


    const category =
        normalizeText(
            activeCategoryButton?.dataset.category
        );


    let visibleCount = 0;


    /* -----------------------------------------------------
       FILTER CARD
    ----------------------------------------------------- */

    materiCards.forEach(
        (card) => {

            const title =
                normalizeText(
                    card.dataset.title
                );


            const cardCategory =
                normalizeText(
                    card.dataset.category
                );


            const cardText =
                normalizeText(
                    card.textContent
                );


            /* -------------------------------------------------
               SEARCH
            ------------------------------------------------- */

            const matchKeyword =
                !keyword ||
                title.includes(
                    keyword
                ) ||
                cardCategory.includes(
                    keyword
                ) ||
                cardText.includes(
                    keyword
                );


            /* -------------------------------------------------
               CATEGORY
            ------------------------------------------------- */

            const matchCategory =
                !category ||
                cardCategory ===
                    category;


            /* -------------------------------------------------
               RESULT
            ------------------------------------------------- */

            const visible =
                matchKeyword &&
                matchCategory;


            if (visible) {

                card.style.display =
                    "";

                visibleCount++;

            } else {

                card.style.display =
                    "none";

            }

        }
    );


    /* =====================================================
       UPDATE COUNT
    ===================================================== */

    if (materiCount) {

        materiCount.textContent =
            visibleCount;

    }


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (emptyState) {

        if (
            visibleCount === 0
        ) {

            emptyState.style.display =
                "block";

        } else {

            emptyState.style.display =
                "none";

        }

    }

}


/* =========================================================
   SET ACTIVE CATEGORY
========================================================= */

function setActiveCategory(
    activeButton
) {

    categoryButtons.forEach(
        (button) => {

            button.classList.remove(
                "active"
            );

        }
    );


    if (activeButton) {

        activeButton.classList.add(
            "active"
        );

    }

}


/* =========================================================
   CATEGORY BUTTON
========================================================= */

categoryButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                setActiveCategory(
                    button
                );


                filterMateri();

            }
        );

    }
);


/* =========================================================
   SEARCH
========================================================= */

if (searchMateri) {

    searchMateri.addEventListener(
        "input",
        filterMateri
    );

}


/* =========================================================
   READ MATERIAL
========================================================= */

const readButtons =
    document.querySelectorAll(
        ".btn-baca"
    );


readButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const targetId =
                    button.dataset.target;


                if (!targetId) {

                    return;

                }


                const detail =
                    document.getElementById(
                        targetId
                    );


                if (!detail) {

                    console.warn(
                        "Detail materi tidak ditemukan:",
                        targetId
                    );

                    return;

                }


                /* -------------------------------------------------
                   SCROLL KE DETAIL
                ------------------------------------------------- */

                detail.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });


                /* -------------------------------------------------
                   FOCUS SEMENTARA
                ------------------------------------------------- */

                detail.classList.add(
                    "detail-focus"
                );


                setTimeout(
                    () => {

                        detail.classList.remove(
                            "detail-focus"
                        );

                    },
                    1400
                );

            }
        );

    }
);


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            const confirmed =
                window.confirm(
                    "Apakah Anda yakin ingin logout?"
                );


            if (!confirmed) {

                return;

            }


            try {

                logoutButton.disabled =
                    true;


                logoutButton.innerHTML =
                    "<span>⏳</span><span>Logout...</span>";


                await signOut(auth);


                window.location.href =
                    "index.html";

            } catch (error) {

                console.error(
                    "LOGOUT ERROR:",
                    error
                );


                logoutButton.disabled =
                    false;


                logoutButton.innerHTML =
                    "<span>🚪</span><span>Logout</span>";


                alert(
                    "Logout gagal. Silakan coba lagi."
                );

            }

        }
    );

}


/* =========================================================
   INITIAL UI
========================================================= */

updateTotalMateri();

filterMateri();

closeSidebar();


/* =========================================================
   AUTH CHECK
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        /* -----------------------------------------------------
           BELUM LOGIN
        ----------------------------------------------------- */

        if (!user) {

            window.location.href =
                "index.html";

            return;

        }


        console.log(
            "Auth state:",
            user.uid
        );


        /* -----------------------------------------------------
           LOAD USER
        ----------------------------------------------------- */

        const validUser =
            await loadUser(user);


        if (!validUser) {

            return;

        }


        /* -----------------------------------------------------
           TOTAL
        ----------------------------------------------------- */

        updateTotalMateri();


        /* -----------------------------------------------------
           FILTER AWAL
        ----------------------------------------------------- */

        filterMateri();

    }
);