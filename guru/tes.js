/* =========================================================
   GURU / TES.JS
   HALAMAN STATUS TES SISWA
   UPT SPF SMP NEGERI 30 MAKASSAR

   VERSI OPTIMASI
   - Pengambilan data paralel
   - Index hasil berdasarkan UID
   - Tidak melakukan filter hasilTes berulang-ulang
   - Status 0/5, 1-4/5, 5/5
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
    deleteDoc,
    doc,
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


const firestore = getFirestore(app);


/* =========================================================
   ELEMENT
========================================================= */

const sidebar = document.querySelector(".sidebar");
const sidebarOverlay = document.querySelector(".sidebar-overlay");
const menuButton = document.querySelector(".menu-button");

const logoutButton = document.querySelector("#logoutButton");

const topUserName = document.querySelector("#topUserName");
const topProfilePhoto = document.querySelector("#topProfilePhoto");
const topProfilePlaceholder = document.querySelector("#topProfilePlaceholder");


const totalSiswa = document.querySelector("#totalSiswa");
const totalSelesai = document.querySelector("#totalSelesai");
const totalBelum = document.querySelector("#totalBelum");
const totalHasil = document.querySelector("#totalHasil");


const searchSiswa = document.querySelector("#searchSiswa");
const filterKelas = document.querySelector("#filterKelas");
const filterTahun = document.querySelector("#filterTahun");
const filterStatus = document.querySelector("#filterStatus");


const dataCount = document.querySelector("#dataCount");
const tesTableBody = document.querySelector("#tesTableBody");
const tableInfo = document.querySelector("#tableInfo");


/* =========================================================
   DATA
========================================================= */

let semuaMurid = [];
let semuaHasilTes = [];
let semuaPengajuan = [];


/*
    INDEX DATA

    Tujuan:
    agar kita tidak melakukan filter terhadap seluruh
    hasilTes setiap kali memproses satu siswa.
*/

let hasilByUid = new Map();
let pengajuanByUid = new Map();


/* =========================================================
   DAFTAR TES
========================================================= */

const daftarTes = [
    "handeye",
    "situp",
    "standingbroadjump",
    "ttest",
    "beeptest"
];


/* =========================================================
   DAFTAR KELAS
========================================================= */

const daftarKelas = [];

for (let tingkat = 7; tingkat <= 9; tingkat++) {

    for (let nomor = 1; nomor <= 10; nomor++) {

        daftarKelas.push(`${tingkat}.${nomor}`);

    }

}


/* =========================================================
   UTILITAS TEXT
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


/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[-_]/g, "");

}


/* =========================================================
   NORMALIZE CLASS
========================================================= */

function normalizeClass(value) {

    const text = safeText(value)
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/kelas/g, "");

    if (!text) {
        return "";
    }

    const match = text.match(/([789])[\.\-]?(\d+)/);

    if (match) {

        return `${match[1]}.${match[2]}`;

    }

    return safeText(value);

}


/* =========================================================
   NORMALIZE TEST KEY
========================================================= */

function normalizeTestKey(value) {

    const text = normalizeText(value);

    if (!text) {
        return "";
    }


    /* HAND & EYE */

    if (
        text === "handeye" ||
        text.includes("handeye") ||
        text.includes("handandeye") ||
        text.includes("handeyecoordination") ||
        text.includes("koordinasimatadan tangan") ||
        text.includes("koordinasimata") ||
        text.includes("mata tangan")
    ) {

        return "handeye";

    }


    /* SIT UP */

    if (
        text === "situp" ||
        text.includes("situp")
    ) {

        return "situp";

    }


    /* STANDING BROAD JUMP */

    if (
        text === "standingbroadjump" ||
        text.includes("standingbroadjump") ||
        text.includes("broadjump") ||
        text.includes("lompatjauhdaristandar") ||
        text.includes("lompatjauh")
    ) {

        return "standingbroadjump";

    }


    /* T TEST */

    if (
        text === "ttest" ||
        text.includes("ttest") ||
        text.includes("t-test") ||
        text.includes("teskelincahan")
    ) {

        return "ttest";

    }


    /* BEEP TEST */

    if (
        text === "beeptest" ||
        text.includes("beeptest") ||
        text.includes("bleep") ||
        text.includes("multistage") ||
        text.includes("shuttlerun")
    ) {

        return "beeptest";

    }


    return "";

}


