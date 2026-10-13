import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

import {
    auth,
    db,
    storage
} from "./firebase-config.js";


// =========================================================
// ELEMENT
// =========================================================

const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const logoutButton = document.getElementById("logoutButton");

const photoInput = document.getElementById("photoInput");
const profilePhoto = document.getElementById("profilePhoto");
const profilePhotoPlaceholder =
    document.getElementById("profilePhotoPlaceholder");

const topProfilePhoto =
    document.getElementById("topProfilePhoto");

const topProfilePlaceholder =
    document.getElementById("topProfilePlaceholder");

const photoMessage =
    document.getElementById("photoMessage");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const topUserName =
    document.getElementById("topUserName");

const topUserClass =
    document.getElementById("topUserClass");

const dataNama =
    document.getElementById("dataNama");

const dataNisn =
    document.getElementById("dataNisn");

const dataEmail =
    document.getElementById("dataEmail");

const dataKelas =
    document.getElementById("dataKelas");

const dataTahunAjaran =
    document.getElementById("dataTahunAjaran");


// =========================================================
// PESAN FOTO
// =========================================================

function showPhotoMessage(message, type = "") {

    if (!photoMessage) {
        return;
    }

    photoMessage.textContent = message;

    photoMessage.className = "photo-message";

    if (type) {
        photoMessage.classList.add(type);
    }
}


// =========================================================
// TAMPILKAN FOTO
// =========================================================

function showPhoto(url) {

    if (url) {

        // -------------------------------------------------
        // FOTO PROFIL BESAR
        // -------------------------------------------------

        if (profilePhoto) {

            profilePhoto.src = url;

            profilePhoto.style.display = "block";
        }

        if (profilePhotoPlaceholder) {

            profilePhotoPlaceholder.style.display =
                "none";
        }


        // -------------------------------------------------
        // FOTO TOPBAR
        // -------------------------------------------------

        if (topProfilePhoto) {

            topProfilePhoto.src = url;

            topProfilePhoto.style.display =
                "block";
        }

        if (topProfilePlaceholder) {

            topProfilePlaceholder.style.display =
                "none";
        }

    } else {

        // -------------------------------------------------
        // TANPA FOTO
        // -------------------------------------------------

        if (profilePhoto) {

            profilePhoto.removeAttribute("src");

            profilePhoto.style.display = "none";
        }

        if (profilePhotoPlaceholder) {

            profilePhotoPlaceholder.style.display =
                "flex";
        }


        // -------------------------------------------------
        // TOPBAR TANPA FOTO
        // -------------------------------------------------

        if (topProfilePhoto) {

            topProfilePhoto.removeAttribute("src");

            topProfilePhoto.style.display =
                "none";
        }

        if (topProfilePlaceholder) {

            topProfilePlaceholder.style.display =
                "flex";
        }
    }
}


// =========================================================
// KOMPRES FOTO
// =========================================================

function compressImage(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();


        // -------------------------------------------------
        // FILE LOADED
        // -------------------------------------------------

        reader.onload = (event) => {

            const image = new Image();


            // -------------------------------------------------
            // IMAGE LOADED
            // -------------------------------------------------

            image.onload = () => {

                const maxWidth = 800;
                const maxHeight = 800;

                let width = image.width;
                let height = image.height;


                // -------------------------------------------------
                // RESIZE PROPORSIONAL
                // -------------------------------------------------

                if (
                    width > maxWidth ||
                    height > maxHeight
                ) {

                    const ratio =
                        Math.min(
                            maxWidth / width,
                            maxHeight / height
                        );

                    width =
                        Math.round(
                            width * ratio
                        );

                    height =
                        Math.round(
                            height * ratio
                        );
                }


                // -------------------------------------------------
                // CANVAS
                // -------------------------------------------------

                const canvas =
                    document.createElement(
                        "canvas"
                    );

                canvas.width = width;
                canvas.height = height;


                const context =
                    canvas.getContext(
                        "2d"
                    );


                if (!context) {

                    reject(
                        new Error(
                            "Canvas tidak tersedia."
                        )
                    );

                    return;
                }


                // -------------------------------------------------
                // DRAW IMAGE
                // -------------------------------------------------

                context.drawImage(
                    image,
                    0,
                    0,
                    width,
                    height
                );


                // -------------------------------------------------
                // CONVERT TO JPEG
                // -------------------------------------------------

                canvas.toBlob(
                    (blob) => {

                        if (!blob) {

                            reject(
                                new Error(
                                    "Gagal mengompres foto."
                                )
                            );

                            return;
                        }

                        resolve(blob);

                    },
                    "image/jpeg",
                    0.80
                );
            };


            // -------------------------------------------------
            // IMAGE ERROR
            // -------------------------------------------------

            image.onerror = () => {

                reject(
                    new Error(
                        "Foto tidak dapat dibaca."
                    )
                );
            };


            image.src =
                event.target.result;
        };


        // -------------------------------------------------
        // FILE ERROR
        // -------------------------------------------------

        reader.onerror = () => {

            reject(
                new Error(
                    "Gagal membaca file."
                )
            );
        };


        reader.readAsDataURL(file);
    });
}


