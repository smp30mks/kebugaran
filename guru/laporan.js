/* =========================================================
   LAPORAN.JS
   PORTAL GURU
   FULL JAVASCRIPT
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
   FIRESTORE
========================================================= */

import {
    collection,
    getDocs,
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   FIREBASE STORAGE
========================================================= */

import {
    getDownloadURL,
    ref
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

import {
    app,
    auth,
    storage
} from "../firebase-config.js";


/* =========================================================
   FIRESTORE INSTANCE
========================================================= */

const firestore = getFirestore(app);


/* =========================================================
   ELEMENT
========================================================= */


/* =========================================================
   FILTER
========================================================= */

const filterTahun =
    document.getElementById("filterTahun");

const filterKelas =
    document.getElementById("filterKelas");

const filterTes =
    document.getElementById("filterTes");

const resetFilter =
    document.getElementById("resetFilter");


/* =========================================================
   SUMMARY
========================================================= */

const totalSiswa =
    document.getElementById("totalSiswa");

const totalHasil =
    document.getElementById("totalHasil");

const rataNilai =
    document.getElementById("rataNilai");


/* =========================================================
   HERO
========================================================= */

const heroTotalMurid =
    document.getElementById("heroTotalMurid");

const heroTotalHasil =
    document.getElementById("heroTotalHasil");

const heroRataNilai =
    document.getElementById("heroRataNilai");


/* =========================================================
   REPORT
========================================================= */

const reportPeriod =
    document.getElementById("reportPeriod");

const laporanTableBody =
    document.getElementById("laporanTableBody");

const tableInfo =
    document.getElementById("tableInfo");

const printButton =
    document.getElementById("printButton");


/* =========================================================
   SIDEBAR
========================================================= */

const logoutButton =
    document.getElementById("logoutButton");

const menuButton =
    document.getElementById("menuButton");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


/* =========================================================
   PROFILE
========================================================= */

const topProfilePhoto =
    document.getElementById("topProfilePhoto");

const topProfilePlaceholder =
    document.getElementById("topProfilePlaceholder");

const topUserName =
    document.getElementById("topUserName");


/* =========================================================
   DATA
========================================================= */

let semuaMurid = [];

let semuaHasilTes = [];


/* =========================================================
   DAFTAR KELAS
   7.1 - 7.10
   8.1 - 8.10
   9.1 - 9.10
========================================================= */

const daftarKelas = [];

for (
    let tingkat = 7;
    tingkat <= 9;
    tingkat++
) {

    for (
        let nomor = 1;
        nomor <= 10;
        nomor++
    ) {

        daftarKelas.push(
            `${tingkat}.${nomor}`
        );

    }

}


/* =========================================================
   DAFTAR TES
========================================================= */

const daftarTes = [

    {
        key: "handeye",
        nama: "Hand & Eye Coordination"
    },

    {
        key: "situp",
        nama: "Sit Up"
    },

    {
        key: "standingbroadjump",
        nama: "Standing Broad Jump"
    },

    {
        key: "ttest",
        nama: "T Test"
    },

    {
        key: "beeptest",
        nama: "Beep Test"
    }

];


/* =========================================================
   INITIAL STATE
========================================================= */

setInitialState();


/* =========================================================
   AUTH GURU
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        /* =================================================
           BELUM LOGIN
        ================================================== */

        if (!user) {

            window.location.href =
                "../index.html";

            return;

        }


        try {

            /* =================================================
               LOAD DATA AKUN GURU
            ================================================== */

            const guruData =
                await getGuruData(
                    user.uid
                );


            /* =================================================
               AKUN TIDAK DITEMUKAN
            ================================================== */

            if (!guruData) {

                alert(
                    "Data akun guru tidak ditemukan."
                );


                await signOut(
                    auth
                );


                window.location.href =
                    "../index.html";


                return;

            }


            /* =================================================
               CEK ROLE
            ================================================== */

            const role =
                normalizeText(
                    guruData.role
                );


            if (
                role !== "guru"
            ) {

                alert(
                    "Anda tidak memiliki akses ke Portal Guru."
                );


                await signOut(
                    auth
                );


                window.location.href =
                    "../index.html";


                return;

            }


            /* =================================================
               NAMA GURU
            ================================================== */

            if (topUserName) {

                topUserName.textContent =
                    guruData.nama ||
                    user.displayName ||
                    "Guru";

            }


            /* =================================================
               FOTO GURU
            ================================================== */

            await loadGuruPhoto(
                user.uid
            );


            /* =================================================
               LOAD DATA LAPORAN
            ================================================== */

            await loadData();

        } catch (error) {

            console.error(
                "Gagal membuka halaman laporan:",
                error
            );


            showError(
                "Gagal memuat laporan."
            );

        }

    }
);


