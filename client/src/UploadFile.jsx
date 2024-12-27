import { useState } from 'react';
import { useFilesDispatch } from './FilesContext.jsx';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


export default function UploadFile() {
  const dispatch = useFilesDispatch();

  const [file, setFile] = useState(null);

  const [open, setOpen] = useState(false);

  const [type, setType] = useState('');

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onFileChange = e => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

 
  const handleUpload = async (formData) => {
    if (file) {        
      try {
        // You can write the URL of your server or any other endpoint used for file upload
        const result = await fetch('http://127.0.0.1:5000/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
  
        const data = await result.json();
  
        const result2 = await fetch('http://127.0.0.1:5000/files', {
          method: 'GET',
          credentials: 'include',
        });

        const data2 = await result2.json();

        dispatch({
          type: 'set',
          files: data2
        })

      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <>
      <button onClick={handleClickOpen}>
        Upload File
      </button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            formData.append("file", file)
            formData.append("type,", type)
            console.log(formData);
            handleUpload(formData);
            handleClose();
          },
        }}
      >
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
        <InputLabel id="demo-simple-select-label">Document Type</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={type}
          label="Type"
          onChange={handleTypeChange}
        >
          <MenuItem value={"Exam"}>Exam</MenuItem>
          <MenuItem value={"Test"}>Test</MenuItem>
          <MenuItem value={"Assignment"}>Assignment</MenuItem>
          <MenuItem value={"Syllabus"}>Syllabus</MenuItem>
        </Select>
        <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="title"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="code"
            label="Course code"
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="prof"
            label="Professor"
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="year"
            label="Year"
            type="number"
            fullWidth
            variant="standard"
          />
          <input type="file" onChange={onFileChange}/>
          {file && (
                <section>
                File details:
                <ul>
                    <li>Name: {file.name}</li>
                    <li>Type: {file.type}</li>
                    <li>Size: {file.size} bytes</li>
                </ul>
                </section>
            )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Upload</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
