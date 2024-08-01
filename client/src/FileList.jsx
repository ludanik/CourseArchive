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

function File({ file }) {
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useFilesDispatch();
  let fileContent;
  if (isEditing) {
    fileContent = (
      <>
        <input
          value={file.text}
          onChange={e => {
            dispatch({
              type: 'changed',
              file: {
                ...file,
                text: e.target.value
              }
            });
          }} />
        <button onClick={() => setIsEditing(false)}>
          Save
        </button>
      </>
    );
  } else {
    fileContent = (
      <>
        {file.text}
        <button onClick={() => setIsEditing(true)}>
          Edit
        </button>
      </>
    );
  }
  return (
    <label>
      {fileContent}
      <button onClick={() => {
        alert("Viewed!")
      }}>
        View
      </button>
      <button onClick={() => {
        alert("Downloaded!")
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