/* =========================================================
   GET DATA GURU
========================================================= */

async function getGuruData(uid) {

    const usersSnapshot =
        await getDocs(
            collection(
                firestore,
                "users"
            )
        );


    let guruData = null;


    usersSnapshot.forEach(
        (docSnap) => {

            if (
                docSnap.id === uid
            ) {

                guruData =
                    docSnap.data();

            }

        }
    );


    return guruData;

}


/* =========================================================
   LOAD DATA
========================================================= */

async function loadData() {

    try {

        /* =================================================
           TAMPILKAN LOADING
        ================================================== */

        showLoading();


        /* =================================================
           LOAD USERS
        ================================================== */

        const usersSnapshot =
            await getDocs(
                collection(
                    firestore,
                    "users"
                )
            );


        semuaMurid = [];


        usersSnapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                const role =
                    normalizeText(
                        data.role
                    );


                /* =========================================
                   HANYA SISWA
                ========================================= */

                if (
                    role === "siswa"
                ) {

                    semuaMurid.push({

                        uid:
                            docSnap.id,

                        ...data

                    });

                }

            }
        );


        /* =================================================
           LOAD HASIL TES
        ================================================== */

        const hasilSnapshot =
            await getDocs(
                collection(
                    firestore,
                    "hasilTes"
                )
            );


        semuaHasilTes = [];


        hasilSnapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                semuaHasilTes.push({

                    id:
                        docSnap.id,

                    ...data

                });

            }
        );


        /* =================================================
           BUAT FILTER
        ================================================== */

        createYearOptions();

        createClassOptions();

        createTestOptions();


        /* =================================================
           UPDATE REPORT
        ================================================== */

        updateReport();

    } catch (error) {

        console.error(
            "Gagal mengambil data laporan:",
            error
        );


        showError(
            "Data laporan gagal dimuat."
        );

    }

}


/* =========================================================
   CREATE YEAR OPTIONS
========================================================= */

