/* =========================
   STUDYFLOW APP
   ========================= */

let subjects =
    JSON.parse(localStorage.getItem("studyflowSubjects")) || [];

let tasks =
    JSON.parse(localStorage.getItem("studyflowTasks")) || [];

let scheduleSessions =
    JSON.parse(localStorage.getItem("studyflowSessions")) || [];

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
        link.classList.toggle(
            "active",
            link.dataset.page === pageName
        );
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

    document.getElementById("day").textContent =
        now.toLocaleDateString("en-US", {
            weekday: "long"
        });

    document.getElementById("date").textContent =
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
        `${subjects.length} ${
            subjects.length === 1
                ? "subject"
                : "subjects"
        }`;


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


    homeGrid.innerHTML = subjects.map(
        (subject, index) => `

            <article
                class="subject"
                style="background:${subject.color}"
            >

                <div class="subject-icon">
                    ${escapeHTML(
                        subject.name.charAt(0).toUpperCase()
                    )}
                </div>

                <div>
                    <h3>
                        ${escapeHTML(subject.name)}
                    </h3>

                    <p>Ready to study</p>
                </div>

                <button
                    class="delete-subject"
                    data-index="${index}"
                >
                    ×
                </button>

            </article>

        `
    ).join("");


    pageGrid.innerHTML = subjects.map(
        (subject, index) => `

            <article
                class="large-subject"
                style="background:${subject.color}"
            >

                <div class="large-subject-icon">
                    ${escapeHTML(
                        subject.name.charAt(0).toUpperCase()
                    )}
                </div>

                <div class="large-subject-info">

                    <h2>
                        ${escapeHTML(subject.name)}
                    </h2>

                    <p>Your study subject</p>

                </div>

                <button
                    class="delete-subject"
                    data-index="${index}"
                >
                    Delete
                </button>

            </article>

        `
    ).join("");


    document
        .querySelectorAll(".delete-subject")
        .forEach(button => {

            button.addEventListener("click", () => {

                const index =
                    Number(button.dataset.index);

                subjects.splice(index, 1);

                saveSubjects();
                renderSubjects();
                renderSchedule();

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

    subjects.push({
        name: cleanName,
        color:
            subjectColors[
                subjects.length %
                subjectColors.length
            ]
    });

    saveSubjects();
    renderSubjects();
    renderSchedule();
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

        homeTasks.innerHTML = `
            <div class="empty-state">
                <strong>Your task list is empty</strong>
                <p>Add your first study task.</p>
            </div>
        `;

        taskPage.innerHTML = `
            <div class="empty-state">
                <strong>No tasks yet</strong>
                <p>Add your first study task.</p>
            </div>
        `;

        return;
    }


    const taskHTML = tasks.map(
        (task, index) => `

            <label class="task ${
                task.completed ? "done" : ""
            }">

                <input
                    type="checkbox"
                    data-index="${index}"
                    ${task.completed ? "checked" : ""}
                >

                <span class="box"></span>

                <div class="task-content">

                    <strong>
                        ${escapeHTML(task.name)}
                    </strong>

                    <small>
                        Study task
                    </small>

                </div>

                <button
                    type="button"
                    class="delete-task"
                    data-index="${index}"
                >
                    ×
                </button>

            </label>

        `
    ).join("");


    homeTasks.innerHTML = taskHTML;

    taskPage.innerHTML = `
        <div class="tasks">
            ${taskHTML}
        </div>
    `;


    /* Checkbox */

    document
        .querySelectorAll(".task input")
        .forEach(checkbox => {

            checkbox.addEventListener(
                "change",
                () => {

                    const index =
                        Number(
                            checkbox.dataset.index
                        );

                    tasks[index].completed =
                        checkbox.checked;

                    saveTasks();
                    renderTasks();

                }
            );

        });


    /* Delete task */

    document
        .querySelectorAll(".delete-task")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    const index =
                        Number(
                            button.dataset.index
                        );

                    tasks.splice(index, 1);

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


renderTasks();


/* =========================
   SCHEDULE
   ========================= */

function saveSchedule() {

    localStorage.setItem(
        "studyflowSessions",
        JSON.stringify(scheduleSessions)
    );
}


/* Create schedule form */

function createScheduleForm() {

    const oldForm =
        document.getElementById(
            "schedule-form-container"
        );

    if (oldForm) {
        oldForm.remove();
    }


    const container =
        document.createElement("div");

    container.id =
        "schedule-form-container";


    const subjectOptions =
        subjects.map(
            subject => `
                <option value="${escapeHTML(
                    subject.name
                )}">
                    ${escapeHTML(subject.name)}
                </option>
            `
        ).join("");


    container.innerHTML = `

        <div class="schedule-form">

            <div class="form-header">

                <div>
                    <span class="section-label">
                        NEW SESSION
                    </span>

                    <h2>
                        Add Study Session
                    </h2>
                </div>

                <button
                    type="button"
                    class="close-form"
                    id="close-schedule-form"
                >
                    ×
                </button>

            </div>


            <form id="schedule-form">

                <label>
                    Subject

                    <select
                        id="session-subject"
                        required
                    >

                        <option value="">
                            Choose a subject
                        </option>

                        ${subjectOptions}

                    </select>

                </label>


                <label>
                    Day

                    <select
                        id="session-day"
                        required
                    >

                        <option value="">
                            Choose a day
                        </option>

                        <option value="Monday">
                            Monday
                        </option>

                        <option value="Tuesday">
                            Tuesday
                        </option>

                        <option value="Wednesday">
                            Wednesday
                        </option>

                        <option value="Thursday">
                            Thursday
                        </option>

                        <option value="Friday">
                            Friday
                        </option>

                        <option value="Saturday">
                            Saturday
                        </option>

                        <option value="Sunday">
                            Sunday
                        </option>

                    </select>

                </label>


                <div class="form-row">

                    <label>
                        Start time

                        <input
                            type="time"
                            id="session-time"
                            required
                        >

                    </label>


                    <label>
                        Duration

                        <select
                            id="session-duration"
                            required
                        >

                            <option value="30">
                                30 minutes
                            </option>

                            <option value="45">
                                45 minutes
                            </option>

                            <option value="60">
                                1 hour
                            </option>

                            <option value="90">
                                1.5 hours
                            </option>

                            <option value="120">
                                2 hours
                            </option>

                        </select>

                    </label>

                </div>


                <button
                    type="submit"
                    class="primary-button"
                >
                    Add to Schedule
                </button>

            </form>

        </div>

    `;


    document
        .getElementById("schedule-page")
        .appendChild(container);


    document
        .getElementById("close-schedule-form")
        .addEventListener(
            "click",
            () => {
                container.remove();
            }
        );


    document
        .getElementById("schedule-form")
        .addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const subject =
                    document.getElementById(
                        "session-subject"
                    ).value;

                const day =
                    document.getElementById(
                        "session-day"
                    ).value;

                const time =
                    document.getElementById(
                        "session-time"
                    ).value;

                const duration =
                    document.getElementById(
                        "session-duration"
                    ).value;


                if (
                    !subject ||
                    !day ||
                    !time ||
                    !duration
                ) {

                    alert(
                        "Please complete all fields."
                    );

                    return;
                }


                scheduleSessions.push({

                    id: Date.now(),

                    subject: subject,

                    day: day,

                    time: time,

                    duration: Number(duration)

                });


                saveSchedule();

                renderSchedule();

                container.remove();

            }
        );

}


/* Render schedule */

function renderSchedule() {

    const dayContainers =
        document.querySelectorAll(
            ".day-sessions"
        );


    dayContainers.forEach(container => {

        const day =
            container.dataset.day;


        const sessions =
            scheduleSessions
                .filter(
                    session =>
                        session.day === day
                )
                .sort(
                    (a, b) =>
                        a.time.localeCompare(
                            b.time
                        )
                );


        if (sessions.length === 0) {

            container.innerHTML = `
                <div class="no-session">
                    No sessions
                </div>
            `;

            return;
        }


        container.innerHTML =
            sessions.map(session => {

                const subject =
                    subjects.find(
                        item =>
                            item.name ===
                            session.subject
                    );


                const background =
                    subject
                        ? subject.color
                        : "#F7DDE5";


                return `

                    <div
                        class="study-session"
                        style="background:${background}"
                    >

                        <div class="session-time">
                            ${formatTime(
                                session.time
                            )}
                        </div>

                        <strong>
                            ${escapeHTML(
                                session.subject
                            )}
                        </strong>

                        <small>
                            ${session.duration} min
                        </small>

                        <button
                            type="button"
                            class="delete-session"
                            data-id="${session.id}"
                        >
                            ×
                        </button>

                    </div>

                `;

            }).join("");


        container
            .querySelectorAll(".delete-session")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(
                                button.dataset.id
                            );

                        scheduleSessions =
                            scheduleSessions.filter(
                                session =>
                                    session.id !== id
                            );

                        saveSchedule();

                        renderSchedule();

                    }
                );

            });

    });

}