/* =========================================================
   GET TEST TYPE
========================================================= */

function getTestTypeFromResult(hasil) {

    if (!hasil) {
        return "";
    }


    const fields = [
        hasil.jenisTes,
        hasil.jenis,
        hasil.testType,
        hasil.test_type,
        hasil.tipeTes,
        hasil.tipe,
        hasil.type,
        hasil.namaTes,
        hasil.namaTest,
        hasil.nama,
        hasil.kategori,
        hasil.tes
    ];


    for (const value of fields) {

        const key = normalizeTestKey(value);

        if (key) {

            return key;

        }

    }


    return "";

}


/* =========================================================
   GET STUDENT UID
========================================================= */

function getStudentUid(data) {

    if (!data) {
        return "";
    }


    const fields = [
        "uid",
        "userId",
        "userid",
        "userUID",
        "userUid",
        "user_id",

        "siswaId",
        "siswaID",
        "siswaUid",
        "siswaUID",

        "studentId",
        "studentID",
        "studentUid",
        "studentUID",

        "idSiswa",
        "id_siswa",

        "idUser",
        "id_user",

        "muridId",
        "muridID",
        "muridUid",
        "muridUID",

        "pesertaId",
        "pesertaID"
    ];


    for (const field of fields) {

        if (
            data[field] !== undefined &&
            data[field] !== null &&
            safeText(data[field])
        ) {

            return safeText(data[field]);

        }

    }


    /* PESERTA */

    if (
        data.peserta &&
        typeof data.peserta === "object"
    ) {

        const pesertaFields = [
            "uid",
            "userId",
            "siswaId",
            "studentId",
            "id"
        ];


        for (const field of pesertaFields) {

            if (
                data.peserta[field] !== undefined &&
                data.peserta[field] !== null &&
                safeText(data.peserta[field])
            ) {

                return safeText(data.peserta[field]);

            }

        }

    }


    /* USER */

    if (
        data.user &&
        typeof data.user === "object"
    ) {

        const userFields = [
            "uid",
            "userId",
            "id"
        ];


        for (const field of userFields) {

            if (
                data.user[field] !== undefined &&
                data.user[field] !== null &&
                safeText(data.user[field])
            ) {

                return safeText(data.user[field]);

            }

        }

    }


    return "";

}


/* =========================================================
   GET STUDENT IDS
========================================================= */

function getStudentIds(murid) {

    if (!murid) {
        return [];
    }


    const ids = [
        murid.uid,
        murid.id,
        murid.userId,
        murid.userid,
        murid.siswaId,
        murid.studentId,
        murid.siswaUid,
        murid.studentUid
    ];


    return [
        ...new Set(
            ids
                .filter(Boolean)
                .map(value => safeText(value))
                .filter(Boolean)
        )
    ];

}


/* =========================================================
   GET RESULT STUDENT IDS
========================================================= */

function getResultStudentIds(hasil) {

    const ids = [];


    if (!hasil) {
        return ids;
    }


    const fields = [
        "uid",
        "userId",
        "userid",
        "userUID",
        "userUid",
        "user_id",

        "siswaId",
        "siswaID",
        "siswaUid",
        "siswaUID",

        "studentId",
        "studentID",
        "studentUid",
        "studentUID",

        "idSiswa",
        "id_siswa",

        "idUser",
        "id_user",

        "muridId",
        "muridID",
        "muridUid",
        "muridUID",

        "pesertaId",
        "pesertaID"
    ];


    for (const field of fields) {

        if (
            hasil[field] !== undefined &&
            hasil[field] !== null &&
            safeText(hasil[field])
        ) {

            ids.push(
                safeText(hasil[field])
            );

        }

    }


    /* PESERTA */

    if (
        hasil.peserta &&
        typeof hasil.peserta === "object"
    ) {

        const pesertaFields = [
            "uid",
            "userId",
            "siswaId",
            "studentId",
            "id"
        ];


        for (const field of pesertaFields) {

            if (
                hasil.peserta[field] !== undefined &&
                hasil.peserta[field] !== null &&
                safeText(hasil.peserta[field])
            ) {

                ids.push(
                    safeText(hasil.peserta[field])
                );

            }

        }

    }


    /* USER */

    if (
        hasil.user &&
        typeof hasil.user === "object"
    ) {

        const userFields = [
            "uid",
            "userId",
            "id"
        ];


        for (const field of userFields) {

            if (
                hasil.user[field] !== undefined &&
                hasil.user[field] !== null &&
                safeText(hasil.user[field])
            ) {

                ids.push(
                    safeText(hasil.user[field])
                );

            }

        }

    }


    return [
        ...new Set(ids)
    ];

}


