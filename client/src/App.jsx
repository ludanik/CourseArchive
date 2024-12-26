import SearchFile from './SearchFile.jsx';
import FileList from './FileList.jsx';
import UploadFile from './UploadFile.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'

import { FilesProvider } from './FilesContext.jsx';
import { useState } from 'react';

export default function FileApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  
  if (loggedIn) {
    return ( 
      <FilesProvider>
        <div id="main">
          <h1>Course Files</h1>
          <div>
            <UploadFile />
            <SearchFile />
          </div>
          <FileList />
        </div>
      </FilesProvider>
    );
  }
  else {
    return (
      <>
        <div id="login">
          <Login setLoggedIn={setLoggedIn}/>
          <Register setLoggedIn={setLoggedIn}/>
        </div>
      </>
    )
  }
}
