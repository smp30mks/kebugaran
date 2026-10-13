/* =========================================================
   HASIL.JS
   HALAMAN HASIL & NILAI - PORTAL GURU
   UPT SPF SMP NEGERI 30 MAKASSAR

   VERSI:
   - TANPA GRAFIK
   - HANYA DATA HASIL
   - FILTER
   - SEARCH
   - STATISTIK
   - EDIT HASIL
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
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    updateDoc,
    serverTimestamp
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


const firestore = getFirestore(app);



/* =========================================================
   DOM - SIDEBAR
========================================================= */

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const menuButton = document.getElementById("menuButton");
const logoutButton = document.getElementById("logoutButton");


/* =========================================================
   DOM - PROFILE
========================================================= */

const topProfilePhoto = document.getElementById("topProfilePhoto");
const topProfilePlaceholder =
    document.getElementById("topProfilePlaceholder");

const topUserName = document.getElementById("topUserName");
const topUserRole = document.querySelector(".top-profile-info span");


/* =========================================================
   DOM - STATISTIK
========================================================= */

const totalSiswa = document.getElementById("totalSiswa");
const totalTesSelesai = document.getElementById("totalTesSelesai");
const rataNilai = document.getElementById("rataNilai");


/* =========================================================
   DOM - FILTER
========================================================= */

const searchSiswa = document.getElementById("searchSiswa");
const filterTahun = document.getElementById("filterTahun");
const filterKelas = document.getElementById("filterKelas");
const filterTes = document.getElementById("filterTes");


/* =========================================================
   DOM - TABLE
========================================================= */

const dataCount = document.getElementById("dataCount");
const hasilTableBody =
    document.getElementById("hasilTableBody");

const tableInfo = document.getElementById("tableInfo");


/* =========================================================
   DOM - EDIT MODAL
========================================================= */

const editModal = document.getElementById("editModal");
const editModalOverlay =
    document.getElementById("editModalOverlay");

const closeEditModal =
    document.getElementById("closeEditModal");

const cancelEditButton =
    document.getElementById("cancelEditButton");

const saveEditButton =
    document.getElementById("saveEditButton");


const editNamaMurid =
    document.getElementById("editNamaMurid");

const editNisnMurid =
    document.getElementById("editNisnMurid");

const editKelasMurid =
    document.getElementById("editKelasMurid");

const editTahunMurid =
    document.getElementById("editTahunMurid");

const editJenisTes =
    document.getElementById("editJenisTes");


const editHasilId =
    document.getElementById("editHasilId");

const editHasil =
    document.getElementById("editHasil");

const editSkor =
    document.getElementById("editSkor");

const editKategori =
    document.getElementById("editKategori");

const editMessage =
    document.getElementById("editMessage");



/* =========================================================
   GLOBAL DATA
========================================================= */

let currentTeacher = null;

let semuaMurid = [];

let semuaHasil = [];

let filteredHasil = [];

let muridMap = new Map();

let hasilMap = new Map();

let currentEditData = null;



/* =========================================================
   KONSTANTA JENIS TES
========================================================= */

const JENIS_TES = {

    handeye:
        "Hand & Eye Coordination",

    situp:
        "Sit Up",

    standingbroadjump:
        "Standing Broad Jump",

    ttest:
        "T Test",

    beeptest:
        "Beep Test"

};


const JENIS_TES_ORDER = [

    "handeye",

    "situp",

    "standingbroadjump",

    "ttest",

    "beeptest"

];



/* =========================================================
   KONSTANTA KATEGORI
========================================================= */

const KATEGORI = {

    1: "Kurang Sekali",

    2: "Kurang",

    3: "Sedang",

    4: "Baik",

    5: "Baik Sekali"

};



/* =========================================================
   UTILITY
========================================================= */

function safeText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value).trim();

}