function createYearOptions() {

    if (!filterTahun) {

        return;

    }


    const tahunSet =
        new Set();


    /* =================================================
       TAHUN DARI DATA MURID
    ================================================== */

    semuaMurid.forEach(
        (murid) => {

            const tahun =
                getTahunAjaran(
                    murid
                );


            if (tahun) {

                tahunSet.add(
                    tahun
                );

            }

        }
    );


    /* =================================================
       TAHUN DARI HASIL TES
       CADANGAN
    ================================================== */

    semuaHasilTes.forEach(
        (hasil) => {

            const tahun =
                getTahunAjaran(
                    hasil
                );


            if (tahun) {

                tahunSet.add(
                    tahun
                );

            }

        }
    );


    /* =================================================
       RESET OPTION
    ================================================== */

    filterTahun.innerHTML = "";


    const semuaOption =
        document.createElement(
            "option"
        );


    semuaOption.value =
        "";


    semuaOption.textContent =
        "Semua Tahun Ajaran";


    filterTahun.appendChild(
        semuaOption
    );


    /* =================================================
       SORT TAHUN
    ================================================== */

    const tahunArray =
        Array.from(
            tahunSet
        );


    tahunArray.sort(
        sortTahunAjaran
    );


    /* =================================================
       TAMBAHKAN OPTION
    ================================================== */

    tahunArray.forEach(
        (tahun) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                tahun;


            option.textContent =
                tahun;


            filterTahun.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   CREATE CLASS OPTIONS
========================================================= */

function createClassOptions() {

    if (!filterKelas) {

        return;

    }


    filterKelas.innerHTML = `
        <option value="">
            Semua Kelas
        </option>

        <optgroup label="Kelas 7">
            ${daftarKelas
                .filter(
                    (kelas) =>
                        kelas.startsWith("7.")
                )
                .map(
                    (kelas) => `
                        <option value="${kelas}">
                            ${kelas}
                        </option>
                    `
                )
                .join("")}
        </optgroup>

        <optgroup label="Kelas 8">
            ${daftarKelas
                .filter(
                    (kelas) =>
                        kelas.startsWith("8.")
                )
                .map(
                    (kelas) => `
                        <option value="${kelas}">
                            ${kelas}
                        </option>
                    `
                )
                .join("")}
        </optgroup>

        <optgroup label="Kelas 9">
            ${daftarKelas
                .filter(
                    (kelas) =>
                        kelas.startsWith("9.")
                )
                .map(
                    (kelas) => `
                        <option value="${kelas}">
                            ${kelas}
                        </option>
                    `
                )
                .join("")}
        </optgroup>
    `;

}


/* =========================================================
   CREATE TEST OPTIONS
========================================================= */

function createTestOptions() {

    if (!filterTes) {

        return;

    }


    filterTes.innerHTML = `
        <option value="">
            Semua Jenis Tes
        </option>
    `;


    daftarTes.forEach(
        (tes) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                tes.key;


            option.textContent =
                tes.nama;


            filterTes.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   GET MURID
========================================================= */

function getMurid(uid) {

    if (!uid) {

        return null;

    }


    return semuaMurid.find(
        (murid) =>
            String(
                murid.uid
            ) === String(uid)
    ) || null;

}


/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(value) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   NORMALIZE KELAS
========================================================= */

function normalizeKelas(value) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            ""
        )
        .replace(
            /-/g,
            "."
        );

}


/* =========================================================
   GET TAHUN AJARAN
========================================================= */

function getTahunAjaran(data) {

    if (!data) {

        return "";

    }


    return String(
        data.tahunAjaran ??
        data.tahunajaran ??
        data.tahun_ajaran ??
        ""
    )
        .trim();

}


/* =========================================================
   NORMALIZE TES
========================================================= */

function normalizeTes(hasil) {

    if (!hasil) {

        return "";

    }


    const value =
        normalizeText(
            hasil.jenisTes ??
            hasil.namaTes ??
            hasil.tes ??
            hasil.jenis ??
            ""
        );


    /* =================================================
       HAND & EYE
    ================================================== */

    if (
        value.includes("handeye") ||
        value.includes("hand eye") ||
        value.includes("hand & eye") ||
        value.includes("hand") &&
        value.includes("eye")
    ) {

        return "handeye";

    }


    /* =================================================
       SIT UP
    ================================================== */

    if (
        value.includes("situp") ||
        value.includes("sit up")
    ) {

        return "situp";

    }


    /* =================================================
       STANDING BROAD JUMP
    ================================================== */

    if (
        value.includes(
            "standingbroadjump"
        ) ||
        value.includes(
            "standing broad jump"
        ) ||
        value.includes(
            "broadjump"
        ) ||
        value.includes(
            "broad jump"
        )
    ) {

        return "standingbroadjump";

    }


    /* =================================================
       T TEST
    ================================================== */

    if (
        value === "ttest" ||
        value.includes("t test") ||
        value.includes("t-test")
    ) {

        return "ttest";

    }


    /* =================================================
       BEEP TEST
    ================================================== */

    if (
        value.includes("beeptest") ||
        value.includes("beep test") ||
        value.includes("bleep test") ||
        value.includes("beep") ||
        value.includes("bleep")
    ) {

        return "beeptest";

    }


    return value;

}


/* =========================================================
   GET NAMA TES
========================================================= */

function getNamaTes(hasil) {

    const key =
        normalizeTes(
            hasil
        );


    const tes =
        daftarTes.find(
            (item) =>
                item.key === key
        );


    if (tes) {

        return tes.nama;

    }


    return (
        hasil?.namaTes ||
        hasil?.jenisTes ||
        hasil?.tes ||
        "Tes Kebugaran"
    );

}


/* =========================================================
   GET REPORT ROWS
========================================================= */

function getReportRows() {

    return semuaHasilTes
        .map(
            (hasil) => {

                const murid =
                    getMurid(
                        hasil.uid
                    );


                /* =========================================
                   HASIL TANPA UID
                ========================================== */

                if (!murid) {

                    return null;

                }


                const muridKelas =
                    murid.kelas ??
                    hasil.kelas ??
                    "";


                const muridTahun =
                    getTahunAjaran(
                        murid
                    ) ||
                    getTahunAjaran(
                        hasil
                    );


                return {

                    ...hasil,

                    muridNama:
                        murid.nama ||
                        hasil.nama ||
                        "-",

                    muridNisn:
                        murid.nisn ||
                        hasil.nisn ||
                        "-",

                    muridKelas:
                        muridKelas ||
                        "-",

                    muridTahun:
                        muridTahun ||
                        "-"

                };

            }
        )
        .filter(Boolean);

}


/* =========================================================
   GET FILTERED ROWS
========================================================= */

function getFilteredRows() {

    const tahun =
        normalizeText(
            filterTahun?.value
        );


    const kelas =
        normalizeKelas(
            filterKelas?.value
        );


    const jenisTes =
        normalizeText(
            filterTes?.value
        );


    return getReportRows()
        .filter(
            (hasil) => {

                const tahunMurid =
                    normalizeText(
                        hasil.muridTahun
                    );


                const kelasMurid =
                    normalizeKelas(
                        hasil.muridKelas
                    );


                const tesMurid =
                    normalizeTes(
                        hasil
                    );


                const cocokTahun =
                    !tahun ||
                    tahunMurid === tahun;


                const cocokKelas =
                    !kelas ||
                    kelasMurid === kelas;


                const cocokTes =
                    !jenisTes ||
                    tesMurid === jenisTes;


                return (
                    cocokTahun &&
                    cocokKelas &&
                    cocokTes
                );

            }
        );

}


/* =========================================================
   UPDATE REPORT
========================================================= */

function updateReport() {

    const data =
        getFilteredRows();


    /* =================================================
       TOTAL MURID UNIK
    ================================================== */

    const muridSet =
        new Set();


    data.forEach(
        (hasil) => {

            if (hasil.uid) {

                muridSet.add(
                    String(
                        hasil.uid
                    )
                );

            }

        }
    );


    const jumlahMurid =
        muridSet.size;


    /* =================================================
       TOTAL HASIL
    ================================================== */

    const jumlahHasil =
        data.length;


    /* =================================================
       SKOR
    ================================================== */

    const skor =
        data
            .map(
                (hasil) =>
                    getScore(
                        hasil
                    )
            )
            .filter(
                (nilai) =>
                    Number.isFinite(
                        nilai
                    )
            );


    /* =================================================
       RATA-RATA
    ================================================== */

    let rata =
        0;


    if (
        skor.length > 0
    ) {

        const total =
            skor.reduce(
                (
                    sum,
                    nilai
                ) =>
                    sum + nilai,
                0
            );


        rata =
            total /
            skor.length;

    }


    /* =================================================
       SUMMARY
    ================================================== */

    setText(
        totalSiswa,
        jumlahMurid
    );


    setText(
        totalHasil,
        jumlahHasil
    );


    setText(
        rataNilai,
        rata > 0
            ? rata.toFixed(1)
            : "0"
    );


    /* =================================================
       HERO
    ================================================== */

    setText(
        heroTotalMurid,
        jumlahMurid
    );


    setText(
        heroTotalHasil,
        jumlahHasil
    );


    setText(
        heroRataNilai,
        rata > 0
            ? rata.toFixed(1)
            : "0"
    );


    /* =================================================
       REPORT PERIOD
    ================================================== */

    updateReportPeriod();


    /* =================================================
       TABLE
    ================================================== */

    renderTable(
        data
    );

}


/* =========================================================
   GET SCORE
========================================================= */

function getScore(hasil) {

    const possibleValues = [

        hasil?.skor,

        hasil?.score,

        hasil?.nilai,

        hasil?.nilaiSkor

    ];


    for (
        const value of possibleValues
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            continue;

        }


        const number =
            Number(
                value
            );


        if (
            Number.isFinite(
                number
            )
        ) {

            return number;

        }

    }


    return NaN;

}


/* =========================================================
   UPDATE REPORT PERIOD
========================================================= */

function updateReportPeriod() {

    if (!reportPeriod) {

        return;

    }


    const tahun =
        filterTahun?.value || "";


    const kelas =
        filterKelas?.value || "";


    const tes =
        filterTes?.value || "";


    const parts = [];


    /* =================================================
       TAHUN
    ================================================== */

    if (tahun) {

        parts.push(
            `Tahun Ajaran ${tahun}`
        );

    } else {

        parts.push(
            "Semua Tahun Ajaran"
        );

    }


    /* =================================================
       KELAS
    ================================================== */

    if (kelas) {

        parts.push(
            `Kelas ${kelas}`
        );

    }


    /* =================================================
       TES
    ================================================== */

    if (tes) {

        const tesData =
            daftarTes.find(
                (item) =>
                    item.key === tes
            );


        if (tesData) {

            parts.push(
                tesData.nama
            );

        }

    }


    reportPeriod.textContent =
        parts.join(
            " • "
        );

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable(data) {

    if (!laporanTableBody) {

        return;

    }


    if (tableInfo) {

        tableInfo.textContent =
            `Menampilkan ${data.length} data`;

    }


    /* =================================================
       EMPTY
    ================================================== */

    if (
        data.length === 0
    ) {

        laporanTableBody.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="empty-state"
                >
                    <div class="empty-icon">
                        📋
                    </div>

                    <div class="empty-title">
                        Tidak ada data laporan
                    </div>

                    <div class="empty-text">
                        Tidak ada data yang sesuai
                        dengan filter yang dipilih.
                    </div>
                </td>
            </tr>
        `;


        return;

    }


    /* =================================================
       SORT
       NAMA → KELAS → TES
    ================================================== */

    const sortedData =
        [...data].sort(
            (a, b) => {

                const namaA =
                    normalizeText(
                        a.muridNama
                    );


                const namaB =
                    normalizeText(
                        b.muridNama
                    );


                const compareNama =
                    namaA.localeCompare(
                        namaB,
                        "id"
                    );


                if (
                    compareNama !== 0
                ) {

                    return compareNama;

                }


                const kelasA =
                    normalizeKelas(
                        a.muridKelas
                    );


                const kelasB =
                    normalizeKelas(
                        b.muridKelas
                    );


                const compareKelas =
                    kelasA.localeCompare(
                        kelasB,
                        "id",
                        {
                            numeric: true
                        }
                    );


                if (
                    compareKelas !== 0
                ) {

                    return compareKelas;

                }


                const tesA =
                    getNamaTes(
                        a
                    );


                const tesB =
                    getNamaTes(
                        b
                    );


                return String(
                    tesA
                ).localeCompare(
                    String(tesB),
                    "id"
                );

            }
        );


    /* =================================================
       CLEAR
    ================================================== */

    laporanTableBody.innerHTML =
        "";


    /* =================================================
       RENDER
    ================================================== */

    sortedData.forEach(
        (hasil, index) => {

            const tr =
                document.createElement(
                    "tr"
                );


            /* =================================================
               DATA
            ================================================== */

            const namaTes =
                getNamaTes(
                    hasil
                );


            const nilaiSkor =
                getScore(
                    hasil
                );


            const hasilTes =
                hasil.hasil ??
                hasil.nilaiHasil ??
                hasil.result ??
                "-";


            const kategori =
                hasil.kategori ??
                "-";


            /* =================================================
               ROW
            ================================================== */

            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHTML(
                        hasil.muridNama
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        hasil.muridNisn
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        hasil.muridKelas
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        hasil.muridTahun
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        namaTes
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        hasilTes
                    )}
                </td>

                <td>
                    <span
                        class="score-badge"
                    >
                        ${
                            Number.isFinite(
                                nilaiSkor
                            )
                                ? nilaiSkor.toFixed(0)
                                : "-"
                        }
                    </span>
                </td>

                <td>
                    <span
                        class="category-badge"
                    >
                        ${escapeHTML(
                            kategori
                        )}
                    </span>
                </td>

            `;


            laporanTableBody.appendChild(
                tr
            );

        }
    );

}


/* =========================================================
   FILTER EVENT
========================================================= */

if (filterTahun) {

    filterTahun.addEventListener(
        "change",
        updateReport
    );

}


if (filterKelas) {

    filterKelas.addEventListener(
        "change",
        updateReport
    );

}


if (filterTes) {

    filterTes.addEventListener(
        "change",
        updateReport
    );

}


/* =========================================================
   RESET FILTER
========================================================= */

if (resetFilter) {

    resetFilter.addEventListener(
        "click",
        () => {

            if (filterTahun) {

                filterTahun.value =
                    "";

            }


            if (filterKelas) {

                filterKelas.value =
                    "";

            }


            if (filterTes) {

                filterTes.value =
                    "";

            }


            updateReport();

        }
    );

}


/* =========================================================
   PRINT REPORT
========================================================= */

if (printButton) {

    printButton.addEventListener(
        "click",
        () => {

            window.print();

        }
    );

}


/* =========================================================
   LOAD FOTO GURU
========================================================= */

async function loadGuruPhoto(uid) {

    if (
        !topProfilePhoto ||
        !topProfilePlaceholder
    ) {

        return;

    }


    /* =================================================
       RESET AWAL
    ================================================== */

    topProfilePhoto.src =
        "";


    topProfilePhoto.classList.remove(
        "show"
    );


    topProfilePhoto.style.display =
        "none";


    topProfilePlaceholder.style.display =
        "flex";


    try {

        /* =================================================
           STORAGE PATH
        ================================================== */

        const photoRef =
            ref(
                storage,
                `profile/${uid}/profile.jpg`
            );


        /* =================================================
           DOWNLOAD URL
        ================================================== */

        const url =
            await getDownloadURL(
                photoRef
            );


        /* =================================================
           TAMPILKAN FOTO
        ================================================== */

        topProfilePhoto.src =
            url;


        topProfilePhoto.classList.add(
            "show"
        );


        topProfilePhoto.style.display =
            "block";


        topProfilePlaceholder.style.display =
            "none";

    } catch (error) {

        /* =================================================
           FOTO TIDAK ADA
        ================================================== */

        topProfilePhoto.src =
            "";


        topProfilePhoto.classList.remove(
            "show"
        );


        topProfilePhoto.style.display =
            "none";


        topProfilePlaceholder.style.display =
            "flex";

    }

}


/* =========================================================
   LOGOUT
========================================================= */

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

                await signOut(
                    auth
                );


                window.location.href =
                    "../index.html";

            } catch (error) {

                console.error(
                    "Logout gagal:",
                    error
                );


                alert(
                    "Logout gagal. Silakan coba lagi."
                );

            }

        }
    );

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

