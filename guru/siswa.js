// =========================================================
// SISWA.JS - DATA MURID GURU
// Firebase Project: projekkepemimpinan-9d557
// Lokasi: guru/siswa.js
// =========================================================


// =========================================================
// FIREBASE AUTH
// =========================================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// =========================================================
// FIRESTORE
// =========================================================

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =========================================================
// FIREBASE CONFIG
// =========================================================

import {
    auth,
    db
} from "../firebase-config.js";


// =========================================================
// ELEMENT
// =========================================================

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const menuButton =
    document.getElementById("menuButton");

const logoutButton =
    document.getElementById("logoutButton");

const topUserName =
    document.getElementById("topUserName");

const topProfilePhoto =
    document.getElementById("topProfilePhoto");

const topProfilePlaceholder =
    document.getElementById("topProfilePlaceholder");

const totalSiswa =
    document.getElementById("totalSiswa");

const searchSiswa =
    document.getElementById("searchSiswa");

const filterKelas =
    document.getElementById("filterKelas");

const filterTahun =
    document.getElementById("filterTahun");

const filterStatus =
    document.getElementById("filterStatus");

const siswaTableBody =
    document.getElementById("siswaTableBody");

const tableInfo =
    document.getElementById("tableInfo");


// =========================================================
// DATA GLOBAL
// =========================================================

let daftarSiswa = [];

let daftarHasilTes = [];


// =========================================================
// JUMLAH TES
// =========================================================

const JUMLAH_TES = 5;


// =========================================================
// JENIS TES
// =========================================================

const DAFTAR_JENIS_TES = [

    "handeye",

    "situp",

    "standingbroadjump",

    "ttest",

    "beeptest"

];


// =========================================================
// SIDEBAR
// =========================================================

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


    document.body.classList.add(
        "sidebar-open"
    );

}


// =========================================================
// CLOSE SIDEBAR
// =========================================================

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


    document.body.classList.remove(
        "sidebar-open"
    );

}


// =========================================================
// MENU BUTTON
// =========================================================

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


// =========================================================
// SIDEBAR OVERLAY
// =========================================================

if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


// =========================================================
// SIDEBAR LINKS
// =========================================================

if (sidebar) {

    const menuLinks =
        sidebar.querySelectorAll(
            "a"
        );


    menuLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                closeSidebar
            );

        }
    );

}


// =========================================================
// ESC KEY
// =========================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            closeSidebar();

        }

    }
);


// =========================================================
// HELPER
// =========================================================

function getText(
    value,
    defaultValue = "-"
) {

    const text =
        String(
            value ?? ""
        ).trim();


    return (
        text ||
        defaultValue
    );

}


// =========================================================
// NORMALIZE TEXT
// =========================================================

function normalizeText(
    value
) {

    return String(
        value ?? ""
    )
        .toLowerCase()
        .trim();

}


// =========================================================
// NORMALIZE ID
// =========================================================

