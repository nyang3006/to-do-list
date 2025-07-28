export interface Task {
    _id: string,
    name: string,
    isCompleted: boolean,
    position: number,
    dueDate: Date | null
}
export interface TaskCreateInput {
    name: string,
    isCompleted: boolean
}