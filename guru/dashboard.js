/* =========================================================
   GURU DASHBOARD
   UPT SPF SMP NEGERI 30 MAKASSAR
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
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

import {
    auth,
    db
} from "../firebase-config.js";


/* =========================================================
   DOM
========================================================= */

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const menuButton =
    document.getElementById("menuButton");

const logoutButton =
    document.getElementById("logoutButton");


const topProfilePhoto =
    document.getElementById("topProfilePhoto");

const topProfilePlaceholder =
    document.getElementById("topProfilePlaceholder");

const topUserName =
    document.getElementById("topUserName");


const totalSiswa =
    document.getElementById("totalSiswa");

const totalKelas =
    document.getElementById("totalKelas");

const totalTesSelesai =
    document.getElementById("totalTesSelesai");

const rataNilai =
    document.getElementById("rataNilai");


const searchSiswa =
    document.getElementById("searchSiswa");

const filterKelas =
    document.getElementById("filterKelas");

const siswaTableBody =
    document.getElementById("siswaTableBody");


/* =========================================================
   DATA GLOBAL
========================================================= */

let daftarSiswa = [];

let daftarKelas = [];

let daftarHasilTes = [];


/* =========================================================
   JENIS TES
========================================================= */

const daftarJenisTes = [
    "handeye",
    "situp",
    "standingbroadjump",
    "ttest",
    "beeptest"
];


/* =========================================================
   NAMA TES
   DIGUNAKAN UNTUK NORMALISASI
========================================================= */

const namaJenisTes = {

    handeye: [
        "handeye",
        "handeyetest",
        "handeyecoordinatest",
        "handeyecoordinate"
    ],

    situp: [
        "situp",
        "situp test",
        "situp 60",
        "situp60"
    ],

    standingbroadjump: [
        "standingbroadjump",
        "standing broad jump",
        "broadjump",
        "broad jump",
        "standinglongjump",
        "standing long jump"
    ],

    ttest: [
        "ttest",
        "t test",
        "t-test",
        "tes t",
        "tes-t"
    ],

    beeptest: [
        "beeptest",
        "beep test",
        "beep",
        "bleep test",
        "bleep"
    ]

};


/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .toLowerCase()
        .trim()
        .replace(
            /[\s_\-]+/g,
            ""
        )
        .replace(
            /[^a-z0-9]/g,
            ""
        );

}


/* =========================================================
   NORMALIZE JENIS TES
========================================================= */

function normalizeTestType(value) {

    const text =
        normalizeText(
            value
        );


    if (!text) {

        return "";

    }


    /* -------------------------------------------------
       HAND EYE
    ------------------------------------------------- */

    if (
        text.includes("handeye")
    ) {

        return "handeye";

    }


    /* -------------------------------------------------
       SIT UP
    ------------------------------------------------- */

    if (
        text.includes("situp")
    ) {

        return "situp";

    }


    /* -------------------------------------------------
       STANDING BROAD JUMP
    ------------------------------------------------- */

    if (
        text.includes(
            "standingbroadjump"
        ) ||
        text.includes(
            "broadjump"
        ) ||
        text.includes(
            "standinglongjump"
        )
    ) {

        return "standingbroadjump";

    }


    /* -------------------------------------------------
       T TEST
    ------------------------------------------------- */

    if (
        text === "ttest" ||
        text.includes("ttest") ||
        text.includes("test")
    ) {

        /*
           Jangan langsung mengembalikan ttest
           untuk semua kata yang mengandung "test".
        */

        if (
            text.includes("ttest") ||
            text.includes("testt")
        ) {

            return "ttest";

        }

    }


    /* -------------------------------------------------
       BEEP TEST
    ------------------------------------------------- */

    if (
        text.includes("beeptest") ||
        text.includes("beep") ||
        text.includes("bleep")
    ) {

        return "beeptest";

    }


    return "";

}


/* =========================================================
   CEK TES SELESAI
========================================================= */