if (
    menuButton &&
    sidebar &&
    sidebarOverlay
) {

    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "active"
            );


            sidebarOverlay.classList.toggle(
                "active"
            );

        }
    );

}


/* =========================================================
   CLOSE SIDEBAR VIA OVERLAY
========================================================= */

if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


/* =========================================================
   CLOSE SIDEBAR VIA MENU ITEM
========================================================= */

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


/* =========================================================
   CLOSE SIDEBAR FUNCTION
========================================================= */

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

}


/* =========================================================
   SHOW LOADING
========================================================= */

function showLoading() {

    if (tableInfo) {

        tableInfo.textContent =
            "Memuat data laporan...";

    }


    if (laporanTableBody) {

        laporanTableBody.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="loading-cell"
                >
                    Memuat data laporan...
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   SHOW ERROR
========================================================= */

function showError(message) {

    if (tableInfo) {

        tableInfo.textContent =
            "Gagal memuat data";

    }


    if (laporanTableBody) {

        laporanTableBody.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="error-cell"
                >
                    ${escapeHTML(
                        message
                    )}
                </td>
            </tr>
        `;

    }


    setText(
        totalSiswa,
        "0"
    );


    setText(
        totalHasil,
        "0"
    );


    setText(
        rataNilai,
        "0"
    );


    setText(
        heroTotalMurid,
        "0"
    );


    setText(
        heroTotalHasil,
        "0"
    );


    setText(
        heroRataNilai,
        "0"
    );

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    element,
    value
) {

    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   SORT TAHUN AJARAN
========================================================= */

function sortTahunAjaran(
    a,
    b
) {

    const tahunA =
        parseInt(
            String(a)
                .substring(0, 4),
            10
        );


    const tahunB =
        parseInt(
            String(b)
                .substring(0, 4),
            10
        );


    if (
        Number.isFinite(tahunA) &&
        Number.isFinite(tahunB)
    ) {

        return tahunB - tahunA;

    }


    return String(
        b
    ).localeCompare(
        String(a),
        "id"
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

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


/* =========================================================
   INITIAL STATE
========================================================= */

function setInitialState() {

    setText(
        totalSiswa,
        "0"
    );


    setText(
        totalHasil,
        "0"
    );


    setText(
        rataNilai,
        "0"
    );


    setText(
        heroTotalMurid,
        "0"
    );


    setText(
        heroTotalHasil,
        "0"
    );


    setText(
        heroRataNilai,
        "0"
    );


    if (reportPeriod) {

        reportPeriod.textContent =
            "Semua Tahun Ajaran";

    }


    if (tableInfo) {

        tableInfo.textContent =
            "Menunggu data...";

    }

}