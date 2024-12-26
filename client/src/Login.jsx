import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';


export default function Login({ setLoggedIn }) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
      };
    
    const handleClose = () => {
        setOpen(false);
    };

    const handleLogin = async (formData) => {       
        try {
        // You can write the URL of your server or any other endpoint used for file upload
        const result = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });
      
        const data = await result.json();

        if (data.error == null) {
            setLoggedIn(true)
        }
    
        } catch (error) {
        console.error(error);
        }
    };
  
  return (
    <>
      <button id="login" onClick={handleClickOpen}>
        Login
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
            handleLogin(formData);
          },
        }}
      >
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
        <TextField
            autoFocus
            required
            margin="dense"
            id="email"
            name="email"
            label="Email"
            type="email"
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
          <Button type="submit">Login</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}