"use strict";


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
    doc,
    getDoc,
    getDocs
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
    auth,
    db,
    storage
} from "../firebase-config.js";



/* =========================================================
   ELEMENT
========================================================= */

const sidebar =
    document.getElementById(
        "sidebar"
    );


const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );


const menuButton =
    document.getElementById(
        "menuButton"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


/* PROFILE */

const topProfilePhoto =
    document.getElementById(
        "topProfilePhoto"
    );


const topProfilePlaceholder =
    document.getElementById(
        "topProfilePlaceholder"
    );


const topUserName =
    document.getElementById(
        "topUserName"
    );



/* FILTER */

const filterTahun =
    document.getElementById(
        "filterTahun"
    );


const filterKelas =
    document.getElementById(
        "filterKelas"
    );


const filterInfo =
    document.getElementById(
        "filterInfo"
    );



/* SUMMARY */

const totalSiswa =
    document.getElementById(
        "totalSiswa"
    );


const totalKelas =
    document.getElementById(
        "totalKelas"
    );


const totalTahun =
    document.getElementById(
        "totalTahun"
    );



/* CLASS */

const classGrid =
    document.getElementById(
        "classGrid"
    );



/* TABLE */

const siswaTableBody =
    document.getElementById(
        "siswaTableBody"
    );


const tableInfo =
    document.getElementById(
        "tableInfo"
    );



/* CHART */

const classChartCanvas =
    document.getElementById(
        "classChart"
    );


const chartTotal =
    document.getElementById(
        "chartTotal"
    );


let classChart = null;



/* =========================================================
   GLOBAL DATA
========================================================= */

let semuaSiswa = [];

let currentUserData = null;



/* =========================================================
   DAFTAR SEMUA KELAS
========================================================= */

const daftarKelas = [

    "7.1",
    "7.2",
    "7.3",
    "7.4",
    "7.5",
    "7.6",
    "7.7",
    "7.8",
    "7.9",
    "7.10",

    "8.1",
    "8.2",
    "8.3",
    "8.4",
    "8.5",
    "8.6",
    "8.7",
    "8.8",
    "8.9",
    "8.10",

    "9.1",
    "9.2",
    "9.3",
    "9.4",
    "9.5",
    "9.6",
    "9.7",
    "9.8",
    "9.9",
    "9.10"

];



/* =========================================================
   NORMALIZE CLASS
========================================================= */

function normalizeClass(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .trim()
        .replace(/\s+/g, "");

}



/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .trim();

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



/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}



/* =========================================================
   SORT KELAS
========================================================= */

function sortKelas(
    a,
    b
) {

    const [
        tingkatA,
        nomorA
    ] = a
        .split(".")
        .map(Number);


    const [
        tingkatB,
        nomorB
    ] = b
        .split(".")
        .map(Number);


    if (
        tingkatA !==
        tingkatB
    ) {

        return (
            tingkatA -
            tingkatB
        );

    }


    return (
        nomorA -
        nomorB
    );

}



/* =========================================================
   SORT SISWA
========================================================= */

function sortStudents(
    data
) {

    return [
        ...data
    ].sort(
        (
            a,
            b
        ) => {

            const namaA =
                normalizeText(
                    a.nama
                ).toLowerCase();


            const namaB =
                normalizeText(
                    b.nama
                ).toLowerCase();


            return namaA.localeCompare(
                namaB,
                "id"
            );

        }
    );

}



/* =========================================================
   GET CURRENT USER DATA
========================================================= */

async function getCurrentUserData(
    user
) {

    if (!user) {

        return null;

    }


    try {

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


        if (
            !snapshot.exists()
        ) {

            return null;

        }


        return {

            uid:
                user.uid,

            ...snapshot.data()

        };

    } catch (error) {

        console.error(
            "Gagal mengambil data pengguna:",
            error
        );

        return null;

    }

}



/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadProfile(
    user
) {

    if (!user) {

        return;

    }


    const nama =
        normalizeText(
            currentUserData?.nama
        ) ||
        normalizeText(
            user.displayName
        ) ||
        "Guru";


    if (topUserName) {

        topUserName.textContent =
            nama;

    }


    if (
        !topProfilePhoto ||
        !topProfilePlaceholder
    ) {

        return;

    }


    topProfilePhoto.classList.remove(
        "show"
    );


    topProfilePlaceholder.style.display =
        "flex";


    try {

        const profileRef =
            ref(
                storage,
                `profile/${user.uid}/profile.jpg`
            );


        const photoURL =
            await getDownloadURL(
                profileRef
            );


        if (photoURL) {

            topProfilePhoto.src =
                photoURL;

            topProfilePhoto.alt =
                `Foto profil ${nama}`;

            topProfilePhoto.classList.add(
                "show"
            );


            topProfilePlaceholder.style.display =
                "none";

        }

    } catch (error) {

        console.info(
            "Foto profil tidak ditemukan."
        );


        topProfilePhoto.classList.remove(
            "show"
        );


        topProfilePlaceholder.style.display =
            "flex";

    }

}



