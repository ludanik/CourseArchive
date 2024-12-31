import { useState } from 'react';
import { useFilesDispatch } from './FilesContext.jsx';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import * as React from 'react';

export default function SearchFile() {
  const [type, setType] = useState('null');
  const [course, setCourse] = useState('null');
  const [prof, setProf] = useState('null');
  
  const dispatch = useFilesDispatch();

  async function search() {
    const result2 = await fetch('http://127.0.0.1:5000/files?type=' + type + "&course=" + course + "&prof=" + prof, {
      method: 'GET',
      credentials: 'include',
    });
  
    const data2 = await result2.json();
  
    dispatch({
      type: 'set',
      files: data2
    })
  }

  return (
    <>
      <div id="autocomplete">
        <Autocomplete
          id="type"
          size="medium"
          fullWidth
          style={{
          width: 200,
          color: "white"
          }}
          options={types}
          renderInput={(params) => <TextField {...params} label="Document type" />}
          onChange={(event, value) => setType(value)}
        />
        <Autocomplete
          id="course-code"
          size="medium"
          freeSolo
          fullWidth
          style={{
          width: 200,
          }}
          options={courses}
          renderInput={(params) => <TextField {...params} label="Course code" />}
          onChange={(event, value) => setCourse(value)}
        />
        <Autocomplete
          id="professor"
          freeSolo
          fullWidth
          options={professors}
          renderInput={(params) => <TextField {...params} label="Professor" />}
          style={{
          width: 200,
          }}
          onChange={(event, value) => setProf(value)}
        />
      </div>
      
      <button onClick={search}> Search </button>
    </>
  );
}

const types = [
  "Syllabus",
  "Exam",
  "Test",
  "Assignment"
];

const courses = [
  "EECS3101",
  "EECS2101"
];


const professors = [
  "Ilir Dema",
  "Aditya Potukuchi",
  "Barack Dema"
];

