import { useState } from 'react';
import { useFilesDispatch } from './FilesContext.jsx';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function UploadFile() {
  const dispatch = useFilesDispatch();

  const [file, setFile] = useState(null);

  const [open, setOpen] = useState(false);

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
        });
  
        const data = await result.json();
  
        const result2 = await fetch('http://127.0.0.1:5000/files', {
          method: 'GET',
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
            console.log(formData);
            handleUpload(formData);
            handleClose();
          },
        }}
      >
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
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
            name="session"
            label="Session"
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
