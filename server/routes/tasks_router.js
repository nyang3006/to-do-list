const express = require('express');
const router = express.Router();

const TaskController = require('../controllers/tasks_controller.js');
router.get('/tasks', TaskController.getAllTasks);
router.get('/tasks/:taskId', TaskController.getTaskById);
router.patch('/tasks/positions', TaskController.moveTasks);
router.patch('/tasks/move', TaskController.moveTaskToNewPosition);
router.post('/tasks', TaskController.createTask);
router.patch('/tasks/edit/:taskId', TaskController.editTask);
router.delete('/tasks/:taskId', TaskController.deleteTask);

module.exports = router;