/* =========================================================
   CHECK RESULT BELONGS TO STUDENT
========================================================= */

function isResultBelongsToMurid(hasil, murid) {

    const resultIds = getResultStudentIds(hasil);
    const studentIds = getStudentIds(murid);


    if (
        resultIds.length === 0 ||
        studentIds.length === 0
    ) {

        return false;

    }


    const studentSet = new Set(studentIds);


    return resultIds.some(
        id => studentSet.has(id)
    );

}


/* =========================================================
   CHECK TEST COMPLETED
========================================================= */

function isTestCompleted(hasil) {

    if (!hasil) {
        return false;
    }


    /* BOOLEAN */

    if (
        hasil.selesai === true ||
        hasil.completed === true ||
        hasil.isCompleted === true
    ) {

        return true;

    }


    /* STATUS */

    const status = normalizeText(
        hasil.status
    );


    if (
        status === "selesai" ||
        status === "completed" ||
        status === "complete" ||
        status === "done"
    ) {

        return true;

    }


    /* HASIL */

    const fields = [
        hasil.nilai,
        hasil.score,
        hasil.skor,
        hasil.hasil,
        hasil.result
    ];


    return fields.some(
        value =>
            value !== undefined &&
            value !== null &&
            safeText(value) !== ""
    );

}


/* =========================================================
   BUILD RESULT INDEX
========================================================= */

function buildResultIndex() {

    hasilByUid = new Map();


    for (const hasil of semuaHasilTes) {

        const uid = getStudentUid(hasil);

        if (!uid) {
            continue;
        }


        const testKey =
            getTestTypeFromResult(hasil);


        if (!testKey) {
            continue;
        }


        if (!hasilByUid.has(uid)) {

            hasilByUid.set(
                uid,
                new Map()
            );

        }


        const studentResults =
            hasilByUid.get(uid);


        /*
            Jika ada dokumen duplikat untuk tes yang sama,
            gunakan data terakhir yang masuk.
        */

        studentResults.set(
            testKey,
            hasil
        );

    }

}


/* =========================================================
   BUILD PENGAJUAN INDEX
========================================================= */

function buildPengajuanIndex() {

    pengajuanByUid = new Map();


    for (const pengajuan of semuaPengajuan) {

        const uid =
            getStudentUid(pengajuan);


        if (!uid) {
            continue;
        }


        pengajuanByUid.set(
            uid,
            pengajuan
        );

    }

}


/* =========================================================
   GET RESULT FOR STUDENT
========================================================= */

function getTestResultForMurid(murid) {

    const studentIds =
        getStudentIds(murid);


    /*
        Cara utama:
        UID langsung.
    */

    for (const uid of studentIds) {

        const indexed =
            hasilByUid.get(uid);


        if (indexed) {

            return Array.from(
                indexed.values()
            );

        }

    }


    /*
        Fallback untuk data lama
        yang mungkin tidak menggunakan uid
        secara langsung.
    */

    const hasil = [];


    for (const data of semuaHasilTes) {

        if (
            isResultBelongsToMurid(
                data,
                murid
            )
        ) {

            hasil.push(data);

        }

    }


    return hasil;

}


/* =========================================================
   GET UNIQUE TEST KEYS
========================================================= */

function getUniqueTestKeys(murid) {

    const results =
        getTestResultForMurid(murid);


    const keys = new Set();


    for (const hasil of results) {

        if (!isTestCompleted(hasil)) {
            continue;
        }


        const key =
            getTestTypeFromResult(hasil);


        if (key) {

            keys.add(key);

        }

    }


    return keys;

}


/* =========================================================
   GET STUDENT STATUS
========================================================= */

