"use strict";

const progressKey = "learnBurmeseProgress";

const params = new URLSearchParams(window.location.search);
const lessonId = Number(params.get("lesson")) || 1;
const lesson = course[lessonId];

let currentQuestionIndex = 0;
let correctAnswers = 0;
let lessonXP = 0;
let answerSelected = false;

function getProgress() {
    const defaultProgress = {
        xp: 0,
        completedLessons: [],
        lessonScores: {},
        wordsReviewed: 0
    };

    try {
        const savedProgress = localStorage.getItem(progressKey);

        if (!savedProgress) {
            return defaultProgress;
        }

        return {
            ...defaultProgress,
            ...JSON.parse(savedProgress)
        };
    } catch (error) {
        console.error("Could not load progress:", error);
        return defaultProgress;
    }
}

function saveProgress(progress) {
    localStorage.setItem(
        progressKey,
        JSON.stringify(progress)
    );
}

function formatType(type = "practice") {
    return type
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}

function renderVocabularyList(words, elementId) {
    const container = document.getElementById(elementId);

    if (!words || words.length === 0) {
        container.innerHTML = `
            <p class="empty-message">
                No vocabulary added yet.
            </p>
        `;
        return;
    }

    container.innerHTML = words
        .map((word) => `
            <article class="vocabulary-item">

                <div>

                    <strong>
                        ${word.burmese}
                    </strong>

                    ${
                        word.script
                            ? `<span class="burmese-script">${word.script}</span>`
                            : ""
                    }

                </div>

                <span>
                    ${word.english}
                </span>

            </article>
        `)
        .join("");
}

function renderOverview() {
    if (!lesson) {
        document.getElementById("lessonOverview").innerHTML = `
            <div class="error-message">
                <h2>Lesson not found</h2>

                <p>
                    This lesson does not exist yet.
                </p>

                <a href="index.html" class="primary-button">
                    Return to course
                </a>
            </div>
        `;

        return;
    }

    document.title =
        `${lesson.title} | Learn Burmese with Su`;

    document.getElementById("lessonUnit").textContent =
        `UNIT ${lesson.unit || 1}`;

    document.getElementById("overviewTitle").textContent =
        `Lesson ${lessonId}: ${lesson.title}`;

    document.getElementById("overviewDescription").textContent =
        lesson.description ||
        "Review vocabulary and practise what you learned in class.";

    document.getElementById("lessonLevel").textContent =
        lesson.level || "Beginner";

    document.getElementById("estimatedTime").textContent =
        lesson.estimatedTime || "5 minutes";

    document.getElementById("coreWordCount").textContent =
        `${lesson.coreVocabulary?.length || 0} words`;

    document.getElementById("bonusWordCount").textContent =
        `${lesson.bonusVocabulary?.length || 0} words`;

    document.getElementById("exerciseCount").textContent =
        `${lesson.questions?.length || 0} exercises`;

    document.getElementById("objectiveList").innerHTML =
        (lesson.objectives || [])
            .map((objective) => `
                <li>
                    <span>✓</span>
                    ${objective}
                </li>
            `)
            .join("");

    renderVocabularyList(
        lesson.coreVocabulary,
        "coreVocabularyList"
    );

    renderVocabularyList(
        lesson.bonusVocabulary,
        "bonusVocabularyList"
    );
}

