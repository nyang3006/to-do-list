const ToDoTask = require('../models/ToDoTask.js'); // Import the Mongoose model for tasks

// Controller to handle GET /tasks - retrieves all tasks from the database
async function getAllTasks(req, res) {
    try {
        console.log("We are getting all tasks");
        const tasks = await ToDoTask.find(); // Fetch all tasks
        res.json(tasks); // Send tasks back as JSON
    } catch (err) {
        res.status(500).json({ error: 'Server error to fetch tasks' }); // Handle server error
    }
};
async function getTaskById(req, res) {
    try {
        console.log("We are getting a task by its id");
        const { taskId } = req.params;
        const task = await ToDoTask.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Server error to fetch task by id' }); // Handle server error
    }
}

async function moveTasks(req, res) {
    try {
        const { updates } = req.body;
        const currentTask = updates[0];
        const otherTask = updates[1];
        const temp = currentTask.position;
        currentTask.position = otherTask.position;
        otherTask.position = temp;

        await Promise.all([
            ToDoTask.updateOne({ _id: currentTask._id }, { position: currentTask.position }),
            ToDoTask.updateOne({ _id: otherTask._id }, { position: otherTask.position }),
        ]);


        res.status(200).json({ message: "Tasks positions updated successfully" });

    } catch (error) {
        res.status(500).json({ error: 'Server error to move tasks' });
    }
}
async function moveTaskToNewPosition(req, res) {
    try {
        const { task, newPosition } = req.body; // Extract task and position from request body
        const currentTask = await ToDoTask.findById(task._id); // Find the current task by ID
        if (!currentTask) {
            return res.status(404).json({ error: 'Task not found' }); // Handle case where task does not exist
        }
        if (currentTask.position < newPosition) {
            // If moving down, update tasks in between
            await ToDoTask.updateMany(
                { position: { $gt: currentTask.position, $lte: newPosition } },
                { $inc: { position: -1 } }
            );
        } else if (currentTask.position > newPosition) {
            await ToDoTask.updateMany(
                { position: { $gte: newPosition, $lt: currentTask.position } },
                { $inc: { position: 1 } }
            );
        }
        // Update the current task's position
        currentTask.position = newPosition;
        await currentTask.save(); // Save the updated task
        res.status(200).json({ message: 'Task moved to new position successfully' }); // Respond with success message


    } catch (error) {
        res.status(500).json({ error: 'Server error to move task to position' });
    }
}
// Controller to handle POST /tasks - creates a new task
async function createTask(req, res) {
    try {
        const { name, isCompleted } = req.body; // Extract fields from request body
        const lastTask = await ToDoTask.findOne().sort({ position: -1 });
        const newPosition = lastTask.position != null ? lastTask.position + 1 : 0;
        const task = new ToDoTask({
            name,
            isCompleted,
            position: newPosition
        }); // Create new task instance

        console.log('New Task: ', task);
        const savedTask = await task.save(); // Save task to MongoDB

        res.status(201).json(savedTask); // Respond with created task
    } catch (error) {
        res.status(500).json({ error: 'Server error to create task' }); // Handle server error
    }
}
async function editTask(req, res) {
    try {
        const { taskId } = req.params;
        const { task } = req.body; // Extract the new name from the request body
        const taskToBeUpdated = await ToDoTask.findById(taskId);
        if (!taskToBeUpdated) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (task.name && task.name !== taskToBeUpdated.name) {
            taskToBeUpdated.name = task.name; // Update the task's name if provided
        }
        if (task.isCompleted && task.isCompleted !== taskToBeUpdated.isCompleted) {
            taskToBeUpdated.isCompleted = task.isCompleted; // Update the task's completion status
        }
        if (task.dueDate && task.dueDate !== taskToBeUpdated.dueDate) {
            taskToBeUpdated.dueDate = task.dueDate; // Update the task's due date if provided
        }

        await taskToBeUpdated.save(); // Save the updated task
        res.status(200).json({ message: 'Task updated successfully' }); // Respond with the updated task
    } catch (error) {
        res.status(500).json({ error: 'Server error to edit task' });
    }
}
async function deleteTask(req, res) {
    try {
        const { taskId } = req.params;

        const deleted = await ToDoTask.findByIdAndDelete(taskId);
        if (!deleted) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error to delete task' });
    }
}
// Export both controller functions
module.exports = {
    getAllTasks,
    getTaskById,
    moveTasks,
    moveTaskToNewPosition,
    createTask,
    editTask,
    deleteTask
};
