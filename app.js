"use strict";

const progressKey = "learnBurmeseProgress";

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
    localStorage.setItem(progressKey, JSON.stringify(progress));
}

function getLessonIds() {
    return Object.keys(course)
        .map(Number)
        .sort((a, b) => a - b);
}

function getCourseUnits() {
    const units = {};

    getLessonIds().forEach((lessonId) => {
        const lesson = course[lessonId];
        const unitNumber = lesson.unit || 1;

        if (!units[unitNumber]) {
            units[unitNumber] = {
                number: unitNumber,
                title: lesson.unitTitle || `Unit ${unitNumber}`,
                description: lesson.unitDescription || "",
                lessons: []
            };
        }

        units[unitNumber].lessons.push({
            id: lessonId,
            ...lesson
        });
    });

    return Object.values(units).sort(
        (a, b) => a.number - b.number
    );
}

function isLessonUnlocked(lessonId, progress) {
    if (lessonId === 1) {
        return true;
    }

    return progress.completedLessons.includes(lessonId - 1);
}

function getNextLesson(progress) {
    const lessonIds = getLessonIds();

    const incompleteLesson = lessonIds.find(
        (lessonId) =>
            !progress.completedLessons.includes(lessonId) &&
            isLessonUnlocked(lessonId, progress)
    );

    if (incompleteLesson) {
        return incompleteLesson;
    }

    return lessonIds[0];
}

function countCourseWords() {
    return getLessonIds().reduce((total, lessonId) => {
        const lesson = course[lessonId];

        return total +
            (lesson.coreVocabulary?.length || 0) +
            (lesson.bonusVocabulary?.length || 0);
    }, 0);
}

function renderCourseStatistics() {
    const progress = getProgress();
    const lessonIds = getLessonIds();
    const completedCount = progress.completedLessons.length;

    const percentage = lessonIds.length
        ? Math.round((completedCount / lessonIds.length) * 100)
        : 0;

    document.getElementById("courseLessonCount").textContent =
        lessonIds.length;

    document.getElementById("courseWordCount").textContent =
        countCourseWords();

    document.getElementById("courseUnitCount").textContent =
        getCourseUnits().length;

    document.getElementById("completedLessons").textContent =
        completedCount;

    document.getElementById("xp").textContent =
        progress.xp || 0;

    document.getElementById("words").textContent =
        progress.wordsReviewed || 0;

    document.getElementById("overallProgressText").textContent =
        `${percentage}%`;

    document.getElementById("overallProgressFill").style.width =
        `${percentage}%`;
}

function renderContinueCard() {
    const progress = getProgress();
    const nextLessonId = getNextLesson(progress);
    const lesson = course[nextLessonId];

    const hasCompletedLessons =
        progress.completedLessons.length > 0;

    const actionText = hasCompletedLessons
        ? "Continue"
        : "Start Course";

    const statusText = progress.completedLessons.includes(nextLessonId)
        ? "Review lesson"
        : `Next lesson · Unit ${lesson.unit}`;

    const container = document.getElementById("continueCard");

    container.innerHTML = `
        <div class="continue-card-content">

            <div class="continue-icon">
                ${lesson.icon || "📖"}
            </div>

            <div>
                <span class="continue-status">
                    ${statusText}
                </span>

                <h3>
                    Lesson ${nextLessonId}: ${lesson.title}
                </h3>

                <p>
                    ${lesson.description || "Vocabulary revision and practice."}
                </p>

                <div class="lesson-metadata">

                    <span>
                        📚 ${lesson.coreVocabulary?.length || 0} core words
                    </span>

                    <span>
                        ⭐ ${lesson.bonusVocabulary?.length || 0} bonus words
                    </span>

                    <span>
                        ⏱️ ${lesson.estimatedTime || "5 minutes"}
                    </span>

                </div>
            </div>

        </div>

        <a
            href="lesson.html?lesson=${nextLessonId}"
            class="primary-button"
        >
            ${actionText} →
        </a>
    `;
}

