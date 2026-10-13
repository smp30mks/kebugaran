/* =========================================================
   LOGIN.JS
   LOGIN + STATISTIK PUBLIK
   APLIKASI KEBUGARAN
   UPT SPF SMP NEGERI 30 MAKASSAR
   Firebase v12
========================================================= */


/* =========================================================
   FIREBASE AUTH
========================================================= */

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


/* =========================================================
   FIREBASE FIRESTORE
========================================================= */

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

import {
    auth,
    db
} from "./firebase-config.js";


/* =========================================================
   BUAT STATISTIK
========================================================= */

import {
    buatStatistik
} from "./buat-statistik.js";


/* =========================================================
   KONFIGURASI
========================================================= */

const PUBLIC_COLLECTION = "statistikPublik";

const CACHE_KEY =
    "publicFitnessStatistics_v5";

const CACHE_TIME_KEY =
    "publicFitnessStatisticsTime_v5";

const CACHE_DURATION =
    30 * 60 * 1000;


/* =========================================================
   DATA GLOBAL
========================================================= */

let publicStatistics = [];

let selectedYear = "all";
let selectedClass = "all";
let selectedGender = "all";

let isPublicStatisticsLoading = false;


/* =========================================================
   NAMA TES
========================================================= */

const TESTS = [
    {
        key: "handeye",
        name: "Hand & Eye Coordination"
    },
    {
        key: "situp",
        name: "Sit Up"
    },
    {
        key: "standingbroadjump",
        name: "Standing Broad Jump"
    },
    {
        key: "ttest",
        name: "T-Test"
    },
    {
        key: "beeptest",
        name: "Beeptest"
    }
];


/* =========================================================
   KATEGORI
========================================================= */

const CATEGORIES = {
    5: "Baik Sekali",
    4: "Baik",
    3: "Sedang",
    2: "Kurang",
    1: "Kurang Sekali"
};


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initPasswordToggle();

        initLoginForm();

        initForgotPassword();

        initPublicStatistics();

    }
);


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function initPasswordToggle() {

    const passwordInput =
        document.getElementById("password");

    const toggleButton =
        document.getElementById("togglePassword");

    if (
        !passwordInput ||
        !toggleButton
    ) {
        return;
    }

    toggleButton.addEventListener(
        "click",
        () => {

            const isPassword =
                passwordInput.type === "password";

            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";

            toggleButton.textContent =
                isPassword
                    ? "🙈"
                    : "👁";

            toggleButton.setAttribute(
                "aria-label",
                isPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
            );

        }
    );

}


/* =========================================================
   LOGIN FORM
========================================================= */

function initLoginForm() {

    const form =
        document.getElementById("loginForm");

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const emailInput =
                document.getElementById("email");

            const passwordInput =
                document.getElementById("password");

            const email =
                emailInput?.value.trim() || "";

            const password =
                passwordInput?.value || "";

            if (
                !email ||
                !password
            ) {

                showLoginMessage(
                    "Email dan password wajib diisi.",
                    "error"
                );

                return;
            }

            setLoginLoading(true);

            hideLoginMessage();

            try {

                const credential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                const uid =
                    credential.user.uid;

                const userRef =
                    doc(
                        db,
                        "users",
                        uid
                    );

                const userSnapshot =
                    await getDoc(userRef);

                if (
                    !userSnapshot.exists()
                ) {

                    await signOut(auth);

                    throw new Error(
                        "Data akun tidak ditemukan."
                    );

                }

                const userData =
                    userSnapshot.data();

                const role =
                    normalizeText(
                        userData.role
                    );

                if (
                    role === "guru"
                ) {

                    showLoginMessage(
                        "Login berhasil. Menyiapkan statistik...",
                        "success"
                    );

                    await loginGuru(uid);

                    return;
                }

                if (
                    role === "siswa"
                ) {

                    showLoginMessage(
                        "Login berhasil. Mengarahkan ke dashboard...",
                        "success"
                    );

                    window.location.href =
                        "dashboard.html";

                    return;
                }

                await signOut(auth);

                throw new Error(
                    "Role akun tidak dikenali."
                );

            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );

                showLoginMessage(
                    getLoginErrorMessage(error),
                    "error"
                );

            } finally {

                setLoginLoading(false);

            }

        }
    );

}


/* =========================================================
   LOGIN GURU
========================================================= */