function isTestCompleted(data) {

    if (!data) {

        return false;

    }


    /* -------------------------------------------------
       FLAG SELESAI
    ------------------------------------------------- */

    if (
        data.selesai === true
    ) {

        return true;

    }


    if (
        data.completed === true
    ) {

        return true;

    }


    if (
        data.isCompleted === true
    ) {

        return true;

    }


    /* -------------------------------------------------
       STATUS
    ------------------------------------------------- */

    const status =
        String(
            data.status ||
            data.statusTes ||
            data.testStatus ||
            ""
        )
            .toLowerCase()
            .trim();


    if (
        status === "selesai" ||
        status === "completed" ||
        status === "complete" ||
        status === "done"
    ) {

        return true;

    }


    /* -------------------------------------------------
       NILAI
    ------------------------------------------------- */

    const nilai =
        data.nilai ??
        data.score ??
        data.skor ??
        data.hasil ??
        data.result ??
        null;


    if (
        nilai !== null &&
        nilai !== undefined &&
        nilai !== ""
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   AMBIL UID / ID SISWA DARI HASIL TES
========================================================= */

function getResultStudentIds(data, documentId = "") {

    const ids = [];


    const kemungkinanId = [

        data?.uid,

        data?.userId,

        data?.userid,

        data?.userUID,

        data?.userUid,

        data?.siswaId,

        data?.siswaID,

        data?.siswaUid,

        data?.siswaUID,

        data?.studentId,

        data?.studentID,

        data?.studentUid,

        data?.studentUID,

        data?.idSiswa,

        data?.id_siswa,

        data?.idUser,

        data?.id_user,

        data?.penggunaId,

        data?.pesertaId,

        data?.pesertaID

    ];


    kemungkinanId.forEach(
        (value) => {

            if (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            ) {

                ids.push(
                    String(value).trim()
                );

            }

        }
    );


    /*
       Beberapa struktur Firebase bisa
       menyimpan UID di field peserta.
    */

    if (
        data?.peserta &&
        typeof data.peserta === "object"
    ) {

        const pesertaIds = [

            data.peserta.uid,

            data.peserta.userId,

            data.peserta.siswaId,

            data.peserta.studentId,

            data.peserta.id

        ];


        pesertaIds.forEach(
            (value) => {

                if (
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== ""
                ) {

                    ids.push(
                        String(value).trim()
                    );

                }

            }
        );

    }


    /*
       ID dokumen hasil tes jangan langsung
       dianggap UID siswa.

       Hanya ditambahkan sebagai fallback
       jika struktur aplikasi memang memakai
       document ID sebagai identitas.
    */

    if (
        documentId &&
        documentId.trim() !== ""
    ) {

        ids.push(
            String(
                documentId
            ).trim()
        );

    }


    return [
        ...new Set(
            ids
        )
    ];

}


/* =========================================================
   AMBIL UID / ID DARI SISWA
========================================================= */

function getStudentIds(siswa) {

    const ids = [];


    const kemungkinanId = [

        siswa?.uid,

        siswa?.id,

        siswa?.userId,

        siswa?.siswaId,

        siswa?.studentId

    ];


    kemungkinanId.forEach(
        (value) => {

            if (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            ) {

                ids.push(
                    String(value).trim()
                );

            }

        }
    );


    return [
        ...new Set(
            ids
        )
    ];

}


/* =========================================================
   CEK HASIL TES MILIK SISWA
========================================================= */

function isResultBelongsToStudent(
    hasil,
    siswa
) {

    const resultIds =
        getResultStudentIds(
            hasil.data || {},
            hasil.id || ""
        );


    const studentIds =
        getStudentIds(
            siswa
        );


    if (
        resultIds.length === 0 ||
        studentIds.length === 0
    ) {

        return false;

    }


    return resultIds.some(
        (resultId) =>
            studentIds.some(
                (studentId) =>
                    String(
                        resultId
                    ) ===
                    String(
                        studentId
                    )
            )
    );

}


/* =========================================================
   SIDEBAR
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


    document.body.style.overflow =
        "";

}


/* =========================================================
   MENU BUTTON
========================================================= */

if (menuButton) {

    menuButton.addEventListener(
        "click",
        () => {

            if (
                sidebar &&
                sidebar.classList.contains(
                    "active"
                )
            ) {

                closeSidebar();

            } else {

                openSidebar();

            }

        }
    );

}


/* =========================================================
   SIDEBAR OVERLAY
========================================================= */

if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


/* =========================================================
   SIDEBAR LINK
========================================================= */

if (sidebar) {

    const sidebarLinks =
        sidebar.querySelectorAll(
            "a"
        );


    sidebarLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                closeSidebar
            );

        }
    );

}


