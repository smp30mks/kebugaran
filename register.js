/* =========================================================
   REGISTER.JS
   PENDAFTARAN SISWA
   UPT SPF SMP NEGERI 30 MAKASSAR

   TAHAP 2:
   - Membuat akun Firebase Authentication
   - Membuat dokumen users/{uid}
   - Role otomatis = siswa
========================================================= */


/* =========================================================
   FIREBASE AUTH
========================================================= */

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


/* =========================================================
   FIRESTORE
========================================================= */

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

import {
    auth,
    db
} from "./firebase-config.js";


/* =========================================================
   ELEMENT
========================================================= */

const registerForm =
    document.getElementById("registerForm");

const namaInput =
    document.getElementById("nama");

const nisnInput =
    document.getElementById("nisn");

const kelasInput =
    document.getElementById("kelas");

const tahunAjaranInput =
    document.getElementById("tahunAjaran");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const registerButton =
    document.getElementById("registerButton");

const registerMessage =
    document.getElementById("registerMessage");

const togglePassword =
    document.getElementById("togglePassword");

const toggleConfirmPassword =
    document.getElementById("toggleConfirmPassword");


/* =========================================================
   TAMPILKAN PESAN
========================================================= */

function showMessage(
    message,
    type = "error"
) {

    if (!registerMessage) {
        return;
    }


    registerMessage.textContent =
        message;


    registerMessage.style.display =
        "block";


    registerMessage.className =
        "login-message";


    if (type === "success") {

        registerMessage.classList.add(
            "success"
        );

    } else {

        registerMessage.classList.add(
            "error"
        );

    }

}


/* =========================================================
   HILANGKAN PESAN
========================================================= */

function hideMessage() {

    if (!registerMessage) {
        return;
    }


    registerMessage.textContent =
        "";


    registerMessage.style.display =
        "none";

}


/* =========================================================
   TOMBOL REGISTER
========================================================= */

function setRegisterLoading(
    isLoading
) {

    if (!registerButton) {
        return;
    }


    if (isLoading) {

        registerButton.disabled =
            true;


        registerButton.dataset.originalText =
            registerButton.textContent;


        registerButton.textContent =
            "Mendaftarkan...";

    } else {

        registerButton.disabled =
            false;


        registerButton.textContent =
            registerButton.dataset.originalText ||
            "Daftar";

    }

}


/* =========================================================
   TOGGLE PASSWORD
========================================================= */

function setupPasswordToggle(
    button,
    input
) {

    if (!button || !input) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            if (
                input.type ===
                "password"
            ) {

                input.type =
                    "text";


                button.textContent =
                    "🙈";


                button.setAttribute(
                    "aria-label",
                    "Sembunyikan password"
                );

            } else {

                input.type =
                    "password";


                button.textContent =
                    "👁";


                button.setAttribute(
                    "aria-label",
                    "Tampilkan password"
                );

            }

        }
    );

}


/* =========================================================
   AKTIFKAN TOGGLE
========================================================= */

setupPasswordToggle(
    togglePassword,
    passwordInput
);


setupPasswordToggle(
    toggleConfirmPassword,
    confirmPasswordInput
);


/* =========================================================
   VALIDASI NISN
========================================================= */

function validateNisn(
    nisn
) {

    if (!nisn) {

        return "NISN wajib diisi.";

    }


    if (!/^\d+$/.test(nisn)) {

        return "NISN hanya boleh berisi angka.";

    }


    if (
        nisn.length < 5 ||
        nisn.length > 20
    ) {

        return "NISN harus berisi antara 5 sampai 20 angka.";

    }


    return null;

}


/* =========================================================
   VALIDASI TAHUN AJARAN
========================================================= */

function validateTahunAjaran(
    tahunAjaran
) {

    if (!tahunAjaran) {

        return "Tahun ajaran wajib diisi.";

    }


    const pattern =
        /^\d{4}\/\d{4}$/;


    if (!pattern.test(tahunAjaran)) {

        return "Format tahun ajaran harus seperti 2026/2027.";

    }


    const tahun =
        tahunAjaran.split("/");


    const tahunAwal =
        Number(tahun[0]);


    const tahunAkhir =
        Number(tahun[1]);


    if (
        tahunAkhir !==
        tahunAwal + 1
    ) {

        return "Tahun ajaran tidak valid.";

    }


    return null;

}


/* =========================================================
   ERROR FIREBASE
========================================================= */