function getMuridStatus(murid) {

    const testSet =
        getUniqueTestKeys(murid);


    const jumlah =
        daftarTes.filter(
            jenis => testSet.has(jenis)
        ).length;


    if (jumlah === 5) {

        return {
            status: "selesai",
            label: "Selesai",
            jumlah: 5
        };

    }


    if (jumlah > 0) {

        return {
            status: "proses",
            label: `${jumlah}/5 Tes`,
            jumlah
        };

    }


    return {
        status: "belum",
        label: "Belum Tes",
        jumlah: 0
    };

}


/* =========================================================
   GET YEAR
========================================================= */

function getTahunAjaran(murid) {

    return safeText(
        murid.tahunAjaran ||
        murid.tahun ||
        murid.academicYear ||
        murid.year
    );

}


/* =========================================================
   GET CLASS
========================================================= */

function getKelas(murid) {

    return normalizeClass(
        murid.kelas ||
        murid.class ||
        murid.kelasSiswa ||
        murid.className
    );

}


/* =========================================================
   GET NAME
========================================================= */

function getNama(murid) {

    return safeText(
        murid.nama ||
        murid.namaLengkap ||
        murid.name ||
        murid.displayName ||
        "Tanpa Nama"
    );

}


/* =========================================================
   GET NISN
========================================================= */

function getNisn(murid) {

    return safeText(
        murid.nisn ||
        murid.NISN ||
        murid.nomorInduk ||
        murid.nomorIndukSiswa ||
        "-"
    );

}


/* =========================================================
   LOAD GURU PROFILE PHOTO
========================================================= */

async function loadGuruPhoto(uid) {

    if (!uid) {
        return;
    }


    try {

        const photoRef =
            ref(
                storage,
                `profile/${uid}/profile.jpg`
            );


        const photoUrl =
            await getDownloadURL(
                photoRef
            );


        if (topProfilePhoto) {

            topProfilePhoto.src =
                photoUrl;

            topProfilePhoto.style.display =
                "block";

        }


        if (topProfilePlaceholder) {

            topProfilePlaceholder.style.display =
                "none";

        }

    } catch (error) {

        console.log(
            "Foto profil guru tidak tersedia:",
            error
        );


        if (topProfilePhoto) {

            topProfilePhoto.style.display =
                "none";

        }


        if (topProfilePlaceholder) {

            topProfilePlaceholder.style.display =
                "flex";

        }

    }

}


/* =========================================================
   SETUP CLASS FILTER
========================================================= */

function setupClassFilter() {

    if (!filterKelas) {
        return;
    }


    filterKelas.innerHTML =
        `<option value="">Semua Kelas</option>`;


    for (const kelas of daftarKelas) {

        const option =
            document.createElement("option");


        option.value = kelas;
        option.textContent = kelas;


        filterKelas.appendChild(
            option
        );

    }

}


/* =========================================================
   SETUP YEAR FILTER
========================================================= */

function setupYearFilter() {

    if (!filterTahun) {
        return;
    }


    const years =
        new Set();


    for (const murid of semuaMurid) {

        const tahun =
            getTahunAjaran(murid);


        if (tahun) {

            years.add(tahun);

        }

    }


    const sortedYears =
        Array.from(years).sort(
            (a, b) =>
                String(b).localeCompare(
                    String(a)
                )
        );


    filterTahun.innerHTML =
        `<option value="">Semua Tahun</option>`;


    for (const tahun of sortedYears) {

        const option =
            document.createElement("option");


        option.value = tahun;
        option.textContent = tahun;


        filterTahun.appendChild(
            option
        );

    }

}


/* =========================================================
   LOAD ALL DATA
========================================================= */