/* Format time */

function formatTime(time) {

    const parts = time.split(":");

    const date = new Date();

    date.setHours(
        Number(parts[0]),
        Number(parts[1])
    );

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


/* Add Study Session button */

const addSessionButton =
    document.getElementById("add-session");


if (addSessionButton) {

    addSessionButton.addEventListener(
        "click",
        () => {

            if (subjects.length === 0) {

                alert(
                    "Please add a subject first."
                );

                showPage("subjects");

                return;
            }


            createScheduleForm();

        }
    );

}


renderSchedule();


/* =========================
   FOCUS TIMER
   ========================= */

const timerDisplay =
    document.getElementById("timer");

const startTimerButton =
    document.getElementById("start-timer");


function updateTimerDisplay() {

    const minutes =
        Math.floor(
            timerSeconds / 60
        );

    const seconds =
        timerSeconds % 60;


    timerDisplay.textContent =
        `${String(minutes).padStart(
            2,
            "0"
        )}:${String(seconds).padStart(
            2,
            "0"
        )}`;
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


    timerInterval =
        setInterval(() => {

            if (timerSeconds > 0) {

                timerSeconds--;

                updateTimerDisplay();

            } else {

                clearInterval(
                    timerInterval
                );

                timerRunning = false;

                alert(
                    "Focus session complete! Great work."
                );

                timerSeconds =
                    25 * 60;

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