async function loginGuru(uid) {

    try {

        console.log(
            "Memperbarui statistik publik..."
        );

        const result =
            await buatStatistik();

        console.log(
            "Statistik publik selesai:",
            result
        );

        clearPublicStatisticsCache();

        window.location.href =
            "guru/dashboard.html";

    } catch (error) {

        console.error(
            "Gagal membuat statistik:",
            error
        );

        showLoginMessage(
            "Login berhasil, tetapi statistik publik belum diperbarui.",
            "success"
        );

        setTimeout(
            () => {

                window.location.href =
                    "guru/dashboard.html";

            },
            800
        );

    }

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

function initForgotPassword() {

    const forgotPassword =
        document.getElementById(
            "forgotPassword"
        );

    if (!forgotPassword) {
        return;
    }

    forgotPassword.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();

            const emailInput =
                document.getElementById("email");

            const email =
                emailInput?.value.trim() || "";

            if (!email) {

                showLoginMessage(
                    "Masukkan email terlebih dahulu untuk reset password.",
                    "error"
                );

                emailInput?.focus();

                return;
            }

            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );

                showLoginMessage(
                    "Link reset password telah dikirim ke email Anda.",
                    "success"
                );

            } catch (error) {

                console.error(
                    "RESET PASSWORD ERROR:",
                    error
                );

                showLoginMessage(
                    getResetPasswordErrorMessage(error),
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   LOGIN LOADING
========================================================= */

function setLoginLoading(
    isLoading
) {

    const loginButton =
        document.getElementById(
            "loginButton"
        );

    if (!loginButton) {
        return;
    }

    if (isLoading) {

        loginButton.disabled = true;

        loginButton.dataset.originalText =
            loginButton.textContent;

        loginButton.textContent =
            "Memproses...";

    } else {

        loginButton.disabled = false;

        loginButton.textContent =
            loginButton.dataset.originalText ||
            "Login";

    }

}


/* =========================================================
   LOGIN MESSAGE
========================================================= */

function showLoginMessage(
    message,
    type = "info"
) {

    const element =
        document.getElementById(
            "loginMessage"
        );

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.className =
        `login-message ${type}`;

    element.style.display =
        "block";

}


/* =========================================================
   HIDE MESSAGE
========================================================= */

function hideLoginMessage() {

    const element =
        document.getElementById(
            "loginMessage"
        );

    if (!element) {
        return;
    }

    element.textContent =
        "";

    element.style.display =
        "none";

}


/* =========================================================
   ERROR LOGIN
========================================================= */

function getLoginErrorMessage(
    error
) {

    const code =
        error?.code || "";

    switch (code) {

        case "auth/invalid-credential":
        case "auth/invalid-login-credentials":
        case "auth/wrong-password":
        case "auth/user-not-found":

            return "Email atau password salah.";

        case "auth/invalid-email":

            return "Format email tidak valid.";

        case "auth/too-many-requests":

            return "Terlalu banyak percobaan login. Silakan coba lagi nanti.";

        case "auth/network-request-failed":

            return "Koneksi internet bermasalah.";

        case "auth/user-disabled":

            return "Akun ini telah dinonaktifkan.";

        default:

            return (
                error?.message ||
                "Login gagal. Silakan coba lagi."
            );

    }

}


/* =========================================================
   ERROR RESET PASSWORD
========================================================= */

function getResetPasswordErrorMessage(
    error
) {

    const code =
        error?.code || "";

    switch (code) {

        case "auth/invalid-email":

            return "Format email tidak valid.";

        case "auth/user-not-found":

            return "Email tersebut belum terdaftar.";

        case "auth/network-request-failed":

            return "Koneksi internet bermasalah.";

        default:

            return "Gagal mengirim link reset password.";

    }

}


/* =========================================================
   INIT PUBLIC STATISTICS
========================================================= */

async function initPublicStatistics() {

    const container =
        document.getElementById(
            "loginPublicChart"
        );

    if (!container) {
        return;
    }

    const yearFilter =
        document.getElementById(
            "publicYearFilter"
        );

    const classFilter =
        document.getElementById(
            "publicClassFilter"
        );

    const genderFilter =
        document.getElementById(
            "publicGenderFilter"
        );


    /* =====================================================
       FILTER TAHUN
    ===================================================== */

    if (yearFilter) {

        yearFilter.addEventListener(
            "change",
            () => {

                selectedYear =
                    yearFilter.value ||
                    "all";

                selectedClass =
                    "all";

                updateClassFilter();

                updateGenderFilter();

                renderPublicStatistics();

            }
        );

    }


    /* =====================================================
       FILTER KELAS
    ===================================================== */

    if (classFilter) {

        classFilter.addEventListener(
            "change",
            () => {

                selectedClass =
                    classFilter.value ||
                    "all";

                updateGenderFilter();

                renderPublicStatistics();

            }
        );

    }


    /* =====================================================
       FILTER GENDER
    ===================================================== */

    if (genderFilter) {

        genderFilter.addEventListener(
            "change",
            () => {

                selectedGender =
                    genderFilter.value ||
                    "all";

                renderPublicStatistics();

            }
        );

    }


    /* =====================================================
       CACHE
    ===================================================== */

    const cached =
        getPublicStatisticsCache();

    if (cached) {

        publicStatistics =
            normalizeStatistics(
                cached.data
            );

        populateYearFilter();

        updateClassFilter();

        updateGenderFilter();

        renderPublicStatistics();

        refreshPublicStatistics(
            true
        );

        return;
    }


    /* =====================================================
       LOAD PERTAMA
    ===================================================== */

    renderPublicLoading();

    await refreshPublicStatistics(
        false
    );

}


/* =========================================================
   REFRESH PUBLIC STATISTICS
========================================================= */

async function refreshPublicStatistics(
    silent = false
) {

    if (
        isPublicStatisticsLoading
    ) {
        return;
    }

    isPublicStatisticsLoading =
        true;

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    PUBLIC_COLLECTION
                )
            );

        const data = [];

        snapshot.forEach(
            (item) => {

                data.push({
                    id: item.id,
                    ...item.data()
                });

            }
        );

        publicStatistics =
            normalizeStatistics(
                data
            );

        savePublicStatisticsCache(
            publicStatistics
        );

        populateYearFilter();

        updateClassFilter();

        updateGenderFilter();

        renderPublicStatistics();

    } catch (error) {

        console.error(
            "PUBLIC STATISTICS ERROR:",
            error
        );

        if (!silent) {

            renderPublicEmpty(
                "Statistik belum dapat dimuat."
            );

        }

    } finally {

        isPublicStatisticsLoading =
            false;

    }

}