function getFirebaseErrorMessage(
    errorCode
) {

    switch (errorCode) {

        case "auth/email-already-in-use":

            return "Email tersebut sudah digunakan.";

        case "auth/invalid-email":

            return "Format email tidak valid.";

        case "auth/weak-password":

            return "Password terlalu lemah. Gunakan minimal 6 karakter.";

        case "auth/network-request-failed":

            return "Koneksi internet bermasalah.";

        case "auth/operation-not-allowed":

            return "Pendaftaran email/password belum diaktifkan di Firebase.";

        case "auth/too-many-requests":

            return "Terlalu banyak percobaan. Silakan coba lagi nanti.";

        default:

            return "Pendaftaran gagal. Silakan coba lagi.";

    }

}


/* =========================================================
   FORM REGISTER
========================================================= */

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            hideMessage();


            /* =================================================
               AMBIL DATA FORM
            ================================================== */

            const nama =
                namaInput
                    ? namaInput.value.trim()
                    : "";


            const nisn =
                nisnInput
                    ? nisnInput.value.trim()
                    : "";


            const kelas =
                kelasInput
                    ? kelasInput.value.trim()
                    : "";


            const tahunAjaran =
                tahunAjaranInput
                    ? tahunAjaranInput.value.trim()
                    : "";


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            const confirmPassword =
                confirmPasswordInput
                    ? confirmPasswordInput.value
                    : "";


            /* =================================================
               VALIDASI NAMA
            ================================================== */

            if (!nama) {

                showMessage(
                    "Nama lengkap wajib diisi."
                );


                namaInput?.focus();

                return;

            }


            if (nama.length < 3) {

                showMessage(
                    "Nama lengkap terlalu pendek."
                );


                namaInput?.focus();

                return;

            }


            /* =================================================
               VALIDASI NISN
            ================================================== */

            const nisnError =
                validateNisn(nisn);


            if (nisnError) {

                showMessage(
                    nisnError
                );


                nisnInput?.focus();

                return;

            }


            /* =================================================
               VALIDASI KELAS
            ================================================== */

            if (!kelas) {

                showMessage(
                    "Silakan pilih kelas."
                );


                kelasInput?.focus();

                return;

            }


            /* =================================================
               VALIDASI TAHUN AJARAN
            ================================================== */

            const tahunError =
                validateTahunAjaran(
                    tahunAjaran
                );


            if (tahunError) {

                showMessage(
                    tahunError
                );


                tahunAjaranInput?.focus();

                return;

            }


            /* =================================================
               VALIDASI EMAIL
            ================================================== */

            if (!email) {

                showMessage(
                    "Email wajib diisi."
                );


                emailInput?.focus();

                return;

            }


            /* =================================================
               VALIDASI PASSWORD
            ================================================== */

            if (!password) {

                showMessage(
                    "Password wajib diisi."
                );


                passwordInput?.focus();

                return;

            }


            if (password.length < 6) {

                showMessage(
                    "Password minimal 6 karakter."
                );


                passwordInput?.focus();

                return;

            }


            /* =================================================
               KONFIRMASI PASSWORD
            ================================================== */

            if (
                password !==
                confirmPassword
            ) {

                showMessage(
                    "Konfirmasi password tidak sama."
                );


                confirmPasswordInput?.focus();

                return;

            }


            /* =================================================
               MULAI REGISTER
            ================================================== */

            setRegisterLoading(true);


            try {

                /* =============================================
                   BUAT AKUN AUTHENTICATION
                ============================================== */

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    credential.user;


                /* =============================================
                   SIMPAN DATA SISWA KE FIRESTORE
                ============================================== */

                const userRef =
                    doc(
                        db,
                        "users",
                        user.uid
                    );


                await setDoc(
                    userRef,
                    {

                        uid: user.uid,

                        nama: nama,

                        nisn: nisn,

                        kelas: kelas,

                        tahunAjaran: tahunAjaran,

                        email: email,

                        role: "siswa"

                    }
                );


                /* =============================================
                   BERHASIL
                ============================================== */

                showMessage(
                    "Pendaftaran berhasil. Mengalihkan ke halaman login...",
                    "success"
                );


                /* =============================================
                   REDIRECT
                ============================================== */

                setTimeout(
                    () => {

                        window.location.href =
                            "index.html";

                    },
                    1000
                );


            } catch (error) {

                console.error(
                    "REGISTER ERROR:",
                    error
                );


                showMessage(
                    getFirebaseErrorMessage(
                        error.code
                    )
                );

            } finally {

                setRegisterLoading(false);

            }

        }
    );

}