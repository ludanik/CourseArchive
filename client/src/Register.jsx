import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';


export default function Register() {

    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
      };
    
    const handleClose = () => {
        setOpen(false);
    };

    const handleRegister = async (formData) => {       
        try {
        // You can write the URL of your server or any other endpoint used for file upload
        const result = await fetch('http://127.0.0.1:5000/register', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });
      
        const data = await result.json();
    
        } catch (error) {
        console.error(error);
        }
    };
  
  return (
    <>
      <button id="login" onClick={handleClickOpen}>
        Register
      </button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            console.log(formData);
            handleRegister(formData);
          },
        }}
      >
        <DialogTitle>Register</DialogTitle>
        <DialogContent>
        <TextField
            autoFocus
            required
            margin="dense"
            id="username"
            name="username"
            label="Username"
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="password"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Register</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}