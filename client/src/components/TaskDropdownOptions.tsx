import api from '../api/router.ts'; // Importing API functions
import {useState, useEffect, useRef} from 'react'
import options_image from "../assets/options.png";
import { useTaskContext } from "../context/TaskContext"; // Custom hook to access task context

interface TaskDropdownOptionsProps{
    isHovered: boolean;
}

function TaskDropdownOptions({ isHovered } : TaskDropdownOptionsProps) {
    const [taskDropdownToggled, setTaskDropdownToggled] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const taskContext = useTaskContext();

    useEffect(() => {
        function handler(event: MouseEvent){
            if (dropdownRef.current){
                if(!dropdownRef.current.contains(event.target as Node)){
                    setTaskDropdownToggled(false);
                }
            }
        }
        document.addEventListener('click', handler);
        return () => {
            document.removeEventListener('click', handler);
        }
    },[])
    const dropdownOptions = [
        {
            id: 1,
            label: "✏️ Edit",
            value: "edit"
        },
        {
            id: 2,
            label: "⬆️ Move Up",
            value: "move-up"
        },
        {
            id: 3,
            label: "⬇️ Move Down",
            value: "move-down"
        },
        {
            id: 4,
            label: "🗑️ Delete",
            value: "delete"
        },
    ]
    async function handleEdit(){
        try{
            const currentTask = taskContext.task;
            taskContext.setModalTask(currentTask);
            taskContext.setOpenModal(true);

        }catch(error){
            console.error('Failed to edit task', error);
        }
    }
    async function handleMoveUp(){
        try{
            const currentTask = taskContext.task;
            const prevTask = taskContext.tasks.find(task => task.position === currentTask.position-1);
            
            if(!prevTask){
                return;
            }
            // Swap positions of current task and previous task
            const tasks = taskContext.tasks.map(task => {
                if (task._id === currentTask._id) {
                    return { ...task, position: task.position - 1 }; // Move current task up
                }
                if (task._id === prevTask._id) {
                    return { ...task, position: task.position + 1 }; // Move previous task down
                }
                return task; // Return other tasks unchanged
            });
            taskContext.setTasks(tasks); // Update context state

            // Update the backend with the new positions
            await api.moveTasks([currentTask, prevTask]);
           

        }catch(error){
            console.error('Failed to move task up', error);
        }
        
        
    }
    async function handleMoveDown(){
        try{
            const currentTask = taskContext.task;
            const nextTask = taskContext.tasks.find(task => task.position === currentTask.position+1)
            if (!nextTask){
                return;
            }
            // Swap positions of current task and next task
            const tasks = taskContext.tasks.map(task => {
                if (task._id === currentTask._id) {
                    return { ...task, position: task.position + 1 }; // Move current task down
                }
                if (task._id === nextTask._id) {
                    return { ...task, position: task.position - 1 }; // Move next task up
                }
                return task; // Return other tasks unchanged
            });
            taskContext.setTasks(tasks); // Update context state
            await api.moveTasks([currentTask, nextTask]);
    

        }catch(error){
            console.error('Failed to move task down', error);
        }
    }
    
    async function handleDelete(){
        try{
            const tasks = taskContext.tasks.filter(task => task._id !== taskContext.task._id);
            taskContext.setTasks(tasks); // Update context state
            await api.deleteTask(taskContext.task._id);
        
            
        }catch(error){
            console.error('Failed to delete task');
        }
    }
    return (
        <div className='task-dropdown' ref={dropdownRef}>
            <button className={`toggle ${isHovered ? 'visible': ''}`} onClick={() => {
                setTaskDropdownToggled(!taskDropdownToggled);
            }}><img className='toggle-img' src={options_image} /></button>
            <div className={`task-options ${taskDropdownToggled ? 'visible' : ''}`}>
                {dropdownOptions.map((option, index) => {
                    return (
                        <button onClick={() => {
                            if (option.value == 'edit'){
                                handleEdit();
                            }else if(option.value == 'move-up'){
                                handleMoveUp();
                            }else if(option.value == 'move-down'){
                                handleMoveDown();
                            }else if(option.value == 'delete'){
                                handleDelete();
                            }

                            setTaskDropdownToggled(false);

                        }}key={index}>{option.label}</button>
                    )
                })}
            </div>
        </div>
    )
}

export default TaskDropdownOptions;