/* =========================================================
   LOAD ALL STUDENTS
========================================================= */

async function loadStudents() {

    try {

        const usersRef =
            collection(
                db,
                "users"
            );


        const snapshot =
            await getDocs(
                usersRef
            );


        semuaSiswa = [];


        snapshot.forEach(
            (documentSnapshot) => {

                const data =
                    documentSnapshot.data();


                if (
                    data.role !==
                    "siswa"
                ) {

                    return;

                }


                semuaSiswa.push({

                    id:
                        documentSnapshot.id,

                    ...data

                });

            }
        );


        semuaSiswa =
            sortStudents(
                semuaSiswa
            );


        return true;

    } catch (error) {

        console.error(
            "Gagal mengambil data siswa:",
            error
        );


        showTableError(
            "Data murid tidak dapat dimuat. Silakan coba lagi."
        );


        return false;

    }

}



/* =========================================================
   LOAD YEAR OPTIONS
========================================================= */

function loadYearOptions() {

    if (!filterTahun) {

        return;

    }


    const tahunSet =
        new Set();


    semuaSiswa.forEach(
        (siswa) => {

            const tahun =
                normalizeText(
                    siswa.tahunAjaran
                );


            if (tahun) {

                tahunSet.add(
                    tahun
                );

            }

        }
    );


    const tahunList =
        Array.from(
            tahunSet
        );


    tahunList.sort(
        (
            a,
            b
        ) => {

            const yearA =
                parseInt(
                    String(a)
                        .split("/")[0],
                    10
                );


            const yearB =
                parseInt(
                    String(b)
                        .split("/")[0],
                    10
                );


            if (
                Number.isNaN(
                    yearA
                ) ||
                Number.isNaN(
                    yearB
                )
            ) {

                return b.localeCompare(
                    a,
                    "id"
                );

            }


            return (
                yearB -
                yearA
            );

        }
    );


    filterTahun.innerHTML = `

        <option value="">
            Semua Tahun Ajaran
        </option>

        ${tahunList
            .map(
                (tahun) => `
                    <option value="${escapeAttribute(tahun)}">
                        ${escapeHTML(tahun)}
                    </option>
                `
            )
            .join("")}

    `;

}



/* =========================================================
   APPLY FILTER
========================================================= */

function applyFilter() {

    const selectedTahun =
        normalizeText(
            filterTahun?.value
        );


    const selectedKelas =
        normalizeClass(
            filterKelas?.value
        );


    const hasil =
        semuaSiswa.filter(
            (siswa) => {

                const tahun =
                    normalizeText(
                        siswa.tahunAjaran
                    );


                const kelas =
                    normalizeClass(
                        siswa.kelas
                    );


                const matchTahun =
                    !selectedTahun ||
                    tahun ===
                        selectedTahun;


                const matchKelas =
                    !selectedKelas ||
                    kelas ===
                        selectedKelas;


                return (
                    matchTahun &&
                    matchKelas
                );

            }
        );


    renderSummary(
        hasil
    );


    renderClassCards(
        hasil
    );


    renderClassChart(
        hasil
    );


    renderStudentTable(
        hasil
    );


    updateFilterInfo(
        hasil,
        selectedTahun,
        selectedKelas
    );

}



/* =========================================================
   RENDER SUMMARY
========================================================= */

function renderSummary(
    data
) {

    /* TOTAL SISWA */

    if (totalSiswa) {

        totalSiswa.textContent =
            data.length;

    }



    /* TOTAL KELAS */

    const kelasSet =
        new Set();


    data.forEach(
        (siswa) => {

            const kelas =
                normalizeClass(
                    siswa.kelas
                );


            if (kelas) {

                kelasSet.add(
                    kelas
                );

            }

        }
    );


    if (totalKelas) {

        totalKelas.textContent =
            kelasSet.size;

    }



    /* TOTAL TAHUN */

    const tahunSet =
        new Set();


    semuaSiswa.forEach(
        (siswa) => {

            const tahun =
                normalizeText(
                    siswa.tahunAjaran
                );


            if (tahun) {

                tahunSet.add(
                    tahun
                );

            }

        }
    );


    if (totalTahun) {

        totalTahun.textContent =
            tahunSet.size;

    }

}



