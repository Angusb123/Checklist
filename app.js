// Add event listeners for the button and input field to handle adding tasks
document.getElementById('add-task-btn').addEventListener('click', addTask);
document.getElementById('task-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask(); // Call addTask function when Enter key is pressed
    }
});

// Load tasks from local storage when the window is loaded
window.addEventListener('load', loadTasks);

let draggedItem = null; // Variable to store the currently dragged item

function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim(); // Get the trimmed value of the input

    if (taskText !== '') {
        const taskList = document.getElementById('task-list');
        
        const taskItem = createTaskItem(taskText); // Create a task item without the label

        taskList.appendChild(taskItem); // Append the task item to the list

        taskInput.value = ''; // Clear the input field

        updateLocalStorage(); // Update local storage
    }
}


// Function to create a task item with the task text and label
function createTaskItem(taskText, labelText) {
    const taskItem = document.createElement('li'); // Create a list item for the task
    taskItem.classList.add('task');
    taskItem.setAttribute('draggable', true); // Make the item draggable

    // Create and configure the left remove button
    const removeBtnLeft = document.createElement('span');
    removeBtnLeft.textContent = '✕';
    removeBtnLeft.style.borderRadius = '8px 0 0 8px';
    removeBtnLeft.classList.add('remove-btn');
    removeBtnLeft.addEventListener('click', () => {
        taskItem.remove(); // Remove the task item from the list
        updateLocalStorage(); // Update local storage
    });

    // Create the custom checkbox
    const customCheckbox = document.createElement('div');
    customCheckbox.classList.add('custom-checkbox');
    customCheckbox.addEventListener('click', () => {
        customCheckbox.classList.toggle('checked'); // Toggle the checkmark visibility
    });

    // Create and configure the task label
    const label = document.createElement('label');
    label.textContent = taskText; // Set the task text

    // Create and configure the task label section
    const taskLabel = document.createElement('span');
    taskLabel.classList.add('task-label');
    taskLabel.textContent = labelText; // Set the task label text

    // Create and configure the right remove button
    const removeBtnRight = document.createElement('span');
    removeBtnRight.textContent = '✕';
    removeBtnRight.style.borderRadius = '0 8px 8px 0';
    removeBtnRight.classList.add('remove-btn');
    removeBtnRight.addEventListener('click', () => {
        taskItem.remove(); // Remove the task item from the list
        updateLocalStorage(); // Update local storage
    });

    // Append all the elements to the task item
    taskItem.appendChild(removeBtnLeft); // Add the left remove button
    taskItem.appendChild(customCheckbox); // Add the custom checkbox
    taskItem.appendChild(label); // Add the task text label
    taskItem.appendChild(taskLabel); // Add the task label section
    taskItem.appendChild(removeBtnRight); // Add the right remove button

    // Event listeners for drag and drop functionality
    taskItem.addEventListener('dragstart', () => {
        draggedItem = taskItem; // Store the dragged item
        taskItem.classList.add('dragging'); // Add dragging class for styling
        setTimeout(() => taskItem.classList.add('invisible'), 0); // Make it invisible during drag
    });

    taskItem.addEventListener('dragend', () => {
        taskItem.classList.remove('dragging', 'invisible'); // Remove dragging classes
        draggedItem = null; // Reset the dragged item
        updateLocalStorage(); // Update local storage
    });

    // Event listener for dragover to enable reordering of tasks
    taskItem.addEventListener('dragover', (e) => {
        e.preventDefault(); // Prevent default behavior to allow dropping
        const afterElement = getDragAfterElement(taskItem.parentElement, e.clientY);
        if (afterElement == null) {
            taskItem.parentElement.appendChild(draggedItem); // Append the dragged item to the end
        } else {
            taskItem.parentElement.insertBefore(draggedItem, afterElement); // Insert before the afterElement
        }
    });

    return taskItem; // Return the created task item
}

// Function to update local storage with current tasks
function updateLocalStorage() {
    const taskList = document.querySelectorAll('#task-list li label');
    const tasks = [];

    taskList.forEach(taskLabel => {
        tasks.push(taskLabel.textContent); // Push the task text to the array
    });

    localStorage.setItem('checklist', JSON.stringify(tasks)); // Save tasks to local storage
}

// Function to load tasks from local storage and display them
function loadTasks() {
    const storedTasks = JSON.parse(localStorage.getItem('checklist')) || []; // Get tasks from local storage

    storedTasks.forEach(taskText => {
        const taskList = document.getElementById('task-list');
        const taskItem = createTaskItem(taskText); // Create a task item for each stored task
        taskList.appendChild(taskItem); // Append the task item to the list
    });
}

// Function to determine the position for dropping the dragged item
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect(); // Get the bounding box of the child element
        const offset = y - box.top - box.height / 2; // Calculate the offset
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }; // Return the closest element
        } else {
            return closest; // Return the closest found so far
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element; // Return the closest element or null
}
