// ========================================
// Learn Burmese with Su
// lesson.js
// ========================================

// Get lesson number from URL
const params = new URLSearchParams(window.location.search);
const lessonId = parseInt(params.get("lesson")) || 1;

// Load lesson
const lesson = course[lessonId];

if (!lesson) {
    document.body.innerHTML = "<h1>Lesson not found.</h1>";
    throw new Error("Lesson not found");
}

// ---------------- Variables ----------------

let currentQuestion = 0;
let score = 0;

// ---------------- HTML Elements ----------------

const lessonTitle = document.getElementById("lessonTitle");
const questionCounter = document.getElementById("questionCounter");
const xpCounter = document.getElementById("xpCounter");

const progressFill = document.getElementById("progressFill");

const question = document.getElementById("question");
const answers = document.getElementById("answers");
const feedback = document.getElementById("feedback");

const nextButton = document.getElementById("nextButton");

const completeScreen = document.getElementById("completeScreen");
const scoreText = document.getElementById("scoreText");
const earnedXP = document.getElementById("earnedXP");
const learnedWords = document.getElementById("learnedWords");

// ---------------- Lesson Info ----------------

lessonTitle.textContent = lesson.title;
xpCounter.textContent = "⭐ " + lesson.xp + " XP";

// ---------------- Load Question ----------------

function loadQuestion() {

    const q = lesson.questions[currentQuestion];

    questionCounter.textContent =
        `Question ${currentQuestion + 1} / ${lesson.questions.length}`;

    progressFill.style.width =
        ((currentQuestion / lesson.questions.length) * 100) + "%";

    question.textContent = q.question;

    answers.innerHTML = "";

    feedback.innerHTML = "";

    nextButton.style.display = "none";

    q.choices.forEach((choice, index) => {

        const button = document.createElement("button");

        button.className = "answer-btn";

        button.textContent = choice;

        button.onclick = () => checkAnswer(index);

        answers.appendChild(button);

    });

}

// ---------------- Check Answer ----------------

function checkAnswer(selected) {

    const q = lesson.questions[currentQuestion];

    const buttons = document.querySelectorAll(".answer-btn");

    buttons.forEach(btn => btn.disabled = true);

    buttons[q.answer].classList.add("correct");

    if (selected === q.answer) {

        score++;

        feedback.innerHTML =
            `<p class="correct-text">✅ Correct!<br>${q.explanation}</p>`;

    } else {

        buttons[selected].classList.add("wrong");

        feedback.innerHTML =
            `<p class="wrong-text">❌ Incorrect.<br>${q.explanation}</p>`;

    }

    nextButton.style.display = "inline-block";

}

// ---------------- Next Question ----------------

nextButton.addEventListener("click", () => {

    currentQuestion++;

    if (currentQuestion < lesson.questions.length) {

        loadQuestion();

    } else {

        finishLesson();

    }

});

// ---------------- Finish Lesson ----------------

function finishLesson() {

    document.querySelector(".lesson-container").style.display = "none";

    completeScreen.style.display = "flex";

    const percentage =
        Math.round(score / lesson.questions.length * 100);

    const xp =
        Math.round((score / lesson.questions.length) * lesson.xp);

    scoreText.textContent = percentage + "%";

    earnedXP.textContent = xp + " XP";

    learnedWords.textContent = score;

    saveProgress(xp);

}

// ---------------- Save Progress ----------------

function saveProgress(xp) {

    let totalXP =
        parseInt(localStorage.getItem("xp")) || 0;

    totalXP += xp;

    localStorage.setItem("xp", totalXP);

    let unlocked =
        parseInt(localStorage.getItem("currentLesson")) || 1;

    if (lessonId >= unlocked) {

        localStorage.setItem(
            "currentLesson",
            lessonId + 1
        );

    }

}

// ---------------- Back Home ----------------

function goHome() {

    window.location.href = "index.html";

}

// ---------------- Start ----------------

loadQuestion();
