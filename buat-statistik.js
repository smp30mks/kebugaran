/* =========================================================
   BUAT-STATISTIK.JS
   GENERATOR STATISTIK PUBLIK
   UPT SPF SMP NEGERI 30 MAKASSAR

   VERSI:
   - HANYA MENGHITUNG SISWA YANG TERDAFTAR
     DI tesPengajuan
   - users digunakan sebagai data identitas siswa
   - hasilTes hanya dihitung untuk siswa terdaftar
   - Statistik Putra / Putri hanya dibuat jika ada
     siswa terdaftar dengan gender tersebut
   - Data dikirim ke statistikPublik
========================================================= */


/* =========================================================
   FIREBASE
========================================================= */

import {
    collection,
    getDocs,
    doc,
    writeBatch,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    db
} from "./firebase-config.js";


/* =========================================================
   COLLECTION
========================================================= */

const USERS_COLLECTION = "users";
const PENGAJUAN_COLLECTION = "tesPengajuan";
const HASIL_COLLECTION = "hasilTes";
const STATISTIK_COLLECTION = "statistikPublik";


/* =========================================================
   JENIS TES
========================================================= */

const TESTS = [
    {
        id: "handeye",
        nama: "Hand & Eye Coordination"
    },
    {
        id: "situp",
        nama: "Sit Up"
    },
    {
        id: "standingbroadjump",
        nama: "Standing Broad Jump"
    },
    {
        id: "ttest",
        nama: "T-Test"
    },
    {
        id: "beeptest",
        nama: "Beep Test"
    }
];


/* =========================================================
   NORMALISASI
========================================================= */

function normalizeText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}


function normalizeYear(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .trim()
        .replace(/\s+/g, " ");
}


function normalizeClass(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .trim()
        .replace(/\s+/g, " ");
}


/* =========================================================
   NORMALISASI GENDER
========================================================= */

function normalizeGender(value) {

    const gender = normalizeText(value);

    if (!gender) {
        return "";
    }


    if (
        gender === "putra" ||
        gender === "laki-laki" ||
        gender === "laki laki" ||
        gender === "laki_laki" ||
        gender === "lk" ||
        gender === "l" ||
        gender === "male" ||
        gender === "man"
    ) {
        return "putra";
    }


    if (
        gender === "putri" ||
        gender === "perempuan" ||
        gender === "pr" ||
        gender === "p" ||
        gender === "female" ||
        gender === "woman"
    ) {
        return "putri";
    }


    return "";
}


/* =========================================================
   NORMALISASI JENIS TES
========================================================= */

function normalizeTestType(value) {

    const type = normalizeText(value)
        .replace(/&/g, "and")
        .replace(/[_\-\s]+/g, "");

    if (!type) {
        return "";
    }


    if (
        type === "handeye" ||
        type === "handandeye" ||
        type === "handeyecoordination"
    ) {
        return "handeye";
    }


    if (
        type === "situp" ||
        type === "situps"
    ) {
        return "situp";
    }


    if (
        type === "standingbroadjump" ||
        type === "broadjump"
    ) {
        return "standingbroadjump";
    }


    if (
        type === "ttest" ||
        type === "t"
    ) {
        return "ttest";
    }


    if (
        type === "beeptest" ||
        type === "beep"
    ) {
        return "beeptest";
    }


    return "";
}


/* =========================================================
   FIRST VALID VALUE
========================================================= */

function firstValue(data, fields) {

    if (!data) {
        return null;
    }

    for (const field of fields) {

        const value = data[field];

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            return value;
        }

    }

    return null;
}


/* =========================================================
   AMBIL UID
========================================================= */

function getUid(data, documentId = "") {

    const uid = firstValue(
        data,
        [
            "uid",
            "userId",
            "studentId",
            "siswaId"
        ]
    );

    if (uid) {
        return String(uid).trim();
    }


    /*
       Dukungan ID:

       UID_handeye
       UID_situp
       UID_standingbroadjump
       UID_ttest
       UID_beeptest
    */

    for (const test of TESTS) {

        const suffix =
            "_" + test.id;

        if (
            documentId &&
            documentId.endsWith(suffix)
        ) {

            return documentId.slice(
                0,
                documentId.length - suffix.length
            );

        }

    }


    return "";
}


