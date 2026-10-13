/* =========================================================
   HASIL.JS
   PORTAL SISWA
   UPT SPF SMP NEGERI 30 MAKASSAR
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
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

import {
    auth
} from "../firebase-config.js";


/* =========================================================
   FIRESTORE INSTANCE
========================================================= */

const db = getFirestore();


/* =========================================================
   DOM ELEMENTS
========================================================= */

const sidebar =
    document.querySelector(".sidebar");

const sidebarOverlay =
    document.querySelector(".sidebar-overlay");

const menuButton =
    document.querySelector(".menu-button");

const logoutButton =
    document.querySelector("#logoutButton");


/* =========================================================
   PROFILE ELEMENTS
========================================================= */

const topProfilePhoto =
    document.querySelector("#topProfilePhoto");

const topProfilePlaceholder =
    document.querySelector("#topProfilePlaceholder");

const topUserName =
    document.querySelector("#topUserName");

const topUserClass =
    document.querySelector("#topUserClass");


/* =========================================================
   SUMMARY ELEMENTS
========================================================= */

const totalTes =
    document.querySelector("#totalTes");

const tesSelesai =
    document.querySelector("#tesSelesai");

const rataRata =
    document.querySelector("#rataRata");


/* =========================================================
   RESULT ELEMENTS
========================================================= */

const resultTableBody =
    document.querySelector("#resultTableBody");

const emptyResult =
    document.querySelector("#emptyResult");


/* =========================================================
   TEST ORDER
========================================================= */

const TEST_ORDER = [

    "handeye",

    "situp",

    "standingbroadjump",

    "ttest",

    "beeptest"

];


/* =========================================================
   TEST NAMES
========================================================= */

const TEST_NAMES = {

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


/* =========================================================
   CATEGORY DATA
========================================================= */

const CATEGORY_DATA = {

    5: {
        name: "Baik Sekali",
        className: "category-excellent"
    },

    4: {
        name: "Baik",
        className: "category-good"
    },

    3: {
        name: "Sedang",
        className: "category-medium"
    },

    2: {
        name: "Kurang",
        className: "category-poor"
    },

    1: {
        name: "Kurang Sekali",
        className: "category-very-poor"
    }

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupSidebar();

        setupLogout();

    }
);


/* =========================================================
   SIDEBAR
========================================================= */

