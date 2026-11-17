document.addEventListener('DOMContentLoaded', () => {
    const taskTable = document.getElementById('updateTaskList');
    const pageMessage = document.getElementById('updateMessage');

    const modal = document.getElementById('taskModal');
    const modalMessage = document.getElementById('modalMessage');
    const taskForm = document.getElementById('updateTaskForm');
    const titleInput = document.getElementById('editTitle');
    const deadlineInput = document.getElementById('editDeadline');
    const priorityInput = document.getElementById('editPriority');
    const statusInput = document.getElementById('editStatus');
    const cancelButton = document.getElementById('cancelUpdate');

    // same rule as the backend: at least 3 characters, one letter, no irrelevant symbols
    const titlePattern = /^(?=.*[A-Za-z])[A-Za-z0-9 .,'&():_-]{3,150}$/;

    // the task that is currently being edited in the modal
    let selectedTask = null;

    function showMessage(message) {
        taskTable.replaceChildren();

        const row = document.createElement('tr');
        const cell = document.createElement('td');

        cell.colSpan = 6;
        cell.textContent = message;

        row.appendChild(cell);
        taskTable.appendChild(row);
    }

    async function loadTasks() {
        showMessage('Loading tasks...');

        try {
            const response = await fetch('/api/tasks', {
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const tasks = await response.json();

            if (!Array.isArray(tasks)) {
                throw new Error('Invalid task data');
            }

            if (tasks.length === 0) {
                showMessage('No tasks created yet.');
                return;
            }

            taskTable.replaceChildren();

            tasks.forEach(task => {
                const row = document.createElement('tr');

                const idCell = document.createElement('td');
                idCell.textContent = task.id ?? '-';

                const titleCell = document.createElement('td');
                titleCell.textContent = task.title ?? '-';

                const deadlineCell = document.createElement('td');
                deadlineCell.textContent = task.deadline ?? '-';

                const priorityCell = document.createElement('td');
                const priorityBadge = document.createElement('span');
                const priorityValue = String(task.priority ?? 'Low');

                priorityBadge.className =
                    'priority-badge priority-' + priorityValue.toLowerCase();
                priorityBadge.textContent = priorityValue;
                priorityCell.appendChild(priorityBadge);

                const statusCell = document.createElement('td');
                const statusBadge = document.createElement('span');
                const statusValue = task.status || 'Not Started';

                statusBadge.className =
                    'status-badge status-' +
                    statusValue.toLowerCase().replace(/\s+/g, '-');
                statusBadge.textContent = statusValue;
                statusCell.appendChild(statusBadge);

                const actionCell = document.createElement('td');
                const updateButton = document.createElement('button');

                updateButton.type = 'button';
                updateButton.textContent = 'Update';
                updateButton.addEventListener('click', () => openModal(task));
                actionCell.appendChild(updateButton);

                row.append(
                    idCell,
                    titleCell,
                    deadlineCell,
                    priorityCell,
                    statusCell,
                    actionCell
                );

                taskTable.appendChild(row);
            });

        } catch (error) {
            console.error('Load tasks error:', error);
            showMessage('Unable to load tasks.');
        }
    }

    // open the modal and fill it with the selected task's details
    function openModal(task) {
        selectedTask = task;

        titleInput.value = task.title;
        deadlineInput.value = task.deadline;
        priorityInput.value = task.priority;
        statusInput.value = task.status || 'Not Started';
        modalMessage.textContent = '';

        modal.hidden = false;
    }

    function closeModal() {
        modal.hidden = true;
        selectedTask = null;
    }

    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = titleInput.value.trim();
        const deadline = deadlineInput.value;
        const priority = priorityInput.value;
        const status = statusInput.value;

        // frontend validation
        if (!title || !deadline || !priority || !status) {
            modalMessage.textContent = 'Please fill in the title, deadline, priority and status.';
            return;
        }

        if (!titlePattern.test(title)) {
            modalMessage.textContent =
                'Title must have at least 3 characters, include a letter and not contain irrelevant symbols.';
            return;
        }

        try {
            const response = await fetch('/api/tasks/' + selectedTask.id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    deadline,
                    priority,
                    status
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Unable to update task');
            }

            pageMessage.textContent = 'Task #' + selectedTask.id + ' updated successfully.';

            closeModal();
            loadTasks();

        } catch (error) {
            modalMessage.textContent = error.message;
            console.error('Update Task error:', error);
        }
    });

    cancelButton.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        // clicking the dark area outside the box closes the modal
        if (event.target === modal) {
            closeModal();
        }
    });

    loadTasks();
});