/* =========================================================
   UPDATE FILTER INFO
========================================================= */

function updateFilterInfo(
    data,
    selectedTahun,
    selectedKelas
) {

    if (!filterInfo) {

        return;

    }


    let text =
        `Menampilkan ${data.length} murid`;


    if (
        selectedKelas
    ) {

        text +=
            ` dari kelas ${selectedKelas}`;

    }


    if (
        selectedTahun
    ) {

        text +=
            ` pada tahun ajaran ${selectedTahun}`;

    }


    if (
        !selectedKelas &&
        !selectedTahun
    ) {

        text +=
            " dari seluruh kelas dan tahun ajaran";

    }


    filterInfo.textContent =
        text;

}



/* =========================================================
   RENDER CLASS CARDS
========================================================= */

function renderClassCards(
    data
) {

    if (!classGrid) {

        return;

    }


    if (
        !Array.isArray(data)
    ) {

        classGrid.innerHTML = `

            <div class="class-empty">
                Data kelas tidak tersedia.
            </div>

        `;

        return;

    }


    const jumlahPerKelas =
        {};


    daftarKelas.forEach(
        (kelas) => {

            jumlahPerKelas[kelas] =
                0;

        }
    );


    data.forEach(
        (siswa) => {

            const kelas =
                normalizeClass(
                    siswa.kelas
                );


            if (
                Object.prototype.hasOwnProperty.call(
                    jumlahPerKelas,
                    kelas
                )
            ) {

                jumlahPerKelas[kelas]++;

            }

        }
    );


    classGrid.innerHTML =
        daftarKelas
            .sort(sortKelas)
            .map(
                (kelas) => {

                    const jumlah =
                        jumlahPerKelas[
                            kelas
                        ] || 0;


                    return `

                        <div
                            class="class-item"
                            data-class="${escapeAttribute(kelas)}"
                        >

                            <div
                                class="class-item-top"
                            >

                                <span
                                    class="class-name"
                                >
                                    ${escapeHTML(kelas)}
                                </span>


                                <span
                                    class="class-icon"
                                    aria-hidden="true"
                                >
                                    🏫
                                </span>

                            </div>


                            <div
                                class="class-count"
                            >
                                ${jumlah}
                            </div>


                            <div
                                class="class-label"
                            >
                                ${jumlah === 1 ? "Murid" : "Murid"}
                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}



/* =========================================================
   RENDER CLASS CHART
========================================================= */

function renderClassChart(
    data
) {

    if (
        !classChartCanvas
    ) {

        return;

    }


    /* =====================================================
       CEK CHART.JS
    ====================================================== */

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js belum tersedia."
        );

        return;

    }



    /* =====================================================
       HITUNG MURID PER KELAS
    ====================================================== */

    const jumlahPerKelas =
        {};


    daftarKelas.forEach(
        (kelas) => {

            jumlahPerKelas[kelas] =
                0;

        }
    );


    data.forEach(
        (siswa) => {

            const kelas =
                normalizeClass(
                    siswa.kelas
                );


            if (
                Object.prototype.hasOwnProperty.call(
                    jumlahPerKelas,
                    kelas
                )
            ) {

                jumlahPerKelas[kelas]++;

            }

        }
    );



    /* =====================================================
       LABEL
    ====================================================== */

    const labels =
        daftarKelas
            .slice()
            .sort(sortKelas);


    const values =
        labels.map(
            (kelas) =>
                jumlahPerKelas[
                    kelas
                ] || 0
        );



    /* =====================================================
       TOTAL
    ====================================================== */

    const total =
        values.reduce(
            (
                sum,
                value
            ) =>
                sum + value,
            0
        );


    if (chartTotal) {

        chartTotal.textContent =
            total;

    }



    /* =====================================================
       DESTROY CHART LAMA
    ====================================================== */

    if (classChart) {

        classChart.destroy();

        classChart =
            null;

    }



    /* =====================================================
       CREATE CHART
    ====================================================== */

    classChart =
        new Chart(
            classChartCanvas,
            {

                type: "bar",


                data: {

                    labels: labels,


                    datasets: [

                        {

                            label:
                                "Jumlah Murid",

                            data:
                                values,

                            backgroundColor:
                                "rgba(7, 155, 145, 0.78)",

                            borderColor:
                                "#078f87",

                            borderWidth:
                                1,

                            borderRadius:
                                8,

                            borderSkipped:
                                false,

                            barPercentage:
                                0.72,

                            categoryPercentage:
                                0.75

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    animation: {

                        duration:
                            600,

                        easing:
                            "easeOutQuart"

                    },


                    interaction: {

                        mode:
                            "index",

                        intersect:
                            false

                    },


                    plugins: {

                        legend: {

                            display:
                                false

                        },


                        tooltip: {

                            backgroundColor:
                                "rgba(7, 59, 99, 0.96)",

                            titleColor:
                                "#ffffff",

                            bodyColor:
                                "#ffffff",

                            padding:
                                12,

                            cornerRadius:
                                10,

                            displayColors:
                                false,


                            callbacks: {

                                title:
                                    function (
                                        tooltipItems
                                    ) {

                                        if (
                                            !tooltipItems.length
                                        ) {

                                            return "";

                                        }


                                        return (
                                            "Kelas " +
                                            tooltipItems[0]
                                                .label
                                        );

                                    },


                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            " " +
                                            context.parsed.y +
                                            " murid"
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        x: {

                            grid: {

                                display:
                                    false

                            },


                            border: {

                                display:
                                    false

                            },


                            ticks: {

                                color:
                                    "#718691",

                                font: {

                                    family:
                                        "Poppins",

                                    size:
                                        9,

                                    weight:
                                        "600"

                                },

                                maxRotation:
                                    0,

                                minRotation:
                                    0

                            }

                        },


                        y: {

                            beginAtZero:
                                true,


                            ticks: {

                                precision:
                                    0,

                                color:
                                    "#82959f",

                                font: {

                                    family:
                                        "Poppins",

                                    size:
                                        9

                                }

                            },


                            grid: {

                                color:
                                    "rgba(126, 153, 163, 0.12)",

                                drawBorder:
                                    false

                            },


                            border: {

                                display:
                                    false

                            }

                        }

                    }

                }

            }
        );

}



/* =========================================================
   RENDER STUDENT TABLE
========================================================= */

function renderStudentTable(
    data
) {

    if (!siswaTableBody) {

        return;

    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        siswaTableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-state"
                >
                    Tidak ada data murid yang sesuai
                    dengan filter.
                </td>

            </tr>

        `;


        if (tableInfo) {

            tableInfo.textContent =
                "Menampilkan 0 murid";

        }


        return;

    }


    const sortedData =
        sortStudents(
            data
        );


    siswaTableBody.innerHTML =
        sortedData
            .map(
                (
                    siswa,
                    index
                ) => {

                    const nama =
                        normalizeText(
                            siswa.nama
                        ) ||
                        "-";


                    const nisn =
                        normalizeText(
                            siswa.nisn
                        ) ||
                        "-";


                    const kelas =
                        normalizeClass(
                            siswa.kelas
                        ) ||
                        "-";


                    const tahun =
                        normalizeText(
                            siswa.tahunAjaran
                        ) ||
                        "-";


                    return `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>


                            <td>

                                <strong>
                                    ${escapeHTML(nama)}
                                </strong>

                            </td>


                            <td>
                                ${escapeHTML(nisn)}
                            </td>


                            <td>
                                ${escapeHTML(kelas)}
                            </td>


                            <td>
                                ${escapeHTML(tahun)}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    if (tableInfo) {

        tableInfo.textContent =
            `Menampilkan ${sortedData.length} murid`;

    }

}



/* =========================================================
   TABLE ERROR
========================================================= */

function showTableError(
    message
) {

    if (siswaTableBody) {

        siswaTableBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-state"
                >
                    ${escapeHTML(message)}
                </td>

            </tr>

        `;

    }


    if (classGrid) {

        classGrid.innerHTML = `

            <div class="class-empty">
                ${escapeHTML(message)}
            </div>

        `;

    }


    if (filterInfo) {

        filterInfo.textContent =
            message;

    }

}



/* =========================================================
   ACCESS ERROR
========================================================= */

function showAccessError(
    message
) {

    document.body.innerHTML = `

        <div
            style="
                min-height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:25px;
                background:
                    linear-gradient(
                        135deg,
                        #f2fbfa,
                        #f6faff
                    );
                font-family:Poppins,sans-serif;
            "
        >

            <div
                style="
                    width:100%;
                    max-width:430px;
                    padding:35px 28px;
                    text-align:center;
                    background:#ffffff;
                    border:1px solid #dfeae8;
                    border-radius:20px;
                    box-shadow:
                        0 18px 45px
                        rgba(15,56,76,.10);
                "
            >

                <div
                    style="
                        width:65px;
                        height:65px;
                        margin:0 auto 18px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        border-radius:18px;
                        background:#fff0f0;
                        font-size:30px;
                    "
                >
                    🔒
                </div>


                <h2
                    style="
                        margin:0;
                        color:#15364e;
                        font-size:21px;
                    "
                >
                    Akses Ditolak
                </h2>


                <p
                    style="
                        margin:10px 0 0;
                        color:#80919d;
                        font-size:12px;
                        line-height:1.7;
                    "
                >
                    ${escapeHTML(message)}
                </p>


                <button
                    id="accessBackButton"
                    type="button"
                    style="
                        margin-top:22px;
                        padding:11px 20px;
                        border:0;
                        border-radius:11px;
                        background:
                            linear-gradient(
                                135deg,
                                #073b63,
                                #079b91
                            );
                        color:#ffffff;
                        font-family:inherit;
                        font-size:12px;
                        font-weight:600;
                        cursor:pointer;
                    "
                >
                    Kembali
                </button>

            </div>

        </div>

    `;


    const accessBackButton =
        document.getElementById(
            "accessBackButton"
        );


    if (accessBackButton) {

        accessBackButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "dashboard.html";

            }
        );

    }

}