/* =========================================================
   AMBIL JENIS TES
========================================================= */

function getTestType(data, documentId = "") {

    const value = firstValue(
        data,
        [
            "jenisTes",
            "jenis",
            "testType",
            "tes",
            "test",
            "tipeTes"
        ]
    );


    const normalized =
        normalizeTestType(value);


    if (normalized) {
        return normalized;
    }


    for (const test of TESTS) {

        const suffix =
            "_" + test.id;

        if (
            documentId &&
            documentId.endsWith(suffix)
        ) {
            return test.id;
        }

    }


    return "";
}


/* =========================================================
   AMBIL SKOR
========================================================= */

function getScore(data) {

    const value = firstValue(
        data,
        [
            "skor",
            "score",
            "nilaiSkor",
            "rating",
            "nilai"
        ]
    );


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }


    const score =
        Number(value);


    if (!Number.isFinite(score)) {
        return null;
    }


    if (
        score < 1 ||
        score > 5
    ) {
        return null;
    }


    return Math.round(score);
}


/* =========================================================
   KATEGORI
========================================================= */

function getCategoryLabel(score) {

    switch (Number(score)) {

        case 5:
            return "Baik Sekali";

        case 4:
            return "Baik";

        case 3:
            return "Sedang";

        case 2:
            return "Kurang";

        case 1:
            return "Kurang Sekali";

        default:
            return "";

    }

}


/* =========================================================
   TEST STRUCTURE
========================================================= */

function createTestStatistic(test) {

    return {

        id: test.id,

        nama: test.nama,

        jumlahTes: 0,

        totalSkor: 0,

        rataRataSkor: 0,

        kategoriDominan: "",

        distribusiKategori: {

            "1": 0,

            "2": 0,

            "3": 0,

            "4": 0,

            "5": 0

        }

    };

}


/* =========================================================
   STATISTIC STRUCTURE
========================================================= */

function createStatistic(
    year,
    kelas,
    gender
) {

    const tests = {};


    for (const test of TESTS) {

        tests[test.id] =
            createTestStatistic(test);

    }


    return {

        tahunAjaran:
            year,

        kelas:
            kelas,

        jenisKelamin:
            gender,

        jumlahSiswa:
            0,

        jumlahTes:
            0,

        rataRataKebugaran:
            0,

        tests

    };

}


/* =========================================================
   KEY
========================================================= */

function makeStatisticKey(
    year,
    kelas,
    gender
) {

    return [
        normalizeYear(year),
        normalizeClass(kelas),
        gender
    ].join("|");

}


/* =========================================================
   DOCUMENT ID
========================================================= */