function normalizeId(
    value
) {

    return String(
        value ?? ""
    )
        .trim();

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// =========================================================
// NORMALIZE JENIS TES
// =========================================================

function normalizeTestType(
    value
) {

    const text =
        String(
            value ?? ""
        )
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


    if (!text) {

        return "";

    }


    // -----------------------------------------------------
    // HAND EYE
    // -----------------------------------------------------

    if (
        text.includes(
            "handeye"
        )
    ) {

        return "handeye";

    }


    // -----------------------------------------------------
    // SIT UP
    // -----------------------------------------------------

    if (
        text.includes(
            "situp"
        )
    ) {

        return "situp";

    }


    // -----------------------------------------------------
    // STANDING BROAD JUMP
    // -----------------------------------------------------

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


    // -----------------------------------------------------
    // T TEST
    // -----------------------------------------------------

    if (
        text === "ttest" ||

        text.includes(
            "ttest"
        ) ||

        text.includes(
            "testt"
        )
    ) {

        return "ttest";

    }


    // -----------------------------------------------------
    // BEEP TEST
    // -----------------------------------------------------

    if (
        text.includes(
            "beeptest"
        ) ||

        text.includes(
            "beep"
        ) ||

        text.includes(
            "bleep"
        )
    ) {

        return "beeptest";

    }


    return "";

}


// =========================================================
// CEK TES SELESAI
// =========================================================

function isTestCompleted(
    data
) {

    if (!data) {

        return false;

    }


    // -----------------------------------------------------
    // FLAG SELESAI
    // -----------------------------------------------------

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


    // -----------------------------------------------------
    // STATUS
    // -----------------------------------------------------

    const status =
        normalizeText(
            data.status ||
            data.statusTes ||
            data.testStatus
        );


    if (
        status === "selesai" ||

        status === "completed" ||

        status === "complete" ||

        status === "done"
    ) {

        return true;

    }


    // -----------------------------------------------------
    // NILAI
    // -----------------------------------------------------

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


// =========================================================
// AMBIL SEMUA ID DARI HASIL TES
// =========================================================

function getResultStudentIds(
    data,
    documentId = ""
) {

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

                String(
                    value
                ).trim() !== ""
            ) {

                ids.push(
                    normalizeId(
                        value
                    )
                );

            }

        }
    );


    // -----------------------------------------------------
    // PESERTA OBJECT
    // -----------------------------------------------------

    if (
        data?.peserta &&

        typeof data.peserta ===
        "object"
    ) {

        const pesertaIds = [

            data.peserta.uid,

            data.peserta.userId,

            data.peserta.userID,

            data.peserta.siswaId,

            data.peserta.studentId,

            data.peserta.id

        ];


        pesertaIds.forEach(
            (value) => {

                if (
                    value !== null &&

                    value !== undefined &&

                    String(
                        value
                    ).trim() !== ""
                ) {

                    ids.push(
                        normalizeId(
                            value
                        )
                    );

                }

            }
        );

    }


    /*
     * Beberapa aplikasi menyimpan UID
     * dalam object user.
     */

    if (
        data?.user &&
        typeof data.user ===
        "object"
    ) {

        const userIds = [

            data.user.uid,

            data.user.userId,

            data.user.id,

            data.user.siswaId,

            data.user.studentId

        ];


        userIds.forEach(
            (value) => {

                if (
                    value !== null &&

                    value !== undefined &&

                    String(
                        value
                    ).trim() !== ""
                ) {

                    ids.push(
                        normalizeId(
                            value
                        )
                    );

                }

            }
        );

    }


    /*
     * Jangan langsung menggunakan document ID
     * sebagai UID siswa.
     *
     * Hanya digunakan apabila data hasil memang
     * tidak memiliki field identitas siswa.
     */

    if (
        ids.length === 0 &&

        documentId
    ) {

        ids.push(
            normalizeId(
                documentId
            )
        );

    }


    return [
        ...new Set(
            ids.filter(
                Boolean
            )
        )
    ];

}


// =========================================================
// AMBIL SEMUA ID DARI SISWA
// =========================================================

function getStudentIds(
    siswa
) {

    const ids = [];


    const kemungkinanId = [

        siswa?.uid,

        siswa?.id,

        siswa?.userId,

        siswa?.userid,

        siswa?.siswaId,

        siswa?.studentId,

        siswa?.siswaUid,

        siswa?.studentUid

    ];


    kemungkinanId.forEach(
        (value) => {

            if (
                value !== null &&

                value !== undefined &&

                String(
                    value
                ).trim() !== ""
            ) {

                ids.push(
                    normalizeId(
                        value
                    )
                );

            }

        }
    );


    return [
        ...new Set(
            ids.filter(
                Boolean
            )
        )
    ];

}


// =========================================================
// CEK HASIL TES MILIK SISWA
// =========================================================

