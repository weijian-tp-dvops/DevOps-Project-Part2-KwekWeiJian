const fs = require('fs').promises;
const path = require('path');

const filePath = path.join(__dirname, 'tasks.json');

const VALID_PRIORITIES = ['Low', 'Medium', 'High'];
const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed'];

// title must have at least 3 characters, at least one letter,
// and only normal characters (letters, numbers, spaces and . , ' & ( ) - _ :)
const TITLE_PATTERN = /^(?=.*[A-Za-z])[A-Za-z0-9 .,'&():_-]{3,150}$/;

async function updateTask(req, res) {
    try {
        const { id } = req.params;
        const { title, deadline, priority, status } = req.body;

        if (!/^\d+$/.test(id) || Number(id) < 1) {
            return res.status(400).json({
                message: 'Invalid task ID.'
            });
        }

        // Error 1: all fields must be filled in
        if (
            typeof title !== 'string' || !title.trim() ||
            typeof deadline !== 'string' || !deadline.trim() ||
            typeof priority !== 'string' || !priority.trim() ||
            typeof status !== 'string' || !status.trim()
        ) {
            return res.status(400).json({
                message: 'Please fill in the title, deadline, priority and status.'
            });
        }

        // Error 2: title cannot contain irrelevant text
        if (!TITLE_PATTERN.test(title.trim())) {
            return res.status(400).json({
                message: 'Title must have at least 3 characters, include a letter and not contain irrelevant symbols.'
            });
        }

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(deadline) ||
            Number.isNaN(Date.parse(deadline))
        ) {
            return res.status(400).json({
                message: 'Please provide a valid deadline.'
            });
        }

        if (!VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({
                message: 'Priority must be Low, Medium or High.'
            });
        }

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                message: 'Status must be Not Started, In Progress or Completed.'
            });
        }

        let tasks = [];

        try {
            const data = await fs.readFile(filePath, 'utf8');
            tasks = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return res.status(404).json({
                    message: 'No tasks found to update.'
                });
            }
            throw error;
        }

        if (!Array.isArray(tasks)) {
            return res.status(500).json({
                message: 'Invalid task data'
            });
        }

        const taskIndex = tasks.findIndex(task => Number(task.id) === Number(id));

        if (taskIndex === -1) {
            return res.status(404).json({
                message: 'Task not found.'
            });
        }

        tasks[taskIndex] = {
            ...tasks[taskIndex],
            title: title.trim(),
            deadline,
            priority,
            status
        };

        await fs.writeFile(
            filePath,
            JSON.stringify(tasks, null, 2),
            'utf8'
        );

        return res.status(200).json({
            message: 'Task updated successfully',
            task: tasks[taskIndex]
        });

    } catch (error) {
        console.error('Update Task error:', error);

        return res.status(500).json({
            message: 'Unable to update task'
        });
    }
}

module.exports = {
    updateTask
};