function makeDocumentId(
    year,
    kelas,
    gender
) {

    const cleanYear =
        normalizeYear(year)
            .replace(/[^\w]+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");


    const cleanClass =
        normalizeClass(kelas)
            .replace(/[^\w]+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");


    const cleanGender =
        gender || "semua";


    return [
        cleanYear,
        cleanClass,
        cleanGender
    ].join("__");

}


/* =========================================================
   GET OR CREATE STATISTIC
========================================================= */

function getOrCreateStatistic(
    statistics,
    year,
    kelas,
    gender
) {

    const key =
        makeStatisticKey(
            year,
            kelas,
            gender
        );


    if (!statistics.has(key)) {

        statistics.set(
            key,
            createStatistic(
                year,
                kelas,
                gender
            )
        );

    }


    return statistics.get(key);

}


/* =========================================================
   TAMBAH SISWA
========================================================= */

function addStudent(
    statistics,
    year,
    kelas,
    gender
) {

    if (
        !year ||
        !kelas
    ) {
        return;
    }


    /*
       SEMUA
    */

    const all =
        getOrCreateStatistic(
            statistics,
            year,
            kelas,
            "semua"
        );


    all.jumlahSiswa++;


    /*
       GENDER
    */

    if (
        gender === "putra" ||
        gender === "putri"
    ) {

        const genderStatistic =
            getOrCreateStatistic(
                statistics,
                year,
                kelas,
                gender
            );


        genderStatistic.jumlahSiswa++;

    }

}


/* =========================================================
   TAMBAH HASIL TES
========================================================= */

function addResult(
    statistics,
    year,
    kelas,
    gender,
    testType,
    score
) {

    if (
        !year ||
        !kelas ||
        !testType ||
        score === null
    ) {
        return;
    }


    /*
       SEMUA
    */

    const all =
        getOrCreateStatistic(
            statistics,
            year,
            kelas,
            "semua"
        );


    addScore(
        all,
        testType,
        score
    );


    /*
       GENDER
    */

    if (
        gender === "putra" ||
        gender === "putri"
    ) {

        const genderStatistic =
            getOrCreateStatistic(
                statistics,
                year,
                kelas,
                gender
            );


        addScore(
            genderStatistic,
            testType,
            score
        );

    }

}


/* =========================================================
   TAMBAH SKOR
========================================================= */

function addScore(
    statistic,
    testType,
    score
) {

    const test =
        statistic.tests[testType];


    if (!test) {
        return;
    }


    test.jumlahTes++;

    test.totalSkor +=
        Number(score);


    test.distribusiKategori[
        String(score)
    ]++;


    statistic.jumlahTes++;

}


/* =========================================================
   FINALISASI
========================================================= */

function finalizeStatistic(
    statistic
) {

    let totalScore = 0;

    let totalScoreCount = 0;


    for (const test of TESTS) {

        const item =
            statistic.tests[test.id];


        if (!item) {
            continue;
        }


        if (
            item.jumlahTes > 0
        ) {

            item.rataRataSkor =
                Number(
                    (
                        item.totalSkor /
                        item.jumlahTes
                    ).toFixed(2)
                );

            totalScore +=
                item.totalSkor;

            totalScoreCount +=
                item.jumlahTes;

        } else {

            item.rataRataSkor = 0;

        }


        /*
           KATEGORI DOMINAN
        */

        let dominantScore = 0;

        let dominantCount = 0;


        for (
            let score = 1;
            score <= 5;
            score++
        ) {

            const count =
                Number(
                    item.distribusiKategori[
                        String(score)
                    ] || 0
                );


            if (
                count >
                dominantCount
            ) {

                dominantCount =
                    count;

                dominantScore =
                    score;

            }

        }


        item.kategoriDominan =
            dominantScore
                ? getCategoryLabel(
                    dominantScore
                )
                : "";

    }


    /*
       RATA-RATA KEBUGARAN
    */

    if (
        totalScoreCount > 0
    ) {

        statistic.rataRataKebugaran =
            Number(
                (
                    totalScore /
                    totalScoreCount
                ).toFixed(2)
            );

    } else {

        statistic.rataRataKebugaran =
            0;

    }

}


/* =========================================================
   LOAD USERS
========================================================= */

async function loadUsers() {

    const snapshot =
        await getDocs(
            collection(
                db,
                USERS_COLLECTION
            )
        );


    const users =
        new Map();


    snapshot.forEach(
        documentSnapshot => {

            const data =
                documentSnapshot.data() || {};


            const uid =
                String(
                    data.uid ||
                    documentSnapshot.id
                ).trim();


            if (!uid) {
                return;
            }


            users.set(
                uid,
                {

                    uid,

                    nama:
                        firstValue(
                            data,
                            [
                                "nama",
                                "name",
                                "namaLengkap"
                            ]
                        ) || "",

                    kelas:
                        normalizeClass(
                            firstValue(
                                data,
                                [
                                    "kelas",
                                    "class",
                                    "kelasSiswa"
                                ]
                            )
                        ),

                    tahunAjaran:
                        normalizeYear(
                            firstValue(
                                data,
                                [
                                    "tahunAjaran",
                                    "tahun_ajaran",
                                    "academicYear",
                                    "year"
                                ]
                            )
                        )

                }
            );

        }
    );


    return users;

}


/* =========================================================
   LOAD SISWA TERDAFTAR
   SUMBER UTAMA JUMLAH MURID
========================================================= */

async function loadRegisteredStudents() {

    const snapshot =
        await getDocs(
            collection(
                db,
                PENGAJUAN_COLLECTION
            )
        );


    const registered =
        new Map();


    snapshot.forEach(
        documentSnapshot => {

            const data =
                documentSnapshot.data() || {};


            const uid =
                getUid(
                    data,
                    documentSnapshot.id
                );


            if (!uid) {
                return;
            }


            const gender =
                normalizeGender(
                    firstValue(
                        data,
                        [
                            "jenisKelamin",
                            "gender",
                            "kelamin",
                            "jenis_kelamin"
                        ]
                    )
                );


            /*
               Jika dokumen yang sama muncul
               lebih dari sekali, tetap satu siswa.
            */

            registered.set(
                uid,
                {

                    uid,

                    gender

                }
            );

        }
    );


    return registered;

}


/* =========================================================
   LOAD HASIL TES
========================================================= */

async function loadResults() {

    const snapshot =
        await getDocs(
            collection(
                db,
                HASIL_COLLECTION
            )
        );


    const results = [];


    snapshot.forEach(
        documentSnapshot => {

            const data =
                documentSnapshot.data() || {};


            const uid =
                getUid(
                    data,
                    documentSnapshot.id
                );


            const testType =
                getTestType(
                    data,
                    documentSnapshot.id
                );


            const score =
                getScore(data);


            if (
                !uid ||
                !testType ||
                score === null
            ) {
                return;
            }


            results.push({

                uid,

                testType,

                score

            });

        }
    );


    return results;

}


/* =========================================================
   HAPUS STATISTIK LAMA
========================================================= */

async function deleteOldStatistics() {

    const snapshot =
        await getDocs(
            collection(
                db,
                STATISTIK_COLLECTION
            )
        );


    if (snapshot.empty) {
        return 0;
    }


    let batch =
        writeBatch(db);


    let operationCount = 0;

    let deletedCount = 0;


    for (
        const item of snapshot.docs
    ) {

        batch.delete(
            doc(
                db,
                STATISTIK_COLLECTION,
                item.id
            )
        );


        operationCount++;

        deletedCount++;


        if (
            operationCount >= 400
        ) {

            await batch.commit();


            batch =
                writeBatch(db);


            operationCount = 0;

        }

    }


    if (
        operationCount > 0
    ) {

        await batch.commit();

    }


    return deletedCount;

}


/* =========================================================
   SIMPAN STATISTIK
========================================================= */

async function saveStatistics(
    statistics
) {

    const items =
        Array.from(
            statistics.values()
        );


    if (!items.length) {
        return 0;
    }


    let batch =
        writeBatch(db);


    let operationCount = 0;

    let savedCount = 0;


    for (
        const statistic of items
    ) {

        finalizeStatistic(
            statistic
        );


        const id =
            makeDocumentId(
                statistic.tahunAjaran,
                statistic.kelas,
                statistic.jenisKelamin
            );


        const reference =
            doc(
                db,
                STATISTIK_COLLECTION,
                id
            );


        batch.set(
            reference,
            {

                tahunAjaran:
                    statistic.tahunAjaran,

                kelas:
                    statistic.kelas,

                jenisKelamin:
                    statistic.jenisKelamin,

                jumlahSiswa:
                    statistic.jumlahSiswa,

                jumlahTes:
                    statistic.jumlahTes,

                rataRataKebugaran:
                    statistic.rataRataKebugaran,

                tests:
                    statistic.tests,

                updatedAt:
                    serverTimestamp()

            }
        );


        operationCount++;

        savedCount++;


        if (
            operationCount >= 400
        ) {

            await batch.commit();


            batch =
                writeBatch(db);


            operationCount = 0;

        }

    }


    if (
        operationCount > 0
    ) {

        await batch.commit();

    }


    return savedCount;

}


/* =========================================================
   FUNGSI UTAMA
========================================================= */

export async function buatStatistik() {

    console.log(
        "=========================================="
    );

    console.log(
        "MEMBUAT STATISTIK PUBLIK"
    );

    console.log(
        "=========================================="
    );


    try {

        /*
           1.
           USERS
        */

        console.log(
            "1/5 Membaca users..."
        );


        const users =
            await loadUsers();


        console.log(
            "Users:",
            users.size
        );


        /*
           2.
           SISWA TERDAFTAR

           INI YANG MENENTUKAN
           JUMLAH MURID.
        */

        console.log(
            "2/5 Membaca tesPengajuan..."
        );


        const registered =
            await loadRegisteredStudents();


        console.log(
            "Siswa terdaftar:",
            registered.size
        );


        /*
           3.
           HASIL TES
        */

        console.log(
            "3/5 Membaca hasilTes..."
        );


        const results =
            await loadResults();


        console.log(
            "Hasil tes:",
            results.length
        );


        /*
           4.
           AGREGASI
        */

        console.log(
            "4/5 Mengolah statistik..."
        );


        const statistics =
            new Map();


        /*
           HANYA SISWA TERDAFTAR
           YANG DIMASUKKAN.
        */

        for (
            const registeredStudent
            of registered.values()
        ) {

            const uid =
                registeredStudent.uid;


            const user =
                users.get(uid);


            /*
               Jika user tidak ditemukan,
               siswa tidak bisa diketahui
               tahun/kelasnya.
            */

            if (!user) {

                console.warn(
                    "Siswa terdaftar tidak ditemukan di users:",
                    uid
                );

                continue;

            }


            const year =
                user.tahunAjaran;


            const kelas =
                user.kelas;


            if (
                !year ||
                !kelas
            ) {

                console.warn(
                    "Data tahun/kelas kosong:",
                    uid
                );

                continue;

            }


            const gender =
                registeredStudent.gender;


            addStudent(
                statistics,
                year,
                kelas,
                gender
            );

        }


        /*
           HASIL TES HANYA UNTUK
           SISWA YANG TERDAFTAR.
        */

        for (
            const result of results
        ) {

            const registeredStudent =
                registered.get(
                    result.uid
                );


            /*
               INI PENTING.

               Jika tidak terdaftar,
               hasil tes DIABAIKAN.
            */

            if (!registeredStudent) {
                continue;
            }


            const user =
                users.get(
                    result.uid
                );


            if (!user) {
                continue;
            }


            if (
                !user.tahunAjaran ||
                !user.kelas
            ) {
                continue;
            }


            addResult(
                statistics,

                user.tahunAjaran,

                user.kelas,

                registeredStudent.gender,

                result.testType,

                result.score
            );

        }


        /*
           FINALISASI
        */

        for (
            const statistic
            of statistics.values()
        ) {

            finalizeStatistic(
                statistic
            );

        }


        console.log(
            "Kelompok statistik:",
            statistics.size
        );


        /*
           5.
           HAPUS DATA LAMA
           DAN SIMPAN DATA BARU
        */

        console.log(
            "5/5 Memperbarui statistikPublik..."
        );


        const deleted =
            await deleteOldStatistics();


        const saved =
            await saveStatistics(
                statistics
            );


        console.log(
            "Statistik lama dihapus:",
            deleted
        );


        console.log(
            "Statistik baru disimpan:",
            saved
        );


        console.log(
            "=========================================="
        );

        console.log(
            "STATISTIK BERHASIL DIPERBARUI"
        );

        console.log(
            "=========================================="
        );


        return {

            success: true,

            users:
                users.size,

            registered:
                registered.size,

            results:
                results.length,

            groups:
                statistics.size,

            deleted,

            saved

        };

    } catch (error) {

        console.error(
            "=========================================="
        );

        console.error(
            "GAGAL MEMBUAT STATISTIK"
        );

        console.error(
            error
        );

        console.error(
            "=========================================="
        );


        throw error;

    }

}


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default buatStatistik;