function isResultBelongsToStudent(
    hasil,
    siswa
) {

    if (
        !hasil ||
        !siswa
    ) {

        return false;

    }


    const resultIds =
        getResultStudentIds(
            hasil.data || hasil,
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
        (resultId) => {

            return studentIds.some(
                (studentId) => {

                    return (
                        String(
                            resultId
                        ) ===

                        String(
                            studentId
                        )
                    );

                }
            );

        }
    );

}


// =========================================================
// DATA GURU
// =========================================================

async function loadTeacherData(
    user
) {

    try {

        console.log(
            "================================="
        );

        console.log(
            "MEMUAT DATA GURU..."
        );

        console.log(
            "================================="
        );


        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnapshot =
            await getDoc(
                userRef
            );


        if (
            !userSnapshot.exists()
        ) {

            console.error(
                "Dokumen guru tidak ditemukan."
            );


            alert(
                "Data akun guru tidak ditemukan."
            );


            await signOut(
                auth
            );


            window.location.href =
                "../index.html";


            return false;

        }


        const userData =
            userSnapshot.data() ||
            {};


        console.log(
            "DATA GURU:",
            userData
        );


        // -------------------------------------------------
        // ROLE
        // -------------------------------------------------

        const role =
            normalizeText(
                userData.role
            );


        if (
            role === "siswa"
        ) {

            window.location.href =
                "../dashboard.html";


            return false;

        }


        if (
            role !== "guru"
        ) {

            console.error(
                "Akun bukan guru."
            );


            alert(
                "Akun tidak memiliki akses sebagai guru."
            );


            await signOut(
                auth
            );


            window.location.href =
                "../index.html";


            return false;

        }


        // -------------------------------------------------
        // NAMA GURU
        // -------------------------------------------------

        const nama =
            getText(
                userData.nama ||
                userData.namaLengkap ||
                userData.name ||
                userData.displayName ||
                user.displayName,
                "Guru"
            );


        if (topUserName) {

            topUserName.textContent =
                nama;

        }


        // -------------------------------------------------
        // FOTO GURU
        // -------------------------------------------------

        const photoURL =
            userData.foto ||
            userData.photoURL ||
            userData.profilePhoto ||
            userData.photo ||
            user.photoURL ||
            "";


        if (
            photoURL &&
            topProfilePhoto
        ) {

            topProfilePhoto.src =
                photoURL;


            topProfilePhoto.style.display =
                "block";


            if (
                topProfilePlaceholder
            ) {

                topProfilePlaceholder.style.display =
                    "none";

            }

        } else {

            if (
                topProfilePhoto
            ) {

                topProfilePhoto.style.display =
                    "none";

            }


            if (
                topProfilePlaceholder
            ) {

                topProfilePlaceholder.style.display =
                    "flex";

            }

        }


        return true;


    } catch (error) {

        console.error(
            "Gagal memuat data guru:",
            error
        );


        if (
            error?.code ===
            "permission-denied"
        ) {

            alert(
                "Akses data guru ditolak oleh Firebase Rules."
            );

        } else {

            alert(
                "Gagal memuat data guru."
            );

        }


        return false;

    }

}


// =========================================================
// LOAD HASIL TES
// =========================================================

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
            (docSnapshot) => {

                const data =
                    docSnapshot.data() ||
                    {};


                const hasil = {

                    id:
                        docSnapshot.id,


                    data:
                        data,


                    uid:
                        data.uid ||
                        data.userId ||
                        data.userid ||
                        data.userUID ||
                        data.userUid ||
                        data.siswaId ||
                        data.siswaID ||
                        data.siswaUid ||
                        data.siswaUID ||
                        data.studentId ||
                        data.studentID ||
                        data.studentUid ||
                        data.studentUID ||
                        data.idSiswa ||
                        data.id_siswa ||
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
                    docSnapshot.id,
                    data
                );

            }
        );


        console.log(
            "JUMLAH HASIL TES:",
            daftarHasilTes.length
        );


    } catch (error) {

        console.error(
            "Gagal mengambil hasil tes:",
            error
        );


        daftarHasilTes = [];

    }

}


