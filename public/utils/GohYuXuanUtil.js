
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

module.exports = {
    readTasks
};