function normalizeText(value) {

    return safeText(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


function escapeHtml(value) {

    return safeText(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


function getValue(data, keys, fallback = "") {

    for (const key of keys) {

        if (
            data &&
            data[key] !== undefined &&
            data[key] !== null &&
            safeText(data[key]) !== ""
        ) {

            return data[key];

        }

    }

    return fallback;

}


/* =========================================================
   UID MURID
========================================================= */

function getStudentUid(data, documentId = "") {

    const uid = getValue(
        data,
        [
            "uid",
            "userId",
            "siswaId",
            "studentId"
        ],
        ""
    );

    return safeText(uid || documentId);

}



/* =========================================================
   TIMESTAMP
========================================================= */

function timestampToNumber(value) {

    if (!value) {
        return 0;
    }


    if (
        typeof value === "object" &&
        typeof value.toMillis === "function"
    ) {

        return value.toMillis();

    }


    if (
        typeof value === "object" &&
        typeof value.seconds === "number"
    ) {

        return value.seconds * 1000;

    }


    if (
        typeof value === "string" ||
        typeof value === "number"
    ) {

        const result =
            new Date(value).getTime();

        return Number.isNaN(result)
            ? 0
            : result;

    }


    return 0;

}



/* =========================================================
   NORMALIZE GENDER
========================================================= */

function normalizeGender(value) {

    const gender =
        normalizeText(value);


    if (
        gender === "putra" ||
        gender === "laki-laki" ||
        gender === "laki laki" ||
        gender === "male" ||
        gender === "l"
    ) {

        return "putra";

    }


    if (
        gender === "putri" ||
        gender === "perempuan" ||
        gender === "female" ||
        gender === "p"
    ) {

        return "putri";

    }


    return safeText(value);

}



/* =========================================================
   NORMALIZE TEST TYPE
========================================================= */

function normalizeTestType(value) {

    const text =
        normalizeText(value)
            .replace(/\s+/g, "");

    if (
        text === "handeye" ||
        text === "handeyecoordination"
    ) {

        return "handeye";

    }


    if (
        text === "situp" ||
        text === "sit-ups"
    ) {

        return "situp";

    }


    if (
        text === "standingbroadjump" ||
        text === "standinglongjump"
    ) {

        return "standingbroadjump";

    }


    if (
        text === "ttest" ||
        text === "t-test"
    ) {

        return "ttest";

    }


    if (
        text === "beeptest" ||
        text === "beep"
    ) {

        return "beeptest";

    }


    return safeText(value);

}



/* =========================================================
   LABEL JENIS TES
========================================================= */

function getTestLabel(type) {

    const normalized =
        normalizeTestType(type);

    return (
        JENIS_TES[normalized] ||
        safeText(type) ||
        "-"
    );

}



/* =========================================================
   KATEGORI BERDASARKAN SKOR
========================================================= */

function getCategoryFromScore(score) {

    const numericScore =
        Number(score);

    if (
        Number.isFinite(numericScore) &&
        KATEGORI[numericScore]
    ) {

        return KATEGORI[numericScore];

    }

    return "";

}



/* =========================================================
   CLASS KATEGORI
========================================================= */

function getCategoryClass(category) {

    const normalized =
        normalizeText(category);

    switch (normalized) {

        case "baik sekali":
            return "category-excellent";

        case "baik":
            return "category-good";

        case "sedang":
            return "category-medium";

        case "kurang":
            return "category-low";

        case "kurang sekali":
            return "category-very-low";

        default:
            return "";

    }

}



/* =========================================================
   FORMAT SCORE
========================================================= */

function formatScore(score) {

    if (
        score === null ||
        score === undefined ||
        score === ""
    ) {

        return "-";

    }


    const numericScore =
        Number(score);


    if (
        Number.isFinite(numericScore)
    ) {

        return numericScore
            .toFixed(
                Number.isInteger(numericScore)
                    ? 0
                    : 2
            );

    }


    return escapeHtml(score);

}



/* =========================================================
   SORT TAHUN
========================================================= */

function sortYears(a, b) {

    const aText =
        safeText(a);

    const bText =
        safeText(b);


    const aStart =
        Number(
            aText.split("/")[0]
        );

    const bStart =
        Number(
            bText.split("/")[0]
        );


    if (
        Number.isFinite(aStart) &&
        Number.isFinite(bStart)
    ) {

        return bStart - aStart;

    }


    return bText.localeCompare(
        aText,
        "id"
    );

}



/* =========================================================
   SORT KELAS
========================================================= */

function sortClasses(a, b) {

    const aText =
        safeText(a);

    const bText =
        safeText(b);


    return aText.localeCompare(
        bText,
        "id",
        {
            numeric: true,
            sensitivity: "base"
        }
    );

}



/* =========================================================
   NORMALIZE MURID
========================================================= */

function normalizeMurid(id, data) {

    const uid =
        getStudentUid(
            data,
            id
        );


    return {

        id,

        uid,

        nama: safeText(
            getValue(
                data,
                [
                    "nama",
                    "name",
                    "namaMurid",
                    "studentName"
                ]
            )
        ),

        nisn: safeText(
            getValue(
                data,
                [
                    "nisn",
                    "NISN"
                ]
            )
        ),

        kelas: safeText(
            getValue(
                data,
                [
                    "kelas",
                    "class"
                ]
            )
        ),

        tahunAjaran: safeText(
            getValue(
                data,
                [
                    "tahunAjaran",
                    "tahun_ajaran",
                    "academicYear"
                ]
            )
        ),

        jenisKelamin:
            normalizeGender(
                getValue(
                    data,
                    [
                        "jenisKelamin",
                        "gender",
                        "kelamin"
                    ]
                )
            ),

        role: safeText(
            getValue(
                data,
                [
                    "role"
                ]
            )
        )

    };

}



/* =========================================================
   NORMALIZE HASIL
========================================================= */

function normalizeHasil(id, data) {

    const uid =
        getStudentUid(
            data,
            ""
        );


    const jenisTes =
        normalizeTestType(
            getValue(
                data,
                [
                    "jenisTes",
                    "jenis_tes",
                    "testType"
                ]
            )
        );


    const scoreValue =
        getValue(
            data,
            [
                "skor",
                "score",
                "nilai"
            ],
            ""
        );


    const numericScore =
        Number(scoreValue);


    let kategori =
        safeText(
            getValue(
                data,
                [
                    "kategori",
                    "category"
                ]
            )
        );


    if (
        !kategori &&
        Number.isFinite(numericScore)
    ) {

        kategori =
            getCategoryFromScore(
                numericScore
            );

    }


    return {

        id,

        uid,

        jenisTes,

        namaTes: safeText(
            getValue(
                data,
                [
                    "namaTes",
                    "testName"
                ]
            )
        ),

        hasil: safeText(
            getValue(
                data,
                [
                    "hasil",
                    "result"
                ]
            )
        ),

        skor:
            Number.isFinite(numericScore)
                ? numericScore
                : "",

        kategori,

        status: safeText(
            getValue(
                data,
                [
                    "status"
                ]
            )
        ),

        submittedAt:
            getValue(
                data,
                [
                    "submittedAt",
                    "createdAt",
                    "updatedAt"
                ],
                null
            ),

        updatedAt:
            getValue(
                data,
                [
                    "updatedAt"
                ],
                null
            ),

        level:
            getValue(
                data,
                [
                    "level"
                ],
                ""
            ),

        balikan:
            getValue(
                data,
                [
                    "balikan"
                ],
                ""
            )

    };

}



/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            window.location.href =
                "../index.html";

            return;

        }


        currentTeacher = user;


        try {

            /*
             * DATA GURU DAN DATA HASIL
             * TIDAK SALING MENUNGGU.
             *
             * FOTO PROFIL TIDAK BOLEH
             * MEMBLOKIR DATA HASIL.
             */

            const teacherPromise =
                loadTeacher()
                    .catch(error => {

                        console.warn(
                            "Profil guru gagal dimuat:",
                            error
                        );

                    });


            const dataPromise =
                loadData();


            await Promise.all([
                teacherPromise,
                dataPromise
            ]);


        } catch (error) {

            console.error(
                "Gagal memuat Hasil & Nilai:",
                error
            );


            renderError(
                "Gagal memuat data hasil tes."
            );

        }

    }
);



/* =========================================================
   LOAD DATA GURU
========================================================= */

async function loadTeacher() {

    if (!currentTeacher) {
        return;
    }


    const teacherRef =
        doc(
            firestore,
            "users",
            currentTeacher.uid
        );


    const teacherSnapshot =
        await getDoc(
            teacherRef
        );


    if (!teacherSnapshot.exists()) {

        throw new Error(
            "Data guru tidak ditemukan."
        );

    }


    const data =
        teacherSnapshot.data();


    const role =
        safeText(
            data.role
        ).toLowerCase();


    if (role !== "guru") {

        throw new Error(
            "Akun bukan akun guru."
        );

    }


    const nama =
        safeText(
            getValue(
                data,
                [
                    "nama",
                    "name",
                    "namaGuru"
                ],
                currentTeacher.displayName ||
                "Guru"
            )
        );


    if (topUserName) {

        topUserName.textContent =
            nama;

    }


    if (topUserRole) {

        topUserRole.textContent =
            "Portal Guru";

    }


    /*
     * FOTO PROFIL DIJALANKAN TERPISAH.
     * TIDAK MENAHAN LOAD DATA HASIL.
     */

    loadTeacherPhoto(
        currentTeacher.uid,
        data
    ).catch(error => {

        console.warn(
            "Foto profil tidak tersedia:",
            error
        );

    });

}



/* =========================================================
   LOAD FOTO GURU
========================================================= */

async function loadTeacherPhoto(
    uid,
    userData = {}
) {

    if (
        !topProfilePhoto ||
        !topProfilePlaceholder
    ) {

        return;

    }


    /*
     * PRIORITAS:
     * 1. photoURL
     * 2. fotoProfil
     * 3. profilePhoto
     * 4. displayPhotoURL
     */

    const existingPhoto =
        safeText(
            getValue(
                userData,
                [
                    "photoURL",
                    "fotoProfil",
                    "profilePhoto",
                    "displayPhotoURL"
                ],
                ""
            )
        );


    if (existingPhoto) {

        topProfilePhoto.src =
            existingPhoto;

        topProfilePhoto.style.display =
            "block";

        topProfilePlaceholder.style.display =
            "none";

        return;

    }


    /*
     * Jika tidak ada URL foto,
     * coba Firebase Storage.
     */

    try {

        const photoRef =
            ref(
                storage,
                `profile/${uid}/profile.jpg`
            );


        const url =
            await getDownloadURL(
                photoRef
            );


        if (!url) {
            return;
        }


        topProfilePhoto.src =
            url;

        topProfilePhoto.style.display =
            "block";

        topProfilePlaceholder.style.display =
            "none";


    } catch (error) {

        /*
         * Jangan tampilkan error ke pengguna.
         * Placeholder tetap digunakan.
         */

        topProfilePhoto.style.display =
            "none";

        topProfilePlaceholder.style.display =
            "flex";

    }

}



/* =========================================================
   LOAD SEMUA DATA
========================================================= */

async function loadData() {

    renderLoading();


    const startTime =
        performance.now();


    /*
     * HANYA AMBIL USER DENGAN ROLE SISWA.
     *
     * Ini lebih efisien daripada membaca semua
     * dokumen users kemudian memfilter di browser.
     */

    const siswaQuery =
        query(
            collection(
                firestore,
                "users"
            ),
            where(
                "role",
                "==",
                "siswa"
            )
        );


    /*
     * USERS DAN HASIL DIBACA BERSAMA.
     */

    const [
        usersSnapshot,
        hasilSnapshot
    ] = await Promise.all([

        getDocs(
            siswaQuery
        ),

        getDocs(
            collection(
                firestore,
                "hasilTes"
            )
        )

    ]);


    console.log(
        `Users siswa: ${usersSnapshot.size}`
    );

    console.log(
        `Hasil tes: ${hasilSnapshot.size}`
    );


    /* =====================================================
       NORMALIZE MURID
    ====================================================== */

    semuaMurid = [];


    usersSnapshot.forEach(
        snapshot => {

            const data =
                snapshot.data();


            semuaMurid.push(
                normalizeMurid(
                    snapshot.id,
                    data
                )
            );

        }
    );


    /* =====================================================
       SORT MURID
    ====================================================== */

    semuaMurid.sort(
        (a, b) =>
            normalizeText(
                a.nama
            ).localeCompare(
                normalizeText(
                    b.nama
                ),
                "id"
            )
    );


    /* =====================================================
       MAP MURID
    ====================================================== */

    muridMap.clear();


    semuaMurid.forEach(
        murid => {

            if (murid.uid) {

                muridMap.set(
                    murid.uid,
                    murid
                );

            }


            muridMap.set(
                murid.id,
                murid
            );

        }
    );


    /* =====================================================
       NORMALIZE HASIL
    ====================================================== */

    semuaHasil = [];


    hasilSnapshot.forEach(
        snapshot => {

            const hasil =
                normalizeHasil(
                    snapshot.id,
                    snapshot.data()
                );


            /*
             * Hanya simpan hasil yang mempunyai UID.
             */

            if (!hasil.uid) {
                return;
            }


            semuaHasil.push(
                hasil
            );

        }
    );


    /* =====================================================
       SORT HASIL
    ====================================================== */

    semuaHasil.sort(
        (a, b) => {

            const aTime =
                timestampToNumber(
                    a.submittedAt
                );


            const bTime =
                timestampToNumber(
                    b.submittedAt
                );


            if (bTime !== aTime) {

                return bTime - aTime;

            }


            const aMurid =
                muridMap.get(
                    a.uid
                );


            const bMurid =
                muridMap.get(
                    b.uid
                );


            return normalizeText(
                aMurid?.nama || ""
            ).localeCompare(
                normalizeText(
                    bMurid?.nama || ""
                ),
                "id"
            );

        }
    );


    /* =====================================================
       MAP HASIL
    ====================================================== */

    hasilMap.clear();


    semuaHasil.forEach(
        hasil => {

            hasilMap.set(
                hasil.id,
                hasil
            );

        }
    );


    /* =====================================================
       FILTER
    ====================================================== */

    populateFilters();


    applyFilters();


    const endTime =
        performance.now();


    console.log(
        `Total waktu load data: ${(endTime - startTime).toFixed(0)} ms`
    );

}



/* =========================================================
   POPULATE FILTER
========================================================= */

function populateFilters() {

    if (
        !filterTahun ||
        !filterKelas
    ) {

        return;

    }


    /*
     * SIMPAN NILAI FILTER SAAT INI
     */

    const currentYear =
        filterTahun.value;

    const currentClass =
        filterKelas.value;


    /*
     * TAHUN
     */

    const years =
        [
            ...new Set(
                semuaMurid
                    .map(
                        murid =>
                            safeText(
                                murid.tahunAjaran
                            )
                    )
                    .filter(Boolean)
            )
        ];


    years.sort(
        sortYears
    );


    filterTahun.innerHTML =
        `
        <option value="">
            Semua Tahun Ajaran
        </option>
        `;


    years.forEach(
        year => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                year;

            option.textContent =
                year;


            filterTahun.appendChild(
                option
            );

        }
    );


    /*
     * KELAS
     */

    const classes =
        [
            ...new Set(
                semuaMurid
                    .map(
                        murid =>
                            safeText(
                                murid.kelas
                            )
                    )
                    .filter(Boolean)
            )
        ];


    classes.sort(
        sortClasses
    );


    filterKelas.innerHTML =
        `
        <option value="">
            Semua Kelas
        </option>
        `;


    classes.forEach(
        kelas => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                kelas;

            option.textContent =
                kelas;


            filterKelas.appendChild(
                option
            );

        }
    );


    /*
     * KEMBALIKAN FILTER
     */

    if (
        currentYear &&
        years.includes(
            currentYear
        )
    ) {

        filterTahun.value =
            currentYear;

    }


    if (
        currentClass &&
        classes.includes(
            currentClass
        )
    ) {

        filterKelas.value =
            currentClass;

    }

}



