// Initialize an array to store students' information
const students = [];
let currentCourseName = "";

// Selecting DOM elements for various forms, tables, and inputs
const addCourseForm = document.querySelector('#add-course form');
const coursesSelect = document.getElementById('courses');
const addStudentForm = document.querySelector('#add-student form');
const studentScoresTable = document.getElementById('studentScoresTable');
const searchScoresForm = document.querySelector('#search-scores form');
const searchedScoresTable = document.getElementById('searchedScoresTable');
const failedStudentsTable = document.getElementById('failedStudents');
const passedStudentsTable = document.getElementById('passedStudents');

// Event listeners for form submissions
addCourseForm.addEventListener('submit', handleAddCourse);
addStudentForm.addEventListener('submit', handleAddStudent);
searchScoresForm.addEventListener('submit', handleSearchScores);

// Function to handle the addCourseForm submission
function handleAddCourse(event) {
    event.preventDefault();

    // Extracting values from the form
    currentCourseName = document.getElementById('courseName').value;
    const gradingScale = document.getElementById('gradingScale').value;

    // Creating a new option element for the coursesSelect dropdown
    const newOption = document.createElement('option');
    newOption.textContent = currentCourseName;
    coursesSelect.appendChild(newOption);

    // Resetting the addCourseForm
    addCourseForm.reset();
}

// Function to handle the addStudentForm submission
function handleAddStudent(event) {
    event.preventDefault();

    // Extracting values from the form
    const studentID = document.getElementById('studentID').value;
    const studentName = document.getElementById('studentName').value;
    const studentSurname = document.getElementById('studentSurname').value;
    const midtermScore = parseFloat(document.getElementById('midtermScore').value);
    const finalScore = parseFloat(document.getElementById('finalScore').value);

    // Check if the input values are valid numbers
    if (isNaN(midtermScore) || isNaN(finalScore)) {
        console.error('Invalid input. Midterm and final scores must be numeric.');
        return;
    }

    // Calculating total score and grade based on the provided functions
    const totalScore = calculateTotalScore(midtermScore, finalScore);
    const grade = calculateGrade(totalScore);

    // Creating a new student object
    const newStudent = {
        id: studentID,
        name: studentName,
        surname: studentSurname,
        midtermScore: midtermScore,
        finalScore: finalScore,
        totalScore: totalScore,
        grade: grade
    };

    // Adding the new student to the students array
    students.push(newStudent);

    // Inserting a new row in the studentScoresTable
    const newRow = studentScoresTable.insertRow(-1);
    newRow.setAttribute('data-id', studentID);

    // Populating the new row with student information and action buttons
    newRow.innerHTML = `
        <td class="editable" contenteditable="true">${studentID}</td>
        <td class="editable" contenteditable="true">${studentName}</td>
        <td class="editable" contenteditable="true">${studentSurname}</td>
        <td class="editable" contenteditable="true" data-grade="${grade}">${totalScore}</td>
        <td>${grade}</td>
        <td class="action-buttons">
            <button onclick="toggleEdit(this)">Edit</button>
            <button onclick="deleteStudent(this)">Delete</button>
        </td>
    `;

    // Resetting the addStudentForm
    addStudentForm.reset();

    // Update the filtered tables
    updateFilteredTables();
}

// Function to handle the searchScoresForm submission
function handleSearchScores(event) {
    event.preventDefault();

    // Extracting the search term from the form
    const searchStudentName = document.getElementById('searchStudentName').value.toLowerCase();

    // Clear the previously searched results in the searchedScoresTable
    searchedScoresTable.innerHTML = '<tr><th>Course Name</th><th>Total Score</th><th>Grade</th></tr>';

    // Filter students based on the search criteria
    const matchingStudents = students.filter(student => {
        const studentName = student.name.toLowerCase();
        return studentName.includes(searchStudentName);
    });

    // Iterate through each matching student and populate the searchedScoresTable
    matchingStudents.forEach(student => {
        const courseName = currentCourseName; // Use the current course name
        const viewStudentScoresRow = document.querySelector(`#studentScoresTable tr[data-id="${student.id}"]`);
        
        if (viewStudentScoresRow) {
            const totalScoreCell = viewStudentScoresRow.querySelector('.editable[data-grade]');
            const totalScore = parseFloat(totalScoreCell.textContent); // Get the updated total score
            const grade = calculateGrade(totalScore);

            // Debugging: Log values
            console.log(`Student: ${student.name}, Total Score: ${totalScore}, Grade: ${grade}`);

            // Add a new row to the searchedScoresTable
            const newRow = searchedScoresTable.insertRow(-1);
            newRow.innerHTML = `<td>${courseName}</td><td>${totalScore}</td><td>${grade}</td>`;
        }
    });
}

