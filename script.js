/* =========================
   STUDYFLOW DATA
========================= */

let subjects =
    JSON.parse(localStorage.getItem("studyflowSubjects")) || [];

let tasks =
    JSON.parse(localStorage.getItem("studyflowTasks")) || [];

let scheduleSessions =
    JSON.parse(localStorage.getItem("studyflowSessions")) || [];

let selectedFocusSubject =
    localStorage.getItem("studyflowFocusSubject") || "";

let timerSeconds = 25 * 60;
let timerInterval = null;
let timerRunning = false;


/* =========================
   NAVIGATION
========================= */

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const logo = document.querySelector(".logo");

function showPage(pageName) {

    pages.forEach(page => {
        page.classList.remove("active-page");
    });

    const targetPage = document.getElementById(`${pageName}-page`);

    if (targetPage) {
        targetPage.classList.add("active-page");
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

    link.addEventListener("click", function(event) {

        event.preventDefault();

        showPage(this.dataset.page);

    });

});

if (logo) {

    logo.addEventListener("click", function(event) {

        event.preventDefault();

        showPage("home");

    });

}


/* =========================
   DATE
========================= */

function displayDate() {

    const now = new Date();

    const dayElement = document.getElementById("day");
    const dateElement = document.getElementById("date");

    if (dayElement) {
        dayElement.textContent =
            now.toLocaleDateString("en-US", {
                weekday: "long"
            });
    }

    if (dateElement) {
        dateElement.textContent =
            now.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric"
            });
    }
}

displayDate();


/* =========================
   SUBJECTS
========================= */

const subjectColors = [
    "pink",
    "purple",
    "blue",
    "sage"
];

function saveSubjects() {

    localStorage.setItem(
        "studyflowSubjects",
        JSON.stringify(subjects)
    );
}

function renderSubjects() {

    const grids = [
        document.getElementById("subjects-grid"),
        document.getElementById("subjects-page-grid")
    ];

    grids.forEach(grid => {

        if (!grid) return;

        if (subjects.length === 0) {

            grid.innerHTML = `
                <div class="empty-state">
                    <strong>No subjects yet</strong>
                    <p>Add your first subject to get started.</p>
                </div>
            `;

            return;
        }

        grid.innerHTML = subjects.map((subject, index) => {

            const color =
                subjectColors[index % subjectColors.length];

            return `
                <div class="subject-item ${color}">
                    <div class="subject-icon">
                        ${escapeHTML(subject.name.charAt(0).toUpperCase())}
                    </div>

                    <div class="subject-info">
                        <strong>${escapeHTML(subject.name)}</strong>
                        <small>Ready to study</small>
                    </div>

                    <button
                        class="delete-subject"
                        data-id="${subject.id}"
                        title="Delete subject">
                        ×
                    </button>
                </div>
            `;

        }).join("");

    });

    updateFocusSubjectOptions();
}

function addSubject() {

    const name = prompt("Enter your subject name:");

    if (!name || !name.trim()) {
        return;
    }

    const subject = {
        id: Date.now(),
        name: name.trim()
    };

    subjects.push(subject);

    saveSubjects();
    renderSubjects();
    updateDashboard();
}

document
    .getElementById("add-subject")
    ?.addEventListener("click", addSubject);

document
    .getElementById("subjects-add-button")
    ?.addEventListener("click", addSubject);


/* Subject deletion */

document.addEventListener("click", function(event) {

    const button = event.target.closest(".delete-subject");

    if (!button) return;

    const id = Number(button.dataset.id);

    subjects = subjects.filter(subject => subject.id !== id);

    /*
       Remove scheduled sessions belonging
       to the deleted subject.
    */

    scheduleSessions =
        scheduleSessions.filter(
            session => session.subjectId !== id
        );

    saveSubjects();

    localStorage.setItem(
        "studyflowSessions",
        JSON.stringify(scheduleSessions)
    );

    if (selectedFocusSubject == id) {

        selectedFocusSubject = "";

        localStorage.removeItem(
            "studyflowFocusSubject"
        );
    }

    renderSubjects();
    renderSchedule();
    updateDashboard();

});


/* =========================
   FOCUS SUBJECT
========================= */

function updateFocusSubjectOptions() {

    const select =
        document.getElementById("focus-subject-select");

    if (!select) return;

    select.innerHTML = `
        <option value="">Select a subject</option>

        ${subjects.map(subject => `
            <option value="${subject.id}">
                ${escapeHTML(subject.name)}
            </option>
        `).join("")}
    `;

    if (
        selectedFocusSubject &&
        subjects.some(
            subject =>
                subject.id == selectedFocusSubject
        )
    ) {

        select.value = selectedFocusSubject;

        updateFocusDisplay();

    } else {

        selectedFocusSubject = "";

        localStorage.removeItem(
            "studyflowFocusSubject"
        );
    }
}