/* =========================================================
   APPLY FILTER
========================================================= */

function applyFilters() {

    const search =
        normalizeText(
            searchSiswa?.value
        );


    const tahun =
        safeText(
            filterTahun?.value
        );


    const kelas =
        safeText(
            filterKelas?.value
        );


    const jenisTes =
        normalizeTestType(
            filterTes?.value
        );


    filteredHasil =
        semuaHasil.filter(
            hasil => {

                const murid =
                    muridMap.get(
                        hasil.uid
                    );


                if (!murid) {

                    /*
                     * Kalau data hasil ada tetapi
                     * user siswa tidak ditemukan,
                     * tetap jangan tampilkan data rusak.
                     */

                    return false;

                }


                /*
                 * SEARCH
                 */

                if (search) {

                    const searchText =
                        normalizeText(
                            [
                                murid.nama,
                                murid.nisn,
                                murid.kelas,
                                murid.tahunAjaran,
                                getTestLabel(
                                    hasil.jenisTes
                                ),
                                hasil.hasil,
                                hasil.kategori
                            ]
                                .filter(Boolean)
                                .join(" ")
                        );


                    if (
                        !searchText.includes(
                            search
                        )
                    ) {

                        return false;

                    }

                }


                /*
                 * TAHUN
                 */

                if (
                    tahun &&
                    murid.tahunAjaran !== tahun
                ) {

                    return false;

                }


                /*
                 * KELAS
                 */

                if (
                    kelas &&
                    murid.kelas !== kelas
                ) {

                    return false;

                }


                /*
                 * JENIS TES
                 */

                if (
                    jenisTes &&
                    normalizeTestType(
                        hasil.jenisTes
                    ) !== jenisTes
                ) {

                    return false;

                }


                return true;

            }
        );


    updateHeroStatistics();

    renderTable();

}



