document.addEventListener('DOMContentLoaded', function() {
    const calendar = document.getElementById('calendar').getElementsByTagName('tbody')[0];
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const noteModal = document.getElementById('noteModal');
    const noteText = document.getElementById('noteText');
    const saveNoteButton = document.getElementById('saveNote');
    const deleteNoteButton = document.getElementById('deleteNote');
    const closeModalButton = document.getElementsByClassName('close')[0];

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDateCell = null;

    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];

    function generateCalendar(month, year) {
        calendar.innerHTML = '';
        const firstDay = new Date(year, month).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        currentMonthYear.textContent = `${monthNames[month]} ${year}`;

        let date = 1;
        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                if (i === 0 && j < firstDay) {
                    cell.appendChild(document.createTextNode(''));
                } else if (date > daysInMonth) {
                    break;
                } else {
                    cell.appendChild(document.createTextNode(date));
                    const noteKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                    fetch(`/api/notes`)
                        .then(response => response.json())
                        .then(notes => {
                            if (notes[noteKey]) {
                                cell.setAttribute('data-note', notes[noteKey]);
                                cell.innerHTML += `<br><span class="note">${notes[noteKey]}</span>`;
                            }
                        });
                    cell.addEventListener('click', function() {
                        selectedDateCell = cell;
                        noteText.value = cell.getAttribute('data-note') || '';
                        noteModal.style.display = 'block';
                    });
                    if (isCurrentMonth && date === today.getDate()) {
                        cell.classList.add('today');
                    }
                    date++;
                }
                row.appendChild(cell);
            }
            calendar.appendChild(row);
        }
    }

    prevMonthButton.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
    });

    nextMonthButton.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
    });

    saveNoteButton.addEventListener('click', function() {
        if (selectedDateCell) {
            const date = selectedDateCell.textContent.split('\n')[0];
            const noteKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            console.log(`Saving note: ${noteText.value} for date: ${noteKey}`);
            fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ date: noteKey, note: noteText.value })
            }).then(response => response.json())
              .then(data => {
                  if (data.success) {
                      selectedDateCell.setAttribute('data-note', noteText.value);
                      selectedDateCell.innerHTML = `${date}<br><span class="note">${noteText.value}</span>`;
                      noteModal.style.display = 'none';
                  }
              });
        }
    });

    deleteNoteButton.addEventListener('click', function() {
        if (selectedDateCell) {
            const date = selectedDateCell.textContent.split('\n')[0];
            const noteKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            console.log(`Deleting note for date: ${noteKey}`);
            fetch('/api/notes', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ date: noteKey })
            }).then(response => response.json())
              .then(data => {
                  if (data.success) {
                      selectedDateCell.removeAttribute('data-note');
                      selectedDateCell.innerHTML = date;
                      noteModal.style.display = 'none';
                      generateCalendar(currentMonth, currentYear); // Regenerate the calendar to reflect changes
                  }
              });
        }
    });

    closeModalButton.addEventListener('click', function() {
        noteModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === noteModal) {
            noteModal.style.display = 'none';
        }
    });

    generateCalendar(currentMonth, currentYear);
});