function startPractice() {
    currentQuestionIndex = 0;
    correctAnswers = 0;
    lessonXP = 0;
    answerSelected = false;

    document
        .getElementById("lessonOverview")
        .classList.add("hidden");

    document
        .getElementById("practiceScreen")
        .classList.remove("hidden");

    document.getElementById("lessonTitle").textContent =
        `Lesson ${lessonId}: ${lesson.title}`;

    document.getElementById("lessonSubtitle").textContent =
        lesson.description || "Vocabulary revision";

    showQuestion();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function showQuestion() {
    answerSelected = false;

    const questionData =
        lesson.questions[currentQuestionIndex];

    const questionNumber =
        currentQuestionIndex + 1;

    const totalQuestions =
        lesson.questions.length;

    const progressPercentage =
        (currentQuestionIndex / totalQuestions) * 100;

    document.getElementById("progressFill").style.width =
        `${progressPercentage}%`;

    document.getElementById("questionCounter").textContent =
        `Exercise ${questionNumber} / ${totalQuestions}`;

    document.getElementById("xpCounter").textContent =
        `⭐ ${lessonXP} XP`;

    document.getElementById("questionType").textContent =
        formatType(questionData.type);

    document.getElementById("questionDifficulty").textContent =
        formatType(questionData.difficulty || "easy");

    document.getElementById("question").textContent =
        questionData.question;

    document.getElementById("questionInstruction").textContent =
        questionData.instruction || "Choose the best answer.";

    document.getElementById("feedback").innerHTML = "";
    document.getElementById("feedback").className =
        "feedback-box";

    document
        .getElementById("nextButton")
        .classList.add("hidden");

    const answersContainer =
        document.getElementById("answers");

    answersContainer.innerHTML = "";

    questionData.choices.forEach(
        (choice, choiceIndex) => {

            const button =
                document.createElement("button");

            button.className = "answer-button";

            button.innerHTML = `
                <span class="answer-letter">
                    ${String.fromCharCode(65 + choiceIndex)}
                </span>

                <span>
                    ${choice}
                </span>
            `;

            button.addEventListener("click", () => {
                checkAnswer(
                    choiceIndex,
                    button,
                    questionData
                );
            });

            answersContainer.appendChild(button);
        }
    );
}

function checkAnswer(
    selectedIndex,
    selectedButton,
    questionData
) {
    if (answerSelected) {
        return;
    }

    answerSelected = true;

    const answerButtons =
        document.querySelectorAll(".answer-button");

    answerButtons.forEach((button) => {
        button.disabled = true;
    });

    const correctIndex = questionData.answer;
    const isCorrect = selectedIndex === correctIndex;

    answerButtons[correctIndex]
        .classList.add("correct-answer");

    const feedback =
        document.getElementById("feedback");

    if (isCorrect) {
        selectedButton.classList.add("correct-answer");

        correctAnswers += 1;
        lessonXP += 10;

        feedback.classList.add("feedback-correct");

        feedback.innerHTML = `
            <strong>Correct!</strong>

            <p>
                ${questionData.explanation}
            </p>
        `;
    } else {
        selectedButton.classList.add("wrong-answer");

        feedback.classList.add("feedback-wrong");

        feedback.innerHTML = `
            <strong>Not quite.</strong>

            <p>
                ${questionData.explanation}
            </p>
        `;
    }

    document.getElementById("xpCounter").textContent =
        `⭐ ${lessonXP} XP`;

    const nextButton =
        document.getElementById("nextButton");

    nextButton.textContent =
        currentQuestionIndex === lesson.questions.length - 1
            ? "Finish Lesson →"
            : "Next Exercise →";

    nextButton.classList.remove("hidden");
}

function nextQuestion() {
    if (!answerSelected) {
        return;
    }

    currentQuestionIndex += 1;

    if (currentQuestionIndex < lesson.questions.length) {
        showQuestion();
        return;
    }

    completeLesson();
}

function completeLesson() {
    document.getElementById("progressFill").style.width =
        "100%";

    const score = Math.round(
        (correctAnswers / lesson.questions.length) * 100
    );

    const progress = getProgress();

    const firstCompletion =
        !progress.completedLessons.includes(lessonId);

    if (firstCompletion) {
        progress.completedLessons.push(lessonId);

        progress.wordsReviewed +=
            (lesson.coreVocabulary?.length || 0) +
            (lesson.bonusVocabulary?.length || 0);
    }

    const previousScore =
        progress.lessonScores[lessonId] || 0;

    progress.lessonScores[lessonId] =
        Math.max(previousScore, score);

    progress.xp += lessonXP;

    saveProgress(progress);

    document
        .getElementById("practiceScreen")
        .classList.add("hidden");

    document
        .getElementById("completeScreen")
        .classList.remove("hidden");

    document.getElementById("scoreText").textContent =
        `${score}%`;

    document.getElementById("earnedXP").textContent =
        `${lessonXP} XP`;

    document.getElementById("learnedWords").textContent =
        lesson.coreVocabulary?.length || 0;

    document.getElementById("newWordsLearned").textContent =
        lesson.bonusVocabulary?.length || 0;

    const completionTitle =
        document.getElementById("completionTitle");

    const completionMessage =
        document.getElementById("completionMessage");

    if (score >= 90) {
        completionTitle.textContent = "Excellent work!";
        completionMessage.textContent =
            "You remembered the lesson vocabulary very well.";
    } else if (score >= 70) {
        completionTitle.textContent = "Good progress!";
        completionMessage.textContent =
            "Review the vocabulary once more to strengthen your recall.";
    } else {
        completionTitle.textContent = "Keep practising!";
        completionMessage.textContent =
            "Return to the vocabulary list and try the lesson again.";
    }

    renderCompletionBonusWords();
    configureNextLessonButton();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function renderCompletionBonusWords() {
    const container =
        document.getElementById("completionBonusWords");

    if (!lesson.bonusVocabulary?.length) {
        container.innerHTML = `
            <p class="empty-message">
                No bonus vocabulary in this lesson.
            </p>
        `;
        return;
    }

    container.innerHTML = lesson.bonusVocabulary
        .map((word) => `
            <div class="completion-word">

                <strong>
                    ${word.burmese}
                </strong>

                <span>
                    ${word.english}
                </span>

            </div>
        `)
        .join("");
}

function configureNextLessonButton() {
    const lessonIds = Object.keys(course)
        .map(Number)
        .sort((a, b) => a - b);

    const currentPosition =
        lessonIds.indexOf(lessonId);

    const nextLessonId =
        lessonIds[currentPosition + 1];

    const nextButton =
        document.getElementById("nextLessonButton");

    if (nextLessonId) {
        nextButton.textContent =
            `Next: ${course[nextLessonId].title} →`;

        nextButton.onclick = () => {
            window.location.href =
                `lesson.html?lesson=${nextLessonId}`;
        };
    } else {
        nextButton.textContent = "Return to Course →";

        nextButton.onclick = () => {
            window.location.href = "index.html";
        };
    }
}

function restartLesson() {
    document
        .getElementById("completeScreen")
        .classList.add("hidden");

    startPractice();
}

function returnToOverview() {
    const confirmed = window.confirm(
        "Return to the lesson overview? Your current attempt will not be saved."
    );

    if (!confirmed) {
        return;
    }

    document
        .getElementById("practiceScreen")
        .classList.add("hidden");

    document
        .getElementById("lessonOverview")
        .classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function initialiseLesson() {
    renderOverview();

    const startButton =
        document.getElementById("startPracticeButton");

    const nextButton =
        document.getElementById("nextButton");

    if (startButton) {
        startButton.addEventListener(
            "click",
            startPractice
        );
    }

    if (nextButton) {
        nextButton.addEventListener(
            "click",
            nextQuestion
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    initialiseLesson
);
