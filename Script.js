// StudyFlow - Interactive Features

// Select all task checkboxes
const taskCheckboxes = document.querySelectorAll(".task input");

// Update task appearance when checked
taskCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        const task = checkbox.closest(".task");

        if (checkbox.checked) {
            task.classList.add("completed");
        } else {
            task.classList.remove("completed");
        }

        updateTaskCount();
    });
});


// Update completed task count
function updateTaskCount() {

    const totalTasks = taskCheckboxes.length;

    const completedTasks =
        document.querySelectorAll(".task input:checked").length;

    const completedCard =
        document.querySelectorAll(".stat-card")[1];

    if (completedCard) {
        completedCard.querySelector("strong").textContent =
            completedTasks;

        const percentage =
            totalTasks === 0
                ? 0
                : Math.round((completedTasks / totalTasks) * 100);

        completedCard.querySelector("small").textContent =
            `${percentage}% completed`;
    }
}


// Add a new task
const addButton = document.querySelector(".add-btn");

if (addButton) {

    addButton.addEventListener("click", () => {

        const taskName = prompt("Enter your new study task:");

        if (!taskName || taskName.trim() === "") {
            return;
        }

        const taskList = document.querySelector(".task-list");

        const newTask = document.createElement("div");

        newTask.className = "task";

        newTask.innerHTML = `
            <input type="checkbox">
            <div>
                <strong>${taskName}</strong>
                <span>New study task</span>
            </div>
        `;

        taskList.appendChild(newTask);

        // Add functionality to the new checkbox
        const newCheckbox =
            newTask.querySelector("input");

        newCheckbox.addEventListener("change", () => {

            if (newCheckbox.checked) {
                newTask.classList.add("completed");
            } else {
                newTask.classList.remove("completed");
            }

            updateTaskCount();
        });

        updateTaskCount();
    });
}


// Display today's date
const dateElement = document.querySelector(".topbar p");

if (dateElement) {

    const today = new Date();

    const options = {
        weekday: "long",
        month: "long",
        day: "numeric"
    };

    dateElement.textContent =
        `Here's your study overview for ${today.toLocaleDateString(
            "en-US",
            options
        )}.`;
}
