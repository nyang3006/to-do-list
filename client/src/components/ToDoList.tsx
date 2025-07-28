import api from '../api/router.ts'; // Importing API functions
import {useState, useEffect} from 'react'; // React hooks
import type {Task, TaskCreateInput} from '../types/Task.ts'; // TypeScript types
import TaskCard from './TaskCard.tsx'; // Reusable component to display a task
import { TaskContext } from '../context/TaskContext.ts'; // Context for passing task data
import { Droppable, DragDropContext, type DroppableProvided, type DropResult } from '@hello-pangea/dnd'; // Import Droppable for drag and drop
import TaskModal from './TaskModal.tsx';

function ToDoList(){
    // State to hold all tasks
    const [tasks, setTasks] = useState<Task[]>([]);
    // State to hold current input value for new task
    const [newTask, setNewTask] = useState("");
    const [modalTask, setModalTask] = useState<Task | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedOption, setSelectedOption] = useState('active');

    const sortingOptions = [
        {
            id: 1,
            label: "Active",
            value: "active"
        },
        {
            id: 2,
            label: "Scheduled",
            value: "scheduled"
        },
        {
            id: 3,
            label: "Completed",
            value: "completed"
        },{
            id: 4,
            label: "All",
            value: "all"
        }
    ]

    // Fetch tasks once when the component mounts
    useEffect(() => {
        fetchTasks();
    }, []);

    // Async function to fetch tasks from the API
    async function fetchTasks(){
        try{
            const tresponse = await api.getAllTasks(); // Call API
            const tasksData = tresponse.data; // Extract task data
            setTasks(tasksData); // Update state
        }catch(error){
            console.error('Error fetching tasks', error);
        }
    };

    // Update input value as the user types
    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>){
        setNewTask(event.target.value);
    }

    // Handle pressing "Enter" to add a new task
    async function handleCreateTask(event: React.KeyboardEvent<HTMLInputElement>){
        if(event.key === 'Enter'){
            if(newTask.trim() !== ""){
                try{
                    const task: TaskCreateInput = {
                        name: newTask,
                        isCompleted: false // Set default completion status
                    };
                    await api.createTask(task); // Create task via API
                    await fetchTasks(); // Refresh task list
                    setNewTask(''); // Clear input field
                }catch(error){
                    console.error("Error handling adding task", error);
                }
            }
        }
    }
    async function handleDragEnd(result: DropResult){
        try{
            const { destination, source } = result;
            if (!destination || destination.index === source.index) return;

            const sourceTask = tasks.find(task => task.position === source.index);
            if (!sourceTask) {
                return;
            }
    
            tasks.splice(source.index, 1); // Remove task from source position
            tasks.splice(destination.index, 0, sourceTask); // Insert task at destination position
            

            const updatedTasks = tasks.map((task, index) => ({
                ...task,
                position: index // Update position based on new order
            }));
            setTasks(updatedTasks); // Update state with new task order
            await api.moveTaskToNewPosition(sourceTask, destination.index); // Move task to new position via API
        
        }catch(error){
        console.error('Error handling drag and drop', error);
        }
        
    }
    async function handleSortOptions(option: {label: string, value: string}){
        setSelectedOption(option.value);
        if (option.value === 'all') {
            setSelectedOption('all');
        }else if(option.value === 'active') {
            setSelectedOption('active');
        } else if (option.value === 'scheduled') {
            setSelectedOption('scheduled');
        } else if (option.value === 'completed') {
            setSelectedOption('completed');
        }
    }

    return (
        <>
            <div className='to-do-list-container'>
                <h1>To Do List</h1>
                <div className='task-filter'>
                    {/* Filter buttons for different task views */}
                    {sortingOptions.map((option, index) => {
                        return (
                            <button 
                            key={index} 
                            className={`filter-button ${selectedOption === option.value ? 'active' : ''}`}
                            onClick={() => handleSortOptions(option)}>{option.label}</button>
                        );
                        
                    }
                        
                    )}
                </div>
                {/* Input field for entering new tasks */}
                <input 
                    className='task-input'
                    type='text' 
                    value={newTask} 
                    placeholder='Add a new task' 
                    onChange={handleInputChange} 
                    onKeyDown={handleCreateTask}
                />
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className='to-do-list'>
                        {/* Render each task using TaskCard and provide context */}
                        <Droppable droppableId="droppable">
                            { 
                                (provided: DroppableProvided) => (
                                    <div 
                                        className='task-list' 
                                        ref={provided.innerRef} 
                                        {...provided.droppableProps}
                                    >
                                        {tasks.filter(task => 
                                            {
                                                if (selectedOption === 'all') return true; // Show all tasks
                                                if (selectedOption === 'active') return !task.isCompleted; // Show active tasks
                                                if (selectedOption === 'scheduled') return task.dueDate; // Show scheduled tasks
                                                if (selectedOption === 'completed') return task.isCompleted; // Show completed tasks
                                                return false; // Default case, should not happen
                                            }
                                        ).sort((a, b) => {
                                            if (selectedOption === 'scheduled') {
                                                // Sort by dueDate for scheduled tasks (handle missing dates safely)
                                                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                                                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                                                return dateA - dateB;
                                            } else {
                                                // Default sort by position
                                                return a.position - b.position;
                                            }
                                        }).map(task =>
                                            <TaskContext.Provider key={task._id} value={{task, tasks, setTasks, setModalTask, setOpenModal}}>
                                                <TaskCard />
                                            </TaskContext.Provider>
                                        )}
                                        {provided.placeholder} {/* Placeholder for drag and drop */}
                                    </div>
                                )
                                
                                
                            }
                        </Droppable>

                        {modalTask && openModal &&(
                            <TaskModal task={modalTask} tasks={tasks} setTasks={setTasks} closeModal={() => {
                                setOpenModal(false);
                                setModalTask(null);
                            }}/>
                        )}
                        
                    </div>
                </DragDropContext>
            </div>
        </>
    );
}
export default ToDoList;
