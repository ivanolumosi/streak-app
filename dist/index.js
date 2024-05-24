"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const showFormButton = document.getElementById('showForm');
const hideFormButton = document.querySelector('.cancel');
const formContainer = document.getElementById('formContainer');
const inputForm = document.getElementById('inputForm');
const habitNameInput = document.querySelector('input[name="text"]');
const stoppageTimeInput = document.querySelector('input[name="date"]');
const habitsContainer = document.getElementById('habitsContainer');
showFormButton.addEventListener('click', () => {
    formContainer.classList.remove('hidden');
});
hideFormButton.addEventListener('click', () => {
    formContainer.classList.add('hidden');
    inputForm.reset();
});
inputForm.addEventListener('submit', (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    const habitName = habitNameInput.value;
    const stoppageTime = stoppageTimeInput.value;
    console.log("Habit Name:", habitName);
    console.log("Stoppage Time:", stoppageTime);
    const newHabit = { name: habitName, stoppageTime: stoppageTime };
    try {
        const addedHabit = yield addHabit(newHabit);
        formContainer.classList.add('hidden');
        inputForm.reset();
        appendHabit(addedHabit);
    }
    catch (error) {
        console.error("Error adding habit:", error);
    }
}));
function fetchHabits() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('http://localhost:3000/habits');
            const data = yield response.json();
            data.forEach(appendHabit);
        }
        catch (error) {
            console.error("Error fetching habits:", error);
        }
    });
}
function addHabit(habit) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('http://localhost:3000/habits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(habit)
        });
        if (!response.ok) {
            throw new Error('Failed to add habit');
        }
        return yield response.json();
    });
}
function updateHabit(habit) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`http://localhost:3000/habits/${habit.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(habit)
        });
        if (!response.ok) {
            throw new Error('Failed to update habit');
        }
        return yield response.json();
    });
}
function deleteHabit(habitId) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`http://localhost:3000/habits/${habitId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete habit');
        }
        return response.json();
    });
}
function appendHabit(habit) {
    const habitDiv = document.createElement('div');
    habitDiv.classList.add('habit');
    const stoppageDate = new Date(habit.stoppageTime);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - stoppageDate.getTime();
    const streak = Math.floor(timeDifference / (1000 * 3600 * 24));
    habitDiv.innerHTML = `
        <ion-icon name="alarm-outline"></ion-icon>
        <h3>${habit.name}</h3>
        <p>Start Time: ${habit.stoppageTime}</p>
        <p>Streak: ${streak} days</p>
        <button class="update">Update</button>
        <button class="delete">Delete</button>
    `;
    const updateButton = habitDiv.querySelector('.update');
    const deleteButton = habitDiv.querySelector('.delete');
    updateButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        const newName = prompt('Enter new habit name:', habit.name);
        const newStoppageTime = prompt('Enter new stoppage time:', habit.stoppageTime);
        if (newName && newStoppageTime) {
            const updatedHabit = Object.assign(Object.assign({}, habit), { name: newName, stoppageTime: newStoppageTime });
            try {
                const result = yield updateHabit(updatedHabit);
                habitDiv.querySelector('h3').textContent = result.name;
                habitDiv.querySelector('p:nth-of-type(1)').textContent = `Stoppage Time: ${result.stoppageTime}`;
                const newStoppageDate = new Date(result.stoppageTime);
                const newTimeDifference = currentDate.getTime() - newStoppageDate.getTime();
                const newStreak = Math.floor(newTimeDifference / (1000 * 3600 * 24));
                habitDiv.querySelector('p:nth-of-type(2)').textContent = `Streak: ${newStreak} days`;
            }
            catch (error) {
                console.error("Error updating habit:", error);
            }
        }
    }));
    deleteButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield deleteHabit(habit.id);
            habitsContainer.removeChild(habitDiv);
        }
        catch (error) {
            console.error("Error deleting habit:", error);
        }
    }));
    habitsContainer.appendChild(habitDiv);
}
fetchHabits();