// =========================================================
// LOAD DATA SISWA
// =========================================================

async function loadStudents() {

    try {

        console.log(
            "================================="
        );

        console.log(
            "MEMUAT DATA MURID..."
        );

        console.log(
            "================================="
        );


        if (siswaTableBody) {

            siswaTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="empty-state"
                    >
                        Memuat data murid...
                    </td>
                </tr>
            `;

        }


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        console.log(
            "JUMLAH DOKUMEN USERS:",
            snapshot.size
        );


        daftarSiswa = [];


        snapshot.forEach(
            (docSnapshot) => {

                const data =
                    docSnapshot.data() ||
                    {};


                const role =
                    normalizeText(
                        data.role
                    );


                console.log(
                    "USER:",
                    docSnapshot.id,
                    data,
                    "ROLE:",
                    role
                );


                // -------------------------------------------------
                // HANYA SISWA
                // -------------------------------------------------

                if (
                    role !== "siswa"
                ) {

                    return;

                }


                // -------------------------------------------------
                // HASIL TES DALAM USERS
                // -------------------------------------------------

                const hasilTesDalamUser =

                    data.hasilTes ??

                    data.tests ??

                    data.tes ??

                    data.nilaiTes ??

                    null;


                // -------------------------------------------------
                // DATA SISWA
                // -------------------------------------------------

                const siswa = {

                    id:
                        docSnapshot.id,


                    uid:
                        data.uid ||
                        data.userId ||
                        data.userid ||
                        data.siswaId ||
                        data.studentId ||
                        data.siswaUid ||
                        data.studentUid ||
                        docSnapshot.id,


                    nama:
                        getText(
                            data.nama ||
                            data.namaLengkap ||
                            data.name ||
                            data.displayName,
                            "Tanpa Nama"
                        ),


                    nisn:
                        getText(
                            data.nisn ||
                            data.NISN ||
                            data.nomorInduk ||
                            data.nis,
                            "-"
                        ),


                    kelas:
                        getText(
                            data.kelas ||
                            data.kelasSiswa ||
                            data.class ||
                            data.kelasSekolah ||
                            data.namaKelas ||
                            data.nama_kelas,
                            "-"
                        ),


                    tahunAjaran:
                        getText(
                            data.tahunAjaran ||
                            data.tahun_ajaran ||
                            data.tahun ||
                            data.academicYear,
                            "-"
                        ),


                    angkatan:
                        getText(
                            data.angkatan,
                            "-"
                        ),


                    tingkat:
                        getText(
                            data.tingkat ||
                            data.level ||
                            data.grade,
                            "-"
                        ),


                    email:
                        getText(
                            data.email,
                            "-"
                        ),


                    foto:
                        data.foto ||
                        data.photoURL ||
                        data.profilePhoto ||
                        data.photo ||
                        "",


                    hasilTes:
                        hasilTesDalamUser

                };


                daftarSiswa.push(
                    siswa
                );

            }
        );


        // =====================================================
        // HUBUNGKAN HASIL TES DENGAN SISWA
        // =====================================================

        daftarSiswa.forEach(
            (siswa) => {

                const hasilDariCollection =

                    daftarHasilTes.filter(
                        (hasil) => {

                            return isResultBelongsToStudent(
                                hasil,
                                siswa
                            );

                        }
                    );


                // -------------------------------------------------
                // HASIL TES DARI USERS
                // -------------------------------------------------

                let hasilDariUser =
                    siswa.hasilTes;


                let hasilUserArray =
                    [];


                if (
                    Array.isArray(
                        hasilDariUser
                    )
                ) {

                    hasilUserArray =
                        hasilDariUser;

                }

                else if (
                    hasilDariUser &&

                    typeof hasilDariUser ===
                    "object"
                ) {

                    hasilUserArray =
                        Object.values(
                            hasilDariUser
                        );

                }


                // -------------------------------------------------
                // GABUNG
                // -------------------------------------------------

                const hasilGabungan =
                    [
                        ...hasilUserArray,
                        ...hasilDariCollection
                    ];


                // -------------------------------------------------
                // HILANGKAN DUPLIKAT
                // -------------------------------------------------

                const hasilUnik =
                    [];


                const hasilKey =
                    new Set();


                hasilGabungan.forEach(
                    (hasil) => {

                        if (!hasil) {

                            return;

                        }


                        const key =

                            hasil.id ||

                            `${

                                hasil.jenisTes ||

                                hasil.namaTes ||

                                hasil.testType ||

                                ""

                            }-${

                                hasil.nilai ??

                                hasil.score ??

                                ""

                            }`;


                        if (
                            hasilKey.has(
                                key
                            )
                        ) {

                            return;

                        }


                        hasilKey.add(
                            key
                        );


                        hasilUnik.push(
                            hasil
                        );

                    }
                );


                siswa.hasilTes =
                    hasilUnik;


                console.log(
                    "HASIL TES SISWA:",
                    siswa.nama,
                    siswa.uid,
                    siswa.hasilTes
                );

            }
        );


        // =====================================================
        // TOTAL SISWA
        // =====================================================

        if (totalSiswa) {

            totalSiswa.textContent =
                daftarSiswa.length;

        }


        // =====================================================
        // FILTER
        // =====================================================

        populateClassFilter();

        populateYearFilter();


        // =====================================================
        // RENDER
        // =====================================================

        renderStudents();


        console.log(
            "================================="
        );

        console.log(
            "TOTAL MURID:",
            daftarSiswa.length
        );

        console.log(
            "================================="
        );


    } catch (error) {

        console.error(
            "GAGAL MEMUAT DATA SISWA:",
            error
        );


        if (totalSiswa) {

            totalSiswa.textContent =
                "0";

        }


        if (siswaTableBody) {

            siswaTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="empty-state"
                    >
                        Gagal memuat data murid.
                    </td>
                </tr>
            `;

        }


        if (filterStatus) {

            filterStatus.textContent =
                "Gagal memuat data murid";

        }


        if (tableInfo) {

            tableInfo.textContent =
                "Tidak ada data";

        }

    }

}


