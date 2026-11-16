
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('createTaskForm');
    const message = document.getElementById('formMessage');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('title').value.trim();
        const deadline = document.getElementById('deadline').value;
        const priority = document.getElementById('priority').value;

        if (!title || !deadline || !priority) {
            message.textContent = 'Please complete all fields.';
            return;
        }

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    deadline,
                    priority
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Unable to create task');
            }

            message.textContent = 'Task created successfully!';
            form.reset();

        } catch (error) {
            message.textContent = error.message;
            console.error('Create Task error:', error);
        }
    });
});