// Function to toggle editing mode for a row
function toggleEdit(button) {
    const row = button.closest('tr');
    const cells = row.querySelectorAll('.editable');

    const isEditing = cells[0].getAttribute('contenteditable') === 'true';

    if (isEditing) {
        // Save changes if in editing mode
        saveChanges(row);
        button.textContent = 'Edit';
    } else {
        // Enable editing mode if not in editing mode
        cells.forEach(cell => cell.setAttribute('contenteditable', 'true'));
        button.textContent = 'Save';
    }
}

// Function to delete a student
function deleteStudent(button) {
    const row = button.closest('tr');
    console.log(`Delete ${row.cells[1].textContent}'s information`);
    row.remove();
    // Update the filtered tables after deleting a student
    updateFilteredTables();
}

// Function to save changes after editing a row
function saveChanges(row) {
    const cells = row.querySelectorAll('.editable');

    // Disable content editing for all editable cells
    cells.forEach(cell => cell.setAttribute('contenteditable', 'false'));

    // Update data-grade attribute and grade cell based on the new total score
    const totalScoreCell = cells[3];
    const newTotalScore = parseFloat(totalScoreCell.textContent);
    const newGrade = calculateGrade(newTotalScore);

    totalScoreCell.setAttribute('data-grade', newGrade);
    row.cells[4].textContent = newGrade;

    // Update the filtered tables after saving changes
    updateFilteredTables();

    // If the student moved from Failed to Passed, remove from Failed table
    if (newGrade !== 'F' && row.parentNode === failedStudentsTable) {
        row.remove();
    }

    // If the student moved from Passed to Failed, remove from Passed table
    if (newGrade === 'F' && row.parentNode === passedStudentsTable) {
        row.remove();
    }
}

// Function to update the "Failed Students" and "Passed Students" tables
function updateFilteredTables() {
    // Clear tables
    failedStudentsTable.innerHTML = '<tr><th>Course name</th><th>ID</th><th>Student Name</th></tr>';
    passedStudentsTable.innerHTML = '<tr><th>Course name</th><th>ID</th><th>Student Name</th></tr>';

    // Iterate through each student
    students.forEach(student => {
        const courseName = currentCourseName;
        const newRow = document.createElement('tr');

        newRow.innerHTML = `<td>${courseName}</td><td>${student.id}</td><td>${student.name}</td>`;

        // Add the student to the appropriate table based on the grade
        if (student.grade === 'F') {
            failedStudentsTable.appendChild(newRow);
        } else {
            passedStudentsTable.appendChild(newRow);
        }

        // Check if the student's grade has changed in the "View Student Scores" table
        const viewStudentScoresRow = document.querySelector(`#studentScoresTable tr[data-id="${student.id}"]`);
        if (viewStudentScoresRow) {
            const totalScoreCell = viewStudentScoresRow.querySelector('.editable[data-grade]');
            const currentGrade = calculateGrade(parseFloat(totalScoreCell.textContent));

            // If the grade has changed, update the "Failed Students" or "Passed Students" tables accordingly
            if (currentGrade !== student.grade) {
                if (currentGrade === 'F') {
                    // Move to Failed Students table
                    passedStudentsTable.removeChild(newRow);
                    failedStudentsTable.appendChild(newRow);
                } else {
                    // Move to Passed Students table
                    failedStudentsTable.removeChild(newRow);
                    passedStudentsTable.appendChild(newRow);
                }

                // Update the student's grade in the students array
                student.grade = currentGrade;
            }
        }
    });
}

// Function to calculate the total score based on midterm and final scores
function calculateTotalScore(midtermScore, finalScore) {
    return (0.4 * midtermScore) + (0.6 * finalScore);
}

// Function to calculate the grade based on the total score
function calculateGrade(totalScore) {
    // Example grading logic:
    if (totalScore >= 90) {
        return 'A';
    } else if (totalScore >= 80) {
        return 'B';
    } else if (totalScore >= 70) {
        return 'C';
    } else if (totalScore >= 60) {
        return 'D';
    } else {
        return 'F';
    }
}

// Exposing the toggleEdit function to the global window object
window.toggleEdit = toggleEdit;