/* =========================================================
   LOAD DATA GURU
========================================================= */

async function loadTeacherData(user) {

    try {

        const teacherRef =
            doc(
                db,
                "users",
                user.uid
            );


        const teacherSnap =
            await getDoc(
                teacherRef
            );


        if (
            !teacherSnap.exists()
        ) {

            console.warn(
                "Data Guru tidak ditemukan."
            );


            if (topUserName) {

                topUserName.textContent =
                    "Guru";

            }


            return;

        }


        const data =
            teacherSnap.data();


        /* -------------------------------------------------
           NAMA
        ------------------------------------------------- */

        const namaGuru =
            data.nama ||
            data.namaLengkap ||
            data.name ||
            data.displayName ||
            user.displayName ||
            "Guru";


        if (topUserName) {

            topUserName.textContent =
                namaGuru;

        }


        /* -------------------------------------------------
           FOTO
        ------------------------------------------------- */

        const foto =
            data.foto ||
            data.photoURL ||
            data.profilePhoto ||
            data.photo ||
            user.photoURL ||
            "";


        if (
            foto &&
            topProfilePhoto
        ) {

            topProfilePhoto.src =
                foto;


            topProfilePhoto.style.display =
                "block";


            if (topProfilePlaceholder) {

                topProfilePlaceholder.style.display =
                    "none";

            }

        } else {

            if (topProfilePhoto) {

                topProfilePhoto.style.display =
                    "none";

            }


            if (topProfilePlaceholder) {

                topProfilePlaceholder.style.display =
                    "flex";

            }

        }


    } catch (error) {

        console.error(
            "Gagal memuat data Guru:",
            error
        );

    }

}


/* =========================================================
   LOAD SEMUA USER / SISWA
========================================================= */

async function loadStudents() {

    try {

        console.log(
            "================================="
        );

        console.log(
            "MEMUAT DATA USERS..."
        );

        console.log(
            "================================="
        );


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        console.log(
            "Jumlah dokumen users:",
            snapshot.size
        );


        daftarSiswa = [];


        snapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                const role =
                    String(
                        data.role ||
                        ""
                    )
                        .toLowerCase()
                        .trim();


                console.log(
                    "USER:",
                    docSnap.id,
                    data,
                    "ROLE:",
                    role
                );


                /* -------------------------------------------------
                   HANYA SISWA
                ------------------------------------------------- */

                if (
                    role !== "siswa"
                ) {

                    return;

                }


                /* -------------------------------------------------
                   DATA SISWA
                ------------------------------------------------- */

                const siswa = {

                    id:
                        docSnap.id,


                    uid:
                        data.uid ||
                        data.userId ||
                        data.userid ||
                        data.siswaId ||
                        data.studentId ||
                        docSnap.id,


                    nama:
                        data.nama ||
                        data.namaLengkap ||
                        data.name ||
                        data.displayName ||
                        "Tanpa Nama",


                    nisn:
                        data.nisn ||
                        data.NISN ||
                        data.nomorInduk ||
                        data.nis ||
                        "-",


                    kelas:
                        data.kelas ||
                        data.kelasSiswa ||
                        data.class ||
                        data.kelasSekolah ||
                        data.namaKelas ||
                        "-",


                    tahunAjaran:
                        data.tahunAjaran ||
                        data.tahun_ajaran ||
                        data.tahun ||
                        data.academicYear ||
                        "-",


                    angkatan:
                        data.angkatan ||
                        "-",


                    tingkat:
                        data.tingkat ||
                        data.level ||
                        data.grade ||
                        "-",


                    email:
                        data.email ||
                        "-",


                    foto:
                        data.foto ||
                        data.photoURL ||
                        data.profilePhoto ||
                        data.photo ||
                        "",


                    role:
                        role,


                    hasilTes:
                        []

                };


                daftarSiswa.push(
                    siswa
                );

            }
        );


        console.log(
            "TOTAL MURID:",
            daftarSiswa.length
        );


        console.table(
            daftarSiswa
        );


        return daftarSiswa;


    } catch (error) {

        console.error(
            "Gagal mengambil data users:",
            error
        );


        daftarSiswa = [];


        return [];

    }

}