function setupSidebar() {

    /*
     * Tombol menu mobile
     */
    if (
        menuButton &&
        sidebar
    ) {

        menuButton.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "active"
                );

                if (sidebarOverlay) {

                    sidebarOverlay.classList.toggle(
                        "active"
                    );

                }

            }
        );

    }


    /*
     * Overlay
     */
    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    /*
     * Tutup sidebar ketika
     * menu diklik
     */
    if (sidebar) {

        const links =
            sidebar.querySelectorAll(
                "a"
            );

        links.forEach(
            link => {

                link.addEventListener(
                    "click",
                    closeSidebar
                );

            }
        );

    }

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

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    if (!logoutButton) {

        return;

    }


    logoutButton.addEventListener(
        "click",
        async () => {

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


                logoutButton.disabled =
                    false;


                alert(
                    "Gagal keluar dari akun."
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
    async user => {

        /*
         * Belum login
         */
        if (!user) {

            window.location.href =
                "../index.html";

            return;

        }


        /*
         * User sudah login
         */
        await loadStudentData(
            user
        );

    }
);


/* =========================================================
   LOAD STUDENT DATA
========================================================= */

async function loadStudentData(
    user
) {

    try {

        /*
         * =====================================================
         * BACA PROFIL SISWA
         * =====================================================
         */

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


        let userData = {};


        if (
            userSnap.exists()
        ) {

            userData =
                userSnap.data();

        }


        /*
         * Tampilkan profil
         */
        renderProfile(
            user,
            userData
        );


        /*
         * =====================================================
         * BACA SEMUA HASIL TES
         * =====================================================
         */

        const results =
            await loadAllResults(
                user.uid
            );


        /*
         * =====================================================
         * TAMPILKAN HASIL
         * =====================================================
         */

        renderResults(
            results
        );


    } catch (error) {

        console.error(
            "Gagal memuat data siswa:",
            error
        );


        showErrorResult();

    }

}


/* =========================================================
   LOAD ALL RESULTS
========================================================= */

async function loadAllResults(
    uid
) {

    /*
     * Membuat semua reference terlebih dahulu.
     *
     * Dengan cara ini 5 dokumen dapat
     * dibaca secara paralel.
     */

    const resultRefs =
        TEST_ORDER.map(
            jenisTes => {

                return doc(
                    db,
                    "hasilTes",
                    `${uid}_${jenisTes}`
                );

            }
        );


    /*
     * =====================================================
     * BACA 5 DOKUMEN SECARA PARALEL
     * =====================================================
     */

    const snapshots =
        await Promise.all(
            resultRefs.map(
                ref =>
                    getDoc(ref)
            )
        );


    /*
     * =====================================================
     * GABUNGKAN HASIL
     * =====================================================
     */

    return TEST_ORDER.map(
        (jenisTes, index) => {

            const snapshot =
                snapshots[index];


            if (
                snapshot.exists()
            ) {

                return {

                    jenisTes,

                    data:
                        snapshot.data()

                };

            }


            return {

                jenisTes,

                data: null

            };

        }
    );

}


/* =========================================================
   RENDER PROFILE
========================================================= */

function renderProfile(
    user,
    userData
) {

    /*
     * =====================================================
     * NAMA
     * =====================================================
     */

    const name =
        userData.nama ||
        userData.name ||
        userData.namaLengkap ||
        userData.displayName ||
        user.displayName ||
        "Siswa";


    if (topUserName) {

        topUserName.textContent =
            name;

    }


    /*
     * =====================================================
     * KELAS
     * =====================================================
     */

    const kelas =
        userData.kelas ||
        userData.class ||
        userData.kelasSiswa ||
        "-";


    if (topUserClass) {

        topUserClass.textContent =
            kelas;

    }


    /*
     * =====================================================
     * FOTO
     * =====================================================
     */

    const photoURL =
        userData.photoURL ||
        userData.fotoURL ||
        userData.foto ||
        userData.photo ||
        user.photoURL ||
        "";


    /*
     * Jika ada foto
     */
    if (
        topProfilePhoto &&
        photoURL
    ) {

        topProfilePhoto.src =
            photoURL;


        topProfilePhoto.style.display =
            "block";


        if (topProfilePlaceholder) {

            topProfilePlaceholder.style.display =
                "none";

        }


        /*
         * Jika gambar gagal
         */
        topProfilePhoto.onerror =
            () => {

                topProfilePhoto.style.display =
                    "none";


                if (topProfilePlaceholder) {

                    topProfilePlaceholder.style.display =
                        "flex";

                }

            };


    } else {

        /*
         * Tidak ada foto
         */
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
   RENDER RESULTS
========================================================= */

function renderResults(
    results
) {

    if (!resultTableBody) {

        return;

    }


    /*
     * Bersihkan tabel
     */
    resultTableBody.innerHTML =
        "";


    /*
     * =====================================================
     * JIKA TIDAK ADA HASIL
     * =====================================================
     */

    if (
        !results ||
        results.length === 0
    ) {

        showEmptyResult();

        updateSummary(
            0,
            0,
            0
        );

        return;

    }


    /*
     * =====================================================
     * STATISTIK
     * =====================================================
     */

    let completedCount =
        0;


    let totalScore =
        0;


    /*
     * =====================================================
     * RENDER SETIAP TES
     * =====================================================
     */

    results.forEach(
        (item, index) => {

            const row =
                createResultRow(
                    item,
                    index
                );


            resultTableBody.appendChild(
                row
            );


            /*
             * Hitung skor
             */
            if (
                item.data
            ) {

                const score =
                    getScore(
                        item.data
                    );


                if (
                    score !== null
                ) {

                    completedCount +=
                        1;


                    totalScore +=
                        score;

                }

            }

        }
    );


    /*
     * =====================================================
     * RATA-RATA
     * =====================================================
     */

    let average =
        0;


    if (
        completedCount > 0
    ) {

        average =
            totalScore /
            completedCount;

    }


    /*
     * =====================================================
     * UPDATE SUMMARY
     * =====================================================
     */

    updateSummary(
        results.length,
        completedCount,
        average
    );


    /*
     * =====================================================
     * EMPTY STATE
     * =====================================================
     */

    if (emptyResult) {

        emptyResult.style.display =
            "none";

    }

}


/* =========================================================
   CREATE RESULT ROW
========================================================= */

function createResultRow(
    item,
    index
) {

    const tr =
        document.createElement(
            "tr"
        );


    const data =
        item.data;


    const testName =
        TEST_NAMES[
            item.jenisTes
        ] ||
        formatTestName(
            item.jenisTes
        );


    /*
     * =====================================================
     * NOMOR
     * =====================================================
     */

    const noCell =
        document.createElement(
            "td"
        );


    noCell.textContent =
        index + 1;


    /*
     * =====================================================
     * NAMA TES
     * =====================================================
     */

    const testCell =
        document.createElement(
            "td"
        );


    testCell.textContent =
        testName;


    /*
     * =====================================================
     * HASIL
     * =====================================================
     */

    const resultCell =
        document.createElement(
            "td"
        );


    /*
     * =====================================================
     * SKOR
     * =====================================================
     */

    const scoreCell =
        document.createElement(
            "td"
        );


    /*
     * =====================================================
     * KATEGORI
     * =====================================================
     */

    const categoryCell =
        document.createElement(
            "td"
        );


    /*
     * =====================================================
     * BELUM ADA DATA
     * =====================================================
     */

    if (!data) {

        resultCell.innerHTML =
            `
            <span class="not-completed">
                Belum ada hasil
            </span>
            `;


        scoreCell.innerHTML =
            `
            <span class="not-completed">
                -
            </span>
            `;


        categoryCell.innerHTML =
            `
            <span class="not-completed">
                -
            </span>
            `;

    }


    /*
     * =====================================================
     * ADA DATA
     * =====================================================
     */

    else {

        /*
         * -------------------------------------------------
         * HASIL PENGUKURAN
         * -------------------------------------------------
         */

        const result =
            getResultValue(
                data
            );


        if (
            result !== null &&
            result !== ""
        ) {

            resultCell.textContent =
                result;

        } else {

            resultCell.innerHTML =
                `
                <span class="not-completed">
                    -
                </span>
                `;

        }


        /*
         * -------------------------------------------------
         * SKOR
         * -------------------------------------------------
         */

        const score =
            getScore(
                data
            );


        if (
            score !== null
        ) {

            const scoreBadge =
                document.createElement(
                    "span"
                );


            scoreBadge.className =
                "score-badge";


            scoreBadge.textContent =
                score;


            scoreCell.appendChild(
                scoreBadge
            );


            /*
             * -------------------------------------------------
             * KATEGORI
             * -------------------------------------------------
             */

            const category =
                getCategory(
                    data,
                    score
                );


            if (category) {

                const categoryBadge =
                    document.createElement(
                        "span"
                    );


                categoryBadge.className =
                    `category-badge ${category.className}`;


                categoryBadge.textContent =
                    category.name;


                categoryCell.appendChild(
                    categoryBadge
                );

            } else {

                categoryCell.innerHTML =
                    `
                    <span class="not-completed">
                        -
                    </span>
                    `;

            }


        } else {

            /*
             * -------------------------------------------------
             * TIDAK ADA SKOR
             * -------------------------------------------------
             */

            scoreCell.innerHTML =
                `
                <span class="not-completed">
                    -
                </span>
                `;


            /*
             * Coba gunakan kategori
             * yang tersimpan di Firestore.
             */

            const category =
                getCategory(
                    data,
                    null
                );


            if (category) {

                const categoryBadge =
                    document.createElement(
                        "span"
                    );


                categoryBadge.className =
                    `category-badge ${category.className}`;


                categoryBadge.textContent =
                    category.name;


                categoryCell.appendChild(
                    categoryBadge
                );

            } else {

                categoryCell.innerHTML =
                    `
                    <span class="not-completed">
                        -
                    </span>
                    `;

            }

        }

    }


    /*
     * =====================================================
     * MASUKKAN 5 CELL
     * =====================================================
     */

    tr.appendChild(
        noCell
    );

    tr.appendChild(
        testCell
    );

    tr.appendChild(
        resultCell
    );

    tr.appendChild(
        scoreCell
    );

    tr.appendChild(
        categoryCell
    );


    return tr;

}


/* =========================================================
   GET RESULT VALUE
========================================================= */

function getResultValue(
    data
) {

    if (!data) {

        return null;

    }


    const possibleFields = [

        "hasil",

        "result",

        "hasilTes",

        "hasilPengukuran",

        "hasilAkhir",

        "pengukuran",

        "nilaiHasil",

        "value"

    ];


    for (
        const field of possibleFields
    ) {

        if (
            data[field] !== undefined &&
            data[field] !== null &&
            data[field] !== ""
        ) {

            return data[field];

        }

    }


    return null;

}


/* =========================================================
   GET SCORE
========================================================= */

function getScore(
    data
) {

    if (!data) {

        return null;

    }


    const possibleFields = [

        "skor",

        "score",

        "nilaiSkor",

        "rating"

    ];


    let rawScore =
        null;


    for (
        const field of possibleFields
    ) {

        if (
            data[field] !== undefined &&
            data[field] !== null &&
            data[field] !== ""
        ) {

            rawScore =
                data[field];

            break;

        }

    }


    if (
        rawScore === null
    ) {

        return null;

    }


    const score =
        Number(
            rawScore
        );


    if (
        !Number.isFinite(
            score
        )
    ) {

        return null;

    }


    if (
        score < 1 ||
        score > 5
    ) {

        return null;

    }


    return Number(
        score.toFixed(2)
    );

}


/* =========================================================
   GET CATEGORY
========================================================= */

function getCategory(
    data,
    score = null
) {

    /*
     * =====================================================
     * BERDASARKAN SKOR
     * =====================================================
     */

    if (
        score !== null
    ) {

        const roundedScore =
            Math.round(
                Number(score)
            );


        if (
            CATEGORY_DATA[
                roundedScore
            ]
        ) {

            return CATEGORY_DATA[
                roundedScore
            ];

        }

    }


    /*
     * =====================================================
     * BERDASARKAN FIELD KATEGORI
     * =====================================================
     */

    if (!data) {

        return null;

    }


    const possibleFields = [

        "kategori",

        "category",

        "grade",

        "predikat",

        "keterangan"

    ];


    let rawCategory =
        null;


    for (
        const field of possibleFields
    ) {

        if (
            data[field] !== undefined &&
            data[field] !== null &&
            data[field] !== ""
        ) {

            rawCategory =
                data[field];

            break;

        }

    }


    if (
        rawCategory === null
    ) {

        return null;

    }


    const categoryText =
        normalizeText(
            rawCategory
        );


    /*
     * =====================================================
     * BAIK SEKALI
     * =====================================================
     */

    if (
        categoryText.includes(
            "baik sekali"
        ) ||
        categoryText.includes(
            "sangat baik"
        )
    ) {

        return CATEGORY_DATA[5];

    }


    /*
     * =====================================================
     * BAIK
     * =====================================================
     */

    if (
        categoryText === "baik"
    ) {

        return CATEGORY_DATA[4];

    }


    /*
     * =====================================================
     * SEDANG / CUKUP
     * =====================================================
     */

    if (
        categoryText.includes(
            "sedang"
        ) ||
        categoryText.includes(
            "cukup"
        )
    ) {

        return CATEGORY_DATA[3];

    }


    /*
     * =====================================================
     * KURANG SEKALI
     * =====================================================
     */

    if (
        categoryText.includes(
            "kurang sekali"
        ) ||
        categoryText.includes(
            "sangat kurang"
        )
    ) {

        return CATEGORY_DATA[1];

    }


    /*
     * =====================================================
     * KURANG
     * =====================================================
     */

    if (
        categoryText.includes(
            "kurang"
        )
    ) {

        return CATEGORY_DATA[2];

    }


    return null;

}


/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(
    value
) {

    return String(
        value
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        );

}


/* =========================================================
   FORMAT TEST NAME
========================================================= */

function formatTestName(
    value
) {

    if (!value) {

        return "-";

    }


    return String(
        value
    )
        .replace(
            /[_-]+/g,
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary(
    total,
    completed,
    average
) {

    /*
     * Total tes
     */
    if (totalTes) {

        totalTes.textContent =
            total;

    }


    /*
     * Tes selesai
     */
    if (tesSelesai) {

        tesSelesai.textContent =
            completed;

    }


    /*
     * Rata-rata
     */
    if (rataRata) {

        if (
            completed > 0
        ) {

            rataRata.textContent =
                Number(
                    average.toFixed(2)
                );

        } else {

            rataRata.textContent =
                "0";

        }

    }

}


/* =========================================================
   SHOW EMPTY RESULT
========================================================= */

function showEmptyResult() {

    if (resultTableBody) {

        resultTableBody.innerHTML =
            `
            <tr>
                <td
                    colspan="5"
                    class="empty-table"
                >
                    Belum ada hasil tes.
                </td>
            </tr>
            `;

    }


    if (emptyResult) {

        emptyResult.style.display =
            "block";

    }

}


/* =========================================================
   SHOW ERROR
========================================================= */

function showErrorResult() {

    if (resultTableBody) {

        resultTableBody.innerHTML =
            `
            <tr>
                <td
                    colspan="5"
                    class="error-result"
                >
                    Gagal memuat data hasil tes.
                </td>
            </tr>
            `;

    }


    if (emptyResult) {

        emptyResult.style.display =
            "none";

    }


    updateSummary(
        0,
        0,
        0
    );

}