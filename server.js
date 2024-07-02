const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const students = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'students.json')).toString());

// API endpoint moksleivių duomenims gauti
app.get('/api/students', (req, res) => {
  res.json(students);
});

// API endpoint specifinio moksleivio duomenims gauti
app.get('/api/student/:id', (req, res) => {
  const studentId = parseInt(req.params.id);
  const student = students.find(s => s.id === studentId);
  if (student) {
    res.json(student);
  } else {
    res.status(404).send('Moksleivis nerastas');
  }
});

// API endpoint moksleivių rikiavimui pagal pavardę
app.get('/api/sort/lastname', (req, res) => {
  const sortedStudents = students.slice().sort((a, b) => a.lastName.localeCompare(b.lastName));
  res.json(sortedStudents);
});

// API endpoint moksleivio paieškai
app.post('/api/search/', (req, res) => {
  const { firstname, lastName, class: className } = req.body;
  const results = students.filter(student =>
    (!firstname || student.firstname.includes(firstname)) &&
    (!lastName || student.lastName.includes(lastName)) &&
    (!className || student.class === className)
  );
  res.json(results);
});

// API endpoint vidurkių apskaičiavimui ir įrašymui į failą
app.get('/api/average', (req, res) => {
  const averages = students.map(student => {
    const grades = Object.values(student.subjects_grades);
    const average = (grades.reduce((sum, val) => sum + val, 0) / grades.length).toFixed(2);
    return { ...student, average };
  });

  fs.writeFileSync(path.join(__dirname, 'data', 'averages.txt'), JSON.stringify(averages, null, 2));

  res.send('Vidurkiai buvo apskaičiuoti ir įrašyti į failą.');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveris veikia ant http://localhost:${PORT}`));