/* =========================================================
   LOAD HASIL TES
========================================================= */

async function loadTestResults() {

    try {

        console.log(
            "================================="
        );

        console.log(
            "MEMUAT HASIL TES..."
        );

        console.log(
            "================================="
        );


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "hasilTes"
                )
            );


        daftarHasilTes = [];


        snapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                const hasil = {

                    id:
                        docSnap.id,


                    data:
                        data,


                    uid:
                        data.uid ||
                        data.userId ||
                        data.userid ||
                        data.siswaId ||
                        data.studentId ||
                        data.siswaUid ||
                        data.studentUid ||
                        data.idSiswa ||
                        "",


                    jenisTes:
                        data.jenisTes ||
                        data.jenis_test ||
                        data.jenisTest ||
                        data.testType ||
                        data.test_type ||
                        data.type ||
                        data.jenis ||
                        data.namaTes ||
                        data.nama_test ||
                        data.testName ||
                        data.test_name ||
                        "",


                    namaTes:
                        data.namaTes ||
                        data.nama_test ||
                        data.testName ||
                        data.test_name ||
                        data.jenisTes ||
                        data.jenis_test ||
                        data.jenisTest ||
                        "",


                    nilai:
                        data.nilai ??
                        data.score ??
                        data.skor ??
                        data.hasil ??
                        data.result ??
                        null,


                    score:
                        data.score ??
                        data.nilai ??
                        data.skor ??
                        null,


                    status:
                        data.status ||
                        data.statusTes ||
                        data.testStatus ||
                        "",


                    selesai:
                        data.selesai === true ||
                        data.completed === true ||
                        data.isCompleted === true

                };


                daftarHasilTes.push(
                    hasil
                );


                console.log(
                    "HASIL TES:",
                    docSnap.id,
                    data
                );

            }
        );


        console.log(
            "Jumlah hasil tes:",
            daftarHasilTes.length
        );


        /* -------------------------------------------------
           PASANGKAN HASIL TES KE SISWA
        ------------------------------------------------- */

        daftarSiswa.forEach(
            (siswa) => {

                siswa.hasilTes =
                    daftarHasilTes.filter(
                        (hasil) =>
                            isResultBelongsToStudent(
                                hasil,
                                siswa
                            )
                    );


                console.log(
                    "HASIL TES SISWA:",
                    siswa.nama,
                    siswa.uid,
                    siswa.hasilTes
                );

            }
        );


        console.log(
            "Hasil tes berhasil dipasangkan."
        );


    } catch (error) {

        console.error(
            "Gagal mengambil hasil tes:",
            error
        );


        daftarHasilTes = [];

    }

}


/* =========================================================
   LOAD KELAS
========================================================= */

