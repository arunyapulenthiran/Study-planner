/* =========================
   STUDYFLOW APP
   ========================= */

let subjects = JSON.parse(localStorage.getItem("studyflowSubjects")) || [];
let tasks = JSON.parse(localStorage.getItem("studyflowTasks")) || [];

let timerSeconds = 25 * 60;
let timerInterval = null;
let timerRunning = false;


/* =========================
   PAGE NAVIGATION
   ========================= */

const pages = {
    home: document.getElementById("home-page"),
    subjects: document.getElementById("subjects-page"),
    schedule: document.getElementById("schedule-page"),
    tasks: document.getElementById("tasks-page")
};

const navLinks = document.querySelectorAll(".nav-link");
const logo = document.querySelector(".logo");


function showPage(pageName) {

    Object.values(pages).forEach(page => {
        page.classList.remove("active-page");
    });

    if (pages[pageName]) {
        pages[pageName].classList.add("active-page");
    }

    navLinks.forEach(link => {
        link.classList.remove("active");

        if (link.dataset.page === pageName) {
            link.classList.add("active");
        }
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


navLinks.forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();

        showPage(link.dataset.page);

    });

});


logo.addEventListener("click", event => {

    event.preventDefault();

    showPage("home");

});


/* =========================
   DATE
   ========================= */

function displayDate() {

    const now = new Date();

    const dayElement = document.getElementById("day");
    const dateElement = document.getElementById("date");

    dayElement.textContent =
        now.toLocaleDateString("en-US", {
            weekday: "long"
        });

    dateElement.textContent =
        now.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
}

displayDate();


/* =========================
   SUBJECTS
   ========================= */

const subjectColors = [
    "#DDEBDD",
    "#DCEEF7",
    "#F7DDE5",
    "#E4DDF6",
    "#FFF1D9"
];


function saveSubjects() {

    localStorage.setItem(
        "studyflowSubjects",
        JSON.stringify(subjects)
    );

}


function renderSubjects() {

    const homeGrid =
        document.getElementById("subjects-grid");

    const pageGrid =
        document.getElementById("subjects-page-grid");

    const subjectCount =
        document.getElementById("subject-count");


    subjectCount.textContent =
        `${subjects.length} ${subjects.length === 1 ? "subject" : "subjects"}`;


    if (subjects.length === 0) {

        homeGrid.innerHTML = `
            <div class="empty-state">
                <strong>No subjects yet</strong>
                <p>Add your first subject to get started.</p>
            </div>
        `;

        pageGrid.innerHTML = `
            <div class="empty-state">
                <strong>No subjects yet</strong>
                <p>Start by adding your first subject.</p>
            </div>
        `;

        return;
    }


    homeGrid.innerHTML = subjects.map((subject, index) => {

        return `
            <article
                class="subject"
                style="background:${subject.color}"
            >

                <div class="subject-icon">
                    ${subject.name.charAt(0).toUpperCase()}
                </div>

                <div>
                    <h3>${escapeHTML(subject.name)}</h3>
                    <p>Ready to study</p>
                </div>

                <button
                    class="delete-subject"
                    data-index="${index}"
                    aria-label="Delete subject"
                >
                    ×
                </button>

            </article>
        `;

    }).join("");


    pageGrid.innerHTML = subjects.map((subject, index) => {

        return `
            <article
                class="large-subject"
                style="background:${subject.color}"
            >

                <div class="large-subject-icon">
                    ${subject.name.charAt(0).toUpperCase()}
                </div>

                <div class="large-subject-info">
                    <h2>${escapeHTML(subject.name)}</h2>
                    <p>Your study subject</p>
                </div>

                <button
                    class="delete-subject"
                    data-index="${index}"
                >
                    Delete
                </button>

            </article>
        `;

    }).join("");


    document.querySelectorAll(".delete-subject")
        .forEach(button => {

            button.addEventListener("click", () => {

                const index =
                    Number(button.dataset.index);

                subjects.splice(index, 1);

                saveSubjects();
                renderSubjects();

            });

        });

}


