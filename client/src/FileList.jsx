import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useFiles, useFilesDispatch } from './FilesContext.jsx';

export default function FileList({ user }) {
  const files = useFiles();
  return (
    <ul>
      {files.map(file => (
        <li key={file.id}>
          <File user={user} file={file} />
        </li>
      ))}
    </ul> 
  );
}

const handleDownloadFile = async (id) => {
  try {
    const url = 'http://127.0.0.1:5000/uploads/' + id
    window.open(url, '_blank').focus();
    const result = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
  } catch (error) {
    console.error(error);
  }
};

function File({ file, user }) {
  const dispatch = useFilesDispatch();

  const [isEditing, setIsEditing] = useState(false);
  
  let fileContent;
  let buttons;

  if (file.author_name === user) {
    buttons = (
      <>
        <button onClick={() => {
        dispatch({
          type: 'deleted',
          id: file.id
        });
      }}>
        Delete
      </button>
      <button onClick={() => setIsEditing(true)}>
          Edit
        </button>
      </>
    );
  }

  if (isEditing) {
    fileContent = (
      <>
        <input
          value={file.name}
          onChange={e => {
            dispatch({
              type: 'changed',
              file: {
                ...file,
                name: e.target.value
              }
            });
          }} />
          <br/>
          <input
          value={file.professor}
          onChange={e => {
            dispatch({
              type: 'changed',
              file: {
                ...file,
                professor: e.target.value
              }
            });
          }} />
          <br/>
          <input
          value={file.course_code}
          onChange={e => {
            dispatch({
              type: 'changed',
              file: {
                ...file,
                course_code: e.target.value
              }
            });
          }} />
          <br/>
          <input
          value={file.year}
          onChange={e => {
            dispatch({
              type: 'changed',
              file: {
                ...file,
                year: e.target.value
              }
            });
          }} />
          <br/>
        <button onClick={() => {
          setIsEditing(false)
          // tell backend we have changed a file
          const result2 = fetch('http://127.0.0.1:5000/update/' + file.id, {
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify(file),
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }}>
          Save
        </button>
      </>
    );
  }
  else {
    fileContent = (
      <>
        {file.name}
        <br />
        {file.professor}
        <br/>
        {file.course_code}
        <br/>
        {file.year} 
        <br/>
        {file.author_name}
        <br/>
      </>
    );
  }

  return (
    <label>
      {fileContent}
      <button onClick={() => {
        handleDownloadFile(file.id)
      }}>
        Download
      </button>
      {buttons}
    </label>
  );
}