/* =========================================================
   NORMALIZE STATISTICS
========================================================= */

function normalizeStatistics(
    data
) {

    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map(
            (item) => {

                const year =
                    normalizeYear(
                        item.tahunAjaran
                    );

                const kelas =
                    normalizeClass(
                        item.kelas
                    );

                const gender =
                    normalizeGender(
                        item.jenisKelamin
                    );

                return {

                    ...item,

                    tahunAjaran:
                        year,

                    kelas:
                        kelas,

                    jenisKelamin:
                        gender,

                    jumlahSiswa:
                        toNumber(
                            item.jumlahSiswa
                        ),

                    tests:
                        normalizeTests(
                            item.tests
                        )

                };

            }
        )
        .filter(
            (item) => {

                /*
                 * Hanya data dengan tahun dan kelas
                 * yang benar-benar valid.
                 *
                 * "semua" bukan tahun ajaran
                 * dan bukan kelas.
                 */

                const year =
                    normalizeText(
                        item.tahunAjaran
                    );

                const kelas =
                    normalizeText(
                        item.kelas
                    );

                if (
                    !year ||
                    !kelas
                ) {
                    return false;
                }

                if (
                    year === "semua" ||
                    year === "all"
                ) {
                    return false;
                }

                if (
                    kelas === "semua" ||
                    kelas === "all"
                ) {
                    return false;
                }

                return true;

            }
        );

}


/* =========================================================
   NORMALIZE TESTS
========================================================= */

function normalizeTests(
    tests
) {

    const result = {};

    TESTS.forEach(
        (test) => {

            const source =
                tests?.[test.key] ||
                {};

            result[test.key] = {

                nama:
                    source.nama ||
                    test.name,

                jumlahTes:
                    toNumber(
                        source.jumlahTes
                    ),

                rataRataSkor:
                    toNumber(
                        source.rataRataSkor
                    ),

                kategoriDominan:
                    source.kategoriDominan ||
                    "",

                distribusiKategori:
                    normalizeDistribution(
                        source.distribusiKategori
                    )

            };

        }
    );

    return result;

}


/* =========================================================
   NORMALIZE DISTRIBUTION
========================================================= */

function normalizeDistribution(
    distribution
) {

    return {

        1:
            toNumber(
                distribution?.[1]
            ),

        2:
            toNumber(
                distribution?.[2]
            ),

        3:
            toNumber(
                distribution?.[3]
            ),

        4:
            toNumber(
                distribution?.[4]
            ),

        5:
            toNumber(
                distribution?.[5]
            )

    };

}


/* =========================================================
   POPULATE YEAR FILTER
========================================================= */

function populateYearFilter() {

    const select =
        document.getElementById(
            "publicYearFilter"
        );

    if (!select) {
        return;
    }


    /*
     * Ambil tahun langsung dari data Firebase.
     *
     * Jangan masukkan:
     * - kosong
     * - semua
     * - all
     */

    const years =
        uniqueSorted(
            publicStatistics
                .map(
                    item =>
                        normalizeYear(
                            item.tahunAjaran
                        )
                )
                .filter(
                    year => {

                        const normalized =
                            normalizeText(
                                year
                            );

                        return (
                            year &&
                            normalized !== "semua" &&
                            normalized !== "all"
                        );

                    }
                )
        );


    select.innerHTML = "";


    /* =====================================================
       SEMUA
    ===================================================== */

    const allOption =
        document.createElement(
            "option"
        );

    allOption.value =
        "all";

    allOption.textContent =
        "Semua";

    select.appendChild(
        allOption
    );


    /* =====================================================
       TAHUN DARI FIREBASE
    ===================================================== */

    years.forEach(
        (year) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                year;

            option.textContent =
                year;

            select.appendChild(
                option
            );

        }
    );


    if (
        selectedYear !== "all" &&
        !years.includes(
            selectedYear
        )
    ) {

        selectedYear =
            "all";

    }


    select.value =
        selectedYear;

}


