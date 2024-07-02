document.addEventListener('DOMContentLoaded', () => {
    const studentsContainer = document.getElementById('studentsContainer');
    const sortLastnameLink = document.getElementById('sortLastname');
    const calculateAverageLink = document.getElementById('calculateAverage');
    const searchForm = document.getElementById('searchForm');
  
    const fetchStudents = async (url = '/api/students') => {
      const response = await fetch(url);
      const students = await response.json();
      renderStudents(students);
    };
  
    const renderStudents = (students) => {
      studentsContainer.innerHTML = '';
      students.forEach(student => {
        const studentCard = document.createElement('div');
        studentCard.className = 'student-card';
        studentCard.innerHTML = `
          <p><strong>Vardas:</strong> ${student.firstname}</p>
          <p><strong>Pavardė:</strong> ${student.lastName}</p>
          <p><strong>Klasė:</strong> ${student.class}</p>
          <a href="details.html?id=${student.id}">Detali informacija</a>
        `;
        studentsContainer.appendChild(studentCard);
      });
    };
  
    sortLastnameLink.addEventListener('click', (e) => {
      e.preventDefault();
      fetchStudents('/api/sort/lastname');
    });
  
    calculateAverageLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetch('/api/average');
      alert('Vidurkiai buvo apskaičiuoti ir įrašyti į failą.');
    });
  
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(searchForm);
      const params = new URLSearchParams();
      for (let [key, value] of formData.entries()) {
        params.append(key, value);
      }
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(params))
      });
      const students = await response.json();
      renderStudents(students);
    });
  
    const loadStudentDetails = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const studentId = urlParams.get('id');
      if (studentId) {
        const response = await fetch(`/api/student/${studentId}`);
        if (response.ok) {
          const student = await response.json();
          const studentDetails = document.getElementById('studentDetails');
          studentDetails.innerHTML = `
            <p><strong>Vardas:</strong> ${student.firstname}</p>
            <p><strong>Pavardė:</strong> ${student.lastName}</p>
            <p><strong>Klasė:</strong> ${student.class}</p>
            <p><strong>Pažymiai:</strong></p>
            <ul>
              ${Object.entries(student.subjects_grades).map(([subject, grade]) => `<li>${subject}: ${grade}</li>`).join('')}
            </ul>
            <p><strong>Vidurkis:</strong> ${(Object.values(student.subjects_grades).reduce((sum, val) => sum + val, 0) / Object.values(student.subjects_grades).length).toFixed(2)}</p>
          `;
        } else {
          document.getElementById('studentDetails').innerHTML = '<p>Moksleivis nerastas.</p>';
        }
      } else {
        document.getElementById('studentDetails').innerHTML = '<p>ID parametras nerastas URL adrese.</p>';
      }
    };
  
    // Tikriname, ar tai yra student.html puslapis
    if (window.location.pathname.endsWith('/details.html')) {
      loadStudentDetails();
    } else {
      fetchStudents();
    }
  });
  