/* =========================================================
   GET VISIBLE MURID
========================================================= */

function getVisibleMurid() {

    const muridSet =
        new Set();


    filteredHasil.forEach(
        hasil => {

            if (
                hasil.uid &&
                muridMap.has(
                    hasil.uid
                )
            ) {

                muridSet.add(
                    hasil.uid
                );

            }

        }
    );


    /*
     * Jika tidak ada hasil tes,
     * tetapi filter belum digunakan,
     * tampilkan seluruh murid.
     */

    if (
        filteredHasil.length === 0 &&
        !searchSiswa?.value &&
        !filterTahun?.value &&
        !filterKelas?.value &&
        !filterTes?.value
    ) {

        return semuaMurid;

    }


    return [
        ...muridSet
    ].map(
        uid =>
            muridMap.get(
                uid
            )
    ).filter(Boolean);

}



/* =========================================================
   UPDATE STATISTIK HERO
========================================================= */

function updateHeroStatistics() {

    const visibleMurid =
        getVisibleMurid();


    /*
     * TOTAL MURID
     */

    if (totalSiswa) {

        totalSiswa.textContent =
            visibleMurid.length;

    }


    /*
     * TOTAL TES
     */

    if (totalTesSelesai) {

        totalTesSelesai.textContent =
            filteredHasil.length;

    }


    /*
     * RATA-RATA SKOR
     */

    const scores =
        filteredHasil

            .map(
                hasil =>
                    Number(
                        hasil.skor
                    )
            )

            .filter(
                score =>
                    Number.isFinite(
                        score
                    )
            );


    if (
        rataNilai
    ) {

        if (
            scores.length === 0
        ) {

            rataNilai.textContent =
                "0.00";

        } else {

            const total =
                scores.reduce(
                    (sum, score) =>
                        sum + score,
                    0
                );


            const average =
                total /
                scores.length;


            rataNilai.textContent =
                average.toFixed(2);

        }

    }

}