async function loadData() {

    try {

        if (tesTableBody) {

            tesTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="loading-row">
                        Memuat data siswa...
                    </td>
                </tr>
            `;

        }


        /*
            PENTING:
            Tiga request dijalankan bersamaan.
        */

        const [
            usersSnapshot,
            hasilSnapshot,
            pengajuanSnapshot
        ] = await Promise.all([

            getDocs(
                collection(
                    firestore,
                    "users"
                )
            ),

            getDocs(
                collection(
                    firestore,
                    "hasilTes"
                )
            ),

            getDocs(
                collection(
                    firestore,
                    "tesPengajuan"
                )
            )

        ]);


        /* =================================================
           USERS
        ================================================= */

        semuaMurid = [];


        usersSnapshot.forEach(
            docSnap => {

                const data =
                    docSnap.data();


                const role =
                    normalizeText(
                        data.role
                    );


                if (
                    role === "siswa" ||
                    role === "murid"
                ) {

                    semuaMurid.push({

                        ...data,

                        uid:
                            docSnap.id

                    });

                }

            }
        );


        /* =================================================
           HASIL TES
        ================================================= */

        semuaHasilTes = [];


        hasilSnapshot.forEach(
            docSnap => {

                semuaHasilTes.push({

                    ...docSnap.data(),

                    id:
                        docSnap.id

                });

            }
        );


        /* =================================================
           PENGAJUAN
        ================================================= */

        semuaPengajuan = [];


        pengajuanSnapshot.forEach(
            docSnap => {

                semuaPengajuan.push({

                    ...docSnap.data(),

                    id:
                        docSnap.id

                });

            }
        );


        /* =================================================
           SORT SISWA
        ================================================= */

        semuaMurid.sort(
            (a, b) =>
                getNama(a).localeCompare(
                    getNama(b),
                    "id"
                )
        );


        /* =================================================
           BUILD INDEX
        ================================================= */

        buildResultIndex();

        buildPengajuanIndex();


        /* =================================================
           FILTER
        ================================================= */

        setupClassFilter();

        setupYearFilter();


        /* =================================================
           SUMMARY
        ================================================= */

        updateSummary();


        /* =================================================
           TABLE
        ================================================= */

        renderTable();


    } catch (error) {

        console.error(
            "Gagal memuat data:",
            error
        );


        if (tesTableBody) {

            tesTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="error-row">
                        Data gagal dimuat.
                        <br>
                        <small>
                            ${safeText(error.message)}
                        </small>
                    </td>
                </tr>
            `;

        }

    }

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary() {

    let selesai = 0;
    let belum = 0;


    for (const murid of semuaMurid) {

        const status =
            getMuridStatus(murid);


        if (
            status.status === "selesai"
        ) {

            selesai++;

        } else {

            belum++;

        }

    }


    if (totalSiswa) {

        totalSiswa.textContent =
            semuaMurid.length;

    }


    if (totalSelesai) {

        totalSelesai.textContent =
            selesai;

    }


    if (totalBelum) {

        totalBelum.textContent =
            belum;

    }


    if (totalHasil) {

        totalHasil.textContent =
            semuaHasilTes.length;

    }

}


/* =========================================================
   GET FILTERED STUDENTS
========================================================= */

function getFilteredStudents() {

    const search =
        normalizeText(
            searchSiswa?.value
        );


    const kelasFilter =
        normalizeClass(
            filterKelas?.value
        );


    const tahunFilter =
        safeText(
            filterTahun?.value
        );


    const statusFilter =
        normalizeText(
            filterStatus?.value
        );


    return semuaMurid.filter(
        murid => {

            const nama =
                normalizeText(
                    getNama(murid)
                );


            const nisn =
                normalizeText(
                    getNisn(murid)
                );


            const kelas =
                normalizeClass(
                    getKelas(murid)
                );


            const tahun =
                safeText(
                    getTahunAjaran(murid)
                );


            const status =
                getMuridStatus(murid);


            const matchSearch =
                !search ||
                nama.includes(search) ||
                nisn.includes(search);


            const matchKelas =
                !kelasFilter ||
                kelas === kelasFilter;


            const matchTahun =
                !tahunFilter ||
                tahun === tahunFilter;


            const matchStatus =
                !statusFilter ||
                status.status === statusFilter;


            return (
                matchSearch &&
                matchKelas &&
                matchTahun &&
                matchStatus
            );

        }
    );

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable() {

    if (!tesTableBody) {
        return;
    }


    const filtered =
        getFilteredStudents();


    if (dataCount) {

        dataCount.textContent =
            filtered.length;

    }


    if (tableInfo) {

        tableInfo.textContent =
            `Menampilkan ${filtered.length} dari ${semuaMurid.length} siswa`;

    }


    if (filtered.length === 0) {

        tesTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">
                    Tidak ada data siswa.
                </td>
            </tr>
        `;

        return;

    }


    const fragment =
        document.createDocumentFragment();


    filtered.forEach(
        (murid, index) => {

            const status =
                getMuridStatus(murid);


            const kelas =
                getKelas(murid) || "-";


            const tahun =
                getTahunAjaran(murid) || "-";


            const nisn =
                getNisn(murid);


            const hasResult =
                getTestResultForMurid(murid)
                    .length > 0;


            const hasPengajuan =
                pengajuanByUid.has(
                    murid.uid
                );


            const canReset =
                hasResult ||
                hasPengajuan;


            const progress =
                Math.round(
                    (status.jumlah / 5) * 100
                );


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    <div class="student-name">
                        ${escapeHtml(
                            getNama(murid)
                        )}
                    </div>
                </td>

                <td>
                    ${escapeHtml(nisn)}
                </td>

                <td>
                    ${escapeHtml(kelas)}
                </td>

                <td>
                    ${escapeHtml(tahun)}
                </td>

                <td>

                    <div class="test-status-wrapper">

                        <div class="test-status ${status.status}">

                            ${escapeHtml(
                                status.label
                            )}

                        </div>

                        <div class="test-progress">

                            <div
                                class="test-progress-bar"
                                style="width:${progress}%"
                            ></div>

                        </div>

                    </div>

                </td>

                <td>

                    ${
                        canReset

                        ? `

                            <button
                                type="button"
                                class="reset-test-btn"
                                data-uid="${escapeHtml(
                                    murid.uid
                                )}"
                            >
                                Reset
                            </button>

                          `

                        : `

                            <span class="no-reset">
                                -
                            </span>

                          `
                    }

                </td>

            `;


            fragment.appendChild(row);

        }
    );


    tesTableBody.innerHTML = "";


    tesTableBody.appendChild(
        fragment
    );


    attachResetButtons();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   RESET BUTTON
