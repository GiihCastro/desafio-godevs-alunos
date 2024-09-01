document.addEventListener('DOMContentLoaded', () => {
    const state = {
        classes: [
            { id: 1, name: "Matemática - 9º Ano", students: [], late: 0, difficulties: 0, lessons: 12, lessonDetails: [] },
            { id: 2, name: "Português - 10º Ano", students: [], late: 0, difficulties: 0, lessons: 8, lessonDetails: [] },
            { id: 3, name: "Ciências - 8º Ano", students: [], late: 0, difficulties: 0, lessons: 18, lessonDetails: [] }
        ],
        currentClass: null,
        currentLesson: null,
        currentStudent: null
    };

    const elements = {
        classList: document.getElementById('classList'),
        currentClassElement: document.getElementById('currentClass'),
        studentCountElement: document.getElementById('studentCount'),
        lateCountElement: document.getElementById('lateCount'),
        difficultyCountElement: document.getElementById('difficultyCount'),
        classLessonsElement: document.getElementById('classLessons'),
        addStudentBtn: document.getElementById('addStudentBtn'),
        studentList: document.getElementById('studentList'),
        lessonList: document.getElementById('lessonList'),
        addClassModal: document.getElementById('addClassModal'),
        addStudentModal: document.getElementById('addStudentModal'),
        editStudentModal: document.getElementById('editStudentModal'),
        editLessonModal: document.getElementById('editLessonModal')
    };

    function renderClasses() {
        elements.classList.innerHTML = state.classes.map(cls => `
            <li class="class-item ${state.currentClass === cls ? 'selected' : ''}" data-class-id="${cls.id}">
                <div class="class-info">
                    <strong>${cls.name}</strong><br>
                    ${cls.students.length} alunos | ${cls.lessons} aulas
                </div>
                <div class="class-actions">
                    <span class="expand-icon">↔</span>
                    <span class="delete-icon" title="Excluir turma">🗑️</span>
                </div>
            </li>
        `).join('');

        attachClassListeners();
    }

    function attachClassListeners() {
        elements.classList.querySelectorAll('.class-item').forEach(item => {
            item.querySelector('.class-info').addEventListener('click', () => {
                state.currentClass = state.classes.find(cls => cls.id === parseInt(item.dataset.classId));
                renderClasses();
                updateClassDetails();
            });

            item.querySelector('.delete-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteClass(parseInt(item.dataset.classId));
            });
        });
    }

    function deleteClass(classId) {
        if (confirm(`Tem certeza que deseja excluir esta turma?`)) {
            state.classes = state.classes.filter(cls => cls.id !== classId);
            if (state.currentClass && state.currentClass.id === classId) {
                state.currentClass = null;
            }
            renderClasses();
            updateClassDetails();
        }
    }

    function updateClassDetails() {
        if (state.currentClass) {
            elements.currentClassElement.textContent = state.currentClass.name;
            elements.studentCountElement.innerHTML = `<div class="stat-icon"></div> ${state.currentClass.students.length} alunos`;
            elements.lateCountElement.innerHTML = `<div class="stat-icon"></div> ${state.currentClass.students.reduce((acc, student) => acc + (student.attendance ? student.attendance.filter(a => !a).length : 0), 0)} faltas`;
            elements.difficultyCountElement.innerHTML = `<div class="stat-icon"></div> ${state.currentClass.difficulties} dificuldades`;
            elements.classLessonsElement.innerHTML = `<div class="stat-icon"></div> ${state.currentClass.lessons} aulas`;
            elements.addStudentBtn.style.display = 'block';
            renderStudents();
            renderLessons();
        } else {
            elements.currentClassElement.textContent = 'Selecione uma turma para ver os detalhes';
            elements.studentCountElement.innerHTML = '';
            elements.lateCountElement.innerHTML = '';
            elements.difficultyCountElement.innerHTML = '';
            elements.classLessonsElement.innerHTML = '';
            elements.addStudentBtn.style.display = 'none';
            elements.studentList.innerHTML = '';
            elements.lessonList.innerHTML = '';
        }
    }

    function renderStudents() {
        if (state.currentClass) {
            elements.studentList.innerHTML = state.currentClass.students.map(student => `
                <li class="student-item" data-student-id="${student.id}">
                    <div class="student-info">
                        <strong>${student.name}</strong>
                        <div>${student.issue ? `<span class="student-issue">${student.issue}</span>` : ''}<div>
                        <div class="attendance-container">
                            <span class="attendance-label">Presenças:</span>
                            <div class="attendance-checkboxes">
                                ${Array.from({length: state.currentClass.lessons}, (_, i) => `
                                    <div class="attendance-checkbox">
                                        <input type="checkbox" 
                                               id="attendance-${student.id}-${i}" 
                                               ${student.attendance && student.attendance[i] ? 'checked' : ''}
                                               data-student-id="${student.id}"
                                               data-lesson="${i}">
                                        <label for="attendance-${student.id}-${i}" title="Aula ${i + 1}">${i + 1}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="student-actions">
                            <span class="edit-icon" title="Editar aluno">✏️</span>
                            <span class="delete-icon" title="Excluir aluno">🗑️</span>
                        </div>
                    </div>
                </li>
            `).join('');

            attachStudentListeners();
            attachAttendanceListeners();
        } else {
            elements.studentList.innerHTML = '';
        }
    }

    function attachAttendanceListeners() {
        elements.studentList.querySelectorAll('.attendance-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const studentId = parseInt(checkbox.dataset.studentId);
                const lessonIndex = parseInt(checkbox.dataset.lesson);
                const student = state.currentClass.students.find(s => s.id === studentId);

                if (student) {
                    student.attendance = student.attendance || Array(state.currentClass.lessons).fill(false);
                    student.attendance[lessonIndex] = checkbox.checked;
                    updateClassDetails();  // Atualiza os detalhes da turma conforme necessário
                }
            });
        });
    }

    function attachStudentListeners() {
        elements.studentList.querySelectorAll('.student-item').forEach(item => {
            const studentId = parseInt(item.dataset.studentId);

            item.querySelector('.edit-icon').addEventListener('click', () => {
                const student = state.currentClass.students.find(s => s.id === studentId);
                if (student) {
                    openEditStudentModal(student);
                }
            });

            item.querySelector('.delete-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteStudent(studentId);
            });
        });
    }
    function deleteStudent(studentId) {
        if (confirm('Tem certeza que deseja excluir este aluno?')) {
            state.currentClass.students = state.currentClass.students.filter(student => student.id !== studentId);
            renderStudents();
            updateClassDetails();
        }
    }

    function openEditStudentModal(student) {
        document.getElementById('editStudentName').value = student.name;
        document.getElementById('editStudentIssue').value = student.issue || '';
        document.getElementById('editStudentForm').onsubmit = function(e) {
            e.preventDefault();
            student.name = document.getElementById('editStudentName').value;
            student.issue = document.getElementById('editStudentIssue').value;
            renderStudents();
            closeModal(elements.editStudentModal);
            updateClassDetails();
        };
        openModal(elements.editStudentModal);
    }

    function renderLessons() {
        if (state.currentClass) {
            elements.lessonList.innerHTML = Array.from({length: state.currentClass.lessons}, (_, i) => {
                const lessonDetail = state.currentClass.lessonDetails[i] || { title: `Aula ${i + 1}`, observation: '' };
                return `
                    <li class="lesson-item" data-lesson="${i}">
                        <div>
                            <strong>${lessonDetail.title}</strong><br>
                            ${lessonDetail.observation ? 'Obs: ' + lessonDetail.observation : 'Sem observações'}
                        </div>
                        <span class="expand-icon">↔</span>
                    </li>
                `;
            }).join('');

            attachLessonListeners();
        } else {
            elements.lessonList.innerHTML = '';
        }
    }

    function attachLessonListeners() {
        elements.lessonList.querySelectorAll('.lesson-item').forEach(item => {
            item.addEventListener('click', () => {
                state.currentLesson = parseInt(item.dataset.lesson);
                openEditLessonModal();
            });
        });
    }

    function openModal(modal) {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }

    document.querySelectorAll('.modal .close').forEach(button => {
        button.addEventListener('click', (e) => {
            closeModal(e.target.closest('.modal'));
        });
    });

    elements.addStudentBtn.addEventListener('click', () => {
        openModal(elements.addStudentModal);
    });

    function openEditLessonModal() {
        if (state.currentLesson !== null && state.currentClass) {
            const lesson = state.currentClass.lessonDetails[state.currentLesson] || { title: `Aula ${state.currentLesson + 1}`, observation: '' };
            document.getElementById('lessonTitle').value = lesson.title;
            document.getElementById('lessonObservation').value = lesson.observation;
            document.getElementById('editLessonForm').onsubmit = function(e) {
                e.preventDefault();
                state.currentClass.lessonDetails[state.currentLesson] = {
                    title: document.getElementById('lessonTitle').value,
                    observation: document.getElementById('lessonObservation').value
                };
                renderLessons();
                closeModal(elements.editLessonModal);
                updateClassDetails();
            };
            openModal(elements.editLessonModal);
        }
    }

    function addNewClass(e) {
        e.preventDefault();

        const name = document.getElementById('className').value.trim();
        const numberOfLessons = parseInt(document.getElementById('numeroDeAulas').value);

        if (state.classes.some(cls => cls.name === name)) {
            alert('Já existe uma turma com esse nome. Por favor, escolha um nome diferente.');
            return;
        }
        
        const newClass = { 
            id: Date.now(), 
            name, 
            students: [], 
            late: 0, 
            difficulties: 0, 
            lessons: numberOfLessons, 
            lessonDetails: Array.from({ length: numberOfLessons }, (_, i) => ({ title: `Aula ${i + 1}`, observation: '' }))
        };
        
        state.classes.push(newClass);
        state.currentClass = newClass;

        renderClasses();
        updateClassDetails();

        closeModal(elements.addClassModal);
        e.target.reset();

        document.querySelector('.tab[data-tab="lessons"]').click();
    }

    document.getElementById('addClassForm').addEventListener('submit', addNewClass);

    elements.addClassModal.querySelector('.close').addEventListener('click', () => closeModal(elements.addClassModal));
    elements.addStudentModal.querySelector('.close').addEventListener('click', () => closeModal(elements.addStudentModal));
    elements.editLessonModal.querySelector('.close').addEventListener('click', () => closeModal(elements.editLessonModal));
    elements.editStudentModal.querySelector('.close').addEventListener('click', () => closeModal(elements.editStudentModal));

    document.getElementById('addStudentForm').onsubmit = function(e) {
        e.preventDefault();
        const name = document.getElementById('studentName').value;
        const issue = document.getElementById('studentIssue').value;
        if (state.currentClass) {
            state.currentClass.students.push({
                id: Date.now(),
                name: name,
                issue: issue,
                attendance: Array(state.currentClass.lessons).fill(false)
            });
            closeModal(elements.addStudentModal);
            renderStudents();
            updateClassDetails();
        }
    };

    document.getElementById('newClassBtn').addEventListener('click', () => openModal(elements.addClassModal));
    elements.addStudentBtn.addEventListener('click', () => {
        if (state.currentClass) {
            openModal(elements.addStudentModal);
        }
    });

 

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}Tab`).classList.add('active');
        });
    });

    
    renderClasses();
    updateClassDetails();
});