/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable() {

    if (
        !hasilTableBody
    ) {

        return;

    }


    /*
     * TIDAK ADA DATA
     */

    if (
        filteredHasil.length === 0
    ) {

        hasilTableBody.innerHTML =
            `
            <tr>

                <td
                    colspan="9"
                    class="empty-state"
                >
                    Tidak ada data hasil tes.
                </td>

            </tr>
            `;


        updateTableInfo();

        return;

    }


    /*
     * RENDER ROW
     */

    const rows =
        filteredHasil.map(
            (hasil, index) =>
                createTableRow(
                    hasil,
                    index
                )
        );


    hasilTableBody.innerHTML =
        rows.join("");


    updateTableInfo();

}



/* =========================================================
   CREATE TABLE ROW
========================================================= */

function createTableRow(
    hasil,
    index
) {

    const murid =
        muridMap.get(
            hasil.uid
        );


    if (!murid) {

        return "";

    }


    const nama =
        safeText(
            murid.nama
        ) || "-";


    const nisn =
        safeText(
            murid.nisn
        );


    const kelas =
        safeText(
            murid.kelas
        ) || "-";


    const tahun =
        safeText(
            murid.tahunAjaran
        ) || "-";


    const jenisTes =
        getTestLabel(
            hasil.jenisTes
        );


    const hasilTes =
        safeText(
            hasil.hasil
        ) || "-";


    const skor =
        formatScore(
            hasil.skor
        );


    const kategori =
        safeText(
            hasil.kategori
        ) ||
        getCategoryFromScore(
            hasil.skor
        ) ||
        "-";


    const categoryClass =
        getCategoryClass(
            kategori
        );


    const safeId =
        escapeHtml(
            hasil.id
        );


    return `
        <tr>

            <td>
                ${index + 1}
            </td>


            <td>

                <div class="student-name">

                    <strong>
                        ${escapeHtml(nama)}
                    </strong>

                    ${
                        nisn
                            ? `
                                <small>
                                    NISN: ${escapeHtml(nisn)}
                                </small>
                              `
                            : ""
                    }

                </div>

            </td>


            <td>
                ${escapeHtml(kelas)}
            </td>


            <td>
                ${escapeHtml(tahun)}
            </td>


            <td>
                ${escapeHtml(jenisTes)}
            </td>


            <td>
                ${escapeHtml(hasilTes)}
            </td>


            <td>

                <strong class="score-value">
                    ${escapeHtml(skor)}
                </strong>

            </td>


            <td>

                <span
                    class="category-badge ${categoryClass}"
                >
                    ${escapeHtml(kategori)}
                </span>

            </td>


            <td>

                <button
                    type="button"
                    class="edit-result-button"
                    data-id="${safeId}"
                >
                    Edit
                </button>

            </td>

        </tr>
    `;

}



