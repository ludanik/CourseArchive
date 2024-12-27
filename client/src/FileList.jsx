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
  let fileContent;
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
  let deleteButton;
  if (file.author_name === user) {
    deleteButton = (
      <button onClick={() => {
        dispatch({
          type: 'deleted',
          id: file.id
        });
      }}>
        Delete
      </button>
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
      {deleteButton}
    </label>
  );
}
