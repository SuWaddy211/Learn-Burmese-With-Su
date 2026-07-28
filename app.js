/*==========================================
    Learn Burmese with Su
    app.js
==========================================*/


/* -------------------------
    COURSE DATA
--------------------------*/

const lessons = [

{
    id:1,
    title:"Greetings",
    description:"Learn basic greetings and introductions.",
    emoji:"👋",
    xp:50,
    questions:10,
    status:"available"
},

{
    id:2,
    title:"Family",
    description:"Talk about your family members.",
    emoji:"👨‍👩‍👧",
    xp:60,
    questions:12,
    status:"available"
},

{
    id:3,
    title:"Actions",
    description:"Common everyday verbs.",
    emoji:"🏃",
    xp:70,
    questions:12,
    status:"available"
},

{
    id:4,
    title:"Sentence Order",
    description:"Build Burmese sentences correctly.",
    emoji:"📝",
    xp:80,
    questions:15,
    status:"available"
},

{
    id:5,
    title:"Food",
    description:"Coming Soon",
    emoji:"🍚",
    xp:90,
    questions:15,
    status:"locked"
},

{
    id:6,
    title:"Shopping",
    description:"Coming Soon",
    emoji:"🛍️",
    xp:90,
    questions:15,
    status:"locked"
}

];


/* -------------------------
    LOCAL STORAGE
--------------------------*/

let xp =
parseInt(localStorage.getItem("xp")) || 0;

let streak =
parseInt(localStorage.getItem("streak")) || 0;

let words =
parseInt(localStorage.getItem("words")) || 0;

let currentLesson =
parseInt(localStorage.getItem("currentLesson")) || 1;


/* -------------------------
    UPDATE DASHBOARD
--------------------------*/

document.getElementById("xp").innerText = xp;
document.getElementById("streak").innerText = streak;
document.getElementById("words").innerText = words;


/* -------------------------
    BUILD LESSON CARDS
--------------------------*/

const lessonContainer =
document.getElementById("lessonContainer");

lessons.forEach(lesson=>{

    let card=document.createElement("div");

    card.className="lesson-card";

    if(lesson.status==="locked"){

        card.innerHTML=`

            <h3>${lesson.emoji} ${lesson.title}</h3>

            <p>${lesson.description}</p>

            <p>🔒 Locked</p>

        `;

    }

    else{

        card.innerHTML=`

            <h3>${lesson.emoji} ${lesson.title}</h3>

            <p>${lesson.description}</p>

            <p>

                ⭐ ${lesson.xp} XP

            </p>

            <p>

                ${lesson.questions} Questions

            </p>

            <button onclick="openLesson(${lesson.id})">

                Start Lesson

            </button>

        `;

    }

    lessonContainer.appendChild(card);

});


/* -------------------------
    OPEN LESSON
--------------------------*/

function openLesson(id){

    localStorage.setItem(
        "currentLesson",
        id
    );

    window.location.href=
    "lesson.html?lesson="+id;

}


/* -------------------------
    CONTINUE BUTTON
--------------------------*/

function startLesson(){

    openLesson(currentLesson);

}


/* -------------------------
    SCROLL
--------------------------*/

function scrollToLessons(){

    document.getElementById("lessons")
    .scrollIntoView({

        behavior:"smooth"

    });

}