/* =========================================================
   UPDATE TABLE INFO
========================================================= */

function updateTableInfo() {

    const count =
        filteredHasil.length;


    if (dataCount) {

        dataCount.textContent =
            `${count} Data`;

    }


    if (tableInfo) {

        if (count === 0) {

            tableInfo.textContent =
                "Menampilkan 0 data";

        } else {

            tableInfo.textContent =
                `Menampilkan ${count} data`;

        }

    }

}



/* =========================================================
   LOADING TABLE
========================================================= */

function renderLoading() {

    if (
        hasilTableBody
    ) {

        hasilTableBody.innerHTML =
            `
            <tr>

                <td
                    colspan="9"
                    class="empty-state"
                >
                    Memuat hasil tes...
                </td>

            </tr>
            `;

    }


    if (dataCount) {

        dataCount.textContent =
            "Memuat...";

    }


    if (tableInfo) {

        tableInfo.textContent =
            "Memuat data...";

    }

}



/* =========================================================
   ERROR TABLE
========================================================= */

function renderError(
    message
) {

    if (
        hasilTableBody
    ) {

        hasilTableBody.innerHTML =
            `
            <tr>

                <td
                    colspan="9"
                    class="empty-state error-state"
                >
                    ${escapeHtml(message)}
                </td>

            </tr>
            `;

    }


    if (dataCount) {

        dataCount.textContent =
            "0 Data";

    }


    if (tableInfo) {

        tableInfo.textContent =
            "Data gagal dimuat";

    }

}