/* =========================================================
   UPDATE CLASS FILTER
========================================================= */

function updateClassFilter() {

    const select =
        document.getElementById(
            "publicClassFilter"
        );

    if (!select) {
        return;
    }


    let source =
        [...publicStatistics];


    /*
     * Jika tahun dipilih,
     * hanya ambil kelas pada tahun tersebut.
     */

    if (
        selectedYear !== "all"
    ) {

        source =
            source.filter(
                item =>
                    item.tahunAjaran ===
                    selectedYear
            );

    }


    /*
     * Ambil kelas dari Firebase.
     *
     * Buang:
     * - kosong
     * - semua
     * - all
     */

    const classes =
        uniqueSorted(
            source
                .map(
                    item =>
                        normalizeClass(
                            item.kelas
                        )
                )
                .filter(
                    kelas => {

                        const normalized =
                            normalizeText(
                                kelas
                            );

                        return (
                            kelas &&
                            normalized !== "semua" &&
                            normalized !== "all"
                        );

                    }
                )
        );


    select.innerHTML = "";


    /* =====================================================
       SEMUA
    ===================================================== */

    const allOption =
        document.createElement(
            "option"
        );

    allOption.value =
        "all";

    allOption.textContent =
        "Semua";

    select.appendChild(
        allOption
    );


    /* =====================================================
       KELAS DARI FIREBASE
    ===================================================== */

    classes.forEach(
        (kelas) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                kelas;

            option.textContent =
                kelas;

            select.appendChild(
                option
            );

        }
    );


    if (
        selectedClass !== "all" &&
        !classes.includes(
            selectedClass
        )
    ) {

        selectedClass =
            "all";

    }


    select.value =
        selectedClass;

    select.disabled =
        classes.length === 0;

}


/* =========================================================
   UPDATE GENDER FILTER
========================================================= */

function updateGenderFilter() {

    const select =
        document.getElementById(
            "publicGenderFilter"
        );

    if (!select) {
        return;
    }


    let source =
        [...publicStatistics];


    if (
        selectedYear !== "all"
    ) {

        source =
            source.filter(
                item =>
                    item.tahunAjaran ===
                    selectedYear
            );

    }


    if (
        selectedClass !== "all"
    ) {

        source =
            source.filter(
                item =>
                    item.kelas ===
                    selectedClass
            );

    }


    /*
     * Hanya tampilkan gender yang benar-benar
     * tersedia di Firebase.
     *
     * Data "semua" tidak menjadi option sendiri.
     */

    const genders =
        unique(
            source
                .map(
                    item =>
                        normalizeGender(
                            item.jenisKelamin
                        )
                )
                .filter(
                    gender =>
                        gender === "putra" ||
                        gender === "putri"
                )
        );


    select.innerHTML = "";


    /* =====================================================
       SEMUA
    ===================================================== */

    const allOption =
        document.createElement(
            "option"
        );

    allOption.value =
        "all";

    allOption.textContent =
        "Semua";

    select.appendChild(
        allOption
    );


    /* =====================================================
       PUTRA
    ===================================================== */

    if (
        genders.includes("putra")
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            "putra";

        option.textContent =
            "Putra";

        select.appendChild(
            option
        );

    }


    /* =====================================================
       PUTRI
    ===================================================== */

    if (
        genders.includes("putri")
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            "putri";

        option.textContent =
            "Putri";

        select.appendChild(
            option
        );

    }


    if (
        selectedGender !== "all" &&
        !genders.includes(
            selectedGender
        )
    ) {

        selectedGender =
            "all";

    }


    select.value =
        selectedGender;

}


/* =========================================================
   FILTER DATA
========================================================= */

function getFilteredStatistics() {

    let data =
        [...publicStatistics];


    if (
        selectedYear !== "all"
    ) {

        data =
            data.filter(
                item =>
                    item.tahunAjaran ===
                    selectedYear
            );

    }


    if (
        selectedClass !== "all"
    ) {

        data =
            data.filter(
                item =>
                    item.kelas ===
                    selectedClass
            );

    }


    if (
        selectedGender !== "all"
    ) {

        data =
            data.filter(
                item =>
                    normalizeGender(
                        item.jenisKelamin
                    ) ===
                    selectedGender
            );

    }


    return data;

}


/* =========================================================
   DATA PERHITUNGAN
========================================================= */

