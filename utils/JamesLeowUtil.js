const fs = require('fs').promises;
const path = require('path');

const filePath = path.join(__dirname, 'tasks.json');

async function deleteTask(req, res) {
    const { id } = req.params;
    const taskId = Number(id);

    if (!/^\d+$/.test(id) || !Number.isSafeInteger(taskId) || taskId < 1) {
        return res.status(400).json({ message: 'Invalid task ID.' });
    }

    try {
        const data = await fs.readFile(filePath, 'utf8');
        const tasks = JSON.parse(data);

        if (!Array.isArray(tasks)) {
            return res.status(500).json({ message: 'Invalid task data.' });
        }

        const taskIndex = tasks.findIndex(task => Number(task.id) === taskId);

        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        tasks.splice(taskIndex, 1);
        await fs.writeFile(filePath, JSON.stringify(tasks, null, 2), 'utf8');

        return res.status(200).json({ message: 'Task deleted successfully.' });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({ message: 'Task not found.' });
        }

        console.error('Delete task error:', error);
        return res.status(500).json({ message: 'Unable to delete task.' });
    }
}

module.exports = { deleteTask };