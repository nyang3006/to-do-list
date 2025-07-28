import api from '../api/router.ts'; // Importing API functions
import { useTaskContext } from "../context/TaskContext"; // Custom hook to access task context
import TaskDropdownOptions from './TaskDropdownOptions.tsx';
import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd'; // Import Draggable for drag and drop

function TaskCard() {
    const taskContext = useTaskContext(); // Get the current task object from context
    const [isHovered, setIsHovered] = useState(false);

    // Handles completing a task
    async function handleMarkTaskComplete(){
        try{
            const tasks = taskContext.tasks.map(t => {
                if (t._id === taskContext.task._id) {
                    return { ...t, isCompleted: true }; // Mark the current task as completed
                }
                return t; // Return other tasks unchanged
            });

            taskContext.setTasks(tasks); // Update context state

            await api.editTask(taskContext.task._id, { ...taskContext.task, isCompleted: false });
            
        }catch(error){
            console.error('Error marking task complete');
        }
    }
    async function handleMarkTaskIncomplete(){
        try{
            const tasks = taskContext.tasks.map(t => {
                if (t._id === taskContext.task._id) {
                    return { ...t, isCompleted: false }; // Mark the current task as completed
                }
                return t; // Return other tasks unchanged
            });

            taskContext.setTasks(tasks); // Update context state
            await api.editTask(taskContext.task._id, { ...taskContext.task, isCompleted: false });
            
        }catch(error){
            console.error('Error marking task incomplete');
        }
    }
    function isToday(date: Date | null): boolean {
        if (!date) return false;
        const parsed = new Date(date);
        const today = new Date();

        return parsed.getDate() === today.getDate() &&
            parsed.getMonth() === today.getMonth() &&
            parsed.getFullYear() === today.getFullYear();
        }

    function isPastDue(date: Date | null): boolean {
        if (!date) return false;
        const parsed = new Date(date);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Strip time to compare dates only

    return parsed < today;
    }   
    function handleDueDates(rawDate: Date | null) {
        if (!rawDate) return null;

        const date = new Date(rawDate); // ✅ safely cast to Date
        const formatted = date.toLocaleDateString();

        if (isToday(date)) {
            return <span>Today</span>;
        } else if (isPastDue(date)) {
            return <span style={{color: 'red'}}>{formatted}</span>;
        } else {
            return <span>{formatted}</span>;
        }
    }
    return (
        <>
            <Draggable draggableId={taskContext.task._id} index={taskContext.task.position}>
                {(provided) => (
                    <div 
                        className="task-card" 
                        onMouseEnter={() => {setIsHovered(true)}} 
                        onMouseLeave={() => {setIsHovered(false)}} 
                        ref={provided.innerRef} 
                        {...provided.draggableProps} 
                        {...provided.dragHandleProps}
                    >
                        
                        <div className='task-checkbox'>
                            {!taskContext.task.isCompleted ? (
                                <div className="task-incomplete" onClick={handleMarkTaskComplete} />
                                
                            ): (
                                <div className="task-complete" onClick={handleMarkTaskIncomplete} />
                            )} 
                        </div>

                        <div className='task-name'>
                            {taskContext.task.name}
                        </div>

                        <div className='task-options'>
                             {/* Edit button (image input, can be styled and hooked with onClick) */}
                            <TaskDropdownOptions isHovered={isHovered} />
                        </div>
                        
                        <div className="task-due">
                           { handleDueDates(taskContext.task.dueDate) }
                        </div>
                        
                        

                    </div>
                )}
            </Draggable>
        </>
    );
}

export default TaskCard;
