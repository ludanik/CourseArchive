import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useFiles, useFilesDispatch } from './FilesContext.jsx';

export default function FileList() {
  const files = useFiles();
  return (
    <ul>
      {files.map(file => (
        <li key={file.id}>
          <File file={file} />
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
    });
  } catch (error) {
    console.error(error);
  }
};

function File({ file }) {
  const dispatch = useFilesDispatch();
  let fileContent;
  fileContent = (
    <>
      Title: {file.name}
      <br />
      Professor: {file.professor}
      <br/>
      Session: {file.session}
      <br/>
      Course code: {file.course_code}
      <br/>
      Year: {file.year}
      <br/>
    </>
  );
  return (
    <label>
      {fileContent}
      <button onClick={() => {
        handleDownloadFile(file.id)
      }}>
        Download
      </button>
      <button onClick={() => {
        dispatch({
          type: 'deleted',
          id: file.id
        });
      }}>
        Delete
      </button>
    </label>
  );
}