async function loadClasses() {

    daftarKelas = [];


    try {

        console.log(
            "Memuat collection kelas..."
        );


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "kelas"
                )
            );


        console.log(
            "Jumlah dokumen kelas:",
            snapshot.size
        );


        snapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                console.log(
                    "KELAS:",
                    docSnap.id,
                    data
                );


                const namaKelas =
                    data.nama ||
                    data.namaKelas ||
                    data.kelas ||
                    data.name ||
                    data.nama_kelas ||
                    data.class ||
                    "";


                if (
                    namaKelas
                ) {

                    daftarKelas.push(
                        String(
                            namaKelas
                        ).trim()
                    );

                }

            }
        );


    } catch (error) {

        console.warn(
            "Collection kelas tidak dapat dibaca:",
            error
        );

    }


    /* -------------------------------------------------
       FALLBACK DARI SISWA
    ------------------------------------------------- */

    if (
        daftarKelas.length === 0
    ) {

        daftarKelas =
            daftarSiswa
                .map(
                    (siswa) =>
                        siswa.kelas
                )
                .filter(
                    (kelas) =>
                        kelas &&
                        kelas !== "-"
                );

    }


    /* -------------------------------------------------
       HILANGKAN DUPLIKAT
    ------------------------------------------------- */

    daftarKelas =
        [
            ...new Set(
                daftarKelas
            )
        ];


    /* -------------------------------------------------
       SORT
    ------------------------------------------------- */

    daftarKelas.sort(
        (a, b) =>
            String(a).localeCompare(
                String(b),
                "id",
                {
                    numeric: true
                }
            )
    );


    console.log(
        "DAFTAR KELAS:",
        daftarKelas
    );

}


/* =========================================================
   POPULATE FILTER KELAS
========================================================= */