========================================================= */

function attachResetButtons() {

    const buttons =
        document.querySelectorAll(
            ".reset-test-btn"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const uid =
                        button.dataset.uid;


                    if (!uid) {
                        return;
                    }


                    const murid =
                        semuaMurid.find(
                            siswa =>
                                siswa.uid === uid
                        );


                    if (!murid) {
                        return;
                    }


                    const nama =
                        getNama(murid);


                    const confirmed =
                        confirm(
                            `Reset semua hasil tes untuk ${nama}?`
                        );


                    if (!confirmed) {
                        return;
                    }


                    await resetStudentTest(
                        murid
                    );

                }
            );

        }
    );

}


/* =========================================================
   RESET STUDENT TEST
========================================================= */

async function resetStudentTest(murid) {

    const uid =
        safeText(
            murid.uid
        );


    if (!uid) {

        alert(
            "UID siswa tidak ditemukan."
        );

        return;

    }


    try {

        /*
            Ambil hasil siswa dari index terlebih dahulu.
        */

        const indexedResults =
            hasilByUid.get(uid);


        const deletePromises = [];


        /* =================================================
           HAPUS HASIL TES
        ================================================= */

        if (indexedResults) {

            for (
                const hasil
                of indexedResults.values()
            ) {

                if (!hasil.id) {
                    continue;
                }


                deletePromises.push(
                    deleteDoc(
                        doc(
                            firestore,
                            "hasilTes",
                            hasil.id
                        )
                    )
                );

            }

        } else {

            /*
                Fallback data lama.
            */

            for (
                const hasil
                of semuaHasilTes
            ) {

                if (
                    isResultBelongsToMurid(
                        hasil,
                        murid
                    )
                ) {

                    if (!hasil.id) {
                        continue;
                    }


                    deletePromises.push(
                        deleteDoc(
                            doc(
                                firestore,
                                "hasilTes",
                                hasil.id
                            )
                        )
                    );

                }

            }

        }


        /* =================================================
           HAPUS PENGAJUAN
        ================================================= */

        const pengajuan =
            pengajuanByUid.get(uid);


        if (
            pengajuan &&
            pengajuan.id
        ) {

            deletePromises.push(
                deleteDoc(
                    doc(
                        firestore,
                        "tesPengajuan",
                        pengajuan.id
                    )
                )
            );

        }


        /*
            Jalankan seluruh delete bersamaan.
        */

        await Promise.all(
            deletePromises
        );


        /* =================================================
           UPDATE DATA LOKAL
        ================================================= */

        semuaHasilTes =
            semuaHasilTes.filter(
                hasil =>
                    !isResultBelongsToMurid(
                        hasil,
                        murid
                    )
            );


        semuaPengajuan =
            semuaPengajuan.filter(
                pengajuan =>
                    getStudentUid(
                        pengajuan
                    ) !== uid
            );


        /*
            Bangun ulang index.
        */

        buildResultIndex();

        buildPengajuanIndex();


        /*
            Refresh tampilan.
        */

        updateSummary();

        renderTable();


        alert(
            `Semua hasil tes ${getNama(murid)} berhasil direset.`
        );


    } catch (error) {

        console.error(
            "Gagal reset hasil tes:",
            error
        );


        alert(
            "Gagal mereset hasil tes.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

if (searchSiswa) {

    searchSiswa.addEventListener(
        "input",
        renderTable
    );

}


/* =========================================================
   FILTER KELAS
========================================================= */

if (filterKelas) {

    filterKelas.addEventListener(
        "change",
        renderTable
    );

}


/* =========================================================
   FILTER TAHUN
========================================================= */

if (filterTahun) {

    filterTahun.addEventListener(
        "change",
        renderTable
    );

}


/* =========================================================
   FILTER STATUS
========================================================= */

if (filterStatus) {

    filterStatus.addEventListener(
        "change",
        renderTable
    );

}


/* =========================================================
   SIDEBAR
========================================================= */

function openSidebar() {

    if (sidebar) {

        sidebar.classList.add(
            "open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "show"
        );

    }

}


function closeSidebar() {

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "show"
        );

    }

}


if (menuButton) {

    menuButton.addEventListener(
        "click",
        openSidebar
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "../index.html";

            } catch (error) {

                console.error(
                    "Logout gagal:",
                    error
                );

                alert(
                    "Gagal keluar dari akun."
                );

            }

        }
    );

}


