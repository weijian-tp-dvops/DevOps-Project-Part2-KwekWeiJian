
document.addEventListener('DOMContentLoaded', () => {

    const taskTable = document.getElementById('dashboardTaskList');
    const totalTasks = document.getElementById('totalTasks');
    const inProgressTasks = document.getElementById('inProgressTasks');
    const completedTasks = document.getElementById('completedTasks');
    const refreshButton = document.getElementById('refreshDashboard');
    const dashboardMessage = document.getElementById('dashboardMessage');

    function showMessage(message) {
        taskTable.replaceChildren();

        const row = document.createElement('tr');
        const cell = document.createElement('td');

        cell.colSpan = 5;
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

            totalTasks.textContent = tasks.length;

            inProgressTasks.textContent = tasks.filter(
                task => task.status === 'In Progress'
            ).length;

            completedTasks.textContent = tasks.filter(
                task => task.status === 'Completed'
            ).length;

            taskTable.replaceChildren();

            if (tasks.length === 0) {
                showMessage('No tasks created yet.');
                return;
            }

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
                    'priority-badge priority-' +
                    priorityValue.toLowerCase();

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

                row.append(
                    idCell,
                    titleCell,
                    deadlineCell,
                    priorityCell,
                    statusCell
                );

                taskTable.appendChild(row);
            });

            if (dashboardMessage) {
                dashboardMessage.textContent = '';
            }

        } catch (error) {
            console.error('Dashboard error:', error);

            showMessage('Unable to load tasks.');

            if (dashboardMessage) {
                dashboardMessage.textContent =
                    'Error: ' + error.message;
            }
        }
    }

    refreshButton.addEventListener('click', loadTasks);

    loadTasks();

    window.addEventListener('pageshow', loadTasks);
});
