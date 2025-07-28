const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const toDoTaskSchema = new Schema({
    name: { type: String, required: true },
    isCompleted: { type: Boolean, required: true },
    position: { type: Number, required: true },
    dueDate: { type: Date, default: null }

});

module.exports = mongoose.model('ToDoTask', toDoTaskSchema);