/* =========================================================
   MOBILE SIDEBAR
========================================================= */

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


    if (menuButton) {

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        menuButton.setAttribute(
            "aria-label",
            "Tutup menu"
        );

    }


    document.body.style.overflow =
        "hidden";

}



/* =========================================================
   CLOSE SIDEBAR
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


    if (menuButton) {

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        menuButton.setAttribute(
            "aria-label",
            "Buka menu"
        );

    }


    document.body.style.overflow =
        "";

}



/* =========================================================
   TOGGLE SIDEBAR
========================================================= */

function toggleSidebar() {

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



/* =========================================================
   SIDEBAR EVENTS
========================================================= */

if (menuButton) {

    menuButton.addEventListener(
        "click",
        toggleSidebar
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}



/* =========================================================
   CLOSE SIDEBAR AFTER MENU CLICK
========================================================= */

document
    .querySelectorAll(
        ".menu-item"
    )
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
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key ===
            "Escape"
        ) {

            closeSidebar();

        }

    }
);



/* =========================================================
   FILTER EVENTS
========================================================= */

if (filterTahun) {

    filterTahun.addEventListener(
        "change",
        applyFilter
    );

}


if (filterKelas) {

    filterKelas.addEventListener(
        "change",
        applyFilter
    );

}



/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            const confirmed =
                window.confirm(
                    "Apakah Anda yakin ingin keluar?"
                );


            if (!confirmed) {

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
   LOAD PAGE
========================================================= */

async function initializePage(
    user
) {

    try {

        /* ================================================
           AMBIL DATA USER
        ================================================= */

        currentUserData =
            await getCurrentUserData(
                user
            );


        if (
            !currentUserData
        ) {

            showAccessError(
                "Data akun Anda tidak ditemukan."
            );

            return;

        }



        /* ================================================
           CEK ROLE
        ================================================= */

        const role =
            normalizeText(
                currentUserData.role
            ).toLowerCase();


        if (
            role !==
            "guru"
        ) {

            showAccessError(
                "Halaman Kelas & Angkatan hanya dapat diakses oleh Guru."
            );


            setTimeout(
                async () => {

                    try {

                        await signOut(
                            auth
                        );

                    } catch (error) {

                        console.error(
                            error
                        );

                    }


                    window.location.href =
                        "../index.html";

                },
                1800
            );


            return;

        }



        /* ================================================
           PROFILE
        ================================================= */

        await loadProfile(
            user
        );



        /* ================================================
           LOAD STUDENTS
        ================================================= */

        const success =
            await loadStudents();


        if (!success) {

            return;

        }



        /* ================================================
           LOAD YEAR FILTER
        ================================================= */

        loadYearOptions();



        /* ================================================
           RENDER INITIAL DATA
        ================================================= */

        renderSummary(
            semuaSiswa
        );


        renderClassCards(
            semuaSiswa
        );


        renderClassChart(
            semuaSiswa
        );


        renderStudentTable(
            semuaSiswa
        );


        updateFilterInfo(
            semuaSiswa,
            "",
            ""
        );



    } catch (error) {

        console.error(
            "Gagal menginisialisasi halaman:",
            error
        );


        showTableError(
            "Terjadi kesalahan saat memuat halaman."
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

            window.location.href =
                "../index.html";

            return;

        }


        await initializePage(
            user
        );

    }
);