/* =========================================================
   AUTH
========================================================= */

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            window.location.href =
                "../index.html";

            return;

        }


        try {

            /*
                Ambil data guru dari users.
            */

            const usersSnapshot =
                await getDocs(
                    collection(
                        firestore,
                        "users"
                    )
                );


            let guruData = null;


            usersSnapshot.forEach(
                docSnap => {

                    if (
                        docSnap.id === user.uid
                    ) {

                        guruData =
                            docSnap.data();

                    }

                }
            );


            /*
                Cek role.
            */

            if (!guruData) {

                alert(
                    "Data akun guru tidak ditemukan."
                );


                await signOut(auth);

                window.location.href =
                    "../index.html";

                return;

            }


            const role =
                normalizeText(
                    guruData.role
                );


            if (role !== "guru") {

                alert(
                    "Akses halaman ini hanya untuk guru."
                );


                await signOut(auth);

                window.location.href =
                    "../index.html";

                return;

            }


            /* =================================================
               NAMA GURU
            ================================================= */

            const namaGuru =
                safeText(
                    guruData.nama ||
                    guruData.namaLengkap ||
                    guruData.name ||
                    user.displayName ||
                    "Guru"
                );


            if (topUserName) {

                topUserName.textContent =
                    namaGuru;

            }


            /* =================================================
               FOTO GURU
            ================================================= */

            loadGuruPhoto(
                user.uid
            );


            /* =================================================
               LOAD DATA UTAMA
            ================================================= */

            await loadData();


        } catch (error) {

            console.error(
                "Gagal memuat halaman guru:",
                error
            );


            if (tesTableBody) {

                tesTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="error-row">
                            Gagal memuat data.
                            <br>
                            <small>
                                ${escapeHtml(
                                    error.message
                                )}
                            </small>
                        </td>
                    </tr>
                `;

            }

        }

    }
);


/* =========================================================
   DEBUG
========================================================= */

window.debugGuruTes = {

    getStudents() {

        return semuaMurid;

    },

    getResults() {

        return semuaHasilTes;

    },

    getPengajuan() {

        return semuaPengajuan;

    },

    getResultIndex() {

        return hasilByUid;

    },

    getPengajuanIndex() {

        return pengajuanByUid;

    },

    refresh() {

        return loadData();

    }

};