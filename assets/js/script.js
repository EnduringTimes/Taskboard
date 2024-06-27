// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  const taskCard = `
    <div class="card mb-2 task-card" id="task-${task.id}" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Deadline: ${task.deadline}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `;
  return taskCard;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  taskList.forEach(task => {
    if (!task || !task.deadline) return;  // Check for undefined task or missing deadline

    const taskCard = createTaskCard(task);
    if (task.state === "to-do") {
      $("#todo-cards").append(taskCard);
    } else if (task.state === "in-progress") {
      $("#in-progress-cards").append(taskCard);
    } else if (task.state === "done") {
      $("#done-cards").append(taskCard);
    }
  });

  $(".delete-task").on("click", handleDeleteTask);

  $(".card").draggable({
    revert: "invalid",
    helper: "clone",
    start: function(event, ui) {
      $(ui.helper).addClass('ui-draggable-dragging');
    },
    stop: function(event, ui) {
      $(ui.helper).removeClass('ui-draggable-dragging');
    }
  });

  $(".lane").droppable({
    accept: ".card",
    drop: handleDrop
  });

  $(".card").each(function() {
    const taskId = $(this).data("id");
    const task = taskList.find(task => task.id === taskId);
    if (!task) return; // Check if task is found
    const deadline = dayjs(task.deadline);
    const now = dayjs();
    if (now.isAfter(deadline)) {
      $(this).addClass("border-danger");
    } else if (now.isAfter(deadline.subtract(3, 'day'))) {
      $(this).addClass("border-warning");
    }
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const title = $("#taskTitle").val();
  const description = $("#taskDescription").val();
  const deadline = $("#taskDeadline").val();

  if (title && description && deadline) {
    const task = {
      id: generateTaskId(),
      title,
      description,
      deadline,
      state: "to-do"
    };

    taskList.push(task);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));

    renderTaskList();
    $("#formModal").modal('hide');
    $("#taskForm")[0].reset();
  }
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest(".card").data("id");
  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.helper.data("id");
  const newStatus = $(event.target).attr("id");

  taskList = taskList.map(task => {
    if (task.id === taskId) {
      task.state = newStatus;
    }
    return task;
  });

  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $("#taskForm").on("submit", handleAddTask);
});