function updateFocusDisplay() {

    const select =
        document.getElementById("focus-subject-select");

    const title =
        document.getElementById("focus-title");

    const focusSubject =
        document.querySelector(".focus-subject");

    if (!select || !title || !focusSubject) {
        return;
    }

    const subject =
        subjects.find(
            item => item.id == select.value
        );

    if (subject) {

        title.textContent = subject.name;

        focusSubject.textContent =
            "READY TO FOCUS";

    } else {

        title.textContent =
            "Choose a subject";

        focusSubject.textContent =
            "CURRENT FOCUS";
    }
}

document
    .getElementById("focus-subject-select")
    ?.addEventListener("change", function() {

        selectedFocusSubject = this.value;

        if (selectedFocusSubject) {

            localStorage.setItem(
                "studyflowFocusSubject",
                selectedFocusSubject
            );

        } else {

            localStorage.removeItem(
                "studyflowFocusSubject"
            );
        }

        updateFocusDisplay();

    });


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

    const tasksPage =
        document.getElementById("tasks-page-list");

    let taskHTML = "";

    if (tasks.length === 0) {

        taskHTML = `
            <div class="empty-state">
                <strong>Your task list is empty</strong>
                <p>Add a task to get started.</p>
            </div>
        `;

    } else {

        taskHTML = tasks.map(task => {

            return `
                <div class="task ${task.completed ? "completed" : ""}">

                    <input
                        type="checkbox"
                        class="task-checkbox"
                        data-id="${task.id}"
                        ${task.completed ? "checked" : ""}
                    >

                    <div class="task-content">
                        <strong>
                            ${escapeHTML(task.title)}
                        </strong>
                    </div>

                    <button
                        class="delete-task"
                        data-id="${task.id}"
                        title="Delete task">
                        ×
                    </button>

                </div>
            `;

        }).join("");
    }

    if (homeTasks) {
        homeTasks.innerHTML = taskHTML;
    }

    if (tasksPage) {
        tasksPage.innerHTML = taskHTML;
    }
}

function addTask() {

    const title = prompt("Enter your task:");

    if (!title || !title.trim()) {
        return;
    }

    tasks.push({
        id: Date.now(),
        title: title.trim(),
        completed: false
    });

    saveTasks();
    renderTasks();
    updateDashboard();
}

document
    .getElementById("add-task")
    ?.addEventListener("click", addTask);


/* Task interactions */

document.addEventListener("change", function(event) {

    if (!event.target.classList.contains("task-checkbox")) {
        return;
    }

    const id = Number(event.target.dataset.id);

    const task = tasks.find(
        item => item.id === id
    );

    if (task) {

        task.completed =
            event.target.checked;

        saveTasks();
        renderTasks();
        updateDashboard();
    }

});


document.addEventListener("click", function(event) {

    const button =
        event.target.closest(".delete-task");

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const id =
        Number(button.dataset.id);

    tasks =
        tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
    updateDashboard();

});


/* =========================
   SCHEDULE
========================= */

function saveSchedule() {

    localStorage.setItem(
        "studyflowSessions",
        JSON.stringify(scheduleSessions)
    );
}

function formatTime(time) {

    const [hours, minutes] =
        time.split(":");

    const date =
        new Date();

    date.setHours(
        Number(hours),
        Number(minutes)
    );

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}

function renderSchedule() {

    document
        .querySelectorAll(".day-sessions")
        .forEach(container => {

            container.innerHTML = `
                <div class="no-session">
                    No sessions
                </div>
            `;

        });

    scheduleSessions.forEach(session => {

        const container =
            document.querySelector(
                `.day-sessions[data-day="${session.day}"]`
            );

        if (!container) return;

        const subject =
            subjects.find(
                item => item.id == session.subjectId
            );

        if (!subject) return;

        if (
            container.querySelector(".no-session")
        ) {
            container.innerHTML = "";
        }

        const sessionElement =
            document.createElement("div");

        sessionElement.className =
            "study-session";

        sessionElement.innerHTML = `

            <strong>
                ${escapeHTML(subject.name)}
            </strong>

            <span>
                ${formatTime(session.time)}
            </span>

            <small>
                ${session.duration} min
            </small>

            <button
                class="delete-session"
                data-id="${session.id}"
                title="Delete session">
                ×
            </button>
        `;

        container.appendChild(
            sessionElement
        );

    });
}


/* Create schedule form */

