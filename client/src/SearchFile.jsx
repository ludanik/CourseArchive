import { useState } from 'react';
import { useFilesDispatch } from './FilesContext.jsx';

export default function SearchFile() {
  const [text, setText] = useState('');
  const dispatch = useFilesDispatch();

  async function search() {
    const result2 = await fetch('http://127.0.0.1:5000/files', {
      method: 'GET',
      credentials: 'include',
    });
  
    const data2 = await result2.json();
  
    dispatch({
      type: 'set',
      files: data2
    })
  
    dispatch({
      type: 'search',
      keyword: text
    });
  }

  return (
    <>
      <input
        placeholder="Search for file"
        value={text}    
        onChange={e => setText(e.target.value)}
      />
      <button onClick={search}> Search </button>
    </>
  );
}

let nextId = 3;
