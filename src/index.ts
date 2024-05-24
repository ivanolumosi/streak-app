const showFormButton = document.getElementById('showForm') as HTMLButtonElement;
const hideFormButton = document.querySelector('.cancel') as HTMLButtonElement;
const formContainer = document.getElementById('formContainer') as HTMLDivElement;
const inputForm = document.getElementById('inputForm') as HTMLFormElement;

const habitNameInput = document.querySelector('input[name="text"]') as HTMLInputElement;
const stoppageTimeInput = document.querySelector('input[name="date"]') as HTMLInputElement;
const habitsContainer = document.getElementById('habitsContainer') as HTMLDivElement;

showFormButton.addEventListener('click', () => {
    formContainer.classList.remove('hidden');
});

hideFormButton.addEventListener('click', () => {
    formContainer.classList.add('hidden');
    inputForm.reset();
});

inputForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const habitName = habitNameInput.value;
    const stoppageTime = stoppageTimeInput.value;

    console.log("Habit Name:", habitName);
    console.log("Stoppage Time:", stoppageTime);

    const newHabit = { name: habitName, stoppageTime: stoppageTime };

    try {
        const addedHabit = await addHabit(newHabit);

        formContainer.classList.add('hidden');
        inputForm.reset();

        appendHabit(addedHabit);
    } catch (error) {
        console.error("Error adding habit:", error);
    }
});

async function fetchHabits() {
    try {
        const response = await fetch('http://localhost:3000/habits');
        const data = await response.json();
        data.forEach(appendHabit);
    } catch (error) {
        console.error("Error fetching habits:", error);
    }
}

async function addHabit(habit: { name: string, stoppageTime: string }) {
    const response = await fetch('http://localhost:3000/habits', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(habit)
    });

    if (!response.ok) {
        throw new Error('Failed to add habit');
    }

    return await response.json();
}

async function updateHabit(habit: { id: number, name: string, stoppageTime: string }) {
    const response = await fetch(`http://localhost:3000/habits/${habit.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(habit)
    });

    if (!response.ok) {
        throw new Error('Failed to update habit');
    }

    return await response.json();
}

async function deleteHabit(habitId: number) {
    const response = await fetch(`http://localhost:3000/habits/${habitId}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error('Failed to delete habit');
    }

    return response.json();
}

function appendHabit(habit: { id: number, name: string, stoppageTime: string }) {
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

    const updateButton = habitDiv.querySelector('.update') as HTMLButtonElement;
    const deleteButton = habitDiv.querySelector('.delete') as HTMLButtonElement;

    updateButton.addEventListener('click', async () => {
        const newName = prompt('Enter new habit name:', habit.name);
        const newStoppageTime = prompt('Enter new stoppage time:', habit.stoppageTime);
        if (newName && newStoppageTime) {
            const updatedHabit = { ...habit, name: newName, stoppageTime: newStoppageTime };
            try {
                const result = await updateHabit(updatedHabit);
                habitDiv.querySelector('h3')!.textContent = result.name;
                habitDiv.querySelector('p:nth-of-type(1)')!.textContent = `Stoppage Time: ${result.stoppageTime}`;
                const newStoppageDate = new Date(result.stoppageTime);
                const newTimeDifference = currentDate.getTime() - newStoppageDate.getTime();
                const newStreak = Math.floor(newTimeDifference / (1000 * 3600 * 24));
                habitDiv.querySelector('p:nth-of-type(2)')!.textContent = `Streak: ${newStreak} days`;
            } catch (error) {
                console.error("Error updating habit:", error);
            }
        }
    });

    deleteButton.addEventListener('click', async () => {
        try {
            await deleteHabit(habit.id);
            habitsContainer.removeChild(habitDiv);
        } catch (error) {
            console.error("Error deleting habit:", error);
        }
    });

    habitsContainer.appendChild(habitDiv);
}

fetchHabits();