// =========================================================
// FILTER KELAS
// =========================================================

function populateClassFilter() {

    if (!filterKelas) {

        return;

    }


    const currentValue =
        filterKelas.value;


    filterKelas.innerHTML = `
        <option value="">
            Semua Kelas
        </option>
    `;


    const kelasSet =
        new Set();


    daftarSiswa.forEach(
        (siswa) => {

            const kelas =
                getText(
                    siswa.kelas,
                    ""
                );


            if (
                kelas &&
                kelas !== "-"
            ) {

                kelasSet.add(
                    kelas
                );

            }

        }
    );


    const daftarKelas =
        Array.from(
            kelasSet
        ).sort(
            (a, b) => {

                return String(
                    a
                ).localeCompare(
                    String(
                        b
                    ),
                    "id",
                    {
                        numeric: true
                    }
                );

            }
        );


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


    if (
        daftarKelas.includes(
            currentValue
        )
    ) {

        filterKelas.value =
            currentValue;

    }

}


// =========================================================
// FILTER TAHUN AJARAN
// =========================================================

function populateYearFilter() {

    if (!filterTahun) {

        return;

    }


    const currentValue =
        filterTahun.value;


    filterTahun.innerHTML = `
        <option value="">
            Semua Tahun Ajaran
        </option>
    `;


    const tahunSet =
        new Set();


    daftarSiswa.forEach(
        (siswa) => {

            const tahun =
                getText(
                    siswa.tahunAjaran,
                    ""
                );


            if (
                tahun &&
                tahun !== "-"
            ) {

                tahunSet.add(
                    tahun
                );

            }

        }
    );


    const daftarTahun =
        Array.from(
            tahunSet
        ).sort(
            (a, b) => {

                return String(
                    b
                ).localeCompare(
                    String(
                        a
                    ),
                    "id",
                    {
                        numeric: true
                    }
                );

            }
        );


    daftarTahun.forEach(
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


    if (
        daftarTahun.includes(
            currentValue
        )
    ) {

        filterTahun.value =
            currentValue;

    }

}


// =========================================================
// GET TEST STATUS
// =========================================================

function getTestStatus(
    siswa
) {

    if (
        !siswa ||
        !siswa.hasilTes
    ) {

        return {

            jumlah: 0,

            selesai: false

        };

    }


    let daftarHasil =
        [];


    // -----------------------------------------------------
    // ARRAY
    // -----------------------------------------------------

    if (
        Array.isArray(
            siswa.hasilTes
        )
    ) {

        daftarHasil =
            siswa.hasilTes;

    }


    // -----------------------------------------------------
    // OBJECT
    // -----------------------------------------------------

    else if (
        typeof siswa.hasilTes ===
        "object"
    ) {

        daftarHasil =
            Object.values(
                siswa.hasilTes
            );

    }


    const tesSelesai =
        new Set();


    daftarHasil.forEach(
        (item) => {

            if (!item) {

                return;

            }


            if (
                !isTestCompleted(
                    item
                )
            ) {

                return;

            }


            // -------------------------------------------------
            // JENIS TES
            // -------------------------------------------------

            let type =
                normalizeTestType(
                    item.jenisTes ||
                    item.jenis_test ||
                    item.jenisTest ||
                    item.testType ||
                    item.test_type ||
                    item.type ||
                    item.jenis
                );


            // -------------------------------------------------
            // FALLBACK NAMA TES
            // -------------------------------------------------

            if (!type) {

                type =
                    normalizeTestType(
                        item.namaTes ||
                        item.nama_test ||
                        item.testName ||
                        item.test_name
                    );

            }


            // -------------------------------------------------
            // FALLBACK DATA MENTAH
            // -------------------------------------------------

            if (!type) {

                type =
                    normalizeTestType(
                        item.data?.jenisTes ||
                        item.data?.jenis_test ||
                        item.data?.jenisTest ||
                        item.data?.testType ||
                        item.data?.test_type ||
                        item.data?.type ||
                        item.data?.jenis ||
                        item.data?.namaTes ||
                        item.data?.nama_test ||
                        item.data?.testName ||
                        item.data?.test_name
                    );

            }


            if (!type) {

                return;

            }


            // -------------------------------------------------
            // HAND EYE
            // -------------------------------------------------

            if (
                type === "handeye" ||
                type.includes("handeye")
            ) {

                tesSelesai.add(
                    "handeye"
                );

                return;

            }


            // -------------------------------------------------
            // SIT UP
            // -------------------------------------------------

            if (
                type === "situp" ||
                type.includes("situp")
            ) {

                tesSelesai.add(
                    "situp"
                );

                return;

            }


            // -------------------------------------------------
            // STANDING BROAD JUMP
            // -------------------------------------------------

            if (
                type ===
                "standingbroadjump" ||

                type.includes(
                    "standingbroadjump"
                ) ||

                type.includes(
                    "broadjump"
                ) ||

                type.includes(
                    "standinglongjump"
                )
            ) {

                tesSelesai.add(
                    "standingbroadjump"
                );

                return;

            }


            // -------------------------------------------------
            // T TEST
            // -------------------------------------------------

            if (
                type === "ttest" ||

                type.includes(
                    "ttest"
                ) ||

                type.includes(
                    "testt"
                )
            ) {

                tesSelesai.add(
                    "ttest"
                );

                return;

            }


            // -------------------------------------------------
            // BEEP TEST
            // -------------------------------------------------

            if (
                type === "beeptest" ||

                type.includes(
                    "beeptest"
                ) ||

                type.includes(
                    "beep"
                ) ||

                type.includes(
                    "bleep"
                )
            ) {

                tesSelesai.add(
                    "beeptest"
                );

                return;

            }

        }
    );


    const jumlah =
        Math.min(
            tesSelesai.size,
            JUMLAH_TES
        );


    return {

        jumlah:
            jumlah,


        selesai:
            jumlah >= JUMLAH_TES

    };

}


// =========================================================
// STATUS HTML
// =========================================================

function getStatusHTML(
    siswa
) {

    const status =
        getTestStatus(
            siswa
        );


    // -----------------------------------------------------
    // SEMUA TES SELESAI
    // -----------------------------------------------------

    if (
        status.selesai
    ) {

        return `
            <span
                class="status-badge status-selesai"
            >
                Selesai
            </span>
        `;

    }


    // -----------------------------------------------------
    // SEBAGIAN TES
    // -----------------------------------------------------

    if (
        status.jumlah > 0
    ) {

        return `
            <span
                class="status-badge status-proses"
            >
                ${status.jumlah}/${JUMLAH_TES} Tes
            </span>
        `;

    }


    // -----------------------------------------------------
    // BELUM TES
    // -----------------------------------------------------

    return `
        <span
            class="status-badge status-belum"
        >
            Belum Tes
        </span>
    `;

}


// =========================================================
// RENDER STUDENTS
// =========================================================

function renderStudents() {

    if (!siswaTableBody) {

        return;

    }


    // -----------------------------------------------------
    // SEARCH
    // -----------------------------------------------------

    const search =
        normalizeText(
            searchSiswa?.value
        );


    // -----------------------------------------------------
    // KELAS
    // -----------------------------------------------------

    const selectedClass =
        normalizeText(
            filterKelas?.value
        );


    // -----------------------------------------------------
    // TAHUN
    // -----------------------------------------------------

    const selectedYear =
        normalizeText(
            filterTahun?.value
        );


    // -----------------------------------------------------
    // STATUS
    // -----------------------------------------------------

    const selectedStatus =
        normalizeText(
            filterStatus?.value
        );


    let filtered =
        [
            ...daftarSiswa
        ];


    // =====================================================
    // SEARCH
    // =====================================================

    if (search) {

        filtered =
            filtered.filter(
                (siswa) => {

                    const nama =
                        normalizeText(
                            siswa.nama
                        );


                    const nisn =
                        normalizeText(
                            siswa.nisn
                        );


                    const kelas =
                        normalizeText(
                            siswa.kelas
                        );


                    return (

                        nama.includes(
                            search
                        ) ||

                        nisn.includes(
                            search
                        ) ||

                        kelas.includes(
                            search
                        )

                    );

                }
            );

    }


    // =====================================================
    // FILTER KELAS
    // =====================================================

    if (
        selectedClass
    ) {

        filtered =
            filtered.filter(
                (siswa) => {

                    return (

                        normalizeText(
                            siswa.kelas
                        ) ===
                        selectedClass

                    );

                }
            );

    }


    // =====================================================
    // FILTER TAHUN
    // =====================================================

    if (
        selectedYear
    ) {

        filtered =
            filtered.filter(
                (siswa) => {

                    return (

                        normalizeText(
                            siswa.tahunAjaran
                        ) ===
                        selectedYear

                    );

                }
            );

    }


    // =====================================================
    // FILTER STATUS
    // =====================================================

    if (
        selectedStatus
    ) {

        filtered =
            filtered.filter(
                (siswa) => {

                    const status =
                        getTestStatus(
                            siswa
                        );


                    // -------------------------------------
                    // SELESAI
                    // -------------------------------------

                    if (
                        selectedStatus ===
                        "selesai"
                    ) {

                        return (
                            status.selesai
                        );

                    }


                    // -------------------------------------
                    // PROSES
                    // -------------------------------------

                    if (
                        selectedStatus ===
                        "proses"
                    ) {

                        return (

                            !status.selesai &&

                            status.jumlah > 0

                        );

                    }


                    // -------------------------------------
                    // BELUM
                    // -------------------------------------

                    if (
                        selectedStatus ===
                        "belum"
                    ) {

                        return (
                            status.jumlah === 0
                        );

                    }


                    return true;

                }
            );

    }


    // =====================================================
    // STATUS INFO
    // =====================================================

    if (filterStatus) {

        if (
            filtered.length ===
            daftarSiswa.length
        ) {

            filterStatus.textContent =
                "Menampilkan seluruh data murid";

        } else {

            filterStatus.textContent =
                `Menampilkan ${filtered.length} data murid`;

        }

    }


    // =====================================================
    // TABLE INFO
    // =====================================================

    if (tableInfo) {

        tableInfo.textContent =
            `Menampilkan ${filtered.length} murid`;

    }


    // =====================================================
    // DATA KOSONG
    // =====================================================

    if (
        filtered.length === 0
    ) {

        siswaTableBody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="empty-state"
                >
                    Tidak ada data murid yang sesuai.
                </td>

            </tr>
        `;


        return;

    }


    // =====================================================
    // RENDER TABLE
    // =====================================================

    siswaTableBody.innerHTML =

        filtered
            .map(
                (siswa, index) => {

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
                                ${getStatusHTML(
                                    siswa
                                )}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


// =========================================================
// SEARCH EVENT
// =========================================================

if (searchSiswa) {

    searchSiswa.addEventListener(
        "input",
        renderStudents
    );

}


// =========================================================
// FILTER KELAS EVENT
// =========================================================

if (filterKelas) {

    filterKelas.addEventListener(
        "change",
        renderStudents
    );

}


// =========================================================
// FILTER TAHUN EVENT
// =========================================================

if (filterTahun) {

    filterTahun.addEventListener(
        "change",
        renderStudents
    );

}


// =========================================================
// FILTER STATUS EVENT
// =========================================================

if (filterStatus) {

    filterStatus.addEventListener(
        "change",
        renderStudents
    );

}


// =========================================================
// LOGOUT
// =========================================================

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

                logoutButton.disabled =
                    true;


                await signOut(
                    auth
                );


                window.location.href =
                    "../index.html";


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(
                    "Gagal logout. Silakan coba lagi."
                );


                logoutButton.disabled =
                    false;

            }

        }
    );

}


// =========================================================
// AUTH STATE
// =========================================================

onAuthStateChanged(
    auth,
    async (user) => {

        console.log(
            "================================="
        );


        console.log(
            "AUTH STATE:",
            user
                ? user.uid
                : "Tidak login"
        );


        console.log(
            "================================="
        );


        // =================================================
        // BELUM LOGIN
        // =================================================

        if (!user) {

            window.location.href =
                "../index.html";


            return;

        }


        try {

            // =============================================
            // CEK GURU
            // =============================================

            const isTeacher =
                await loadTeacherData(
                    user
                );


            if (!isTeacher) {

                return;

            }


            // =============================================
            // LOAD HASIL TES
            // =============================================

            await loadTestResults();


            // =============================================
            // LOAD SISWA
            // =============================================

            await loadStudents();


            // =============================================
            // DEBUG
            // =============================================

            console.log(
                "================================="
            );


            console.log(
                "HALAMAN DATA MURID SELESAI"
            );


            console.log(
                "Jumlah murid:",
                daftarSiswa.length
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
                        `${status.jumlah}/${JUMLAH_TES}`,

                        "| Selesai:",
                        status.selesai,

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
                "Gagal memuat halaman Data Murid:",
                error
            );


        }

    }
);