/* =========================================================
   OPEN EDIT MODAL
========================================================= */

function openEditModal(
    hasilId
) {

    const hasil =
        hasilMap.get(
            hasilId
        );


    if (!hasil) {

        return;

    }


    const murid =
        muridMap.get(
            hasil.uid
        );


    if (!murid) {

        return;

    }


    currentEditData = {
        hasil,
        murid
    };


    /*
     * DATA MURID
     */

    if (editNamaMurid) {

        editNamaMurid.textContent =
            murid.nama || "-";

    }


    if (editNisnMurid) {

        editNisnMurid.textContent =
            murid.nisn || "-";

    }


    if (editKelasMurid) {

        editKelasMurid.textContent =
            murid.kelas || "-";

    }


    if (editTahunMurid) {

        editTahunMurid.textContent =
            murid.tahunAjaran || "-";

    }


    if (editJenisTes) {

        editJenisTes.textContent =
            getTestLabel(
                hasil.jenisTes
            );

    }


    /*
     * HIDDEN ID
     */

    if (editHasilId) {

        editHasilId.value =
            hasil.id;

    }


    /*
     * HASIL
     */

    if (editHasil) {

        editHasil.value =
            hasil.hasil || "";

    }


    /*
     * SKOR
     */

    if (editSkor) {

        editSkor.value =
            hasil.skor !== ""
                ? hasil.skor
                : "";

    }


    /*
     * KATEGORI
     */

    const kategori =
        hasil.kategori ||
        getCategoryFromScore(
            hasil.skor
        );


    if (editKategori) {

        editKategori.value =
            kategori || "";

    }


    if (editMessage) {

        editMessage.textContent =
            "";

        editMessage.className =
            "edit-message";

    }


    /*
     * BUKA MODAL
     */

    if (editModal) {

        editModal.style.display =
            "flex";

        document.body.classList.add(
            "modal-open"
        );

    }


    /*
     * FOCUS HASIL
     */

    setTimeout(
        () => {

            if (editHasil) {

                editHasil.focus();

            }

        },
        50
    );

}



/* =========================================================
   CLOSE EDIT MODAL
========================================================= */

function closeEdit() {

    currentEditData =
        null;


    if (editModal) {

        editModal.style.display =
            "none";

    }


    document.body.classList.remove(
        "modal-open"
    );


    if (editMessage) {

        editMessage.textContent =
            "";

        editMessage.className =
            "edit-message";

    }

}



/* =========================================================
   UPDATE CATEGORY DARI SKOR
========================================================= */

function updateEditCategory() {

    if (
        !editSkor ||
        !editKategori
    ) {

        return;

    }


    const score =
        Number(
            editSkor.value
        );


    const category =
        getCategoryFromScore(
            score
        );


    editKategori.value =
        category || "";

}



/* =========================================================
   SAVE EDIT
========================================================= */

async function saveEdit() {

    if (
        !currentEditData
    ) {

        return;

    }


    const hasil =
        currentEditData.hasil;


    const hasilId =
        hasil.id;


    const newHasil =
        safeText(
            editHasil?.value
        );


    const newSkor =
        Number(
            editSkor?.value
        );


    /*
     * VALIDASI HASIL
     */

    if (!newHasil) {

        showEditMessage(
            "Hasil tes wajib diisi.",
            "error"
        );

        editHasil?.focus();

        return;

    }


    /*
     * VALIDASI SKOR
     */

    if (
        !Number.isInteger(
            newSkor
        ) ||
        newSkor < 1 ||
        newSkor > 5
    ) {

        showEditMessage(
            "Skor harus berupa angka 1 sampai 5.",
            "error"
        );

        editSkor?.focus();

        return;

    }


    const newKategori =
        getCategoryFromScore(
            newSkor
        );


    /*
     * NONAKTIFKAN BUTTON
     */

    if (saveEditButton) {

        saveEditButton.disabled =
            true;

        saveEditButton.dataset.originalText =
            saveEditButton.textContent;

        saveEditButton.textContent =
            "Menyimpan...";

    }


    showEditMessage(
        "Menyimpan perubahan...",
        "loading"
    );


    try {

        const hasilRef =
            doc(
                firestore,
                "hasilTes",
                hasilId
            );


        await updateDoc(
            hasilRef,
            {

                hasil:
                    newHasil,

                skor:
                    newSkor,

                kategori:
                    newKategori,

                updatedAt:
                    serverTimestamp()

            }
        );


        /*
         * UPDATE LOCAL DATA
         */

        hasil.hasil =
            newHasil;

        hasil.skor =
            newSkor;

        hasil.kategori =
            newKategori;


        hasil.updatedAt =
            new Date();


        hasilMap.set(
            hasil.id,
            hasil
        );


        /*
         * TUTUP MODAL
         */

        closeEdit();


        /*
         * REFRESH TABLE
         */

        applyFilters();


    } catch (error) {

        console.error(
            "Gagal menyimpan hasil:",
            error
        );


        showEditMessage(
            "Gagal menyimpan perubahan. Silakan coba lagi.",
            "error"
        );


    } finally {

        if (saveEditButton) {

            saveEditButton.disabled =
                false;


            saveEditButton.textContent =
                saveEditButton.dataset.originalText ||
                "Simpan Perubahan";

        }

    }

}