function populateClassFilter() {

    if (!filterKelas) {

        return;

    }


    filterKelas.innerHTML = `
        <option value="">
            Semua Kelas
        </option>
    `;


    daftarKelas.forEach(
        (kelas) => {

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

}


/* =========================================================
   STATUS TES SISWA
========================================================= */

function getTestStatus(siswa) {

    if (
        !siswa ||
        !Array.isArray(
            siswa.hasilTes
        )
    ) {

        return {

            selesai: 0,

            total:
                daftarJenisTes.length,

            persen: 0

        };

    }


    const testSelesai =
        new Set();


    siswa.hasilTes.forEach(
        (hasil) => {

            if (
                !isTestCompleted(
                    hasil
                )
            ) {

                return;

            }


            /* -------------------------------------------------
               JENIS TES
            ------------------------------------------------- */

            let type =
                normalizeTestType(
                    hasil.jenisTes
                );


            /* -------------------------------------------------
               FALLBACK NAMA TES
            ------------------------------------------------- */

            if (!type) {

                type =
                    normalizeTestType(
                        hasil.namaTes
                    );

            }


            /* -------------------------------------------------
               FALLBACK DATA MENTAH
            ------------------------------------------------- */

            if (!type) {

                const raw =
                    hasil.data || {};


                type =
                    normalizeTestType(
                        raw.jenisTes ||
                        raw.jenis_test ||
                        raw.jenisTest ||
                        raw.testType ||
                        raw.test_type ||
                        raw.type ||
                        raw.jenis ||
                        raw.namaTes ||
                        raw.nama_test ||
                        raw.testName ||
                        raw.test_name ||
                        ""
                    );

            }


            if (type) {

                testSelesai.add(
                    type
                );

            }

        }
    );


    const jumlahSelesai =
        Math.min(
            testSelesai.size,
            daftarJenisTes.length
        );


    return {

        selesai:
            jumlahSelesai,


        total:
            daftarJenisTes.length,


        persen:
            Math.round(
                (
                    jumlahSelesai /
                    daftarJenisTes.length
                ) *
                100
            )

    };

}


/* =========================================================
   STATISTIK DASHBOARD
========================================================= */

function calculateTestStatistics() {

    /* -------------------------------------------------
       TOTAL SISWA
    ------------------------------------------------- */

    if (totalSiswa) {

        totalSiswa.textContent =
            daftarSiswa.length;

    }


    /* -------------------------------------------------
       TOTAL KELAS
    ------------------------------------------------- */

    if (totalKelas) {

        totalKelas.textContent =
            daftarKelas.length;

    }


    /* -------------------------------------------------
       SISWA YANG SUDAH 5/5 TES
    ------------------------------------------------- */

    let jumlahSiswaSelesai =
        0;


    daftarSiswa.forEach(
        (siswa) => {

            const status =
                getTestStatus(
                    siswa
                );


            if (
                status.selesai >=
                status.total
            ) {

                jumlahSiswaSelesai++;

            }

        }
    );


    if (totalTesSelesai) {

        totalTesSelesai.textContent =
            jumlahSiswaSelesai;

    }


    /* -------------------------------------------------
       RATA-RATA NILAI
    ------------------------------------------------- */

    let totalNilai =
        0;


    let jumlahNilai =
        0;


    daftarHasilTes.forEach(
        (hasil) => {

            if (
                !isTestCompleted(
                    hasil
                )
            ) {

                return;

            }


            let nilai =
                hasil.nilai;


            if (
                nilai === null ||
                nilai === undefined ||
                nilai === ""
            ) {

                return;

            }


            nilai =
                Number(
                    nilai
                );


            if (
                Number.isFinite(
                    nilai
                )
            ) {

                totalNilai +=
                    nilai;


                jumlahNilai++;

            }

        }
    );


    let rataRata =
        0;


    if (
        jumlahNilai > 0
    ) {

        rataRata =
            totalNilai /
            jumlahNilai;

    }


    if (rataNilai) {

        rataNilai.textContent =
            jumlahNilai > 0
                ? rataRata.toFixed(1)
                : "0";

    }


    console.log(
        "STATISTIK:",
        {
            totalSiswa:
                daftarSiswa.length,

            totalKelas:
                daftarKelas.length,

            totalSiswaSelesai:
                jumlahSiswaSelesai,

            totalNilai:
                totalNilai,

            jumlahNilai:
                jumlahNilai,

            rataRata:
                rataRata
        }
    );

}


/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderStudents() {

    if (!siswaTableBody) {

        return;

    }


    /* -------------------------------------------------
       SEARCH
    ------------------------------------------------- */

    const keyword =
        searchSiswa
            ? searchSiswa.value
                .toLowerCase()
                .trim()
            : "";


    /* -------------------------------------------------
       FILTER KELAS
    ------------------------------------------------- */

    const kelasDipilih =
        filterKelas
            ? filterKelas.value
            : "";


    let data =
        [
            ...daftarSiswa
        ];


    /* -------------------------------------------------
       SEARCH
    ------------------------------------------------- */

    if (keyword) {

        data =
            data.filter(
                (siswa) => {

                    const nama =
                        String(
                            siswa.nama ||
                            ""
                        )
                            .toLowerCase();


                    const nisn =
                        String(
                            siswa.nisn ||
                            ""
                        )
                            .toLowerCase();


                    const kelas =
                        String(
                            siswa.kelas ||
                            ""
                        )
                            .toLowerCase();


                    return (
                        nama.includes(
                            keyword
                        ) ||

                        nisn.includes(
                            keyword
                        ) ||

                        kelas.includes(
                            keyword
                        )
                    );

                }
            );

    }


    /* -------------------------------------------------
       FILTER KELAS
    ------------------------------------------------- */

    if (kelasDipilih) {

        data =
            data.filter(
                (siswa) =>
                    String(
                        siswa.kelas ||
                        ""
                    ) ===
                    String(
                        kelasDipilih
                    )
            );

    }


    /* -------------------------------------------------
       DATA KOSONG
    ------------------------------------------------- */

    if (
        data.length === 0
    ) {

        siswaTableBody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="loading-cell"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >
                    Belum ada data murid.
                </td>

            </tr>
        `;


        return;

    }


    /* -------------------------------------------------
       BATASI 10 SISWA
    ------------------------------------------------- */

    const dataTampil =
        data.slice(
            0,
            10
        );


    /* -------------------------------------------------
       RENDER
    ------------------------------------------------- */

    siswaTableBody.innerHTML =
        dataTampil
            .map(
                (siswa, index) => {

                    const status =
                        getTestStatus(
                            siswa
                        );


                    let statusHTML =
                        "";


                    /* -------------------------------------------------
                       5/5
                    ------------------------------------------------- */

                    if (
                        status.selesai >=
                        status.total
                    ) {

                        statusHTML = `
                            <span
                                class="status-badge status-selesai"
                            >
                                Selesai
                            </span>
                        `;

                    }


                    /* -------------------------------------------------
                       SEBAGIAN
                    ------------------------------------------------- */

                    else if (
                        status.selesai > 0
                    ) {

                        statusHTML = `
                            <span
                                class="status-badge status-proses"
                            >
                                ${status.selesai}/${status.total} Tes
                            </span>
                        `;

                    }


                    /* -------------------------------------------------
                       BELUM
                    ------------------------------------------------- */

                    else {

                        statusHTML = `
                            <span
                                class="status-badge status-belum"
                            >
                                Belum Tes
                            </span>
                        `;

                    }


                    return `
                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${escapeHTML(
                                    siswa.nama
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    siswa.nisn
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    siswa.kelas
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    siswa.tahunAjaran
                                )}
                            </td>

                            <td>
                                ${statusHTML}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

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
   SEARCH EVENT
========================================================= */

if (searchSiswa) {

    searchSiswa.addEventListener(
        "input",
        renderStudents
    );

}


/* =========================================================
   FILTER EVENT
========================================================= */

if (filterKelas) {

    filterKelas.addEventListener(
        "change",
        renderStudents
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

            }

        }
    );

}


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        /* -------------------------------------------------
           BELUM LOGIN
        ------------------------------------------------- */

        if (!user) {

            window.location.href =
                "../index.html";


            return;

        }


        try {

            console.log(
                "================================="
            );

            console.log(
                "GURU LOGIN:",
                user.uid
            );

            console.log(
                "================================="
            );


            /* -------------------------------------------------
               DATA USER GURU
            ------------------------------------------------- */

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnap =
                await getDoc(
                    userRef
                );


            if (
                !userSnap.exists()
            ) {

                console.error(
                    "Dokumen users Guru tidak ditemukan."
                );


                return;

            }


            const userData =
                userSnap.data();


            console.log(
                "DATA GURU:",
                userData
            );


            /* -------------------------------------------------
               CEK ROLE
            ------------------------------------------------- */

            const roleGuru =
                String(
                    userData.role ||
                    ""
                )
                    .toLowerCase()
                    .trim();


            if (
                roleGuru !== "guru"
            ) {

                console.error(
                    "Akun bukan Guru."
                );


                await signOut(
                    auth
                );


                window.location.href =
                    "../index.html";


                return;

            }


            console.log(
                "ROLE GURU BERHASIL DIVERIFIKASI."
            );


            /* -------------------------------------------------
               LOAD GURU
            ------------------------------------------------- */

            await loadTeacherData(
                user
            );


            /* -------------------------------------------------
               LOAD SISWA
            ------------------------------------------------- */

            await loadStudents();


            /* -------------------------------------------------
               LOAD HASIL TES
            ------------------------------------------------- */

            await loadTestResults();


            /* -------------------------------------------------
               LOAD KELAS
            ------------------------------------------------- */

            await loadClasses();


            /* -------------------------------------------------
               FILTER KELAS
            ------------------------------------------------- */

            populateClassFilter();


            /* -------------------------------------------------
               STATISTIK
            ------------------------------------------------- */

            calculateTestStatistics();


            /* -------------------------------------------------
               TABEL
            ------------------------------------------------- */

            renderStudents();


            /* -------------------------------------------------
               DEBUG
            ------------------------------------------------- */

            console.log(
                "================================="
            );

            console.log(
                "DASHBOARD GURU SELESAI DIMUAT"
            );

            console.log(
                "Jumlah murid:",
                daftarSiswa.length
            );

            console.log(
                "Jumlah kelas:",
                daftarKelas.length
            );

            console.log(
                "Jumlah hasil tes:",
                daftarHasilTes.length
            );


            daftarSiswa.forEach(
                (siswa) => {

                    const status =
                        getTestStatus(
                            siswa
                        );


                    console.log(
                        siswa.nama,
                        "| UID:",
                        siswa.uid,
                        "| Tes:",
                        status.selesai +
                        "/" +
                        status.total,
                        "| Hasil:",
                        siswa.hasilTes
                    );

                }
            );


            console.log(
                "================================="
            );


        } catch (error) {

            console.error(
                "Gagal memuat dashboard Guru:",
                error
            );

        }

    }
);