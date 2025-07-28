import type {Task} from '../types/Task.ts'; // TypeScript types
import { useState } from 'react';
import api from '../api/router.ts'; // Import API functions
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker styles

interface TaskModalProps {
    task: Task;
    tasks: Task[]; // Array of all tasks
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>; // Function to update tasks
    closeModal: () => void; // Function to close the modal
  }
function TaskModal( { task, tasks, setTasks, closeModal }: TaskModalProps) {
    const [inputValue, setInputValue] = useState(task.name); // State to hold the input value
    const [dueDate, setDueDate] = useState<Date | null>(task.dueDate ? new Date(task.dueDate) : null); // State to hold the due date
    
    async function handleEditTask() {
        if(inputValue.trim() !== ""){
            try{
                const updatedTasks = tasks.map(t => {
                    if (t._id === task._id) {
                        return { ...t, name: inputValue, dueDate: dueDate }; // Update the task name
                    }
                    return t; // Return other tasks unchanged
                });
                setTasks(updatedTasks); // Update context state
                await api.editTask(task._id, { ...task, name: inputValue, dueDate: dueDate }); // Call API to update task
                closeModal(); // Close the modal after saving
                
            }catch(error){
                console.error("Error handling editing task", error);
            }
        }
    }
  return (
    <>
      <div className="task-modal-background">
        <div className='task-modal-container'>
          <div className='task-title'>
            <h1>Edit Task</h1>
            <button className='task-cancel' onClick={closeModal}>Cancel</button>
            <button className='task-save'onClick={handleEditTask}>Save</button>
          </div>
          <div className='task-body'>
            <p>Title</p>
            <input 
              className='task-modal-name' 
              defaultValue={task.name}
              onChange={event => setInputValue(event.target.value)}
            />
            <p>Due Date</p>
            <DatePicker
              selected={dueDate}
              onChange={(date: Date | null) => setDueDate(date)}
              className='task-modal-date'
              value={dueDate ? dueDate.toLocaleDateString() : ''}
            />
          </div>
          <div className='task-footer'>

          </div>
        </div>
      </div>
    </>
  )
}

export default TaskModal;