// =========================================================
// UPLOAD FOTO
// =========================================================

if (photoInput) {

    photoInput.addEventListener(
        "change",
        async () => {

            const file =
                photoInput.files?.[0];


            if (!file) {
                return;
            }


            // =================================================
            // CEK LOGIN
            // =================================================

            const user =
                auth.currentUser;


            if (!user) {

                window.location.href =
                    "index.html";

                return;
            }


            // =================================================
            // CEK FORMAT
            // =================================================

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                showPhotoMessage(
                    "Format foto harus JPG, PNG, atau WebP.",
                    "error"
                );

                photoInput.value = "";

                return;
            }


            // =================================================
            // CEK UKURAN ASLI
            // =================================================

            if (
                file.size >
                5 * 1024 * 1024
            ) {

                showPhotoMessage(
                    "Ukuran foto asli maksimal 5 MB.",
                    "error"
                );

                photoInput.value = "";

                return;
            }


            try {

                // =================================================
                // PROSES
                // =================================================

                showPhotoMessage(
                    "Memproses foto...",
                    "loading"
                );


                // =================================================
                // KOMPRES
                // =================================================

                const compressedPhoto =
                    await compressImage(
                        file
                    );


                // =================================================
                // CEK HASIL KOMPRES
                // =================================================

                if (
                    compressedPhoto.size >
                    1 * 1024 * 1024
                ) {

                    showPhotoMessage(
                        "Foto masih lebih dari 1 MB. Silakan pilih foto lain.",
                        "error"
                    );

                    photoInput.value = "";

                    return;
                }


                // =================================================
                // STORAGE PATH
                // =================================================

                const photoRef =
                    ref(
                        storage,
                        `profile/${user.uid}/profile.jpg`
                    );


                // =================================================
                // UPLOAD
                // =================================================

                showPhotoMessage(
                    "Mengupload foto...",
                    "loading"
                );


                await uploadBytes(
                    photoRef,
                    compressedPhoto,
                    {
                        contentType:
                            "image/jpeg"
                    }
                );


                // =================================================
                // GET DOWNLOAD URL
                // =================================================

                const photoURL =
                    await getDownloadURL(
                        photoRef
                    );


                // =================================================
                // UPDATE FIRESTORE
                // =================================================

                await updateDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    ),
                    {
                        photoURL:
                            photoURL
                    }
                );


                // =================================================
                // TAMPILKAN FOTO
                // =================================================

                showPhoto(
                    photoURL
                );


                showPhotoMessage(
                    "Foto profil berhasil diperbarui.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "UPLOAD FOTO ERROR:",
                    error
                );


                showPhotoMessage(
                    "Gagal mengupload foto. Periksa Firebase Storage dan Rules.",
                    "error"
                );


            } finally {

                photoInput.value = "";
            }
        }
    );
}


// =========================================================
// SIDEBAR
// =========================================================

function openSidebar() {

    sidebar?.classList.add(
        "active"
    );

    sidebarOverlay?.classList.add(
        "active"
    );
}


