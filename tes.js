/* =========================================================
   AUTH
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
    getDoc,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   STORAGE
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
} from "./firebase-config.js";


/* =========================================================
   FIRESTORE LOCAL INSTANCE
========================================================= */

const firestore = getFirestore(app);


/* =========================================================
   ELEMENT
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

const topUserClass =
    document.getElementById("topUserClass");

const jenisKelamin =
    document.getElementById("jenisKelamin");

const handEye =
    document.getElementById("handEye");

const sitUp =
    document.getElementById("sitUp");

const broadJump1 =
    document.getElementById("broadJump1");

const broadJump2 =
    document.getElementById("broadJump2");

const tTest1 =
    document.getElementById("tTest1");

const tTest2 =
    document.getElementById("tTest2");

const beepLevel =
    document.getElementById("beepLevel");

const beepShuttle =
    document.getElementById("beepShuttle");

const saveAllTests =
    document.getElementById("saveAllTests");

const message =
    document.getElementById("message");


/* =========================================================
   STATE
========================================================= */

let submissionAlreadyExists = false;


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(text, type = "") {

    if (!message) {
        return;
    }

    message.textContent = text;

    message.className =
        `message ${type}`;
}


/* =========================================================
   NUMBER
========================================================= */

function toNumber(value) {

    if (
        value === "" ||
        value === null ||
        value === undefined
    ) {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}


/* =========================================================
   LOCK FORM
========================================================= */

function lockForm() {

    submissionAlreadyExists = true;

    const fields = [
        jenisKelamin,
        handEye,
        sitUp,
        broadJump1,
        broadJump2,
        tTest1,
        tTest2,
        beepLevel,
        beepShuttle
    ];

    fields.forEach((field) => {

        if (field) {
            field.disabled = true;
        }

    });


    if (saveAllTests) {

        saveAllTests.disabled = true;

        saveAllTests.textContent =
            "✓ Hasil Sudah Dikirim";

        saveAllTests.style.opacity =
            "0.65";

        saveAllTests.style.cursor =
            "not-allowed";
    }

}


/* =========================================================
   CEK SUBMISSION
========================================================= */

async function checkSubmissionStatus(user) {

    try {

        const submissionRef =
            doc(
                firestore,
                "tesPengajuan",
                user.uid
            );


        const submissionSnap =
            await getDoc(
                submissionRef
            );


        if (submissionSnap.exists()) {

            lockForm();

            showMessage(
                "Hasil tes sudah pernah dikirim dan tidak dapat diubah.",
                "success"
            );

            return true;
        }


        return false;

    } catch (error) {

        console.error(
            "Gagal mengecek status tes:",
            error
        );

        showMessage(
            "Gagal mengecek status pengisian tes.",
            "error"
        );

        return false;
    }

}


/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadProfile(user) {

    try {

        const userRef =
            doc(
                firestore,
                "users",
                user.uid
            );


        const userSnap =
            await getDoc(
                userRef
            );


        if (!userSnap.exists()) {

            window.location.href =
                "index.html";

            return false;
        }


        const data =
            userSnap.data();


        /* =====================================================
           ROLE DATABASE

           Firebase tetap menggunakan role "siswa".
           Tampilan kepada pengguna menggunakan istilah "murid".
        ===================================================== */

        const role =
            String(
                data.role || ""
            )
                .trim()
                .toLowerCase();


        if (role !== "siswa") {

            await signOut(auth);

            window.location.href =
                "index.html";

            return false;
        }


        /* =====================================================
           NAMA DAN KELAS
        ===================================================== */

        if (topUserName) {

            topUserName.textContent =
                data.nama ||
                user.displayName ||
                "Murid";
        }


        if (topUserClass) {

            topUserClass.textContent =
                data.kelas ||
                "-";
        }


        /* =====================================================
           FOTO PROFIL
        ===================================================== */

        try {

            const photoRef =
                ref(
                    storage,
                    `profile/${user.uid}/profile.jpg`
                );


            const photoURL =
                await getDownloadURL(
                    photoRef
                );


            if (topProfilePhoto) {

                topProfilePhoto.src =
                    photoURL;

                topProfilePhoto.style.display =
                    "block";
            }


            if (topProfilePlaceholder) {

                topProfilePlaceholder.style.display =
                    "none";
            }

        } catch (error) {

            if (topProfilePhoto) {

                topProfilePhoto.style.display =
                    "none";
            }


            if (topProfilePlaceholder) {

                topProfilePlaceholder.style.display =
                    "flex";
            }

        }


        return true;

    } catch (error) {

        console.error(
            "Gagal memuat profil:",
            error
        );

        showMessage(
            "Gagal memuat data profil.",
            "error"
        );

        return false;
    }

}


/* =========================================================
   VALIDASI FORM
========================================================= */

function validateForm() {

    /* =========================
       JENIS KELAMIN
    ========================== */

    if (!jenisKelamin.value) {

        showMessage(
            "Silakan pilih jenis kelamin terlebih dahulu.",
            "error"
        );

        jenisKelamin.focus();

        return false;
    }


    /* =========================
       HAND & EYE
    ========================== */

    const handEyeValue =
        toNumber(
            handEye.value
        );


    if (
        handEyeValue === null ||
        handEyeValue < 0
    ) {

        showMessage(
            "Hasil Hand & Eye belum diisi.",
            "error"
        );

        handEye.focus();

        return false;
    }


    /* =========================
       SIT UP
    ========================== */

    const sitUpValue =
        toNumber(
            sitUp.value
        );


    if (
        sitUpValue === null ||
        sitUpValue < 0
    ) {

        showMessage(
            "Hasil Sit Up belum diisi.",
            "error"
        );

        sitUp.focus();

        return false;
    }


    /* =========================
       BROAD JUMP
    ========================== */

    const jump1 =
        toNumber(
            broadJump1.value
        );


    const jump2 =
        toNumber(
            broadJump2.value
        );


    if (
        jump1 === null &&
        jump2 === null
    ) {

        showMessage(
            "Minimal isi satu hasil Standing Broad Jump.",
            "error"
        );

        broadJump1.focus();

        return false;
    }


    if (
        jump1 !== null &&
        jump1 < 0
    ) {

        showMessage(
            "Hasil Standing Broad Jump tidak boleh negatif.",
            "error"
        );

        broadJump1.focus();

        return false;
    }


    if (
        jump2 !== null &&
        jump2 < 0
    ) {

        showMessage(
            "Hasil Standing Broad Jump tidak boleh negatif.",
            "error"
        );

        broadJump2.focus();

        return false;
    }


    /* =========================
       T TEST
    ========================== */

    const t1 =
        toNumber(
            tTest1.value
        );


    const t2 =
        toNumber(
            tTest2.value
        );


    if (
        t1 === null &&
        t2 === null
    ) {

        showMessage(
            "Minimal isi satu hasil T Test.",
            "error"
        );

        tTest1.focus();

        return false;
    }


    if (
        t1 !== null &&
        t1 <= 0
    ) {

        showMessage(
            "Waktu T Test harus lebih dari 0 detik.",
            "error"
        );

        tTest1.focus();

        return false;
    }


    if (
        t2 !== null &&
        t2 <= 0
    ) {

        showMessage(
            "Waktu T Test harus lebih dari 0 detik.",
            "error"
        );

        tTest2.focus();

        return false;
    }


    /* =========================
       BEEP TEST
    ========================== */

    const level =
        toNumber(
            beepLevel.value
        );


    const shuttle =
        toNumber(
            beepShuttle.value
        );


    if (
        level === null ||
        shuttle === null
    ) {

        showMessage(
            "Level dan balikan Beep Test harus diisi.",
            "error"
        );

        beepLevel.focus();

        return false;
    }


    if (
        level < 1 ||
        !Number.isInteger(level)
    ) {

        showMessage(
            "Level Beep Test harus berupa bilangan bulat minimal 1.",
            "error"
        );

        beepLevel.focus();

        return false;
    }


    if (
        shuttle < 1 ||
        !Number.isInteger(shuttle)
    ) {

        showMessage(
            "Balikan Beep Test harus berupa bilangan bulat minimal 1.",
            "error"
        );

        beepShuttle.focus();

        return false;
    }


    return true;
}


/* =========================================================
   HAND & EYE SCORE
========================================================= */

function scoreHandEye(
    value,
    gender
) {

    if (gender === "putra") {

        if (value >= 21) {

            return {
                skor: 5,
                kategori: "Baik Sekali"
            };

        }

        if (value >= 15) {

            return {
                skor: 4,
                kategori: "Baik"
            };

        }

        if (value >= 9) {

            return {
                skor: 3,
                kategori: "Sedang"
            };

        }

        if (value >= 4) {

            return {
                skor: 2,
                kategori: "Kurang"
            };

        }

        return {
            skor: 1,
            kategori: "Kurang Sekali"
        };
    }


    if (value >= 14) {

        return {
            skor: 5,
            kategori: "Baik Sekali"
        };

    }

    if (value >= 8) {

        return {
            skor: 4,
            kategori: "Baik"
        };

    }

    if (value >= 4) {

        return {
            skor: 3,
            kategori: "Sedang"
        };

    }

    if (value >= 1) {

        return {
            skor: 2,
            kategori: "Kurang"
        };

    }

    return {
        skor: 1,
        kategori: "Kurang Sekali"
    };

}


/* =========================================================
   SIT UP SCORE
========================================================= */

function scoreSitUp(
    value,
    gender
) {

    if (gender === "putra") {

        if (value >= 30) {

            return {
                skor: 5,
                kategori: "Baik Sekali"
            };

        }

        if (value >= 21) {

            return {
                skor: 4,
                kategori: "Baik"
            };

        }

        if (value >= 18) {

            return {
                skor: 3,
                kategori: "Sedang"
            };

        }

        if (value >= 9) {

            return {
                skor: 2,
                kategori: "Kurang"
            };

        }

        return {
            skor: 1,
            kategori: "Kurang Sekali"
        };
    }


    if (value >= 24) {

        return {
            skor: 5,
            kategori: "Baik Sekali"
        };

    }

    if (value >= 18) {

        return {
            skor: 4,
            kategori: "Baik"
        };

    }

    if (value >= 12) {

        return {
            skor: 3,
            kategori: "Sedang"
        };

    }

    if (value >= 6) {

        return {
            skor: 2,
            kategori: "Kurang"
        };

    }

    return {
        skor: 1,
        kategori: "Kurang Sekali"
    };

}


/* =========================================================
   STANDING BROAD JUMP SCORE
========================================================= */

function scoreBroadJump(
    value,
    gender
) {

    if (gender === "putra") {

        if (value >= 224) {

            return {
                skor: 5,
                kategori: "Baik Sekali"
            };

        }

        if (value >= 195) {

            return {
                skor: 4,
                kategori: "Baik"
            };

        }

        if (value >= 165) {

            return {
                skor: 3,
                kategori: "Sedang"
            };

        }

        if (value >= 136) {

            return {
                skor: 2,
                kategori: "Kurang"
            };

        }

        return {
            skor: 1,
            kategori: "Kurang Sekali"
        };
    }


    if (value >= 178) {

        return {
            skor: 5,
            kategori: "Baik Sekali"
        };

    }

    if (value >= 153) {

        return {
            skor: 4,
            kategori: "Baik"
        };

    }

    if (value >= 129) {

        return {
            skor: 3,
            kategori: "Sedang"
        };

    }

    if (value >= 104) {

        return {
            skor: 2,
            kategori: "Kurang"
        };

    }

    return {
        skor: 1,
        kategori: "Kurang Sekali"
    };

}


/* =========================================================
   T TEST SCORE
========================================================= */

function scoreTTest(
    value,
    gender
) {

    if (gender === "putra") {

        if (value <= 10.00) {

            return {
                skor: 5,
                kategori: "Baik Sekali"
            };

        }

        if (value <= 12.37) {

            return {
                skor: 4,
                kategori: "Baik"
            };

        }

        if (value <= 13.17) {

            return {
                skor: 3,
                kategori: "Sedang"
            };

        }

        if (value <= 14.75) {

            return {
                skor: 2,
                kategori: "Kurang"
            };

        }

        return {
            skor: 1,
            kategori: "Kurang Sekali"
        };
    }


    if (value <= 11.83) {

        return {
            skor: 5,
            kategori: "Baik Sekali"
        };

    }

    if (value <= 13.64) {

        return {
            skor: 4,
            kategori: "Baik"
        };

    }

    if (value <= 15.46) {

        return {
            skor: 3,
            kategori: "Sedang"
        };

    }

    if (value <= 17.29) {

        return {
            skor: 2,
            kategori: "Kurang"
        };

    }

    return {
        skor: 1,
        kategori: "Kurang Sekali"
    };

}


/* =========================================================
   BEEP LEVEL COMPARISON
========================================================= */

function compareLevelShuttle(
    level,
    shuttle,
    targetLevel,
    targetShuttle
) {

    if (level > targetLevel) {
        return true;
    }


    if (
        level === targetLevel &&
        shuttle >= targetShuttle
    ) {
        return true;
    }


    return false;
}


/* =========================================================
   BEEP TEST SCORE
========================================================= */

function scoreBeepTest(
    level,
    shuttle,
    gender
) {

    /* =====================================================
       PUTRA
    ====================================================== */

    if (gender === "putra") {

        /* =========================
           SKOR 5
           > L7 B7
        ========================== */

        if (
            level > 7 ||
            (
                level === 7 &&
                shuttle > 7
            )
        ) {

            return {
                skor: 5,
                kategori: "Baik Sekali"
            };
        }


        /* =========================
           SKOR 4
           L4 B4 - L7 B7
        ========================== */

        if (
            compareLevelShuttle(
                level,
                shuttle,
                4,
                4
            ) &&
            (
                level < 7 ||
                (
                    level === 7 &&
                    shuttle <= 7
                )
            )
        ) {

            return {
                skor: 4,
                kategori: "Baik"
            };
        }


        /* =========================
           SKOR 3
           L2 B2 - L4 B3
        ========================== */

        if (
            compareLevelShuttle(
                level,
                shuttle,
                2,
                2
            ) &&
            (
                level < 4 ||
                (
                    level === 4 &&
                    shuttle <= 3
                )
            )
        ) {

            return {
                skor: 3,
                kategori: "Sedang"
            };
        }


        /* =========================
           SKOR 2
           L1 B2 - L2 B1
        ========================== */

        if (
            compareLevelShuttle(
                level,
                shuttle,
                1,
                2
            ) &&
            (
                level < 2 ||
                (
                    level === 2 &&
                    shuttle <= 1
                )
            )
        ) {

            return {
                skor: 2,
                kategori: "Kurang"
            };
        }


        return {
            skor: 1,
            kategori: "Kurang Sekali"
        };
    }


    /* =====================================================
       PUTRI
    ====================================================== */

    /* =========================
       SKOR 5
       > L4 B5
    ========================== */

    if (
        level > 4 ||
        (
            level === 4 &&
            shuttle > 5
        )
    ) {

        return {
            skor: 5,
            kategori: "Baik Sekali"
        };
    }


    /* =========================
       SKOR 4
       L3 B3 - L4 B5
    ========================== */

    if (
        compareLevelShuttle(
            level,
            shuttle,
            3,
            3
        ) &&
        (
            level < 4 ||
            (
                level === 4 &&
                shuttle <= 5
            )
        )
    ) {

        return {
            skor: 4,
            kategori: "Baik"
        };
    }


    /* =========================
       SKOR 3
       L2 B1 - L3 B2
    ========================== */

    if (
        compareLevelShuttle(
            level,
            shuttle,
            2,
            1
        ) &&
        (
            level < 3 ||
            (
                level === 3 &&
                shuttle <= 2
            )
        )
    ) {

        return {
            skor: 3,
            kategori: "Sedang"
        };
    }


    /* =========================
       SKOR 2
       L1 B2 - L1 B7
    ========================== */

    if (
        level === 1 &&
        shuttle >= 2 &&
        shuttle <= 7
    ) {

        return {
            skor: 2,
            kategori: "Kurang"
        };
    }


    return {
        skor: 1,
        kategori: "Kurang Sekali"
    };
}


/* =========================================================
   SAVE ALL RESULTS
========================================================= */

async function saveAllResults(user) {

    if (submissionAlreadyExists) {

        showMessage(
            "Hasil tes sudah pernah dikirim dan tidak dapat diubah.",
            "error"
        );

        return;
    }


    if (!validateForm()) {
        return;
    }


    const gender =
        jenisKelamin.value;


    const handEyeValue =
        toNumber(
            handEye.value
        );


    const sitUpValue =
        toNumber(
            sitUp.value
        );


    const jump1 =
        toNumber(
            broadJump1.value
        );


    const jump2 =
        toNumber(
            broadJump2.value
        );


    /* =====================================================
       BROAD JUMP
       HASIL TERJAUH
    ====================================================== */

    const broadJumpValue =
        jump1 !== null &&
        jump2 !== null
            ? Math.max(
                jump1,
                jump2
            )
            : (
                jump1 ??
                jump2
            );


    /* =====================================================
       T TEST
       WAKTU TERCEPAT
    ====================================================== */

    const t1 =
        toNumber(
            tTest1.value
        );


    const t2 =
        toNumber(
            tTest2.value
        );


    const tTestValue =
        t1 !== null &&
        t2 !== null
            ? Math.min(
                t1,
                t2
            )
            : (
                t1 ??
                t2
            );


    /* =====================================================
       BEEP TEST
    ====================================================== */

    const level =
        toNumber(
            beepLevel.value
        );


    const shuttle =
        toNumber(
            beepShuttle.value
        );


    /* =====================================================
       HITUNG SKOR
    ====================================================== */

    const handEyeScore =
        scoreHandEye(
            handEyeValue,
            gender
        );


    const sitUpScore =
        scoreSitUp(
            sitUpValue,
            gender
        );


    const broadJumpScore =
        scoreBroadJump(
            broadJumpValue,
            gender
        );


    const tTestScore =
        scoreTTest(
            tTestValue,
            gender
        );


    const beepScore =
        scoreBeepTest(
            level,
            shuttle,
            gender
        );


    /* =====================================================
       UI LOCK SAAT MENYIMPAN
    ====================================================== */

    saveAllTests.disabled =
        true;

    saveAllTests.textContent =
        "Menyimpan hasil...";


    showMessage(
        "Hasil sedang disimpan. Mohon tunggu...",
        ""
    );


    try {

        await runTransaction(
            firestore,
            async (transaction) => {

                /* =================================================
                   PENGUNCI SUBMIT
                ================================================== */

                const submissionRef =
                    doc(
                        firestore,
                        "tesPengajuan",
                        user.uid
                    );


                const submissionSnap =
                    await transaction.get(
                        submissionRef
                    );


                if (
                    submissionSnap.exists()
                ) {

                    throw new Error(
                        "ALREADY_SUBMITTED"
                    );
                }


                transaction.set(
                    submissionRef,
                    {
                        uid:
                            user.uid,

                        jenisKelamin:
                            gender,

                        status:
                            "tersimpan",

                        submittedAt:
                            serverTimestamp()
                    }
                );


                /* =================================================
                   HAND & EYE
                ================================================== */

                const handEyeRef =
                    doc(
                        firestore,
                        "hasilTes",
                        `${user.uid}_handeye`
                    );


                transaction.set(
                    handEyeRef,
                    {
                        uid:
                            user.uid,

                        jenisTes:
                            "handeye",

                        namaTes:
                            "Hand & Eye Coordination",

                        jenisKelamin:
                            gender,

                        hasil:
                            `${handEyeValue} x`,

                        hasilAngka:
                            handEyeValue,

                        skor:
                            handEyeScore.skor,

                        kategori:
                            handEyeScore.kategori,

                        status:
                            "tersimpan",

                        submittedAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()
                    }
                );


                /* =================================================
                   SIT UP
                ================================================== */

                const sitUpRef =
                    doc(
                        firestore,
                        "hasilTes",
                        `${user.uid}_situp`
                    );


                transaction.set(
                    sitUpRef,
                    {
                        uid:
                            user.uid,

                        jenisTes:
                            "situp",

                        namaTes:
                            "Sit Up",

                        jenisKelamin:
                            gender,

                        hasil:
                            `${sitUpValue} x`,

                        hasilAngka:
                            sitUpValue,

                        skor:
                            sitUpScore.skor,

                        kategori:
                            sitUpScore.kategori,

                        status:
                            "tersimpan",

                        submittedAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()
                    }
                );


                /* =================================================
                   STANDING BROAD JUMP
                ================================================== */

                const broadJumpRef =
                    doc(
                        firestore,
                        "hasilTes",
                        `${user.uid}_standingbroadjump`
                    );


                transaction.set(
                    broadJumpRef,
                    {
                        uid:
                            user.uid,

                        jenisTes:
                            "standingbroadjump",

                        namaTes:
                            "Standing Broad Jump",

                        jenisKelamin:
                            gender,

                        hasil:
                            `${broadJumpValue} cm`,

                        hasilAngka:
                            broadJumpValue,

                        percobaan1:
                            jump1,

                        percobaan2:
                            jump2,

                        skor:
                            broadJumpScore.skor,

                        kategori:
                            broadJumpScore.kategori,

                        status:
                            "tersimpan",

                        submittedAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()
                    }
                );


                /* =================================================
                   T TEST
                ================================================== */

                const tTestRef =
                    doc(
                        firestore,
                        "hasilTes",
                        `${user.uid}_ttest`
                    );


                transaction.set(
                    tTestRef,
                    {
                        uid:
                            user.uid,

                        jenisTes:
                            "ttest",

                        namaTes:
                            "T Test",

                        jenisKelamin:
                            gender,

                        hasil:
                            `${tTestValue.toFixed(2)} detik`,

                        hasilAngka:
                            tTestValue,

                        percobaan1:
                            t1,

                        percobaan2:
                            t2,

                        skor:
                            tTestScore.skor,

                        kategori:
                            tTestScore.kategori,

                        status:
                            "tersimpan",

                        submittedAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()
                    }
                );


                /* =================================================
                   BEEP TEST
                ================================================== */

                const beepRef =
                    doc(
                        firestore,
                        "hasilTes",
                        `${user.uid}_beeptest`
                    );


                transaction.set(
                    beepRef,
                    {
                        uid:
                            user.uid,

                        jenisTes:
                            "beeptest",

                        namaTes:
                            "Beep Test",

                        jenisKelamin:
                            gender,

                        hasil:
                            `Level ${level} - Balikan ${shuttle}`,

                        level:
                            level,

                        balikan:
                            shuttle,

                        skor:
                            beepScore.skor,

                        kategori:
                            beepScore.kategori,

                        status:
                            "tersimpan",

                        submittedAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()
                    }
                );

            }
        );


        /* =====================================================
           BERHASIL
        ====================================================== */

        lockForm();

        showMessage(
            "Hasil tes berhasil disimpan. Terima kasih sudah bersikap sportif dan jujur.",
            "success"
        );


    } catch (error) {

        console.error(
            "Gagal menyimpan hasil:",
            error
        );


        /* =====================================================
           SUDAH PERNAH SUBMIT
        ====================================================== */

        if (
            error.message ===
            "ALREADY_SUBMITTED"
        ) {

            lockForm();

            showMessage(
                "Hasil tes sudah pernah dikirim dan tidak dapat diubah.",
                "error"
            );

            return;
        }


        /* =====================================================
           ERROR FIREBASE
        ====================================================== */

        submissionAlreadyExists =
            false;

        saveAllTests.disabled =
            false;

        saveAllTests.textContent =
            "💾 Simpan Semua Hasil";


        showMessage(
            "Hasil gagal disimpan. Silakan coba lagi.",
            "error"
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

}


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


if (menuButton) {

    menuButton.addEventListener(
        "click",
        () => {

            if (
                sidebar &&
                sidebar.classList.contains("active")
            ) {

                closeSidebar();

            } else {

                openSidebar();

            }

        }
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        () => {

            closeSidebar();

        }
    );

}


/* =========================================================
   CLOSE SIDEBAR WHEN MENU CLICKED
========================================================= */

document
    .querySelectorAll(".menu-item")
    .forEach((item) => {

        item.addEventListener(
            "click",
            () => {

                closeSidebar();

            }
        );

    });


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
                    "index.html";

            } catch (error) {

                console.error(
                    "Logout gagal:",
                    error
                );

                showMessage(
                    "Logout gagal.",
                    "error"
                );
            }

        }
    );

}


/* =========================================================
   SAVE BUTTON
========================================================= */

if (saveAllTests) {

    saveAllTests.addEventListener(
        "click",
        async () => {

            const user =
                auth.currentUser;


            if (!user) {

                window.location.href =
                    "index.html";

                return;
            }


            await saveAllResults(
                user
            );

        }
    );

}


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        const profileLoaded =
            await loadProfile(
                user
            );


        if (!profileLoaded) {
            return;
        }


        await checkSubmissionStatus(
            user
        );

    }
);
