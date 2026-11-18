async function deleteDashboardTask(task, loadTasks, message, button) {
    const id = String(task.id ?? '');
    const taskId = Number(id);

    if (!/^\d+$/.test(id) || !Number.isSafeInteger(taskId) || taskId < 1) {
        message.textContent = 'Invalid task ID.';
        return;
    }

    if (!window.confirm(`Delete "${task.title}"?`)) {
        return;
    }

    button.disabled = true;
    message.textContent = 'Deleting task...';

    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();

        if (!response.ok) {
            message.textContent = result.message || 'Unable to delete task.';
            return;
        }

        await loadTasks();

        if (!message.textContent) {
            message.textContent = result.message;
        }
    } catch (error) {
        console.error('Delete task error:', error);
        message.textContent = 'Unable to confirm deletion. Refresh the dashboard and try again.';
    } finally {
        button.disabled = false;
    }
}