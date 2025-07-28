import axios, { type AxiosInstance } from 'axios'; // Import axios and its types
import type { Task, TaskCreateInput } from '../types/Task.ts'; // Import custom Task types

// Create an Axios instance with base URL pointing to backend route
const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000/routes', // Base path for API endpoints
});

// Function to GET all tasks from the backend
// Expected response is an array of Task objects
export const getAllTasks = () => api.get<[Task]>('/tasks');

export const getTaskById = (taskId: string) => api.get(`/tasks/${taskId}`);

// export const getTaskByPosition = (position: number) => api.get(`/tasks/positions/${position}`);

export const moveTasks = (tasks: Task[]) => api.patch(`/tasks/positions`, { updates: tasks });

// Function to move a task to a new position
export const moveTaskToNewPosition = (task: Task, newPosition: number) => api.patch(`/tasks/move`, { task, newPosition });
// Function to POST a new task to the backend
// Accepts a TaskCreateInput object (name + isCompleted)
export const createTask = (payload: TaskCreateInput) => api.post('/tasks', payload);
// Function to mark a task as completed or not
// Function to edit an existing task
export const editTask = (taskId: string, task: Task) => api.patch(`/tasks/edit/${taskId}`, { task });
// Function to DELETE a task by its ID
export const deleteTask = (taskId: string) => api.delete(`/tasks/${taskId}`);
// Group and export all API functions as a single object
const apis = {
    getAllTasks,
    getTaskById,
    moveTasks,
    moveTaskToNewPosition,
    createTask,
    editTask,
    deleteTask
};

export default apis; // Default export for easy import elsewhere
