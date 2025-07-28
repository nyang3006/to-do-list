import { createContext, useContext } from "react";
import type { Task } from "../types/Task";

export interface TaskContextType {
    task: Task,
    tasks: Task[],
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    setModalTask: React.Dispatch<React.SetStateAction<Task | null>>;
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function useTaskContext() {
    const task = useContext(TaskContext);
    if (task == undefined) {
        throw new Error('useTaskContext must be used with a TaskContext');
    }
    return task;
}