function getCalculationData(
    data
) {

    /*
     * Ketika gender = Semua:
     *
     * Gunakan dokumen jenisKelamin = "semua"
     * karena dokumen tersebut sudah merupakan
     * gabungan Putra + Putri.
     *
     * Jangan menjumlahkan:
     * semua + putra + putri.
     */

    if (
        selectedGender === "all"
    ) {

        const semuaData =
            data.filter(
                item =>
                    normalizeGender(
                        item.jenisKelamin
                    ) === "semua"
            );

        if (
            semuaData.length > 0
        ) {

            return semuaData;

        }

    }


    /*
     * Jika filter Putra / Putri,
     * gunakan data gender tersebut.
     */

    return data.filter(
        item =>
            normalizeGender(
                item.jenisKelamin
            ) ===
            (
                selectedGender === "all"
                    ? normalizeGender(
                        item.jenisKelamin
                    )
                    : selectedGender
            )
    );

}


/* =========================================================
   RENDER PUBLIC STATISTICS
========================================================= */

function renderPublicStatistics() {

    const container =
        document.getElementById(
            "loginPublicChart"
        );

    if (!container) {
        return;
    }


    const data =
        getFilteredStatistics();


    if (
        !data.length
    ) {

        renderPublicEmpty(
            "Belum ada data statistik untuk pilihan tersebut."
        );

        return;
    }


    updateGenderFilter();


    /*
     * Data untuk perhitungan harus konsisten
     * antara summary dan grafik.
     */

    const calculationData =
        getCalculationData(
            data
        );


    if (
        !calculationData.length
    ) {

        renderPublicEmpty(
            "Belum ada data statistik untuk pilihan tersebut."
        );

        return;
    }


    const summary =
        calculateSummary(
            calculationData
        );


    const testStatistics =
        calculateTestStatistics(
            calculationData
        );


    container.innerHTML = "";


    /* =====================================================
       SUMMARY CARD
    ===================================================== */

    const summaryHTML = `

        <div class="public-chart-card">

            <div class="public-chart-header">

                <div>

                    <h4>
                        Gambaran Kebugaran Murid
                    </h4>

                    <p>
                        Hasil statistik berdasarkan
                        pilihan tahun ajaran, kelas,
                        dan kelamin.
                    </p>

                </div>

                <div class="public-chart-student-count">

                    👥
                    ${formatNumber(
                        summary.jumlahMurid
                    )}
                    Murid

                </div>

            </div>


            <div class="statistics-summary">


                <div class="stat-summary-card">

                    <h3>
                        👥 Jumlah Murid
                    </h3>

                    <strong>
                        ${formatNumber(
                            summary.jumlahMurid
                        )}
                    </strong>

                </div>


                <div class="stat-summary-card">

                    <h3>
                        📈 Rata-rata Kebugaran
                    </h3>

                    <strong>
                        ${summary.rataRataKeseluruhan.toFixed(2)}
                        / 5
                    </strong>

                </div>


                <div class="stat-summary-card">

                    <h3>
                        🎯 Data Tes
                    </h3>

                    <strong>
                        ${formatNumber(
                            summary.jumlahTes
                        )}
                    </strong>

                </div>


            </div>


            <div class="public-chart-title">

                HASIL TES KEBUGARAN

            </div>


            <div class="public-chart-subtitle">

                Rata-rata skor setiap jenis tes

            </div>


            <div class="public-chart-canvas-wrap">

                <canvas
                    id="publicFitnessBarChart"
                    aria-label="Grafik rata-rata skor tes kebugaran"
                    role="img">
                </canvas>

            </div>


        </div>

    `;


    container.insertAdjacentHTML(
        "beforeend",
        summaryHTML
    );


    renderVerticalBarChart(
        testStatistics
    );

}


/* =========================================================
   CALCULATE SUMMARY
========================================================= */

function calculateSummary(
    data
) {

    const jumlahMurid =
        sumUniqueStudentGroups(
            data
        );

    let jumlahTes = 0;

    let totalScore = 0;

    let totalScoreCount = 0;


    data.forEach(
        (group) => {

            TESTS.forEach(
                (test) => {

                    const testData =
                        group.tests?.[
                            test.key
                        ];

                    if (!testData) {
                        return;
                    }


                    const jumlah =
                        toNumber(
                            testData.jumlahTes
                        );

                    const rata =
                        toNumber(
                            testData.rataRataSkor
                        );


                    jumlahTes +=
                        jumlah;


                    if (
                        jumlah > 0 &&
                        rata >= 0
                    ) {

                        totalScore +=
                            rata * jumlah;

                        totalScoreCount +=
                            jumlah;

                    }

                }
            );

        }
    );


    const rataRataKeseluruhan =
        totalScoreCount > 0
            ? totalScore /
              totalScoreCount
            : 0;


    return {

        jumlahMurid,

        jumlahTes,

        rataRataKeseluruhan

    };

}


/* =========================================================
   UNIQUE STUDENT GROUP COUNT
========================================================= */

