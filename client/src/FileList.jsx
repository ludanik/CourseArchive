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
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useFilesDispatch();
  let fileContent;
  fileContent = (
    <>
      {file.name} {file.course_code} {file.professor} {file.session} {file.year}
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