function createScheduleForm() {

    if (
        document.getElementById(
            "schedule-form-container"
        )
    ) {
        return;
    }

    const schedulePage =
        document.getElementById(
            "schedule-page"
        );

    if (!schedulePage) return;

    const container =
        document.createElement("div");

    container.id =
        "schedule-form-container";

    container.innerHTML = `

        <div class="schedule-form">

            <div class="form-header">

                <h3>Add Study Session</h3>

                <button
                    type="button"
                    class="close-form"
                    id="close-schedule-form">
                    ×
                </button>

            </div>

            <form id="schedule-form">

                <label>
                    Subject

                    <select id="session-subject" required>

                        <option value="">
                            Select subject
                        </option>

                        ${subjects.map(subject => `
                            <option value="${subject.id}">
                                ${escapeHTML(subject.name)}
                            </option>
                        `).join("")}

                    </select>
                </label>

                <div class="form-row">

                    <label>
                        Day

                        <select id="session-day" required>

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

                    <label>
                        Start time

                        <input
                            type="time"
                            id="session-time"
                            required
                        >
                    </label>

                </div>

                <label>
                    Duration

                    <select
                        id="session-duration"
                        required>

                        <option value="25">
                            25 minutes
                        </option>

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
                            1 hour 30 minutes
                        </option>

                    </select>

                </label>

                <button
                    type="submit"
                    class="primary-button">
                    Add Session
                </button>

            </form>

        </div>
    `;

    schedulePage.appendChild(container);

    document
        .getElementById("close-schedule-form")
        ?.addEventListener("click", function() {

            container.remove();

        });

    document
        .getElementById("schedule-form")
        ?.addEventListener("submit", function(event) {

            event.preventDefault();

            const subjectId =
                Number(
                    document.getElementById(
                        "session-subject"
                    ).value
                );

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

            if (!subjectId || !day || !time) {
                return;
            }

            scheduleSessions.push({

                id: Date.now(),

                subjectId,

                day,

                time,

                duration: Number(duration)

            });

            saveSchedule();

            renderSchedule();

            updateDashboard();

            container.remove();

        });

}

document
    .getElementById("add-session")
    ?.addEventListener("click", function() {

        if (subjects.length === 0) {

            alert(
                "Please add a subject first."
            );

            showPage("subjects");

            return;
        }

        createScheduleForm();

    });


/* Delete session */

document.addEventListener("click", function(event) {

    const button =
        event.target.closest(".delete-session");

    if (!button) return;

    const id =
        Number(button.dataset.id);

    scheduleSessions =
        scheduleSessions.filter(
            session => session.id !== id
        );

    saveSchedule();

    renderSchedule();

    updateDashboard();

});


/* =========================
   FOCUS TIMER
========================= */

function updateTimerDisplay() {

    const timer =
        document.getElementById("timer");

    if (!timer) return;

    const minutes =
        Math.floor(timerSeconds / 60);

    const seconds =
        timerSeconds % 60;

    timer.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {

    if (timerRunning) return;

    timerRunning = true;

    const button =
        document.getElementById("start-timer");

    if (button) {
        button.innerHTML =
            "Pause Focus Session <span>Ⅱ</span>";
    }

    timerInterval =
        setInterval(() => {

            if (timerSeconds > 0) {

                timerSeconds--;

                updateTimerDisplay();

            } else {

                clearInterval(timerInterval);

                timerRunning = false;

                alert(
                    "Focus session complete!"
                );

                timerSeconds =
                    25 * 60;

                updateTimerDisplay();

                if (button) {
                    button.innerHTML =
                        "Start Focus Session <span>→</span>";
                }
            }

        }, 1000);
}

function pauseTimer() {

    clearInterval(timerInterval);

    timerRunning = false;

    const button =
        document.getElementById("start-timer");

    if (button) {

        button.innerHTML =
            "Resume Focus Session <span>→</span>";
    }
}

document
    .getElementById("start-timer")
    ?.addEventListener("click", function() {

        if (!selectedFocusSubject) {

            alert(
                "Please choose a subject first."
            );

            return;
        }

        if (timerRunning) {

            pauseTimer();

        } else {

            startTimer();

        }

    });


/* =========================
   DASHBOARD
========================= */

function updateDashboard() {

    const subjectStat =
        document.getElementById(
            "stat-subjects"
        );

    const taskStat =
        document.getElementById(
            "stat-tasks"
        );

    const sessionStat =
        document.getElementById(
            "stat-sessions"
        );

    if (subjectStat) {

        subjectStat.textContent =
            subjects.length;
    }

    const completedTasks =
        tasks.filter(
            task => task.completed
        ).length;

    if (taskStat) {

        taskStat.textContent =
            `${completedTasks} / ${tasks.length}`;
    }

    if (sessionStat) {

        sessionStat.textContent =
            scheduleSessions.length;
    }

    renderTodaySessions();
}


/* Today's plan */

function renderTodaySessions() {

    const container =
        document.getElementById(
            "today-sessions"
        );

    if (!container) return;

    const today =
        new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "long"
            }
        );

    const todaySessions =
        scheduleSessions
            .filter(
                session =>
                    session.day === today
            )
            .sort(
                (a, b) =>
                    a.time.localeCompare(b.time)
            );

    if (todaySessions.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <strong>
                    No sessions planned
                </strong>

                <p>
                    Add a study session to your schedule.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        todaySessions.map(session => {

            const subject =
                subjects.find(
                    item =>
                        item.id ==
                        session.subjectId
                );

            if (!subject) return "";

            return `

                <div class="today-session">

                    <div class="today-session-time">
                        ${formatTime(session.time)}
                    </div>

                    <div class="today-session-info">

                        <strong>
                            ${escapeHTML(subject.name)}
                        </strong>

                        <span>
                            ${session.duration} minutes
                        </span>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================
   SECURITY HELPER
========================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   INITIAL LOAD
========================= */

renderSubjects();

renderTasks();

renderSchedule();

updateFocusSubjectOptions();

updateTimerDisplay();

updateDashboard();