function sumUniqueStudentGroups(
    data
) {

    const map =
        new Map();


    data.forEach(
        (item) => {

            const key = [

                item.tahunAjaran,

                item.kelas,

                normalizeGender(
                    item.jenisKelamin
                )

            ].join("__");


            const jumlah =
                toNumber(
                    item.jumlahSiswa
                );


            if (
                !map.has(key)
            ) {

                map.set(
                    key,
                    jumlah
                );

            } else {

                /*
                 * Jika dokumen duplikat,
                 * gunakan jumlah terbesar.
                 */

                map.set(
                    key,
                    Math.max(
                        map.get(key),
                        jumlah
                    )
                );

            }

        }
    );


    let total = 0;


    map.forEach(
        value => {

            total +=
                value;

        }
    );


    return total;

}


/* =========================================================
   CALCULATE TEST STATISTICS
========================================================= */

function calculateTestStatistics(
    data
) {

    return TESTS.map(
        (test) => {

            let totalWeightedScore = 0;

            let totalTests = 0;


            const distribution = {

                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0

            };


            data.forEach(
                (group) => {

                    const testData =
                        group.tests?.[
                            test.key
                        ];

                    if (!testData) {
                        return;
                    }


                    const count =
                        toNumber(
                            testData.jumlahTes
                        );


                    const average =
                        toNumber(
                            testData.rataRataSkor
                        );


                    if (
                        count > 0
                    ) {

                        totalWeightedScore +=
                            average * count;

                        totalTests +=
                            count;

                    }


                    const groupDistribution =
                        testData.distribusiKategori ||
                        {};


                    [1, 2, 3, 4, 5].forEach(
                        (score) => {

                            distribution[score] +=
                                toNumber(
                                    groupDistribution[
                                        score
                                    ]
                                );

                        }
                    );

                }
            );


            const average =
                totalTests > 0
                    ? totalWeightedScore /
                      totalTests
                    : 0;


            const dominantCategory =
                getDominantCategory(
                    distribution
                );


            return {

                key:
                    test.key,

                name:
                    test.name,

                average,

                totalTests,

                distribution,

                dominantCategory

            };

        }
    );

}


/* =========================================================
   GET DOMINANT CATEGORY
========================================================= */

function getDominantCategory(
    distribution
) {

    let bestScore = 0;

    let bestCount = 0;


    [1, 2, 3, 4, 5].forEach(
        (score) => {

            const count =
                toNumber(
                    distribution?.[
                        score
                    ]
                );


            if (
                count > bestCount
            ) {

                bestCount =
                    count;

                bestScore =
                    score;

            }

        }
    );


    if (
        !bestScore
    ) {

        return "-";

    }


    return CATEGORIES[
        bestScore
    ];

}


/* =========================================================
   RENDER VERTICAL BAR CHART
========================================================= */

function renderVerticalBarChart(
    testStatistics
) {

    const canvas =
        document.getElementById(
            "publicFitnessBarChart"
        );

    if (!canvas) {
        return;
    }


    const wrapper =
        canvas.parentElement;

    if (!wrapper) {
        return;
    }


    const context =
        canvas.getContext("2d");

    if (!context) {
        return;
    }


    resizeCanvas(
        canvas,
        wrapper
    );


    const deviceRatio =
        window.devicePixelRatio ||
        1;


    context.setTransform(
        deviceRatio,
        0,
        0,
        deviceRatio,
        0,
        0
    );


    const cssWidth =
        wrapper.clientWidth;

    const cssHeight =
        wrapper.clientHeight;


    context.clearRect(
        0,
        0,
        cssWidth,
        cssHeight
    );


    const padding = {

        top: 30,

        right: 25,

        bottom: 65,

        left: 42

    };


    const chartWidth =
        cssWidth -
        padding.left -
        padding.right;


    const chartHeight =
        cssHeight -
        padding.top -
        padding.bottom;


    if (
        chartWidth <= 0 ||
        chartHeight <= 0
    ) {

        return;

    }


    /* =====================================================
       GRID
    ===================================================== */

    context.lineWidth = 1;

    context.strokeStyle =
        "#e7eeee";

    context.fillStyle =
        "#718096";

    context.font =
        "10px Poppins, sans-serif";

    context.textAlign =
        "right";

    context.textBaseline =
        "middle";


    for (
        let value = 0;
        value <= 5;
        value++
    ) {

        const y =
            padding.top +
            chartHeight -
            (
                value / 5
            ) *
            chartHeight;


        context.beginPath();

        context.moveTo(
            padding.left,
            y
        );

        context.lineTo(
            cssWidth -
            padding.right,
            y
        );

        context.stroke();


        context.fillText(
            String(value),
            padding.left - 10,
            y
        );

    }


    /* =====================================================
       BASELINE
    ===================================================== */

    context.strokeStyle =
        "#bfcfcd";

    context.lineWidth =
        1.3;


    const baselineY =
        padding.top +
        chartHeight;


    context.beginPath();

    context.moveTo(
        padding.left,
        baselineY
    );

    context.lineTo(
        cssWidth -
        padding.right,
        baselineY
    );

    context.stroke();


    /* =====================================================
       BAR
    ===================================================== */

    const count =
        testStatistics.length;


    if (
        count === 0
    ) {

        return;

    }


    const slotWidth =
        chartWidth /
        count;


    const barWidth =
        Math.min(
            65,
            slotWidth * 0.52
        );


    testStatistics.forEach(
        (item, index) => {

            const score =
                Math.max(
                    0,
                    Math.min(
                        5,
                        item.average || 0
                    )
                );


            const barHeight =
                (
                    score / 5
                ) *
                chartHeight;


            const x =
                padding.left +
                slotWidth * index +
                (
                    slotWidth -
                    barWidth
                ) / 2;


            const y =
                baselineY -
                barHeight;


            context.fillStyle =
                "#08a79e";


            roundRect(
                context,
                x,
                y,
                barWidth,
                Math.max(
                    barHeight,
                    3
                ),
                8
            );


            context.fill();


            /* =============================================
               NILAI
            ============================================= */

            context.fillStyle =
                "#102a43";

            context.font =
                "bold 11px Poppins, sans-serif";

            context.textAlign =
                "center";

            context.textBaseline =
                "bottom";


            context.fillText(
                score.toFixed(2),
                x +
                    barWidth / 2,
                y - 7
            );


            /* =============================================
               LABEL
            ============================================= */

            context.fillStyle =
                "#607080";

            context.font =
                "9px Poppins, sans-serif";

            context.textAlign =
                "center";

            context.textBaseline =
                "top";


            const labels =
                splitChartLabel(
                    item.name
                );


            labels.forEach(
                (
                    label,
                    labelIndex
                ) => {

                    context.fillText(
                        label,
                        x +
                            barWidth / 2,
                        baselineY +
                            12 +
                            labelIndex * 12
                    );

                }
            );

        }
    );

}


