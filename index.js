
const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 5050;

const tasksFile = path.join(__dirname, 'utils', 'tasks.json');

app.use(express.json());

// Serve HTML, CSS and JavaScript
app.use(express.static(path.join(__dirname, 'public')));

// READ TASKS API
app.get('/api/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(tasksFile, 'utf8');
        const tasks = JSON.parse(data);

        if (!Array.isArray(tasks)) {
            return res.status(500).json({
                message: 'Task data must be an array'
            });
        }

        return res.status(200).json(tasks);

    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(200).json([]);
        }

        console.error('Read Tasks error:', error);

        return res.status(500).json({
            message: 'Unable to read tasks'
        });
    }
});

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