function renderLessonCard(lesson, progress) {
    const completed =
        progress.completedLessons.includes(lesson.id);

    const unlocked =
        isLessonUnlocked(lesson.id, progress);

    const score =
        progress.lessonScores?.[lesson.id];

    let statusClass = "lesson-card-available";
    let statusText = "Available";

    if (completed) {
        statusClass = "lesson-card-completed";
        statusText = "Completed";
    } else if (!unlocked) {
        statusClass = "lesson-card-locked";
        statusText = "Locked";
    }

    const buttonText = completed
        ? "Review"
        : unlocked
            ? "Start"
            : "Locked";

    const buttonMarkup = unlocked
        ? `
            <a
                href="lesson.html?lesson=${lesson.id}"
                class="lesson-action-button"
            >
                ${buttonText} →
            </a>
        `
        : `
            <button
                class="lesson-action-button locked-button"
                disabled
            >
                🔒 Locked
            </button>
        `;

    return `
        <article class="lesson-card ${statusClass}">

            <div class="lesson-number">

                <span>
                    ${completed ? "✓" : lesson.id}
                </span>

            </div>

            <div class="lesson-card-main">

                <div class="lesson-card-heading">

                    <div>
                        <span class="lesson-status">
                            ${statusText}
                        </span>

                        <h3>
                            ${lesson.icon || "📘"} ${lesson.title}
                        </h3>
                    </div>

                    ${
                        typeof score === "number"
                            ? `<span class="lesson-score">${score}%</span>`
                            : ""
                    }

                </div>

                <p>
                    ${lesson.description || ""}
                </p>

                <div class="lesson-metadata">

                    <span>
                        📚 ${lesson.coreVocabulary?.length || 0} core
                    </span>

                    <span>
                        ⭐ ${lesson.bonusVocabulary?.length || 0} bonus
                    </span>

                    <span>
                        ✏️ ${lesson.questions?.length || 0} exercises
                    </span>

                    <span>
                        ${lesson.estimatedTime || "5 minutes"}
                    </span>

                </div>

            </div>

            <div class="lesson-card-action">
                ${buttonMarkup}
            </div>

        </article>
    `;
}

function renderUnits() {
    const progress = getProgress();
    const unitContainer =
        document.getElementById("unitContainer");

    const units = getCourseUnits();

    unitContainer.innerHTML = units
        .map((unit) => {

            const completedInUnit = unit.lessons.filter(
                (lesson) =>
                    progress.completedLessons.includes(lesson.id)
            ).length;

            const unitPercentage = Math.round(
                (completedInUnit / unit.lessons.length) * 100
            );

            return `
                <section class="course-unit">

                    <div class="unit-header">

                        <div class="unit-title-area">

                            <div class="unit-number">
                                ${unit.number}
                            </div>

                            <div>
                                <span class="section-label">
                                    UNIT ${unit.number}
                                </span>

                                <h2>${unit.title}</h2>

                                <p>
                                    ${unit.description}
                                </p>
                            </div>

                        </div>

                        <div class="unit-progress">

                            <span>
                                ${completedInUnit}/${unit.lessons.length}
                                completed
                            </span>

                            <div class="unit-progress-track">

                                <div
                                    style="width: ${unitPercentage}%"
                                ></div>

                            </div>

                        </div>

                    </div>

                    <div class="lesson-list">

                        ${unit.lessons
                            .map((lesson) =>
                                renderLessonCard(lesson, progress)
                            )
                            .join("")}

                    </div>

                </section>
            `;
        })
        .join("");
}

function scrollToProgress() {
    document
        .getElementById("progressSection")
        .scrollIntoView({
            behavior: "smooth"
        });
}

function resetProgress() {
    const confirmed = window.confirm(
        "Reset all lesson progress and XP?"
    );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(progressKey);
    window.location.reload();
}

function initialiseHomepage() {
    if (typeof course === "undefined") {
        console.error("Course data could not be loaded.");
        return;
    }

    renderCourseStatistics();
    renderContinueCard();
    renderUnits();
}

document.addEventListener(
    "DOMContentLoaded",
    initialiseHomepage
);