/* =========================================================
   ROUND RECT
========================================================= */

function roundRect(
    ctx,
    x,
    y,
    width,
    height,
    radius
) {

    const r =
        Math.min(
            radius,
            width / 2,
            height / 2
        );


    ctx.beginPath();

    ctx.moveTo(
        x + r,
        y
    );

    ctx.arcTo(
        x + width,
        y,
        x + width,
        y + height,
        r
    );

    ctx.arcTo(
        x + width,
        y + height,
        x,
        y + height,
        r
    );

    ctx.arcTo(
        x,
        y + height,
        x,
        y,
        r
    );

    ctx.arcTo(
        x,
        y,
        x + width,
        y,
        r
    );

    ctx.closePath();

}


/* =========================================================
   RESIZE CANVAS
========================================================= */

function resizeCanvas(
    canvas,
    wrapper
) {

    const ratio =
        window.devicePixelRatio ||
        1;


    const width =
        wrapper.clientWidth;

    const height =
        wrapper.clientHeight;


    canvas.width =
        Math.max(
            1,
            Math.floor(
                width * ratio
            )
        );


    canvas.height =
        Math.max(
            1,
            Math.floor(
                height * ratio
            )
        );


    canvas.style.width =
        `${width}px`;

    canvas.style.height =
        `${height}px`;

}


/* =========================================================
   SPLIT CHART LABEL
========================================================= */

function splitChartLabel(
    name
) {

    const map = {

        "Hand & Eye Coordination": [
            "Hand & Eye",
            "Coordination"
        ],

        "Standing Broad Jump": [
            "Standing Broad",
            "Jump"
        ],

        "Beeptest": [
            "Beeptest"
        ],

        "T-Test": [
            "T-Test"
        ],

        "Sit Up": [
            "Sit Up"
        ]

    };


    return (
        map[name] ||
        [name]
    );

}


/* =========================================================
   LOADING
========================================================= */

function renderPublicLoading() {

    const container =
        document.getElementById(
            "loginPublicChart"
        );

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="public-chart-loading">

            Memuat statistik kebugaran...

        </div>

    `;

}


/* =========================================================
   EMPTY
========================================================= */

function renderPublicEmpty(
    message
) {

    const container =
        document.getElementById(
            "loginPublicChart"
        );

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="public-chart-empty">

            <div
                style="
                    font-size:34px;
                    margin-bottom:10px;
                "
            >
                📊
            </div>

            <div>
                ${escapeHTML(message)}
            </div>

        </div>

    `;

}


/* =========================================================
   CACHE
========================================================= */

