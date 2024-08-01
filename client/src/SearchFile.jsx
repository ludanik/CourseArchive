import { useState } from 'react';
import { useFilesDispatch } from './FilesContext.jsx';

export default function SearchFile() {
  const [text, setText] = useState('');
  const dispatch = useFilesDispatch();
  return (
    <>
      <input
        placeholder="Search for file"
        value={text}    
        onChange={e => setText(e.target.value)}
      />
      <button onClick={() => {
        setText('');
        dispatch({
          type: 'added',
          id: nextId++,
          text: text,
        }); 
      }}>Search</button>
    </>
  );
}

let nextId = 3;
