/* =========================================================
   GURU / MATERI.JS
   HALAMAN MATERI GURU

   TIDAK MENGGUNAKAN FIREBASE
========================================================= */


/* =========================================================
   ELEMENT
========================================================= */

const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const logoutButton =
    document.getElementById("logoutButton");

const topUserName =
    document.getElementById("topUserName");

const topProfilePhoto =
    document.getElementById("topProfilePhoto");

const topProfilePlaceholder =
    document.getElementById("topProfilePlaceholder");


/* =========================================================
   SIDEBAR
========================================================= */

function openSidebar() {

    if (sidebar) {
        sidebar.classList.add("show");
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.add("show");
    }

    document.body.classList.add("sidebar-open");
}


function closeSidebar() {

    if (sidebar) {
        sidebar.classList.remove("show");
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("show");
    }

    document.body.classList.remove("sidebar-open");
}


/* =========================================================
   TOMBOL MENU MOBILE
========================================================= */

if (menuButton) {

    menuButton.addEventListener("click", () => {

        if (
            sidebar &&
            sidebar.classList.contains("show")
        ) {

            closeSidebar();

        } else {

            openSidebar();

        }

    });

}


/* =========================================================
   OVERLAY
========================================================= */

if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


/* =========================================================
   MENU SIDEBAR
========================================================= */

const menuItems =
    document.querySelectorAll(".menu-item");


menuItems.forEach(item => {

    item.addEventListener("click", () => {

        closeSidebar();

    });

});


/* =========================================================
   PROFILE
   SEMENTARA MENGAMBIL DARI localStorage
   JIKA DATA TERSEDIA
========================================================= */

try {

    const savedUser =
        localStorage.getItem("user");


    if (savedUser) {

        const user =
            JSON.parse(savedUser);


        if (
            user.name &&
            topUserName
        ) {

            topUserName.textContent =
                user.name;

        }


        if (
            user.displayName &&
            topUserName
        ) {

            topUserName.textContent =
                user.displayName;

        }


        if (
            user.photoURL &&
            topProfilePhoto
        ) {

            topProfilePhoto.src =
                user.photoURL;

            topProfilePhoto.style.display =
                "block";


            if (topProfilePlaceholder) {

                topProfilePlaceholder.style.display =
                    "none";

            }

        }

    }

} catch (error) {

    console.warn(
        "Data profil tidak dapat dibaca:",
        error
    );

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            const confirmLogout =
                confirm(
                    "Apakah Anda yakin ingin logout?"
                );


            if (!confirmLogout) {

                return;

            }


            /*
             * Hapus data login lokal
             * jika sistem login menyimpannya.
             */

            try {

                localStorage.removeItem("user");

            } catch (error) {

                console.warn(
                    "Gagal menghapus data user:",
                    error
                );

            }


            /*
             * Kembali ke halaman login.
             */

            window.location.href =
                "../index.html";

        }
    );

}


/* =========================================================
   MULAI BELAJAR
========================================================= */

const startButtons =
    document.querySelectorAll(
        ".materi-button[data-target]"
    );


startButtons.forEach(button => {

    button.addEventListener(
        "click",
        event => {

            event.preventDefault();


            const targetId =
                button.getAttribute(
                    "data-target"
                );


            if (!targetId) {

                return;

            }


            const target =
                document.getElementById(
                    targetId
                );


            if (!target) {

                console.warn(
                    "Materi tidak ditemukan:",
                    targetId
                );

                return;

            }


            target.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });


            /*
             * Efek highlight
             */

            target.classList.add(
                "detail-highlight"
            );


            setTimeout(() => {

                target.classList.remove(
                    "detail-highlight"
                );

            }, 1200);

        }
    );

});


/* =========================================================
   TOMBOL KEMBALI KE DAFTAR MATERI
========================================================= */

const backButtons =
    document.querySelectorAll(
        ".back-to-materi"
    );


backButtons.forEach(button => {

    button.addEventListener(
        "click",
        event => {

            event.preventDefault();


            const materiSection =
                document.querySelector(
                    ".materi-list-section"
                );


            if (!materiSection) {

                return;

            }


            materiSection.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }
    );

});


/* =========================================================
   LINK EKSTERNAL
========================================================= */

const externalLinks =
    document.querySelectorAll(
        '.materi-detail a[href^="http"]'
    );


externalLinks.forEach(link => {

    link.setAttribute(
        "target",
        "_blank"
    );

    link.setAttribute(
        "rel",
        "noopener noreferrer"
    );

});


/* =========================================================
   IMAGE ERROR HANDLER
========================================================= */

const materialImages =
    document.querySelectorAll(
        ".materi-image img"
    );


materialImages.forEach(image => {

    image.addEventListener(
        "error",
        () => {

            image.style.opacity =
                "0.25";

            image.alt =
                "Gambar materi tidak ditemukan";

        }
    );

});


/* =========================================================
   ACTIVE MENU
========================================================= */

const currentPage =
    window.location.pathname
        .split("/")
        .pop();


menuItems.forEach(item => {

    const itemPage =
        item.getAttribute("href");


    if (
        itemPage &&
        itemPage === currentPage
    ) {

        menuItems.forEach(menu => {

            menu.classList.remove(
                "active"
            );

        });


        item.classList.add(
            "active"
        );

    }

});


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (window.innerWidth > 900) {

            closeSidebar();

        }

    }
);


/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeSidebar();

        }

    }
);


/* =========================================================
   SELESAI
========================================================= */

console.log(
    "Guru Materi berhasil dimuat."
);