function closeSidebar() {

    sidebar?.classList.remove(
        "active"
    );

    sidebarOverlay?.classList.remove(
        "active"
    );
}


// =========================================================
// MENU BUTTON
// =========================================================

menuButton?.addEventListener(
    "click",
    () => {

        if (
            sidebar?.classList.contains(
                "active"
            )
        ) {

            closeSidebar();

        } else {

            openSidebar();
        }
    }
);


// =========================================================
// OVERLAY
// =========================================================

sidebarOverlay?.addEventListener(
    "click",
    closeSidebar
);


// =========================================================
// TUTUP SIDEBAR SETELAH MEMILIH MENU
// =========================================================

document
    .querySelectorAll(
        ".menu-item"
    )
    .forEach(
        (item) => {

            item.addEventListener(
                "click",
                closeSidebar
            );

        }
    );


// =========================================================
// LOGOUT
// =========================================================

logoutButton?.addEventListener(
    "click",
    async () => {

        const confirmed =
            confirm(
                "Apakah Anda yakin ingin logout?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await signOut(
                auth
            );


            window.location.href =
                "index.html";


        } catch (error) {

            console.error(
                "LOGOUT ERROR:",
                error
            );


            alert(
                "Logout gagal. Silakan coba lagi."
            );
        }
    }
);


// =========================================================
// LOAD PROFILE
// =========================================================

onAuthStateChanged(
    auth,
    async (user) => {

        // =================================================
        // BELUM LOGIN
        // =================================================

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        try {

            // =================================================
            // USER DOCUMENT
            // =================================================

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const snapshot =
                await getDoc(
                    userRef
                );


            // =================================================
            // USER TIDAK DITEMUKAN
            // =================================================

            if (
                !snapshot.exists()
            ) {

                await signOut(
                    auth
                );


                window.location.href =
                    "index.html";

                return;
            }


            const data =
                snapshot.data();


            // =================================================
            // ROLE
            // =================================================

            const role =
                String(
                    data.role || ""
                )
                    .toLowerCase()
                    .trim();


            if (
                role !== "siswa"
            ) {

                // -------------------------------------------------
                // GURU
                // -------------------------------------------------

                if (
                    role === "guru"
                ) {

                    window.location.href =
                        "guru/dashboard.html";

                } else {

                    // -------------------------------------------------
                    // ROLE TIDAK VALID
                    // -------------------------------------------------

                    await signOut(
                        auth
                    );


                    window.location.href =
                        "index.html";
                }


                return;
            }


            // =================================================
            // DATA USER
            // =================================================

            const nama =
                data.nama ||
                user.displayName ||
                "Murid";


            const email =
                data.email ||
                user.email ||
                "-";


            const nisn =
                data.nisn ||
                "-";


            const kelas =
                data.kelas ||
                "-";


            const tahunAjaran =
                data.tahunAjaran ||
                "-";


            // =================================================
            // PROFILE HEADER
            // =================================================

            if (profileName) {

                profileName.textContent =
                    nama;
            }


            if (profileEmail) {

                profileEmail.textContent =
                    email;
            }


            // =================================================
            // TOPBAR
            // =================================================

            if (topUserName) {

                topUserName.textContent =
                    nama;
            }


            if (topUserClass) {

                topUserClass.textContent =
                    kelas;
            }


            // =================================================
            // DATA PRIBADI
            // =================================================

            if (dataNama) {

                dataNama.textContent =
                    nama;
            }


            if (dataNisn) {

                dataNisn.textContent =
                    nisn;
            }


            if (dataEmail) {

                dataEmail.textContent =
                    email;
            }


            if (dataKelas) {

                dataKelas.textContent =
                    kelas;
            }


            if (dataTahunAjaran) {

                dataTahunAjaran.textContent =
                    tahunAjaran;
            }


            // =================================================
            // FOTO
            // =================================================

            showPhoto(
                data.photoURL || ""
            );


        } catch (error) {

            console.error(
                "LOAD PROFILE ERROR:",
                error
            );
        }

    }
);