function addSubject() {

    const name = prompt(
        "What subject would you like to add?"
    );

    if (!name || !name.trim()) {
        return;
    }


    const cleanName = name.trim();


    if (
        subjects.some(
            subject =>
                subject.name.toLowerCase() ===
                cleanName.toLowerCase()
        )
    ) {

        alert("That subject already exists.");

        return;
    }


    const color =
        subjectColors[
            subjects.length % subjectColors.length
        ];


    subjects.push({
        name: cleanName,
        color: color
    });


    saveSubjects();
    renderSubjects();

}


document
    .getElementById("add-subject")
    .addEventListener("click", addSubject);


document
    .getElementById("subjects-add-button")
    .addEventListener("click", addSubject);


renderSubjects();


/* =========================
   TASKS
   ========================= */

function saveTasks() {

    localStorage.setItem(
        "studyflowTasks",
        JSON.stringify(tasks)
    );

}


function renderTasks() {

    const homeTasks =
        document.getElementById("home-tasks");

    const taskPage =
        document.getElementById("tasks-page-list");


    if (tasks.length === 0) {

        const emptyHTML = `
            <div class="empty-state">
                <strong>Your task list is empty</strong>
                <p>Add your first study task.</p>
            </div>
        `;

        homeTasks.innerHTML = emptyHTML;

        taskPage.innerHTML = `
            <div class="empty-state">
                <strong>No tasks yet</strong>
                <p>Add your first study task.</p>
            </div>
        `;

        return;
    }


    const taskHTML = tasks.map((task, index) => {

        return `
            <label class="task ${task.completed ? "done" : ""}">

                <input
                    type="checkbox"
                    data-index="${index}"
                    ${task.completed ? "checked" : ""}
                >

                <span class="box"></span>

                <div>
                    <strong>
                        ${escapeHTML(task.name)}
                    </strong>

                    <small>
                        Study task
                    </small>
                </div>

            </label>
        `;

    }).join("");


    homeTasks.innerHTML = taskHTML;


    taskPage.innerHTML = `
        <div class="tasks">
            ${taskHTML}
        </div>
    `;


    document
        .querySelectorAll(".task input")
        .forEach(checkbox => {

            checkbox.addEventListener(
                "change",
                () => {

                    const index =
                        Number(checkbox.dataset.index);

                    tasks[index].completed =
                        checkbox.checked;

                    saveTasks();
                    renderTasks();

                }
            );

        });

}


function addTask() {

    const name = prompt(
        "What study task would you like to add?"
    );

    if (!name || !name.trim()) {
        return;
    }


    tasks.push({
        name: name.trim(),
        completed: false
    });


    saveTasks();
    renderTasks();

}


document
    .getElementById("add-task")
    .addEventListener("click", addTask);


document
    .getElementById("schedule-task-button")
    .addEventListener("click", () => {

        showPage("tasks");

        setTimeout(() => {
            addTask();
        }, 200);

    });


renderTasks();


/* =========================
   FOCUS TIMER
   ========================= */

const timerDisplay =
    document.getElementById("timer");

const startTimerButton =
    document.getElementById("start-timer");


function updateTimerDisplay() {

    const minutes =
        Math.floor(timerSeconds / 60);

    const seconds =
        timerSeconds % 60;


    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


function startTimer() {

    if (timerRunning) {

        clearInterval(timerInterval);

        timerRunning = false;

        startTimerButton.innerHTML =
            `Resume Focus Session <span>→</span>`;

        return;
    }


    timerRunning = true;

    startTimerButton.innerHTML =
        `Pause Focus Session <span>Ⅱ</span>`;


    timerInterval = setInterval(() => {

        if (timerSeconds > 0) {

            timerSeconds--;

            updateTimerDisplay();

        } else {

            clearInterval(timerInterval);

            timerRunning = false;

            alert(
                "Focus session complete! Great work."
            );

            timerSeconds = 25 * 60;

            updateTimerDisplay();

            startTimerButton.innerHTML =
                `Start Focus Session <span>→</span>`;

        }

    }, 1000);

}


startTimerButton.addEventListener(
    "click",
    startTimer
);


updateTimerDisplay();


/* =========================
   SECURITY HELPER
   ========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}