function getPublicStatisticsCache() {

    try {

        const rawData =
            sessionStorage.getItem(
                CACHE_KEY
            );

        const rawTime =
            sessionStorage.getItem(
                CACHE_TIME_KEY
            );


        if (
            !rawData ||
            !rawTime
        ) {

            return null;

        }


        const timestamp =
            Number(rawTime);


        if (
            !Number.isFinite(
                timestamp
            )
        ) {

            return null;

        }


        const age =
            Date.now() -
            timestamp;


        if (
            age < 0 ||
            age > CACHE_DURATION
        ) {

            clearPublicStatisticsCache();

            return null;

        }


        const data =
            JSON.parse(
                rawData
            );


        if (
            !Array.isArray(data)
        ) {

            return null;

        }


        return {

            data,

            timestamp

        };


    } catch (error) {

        console.warn(
            "Cache statistik rusak:",
            error
        );

        clearPublicStatisticsCache();

        return null;

    }

}


/* =========================================================
   SAVE CACHE
========================================================= */

function savePublicStatisticsCache(
    data
) {

    try {

        sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify(data)
        );

        sessionStorage.setItem(
            CACHE_TIME_KEY,
            String(
                Date.now()
            )
        );

    } catch (error) {

        console.warn(
            "Gagal menyimpan cache statistik:",
            error
        );

    }

}


/* =========================================================
   CLEAR CACHE
========================================================= */

function clearPublicStatisticsCache() {

    try {

        /*
         * Hapus cache versi lama juga.
         */

        sessionStorage.removeItem(
            "publicFitnessStatistics_v4"
        );

        sessionStorage.removeItem(
            "publicFitnessStatisticsTime_v4"
        );


        sessionStorage.removeItem(
            CACHE_KEY
        );

        sessionStorage.removeItem(
            CACHE_TIME_KEY
        );

    } catch (error) {

        console.warn(
            "Gagal menghapus cache statistik:",
            error
        );

    }

}


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {
            return;
        }


        try {

            const userSnapshot =
                await getDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    )
                );


            if (
                !userSnapshot.exists()
            ) {

                return;

            }


            const userData =
                userSnapshot.data();


            const role =
                normalizeText(
                    userData.role
                );


            if (
                role === "siswa"
            ) {

                if (
                    !window.location.pathname.endsWith(
                        "dashboard.html"
                    )
                ) {

                    window.location.href =
                        "dashboard.html";

                }

            } else if (
                role === "guru"
            ) {

                /*
                 * Jangan menjalankan buatStatistik()
                 * di sini.
                 *
                 * Login guru sudah menjalankan
                 * buatStatistik() di loginGuru().
                 */

                const currentPath =
                    window.location.pathname;


                if (
                    currentPath.endsWith(
                        "/index.html"
                    ) ||
                    currentPath.endsWith("/")
                ) {

                    /*
                     * Tetap di halaman login.
                     */

                }

            }

        } catch (error) {

            console.error(
                "AUTH STATE ERROR:",
                error
            );

        }

    }
);


/* =========================================================
   WINDOW RESIZE
========================================================= */

let resizeTimer = null;


window.addEventListener(
    "resize",
    () => {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                () => {

                    const filteredData =
                        getFilteredStatistics();


                    const calculationData =
                        getCalculationData(
                            filteredData
                        );


                    const testStatistics =
                        calculateTestStatistics(
                            calculationData
                        );


                    if (
                        testStatistics.length
                    ) {

                        renderVerticalBarChart(
                            testStatistics
                        );

                    }

                },
                150
            );

    }
);


/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   NORMALIZE YEAR
========================================================= */

function normalizeYear(
    value
) {

    return String(
        value ?? ""
    )
        .trim();

}


/* =========================================================
   NORMALIZE CLASS
========================================================= */

function normalizeClass(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .replace(
            /\s+/g,
            " "
        );

}


/* =========================================================
   NORMALIZE GENDER
========================================================= */

function normalizeGender(
    value
) {

    const text =
        normalizeText(
            value
        );


    if (
        text === "putra" ||
        text === "laki-laki" ||
        text === "laki laki" ||
        text === "laki"
    ) {

        return "putra";

    }


    if (
        text === "putri" ||
        text === "perempuan" ||
        text === "wanita"
    ) {

        return "putri";

    }


    if (
        text === "semua" ||
        text === "all" ||
        text === ""
    ) {

        return "semua";

    }


    return text;

}


/* =========================================================
   NUMBER
========================================================= */

function toNumber(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return 0;

    }


    const number =
        Number(
            String(value)
                .replace(
                    ",",
                    "."
                )
                .replace(
                    /[^\d.-]/g,
                    ""
                )
        );


    return Number.isFinite(
        number
    )
        ? number
        : 0;

}


/* =========================================================
   UNIQUE
========================================================= */

function unique(
    array
) {

    return [
        ...new Set(
            array
        )
    ];

}


/* =========================================================
   SORT
========================================================= */

function uniqueSorted(
    array
) {

    const values =
        unique(
            array
        );


    return values.sort(
        (a, b) => {

            return String(a)
                .localeCompare(
                    String(b),
                    "id",
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                );

        }
    );

}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(
    value
) {

    return new Intl.NumberFormat(
        "id-ID"
    ).format(
        Math.round(
            toNumber(
                value
            )
        )
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}