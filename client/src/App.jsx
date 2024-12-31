import SearchFile from './SearchFile.jsx';
import FileList from './FileList.jsx';
import UploadFile from './UploadFile.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'

import { FilesProvider } from './FilesContext.jsx';
import { useState } from 'react';

export default function FileApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  
  const handleLogOut = () => {
    setLoggedIn(false);
    setUser('');
  };  

  if (loggedIn) {
    return ( 
      <FilesProvider>
        <div id="top">
            <h1>Course Files</h1>
            <div id="logout">
              <h3>Logged in as {user}</h3>
              <button onClick={handleLogOut}>Log out</button>
            </div>
        </div>
        <div id="search">
          <UploadFile />
          <SearchFile />
        </div>
        <FileList user={user} />
        
      </FilesProvider>
    );
  }
  else {
    return (
      <>
        <div id="login">
          <Login setLoggedIn={setLoggedIn} setUser={setUser}/>
          <Register setLoggedIn={setLoggedIn} setUser={setUser}/>
        </div>
      </>
    )
  }
}
