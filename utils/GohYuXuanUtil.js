const fs = require('fs').promises;
const path = require('path');

const filePath = path.join(__dirname, 'tasks.json');

async function readTasks(req, res) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const tasks = JSON.parse(data);

        if (!Array.isArray(tasks)) {
            return res.status(500).json({
                message: 'Invalid task data'
            });
        }

        return res.status(200).json(tasks);

    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(200).json([]);
        }

        console.error('Read tasks error:', error);

        return res.status(500).json({
            message: 'Unable to read tasks'
        });
    }
}

async function createTask(req, res) {
    try {
        const { title, deadline, priority } = req.body;

        if (
            typeof title !== 'string' ||
            !title.trim() ||
            title.trim().length > 150 ||
            typeof deadline !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}$/.test(deadline) ||
            Number.isNaN(Date.parse(deadline)) ||
            !['Low', 'Medium', 'High'].includes(priority)
        ) {
            return res.status(400).json({
                message: 'Please provide a valid title, deadline and priority.'
            });
        }

        let tasks = [];

        try {
            const data = await fs.readFile(filePath, 'utf8');
            tasks = JSON.parse(data);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }

        if (!Array.isArray(tasks)) {
            return res.status(500).json({
                message: 'Invalid task data'
            });
        }

        const nextId = tasks.reduce(
            (maxId, task) => Math.max(maxId, Number(task.id) || 0),
            0
        ) + 1;

        const newTask = {
            id: nextId,
            title: title.trim(),
            deadline,
            priority,
            status: null
        };

        tasks.push(newTask);

        await fs.writeFile(
            filePath,
            JSON.stringify(tasks, null, 2),
            'utf8'
        );

        return res.status(201).json({
            message: 'Task created successfully',
            task: newTask
        });

    } catch (error) {
        console.error('Create Task error:', error);

        return res.status(500).json({
            message: 'Unable to create task'
        });
    }
}


module.exports = {
    readTasks, createTask
};