/* =========================================================
   EDIT MESSAGE
========================================================= */

function showEditMessage(
    message,
    type = ""
) {

    if (!editMessage) {
        return;
    }


    editMessage.textContent =
        message;


    editMessage.className =
        `edit-message ${type}`;

}



/* =========================================================
   SIDEBAR OPEN
========================================================= */

function openSidebar() {

    sidebar?.classList.add(
        "open"
    );

    sidebarOverlay?.classList.add(
        "active"
    );

    document.body.classList.add(
        "sidebar-open"
    );

}



/* =========================================================
   SIDEBAR CLOSE
========================================================= */

function closeSidebar() {

    sidebar?.classList.remove(
        "open"
    );

    sidebarOverlay?.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "sidebar-open"
    );

}



/* =========================================================
   LOGOUT
========================================================= */

async function handleLogout() {

    if (logoutButton) {

        logoutButton.disabled =
            true;

    }


    try {

        await signOut(
            auth
        );


        window.location.href =
            "../index.html";


    } catch (error) {

        console.error(
            "Gagal logout:",
            error
        );


        if (logoutButton) {

            logoutButton.disabled =
                false;

        }

    }

}



/* =========================================================
   EVENT - MENU
========================================================= */

if (menuButton) {

    menuButton.addEventListener(
        "click",
        () => {

            const isOpen =
                sidebar?.classList.contains(
                    "open"
                );


            if (isOpen) {

                closeSidebar();

            } else {

                openSidebar();

            }

        }
    );

}



/* =========================================================
   EVENT - OVERLAY
========================================================= */

if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}



/* =========================================================
   EVENT - LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        handleLogout
    );

}



/* =========================================================
   EVENT - SEARCH
========================================================= */

if (searchSiswa) {

    searchSiswa.addEventListener(
        "input",
        applyFilters
    );

}



/* =========================================================
   EVENT - TAHUN
========================================================= */

if (filterTahun) {

    filterTahun.addEventListener(
        "change",
        applyFilters
    );

}



/* =========================================================
   EVENT - KELAS
========================================================= */

if (filterKelas) {

    filterKelas.addEventListener(
        "change",
        applyFilters
    );

}



/* =========================================================
   EVENT - JENIS TES
========================================================= */

if (filterTes) {

    filterTes.addEventListener(
        "change",
        applyFilters
    );

}



/* =========================================================
   EVENT - EDIT BUTTON
========================================================= */

if (hasilTableBody) {

    hasilTableBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".edit-result-button"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;


            if (!id) {
                return;
            }


            openEditModal(
                id
            );

        }
    );

}



/* =========================================================
   EVENT - CLOSE MODAL
========================================================= */

if (closeEditModal) {

    closeEditModal.addEventListener(
        "click",
        closeEdit
    );

}


if (cancelEditButton) {

    cancelEditButton.addEventListener(
        "click",
        closeEdit
    );

}


if (editModalOverlay) {

    editModalOverlay.addEventListener(
        "click",
        closeEdit
    );

}



/* =========================================================
   EVENT - SAVE
========================================================= */

if (saveEditButton) {

    saveEditButton.addEventListener(
        "click",
        saveEdit
    );

}



/* =========================================================
   EVENT - SKOR BERUBAH
========================================================= */

if (editSkor) {

    editSkor.addEventListener(
        "input",
        updateEditCategory
    );

}



/* =========================================================
   EVENT - ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            if (
                editModal &&
                editModal.style.display === "flex"
            ) {

                closeEdit();

            }


            if (
                sidebar?.classList.contains(
                    "open"
                )
            ) {

                closeSidebar();

            }

        }

    }
);



/* =========================================================
   EVENT - RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 992
        ) {

            closeSidebar();

        }

    }
);



/* =========================================================
   INITIAL CATEGORY
========================================================= */

updateEditCategory();