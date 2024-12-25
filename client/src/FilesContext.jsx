import { createContext, useContext, useReducer, useEffect } from 'react';

const FilesContext = createContext(null);
const FilesDispatchContext = createContext(null);

export const fetchFiles = async (dispatch, handleFetchFiles) => {
  const initialFiles = await handleFetchFiles();
  dispatch({ type: 'set', files: initialFiles });
};

const handleFetchFiles = async () => {
  try {
    const result = await fetch('http://127.0.0.1:5000/files', {
      method: 'GET',
      credentials: 'include',
    });
    const data = await result.json();
    if (data.error != null) {
      return [];
    }
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const filesReducer = (files, action) => {
  switch (action.type) {
    case 'set': {
      return action.files;
    }
    case 'added': {
      return [...files, action.file];
    }
    case 'changed': {
      return files.map(t => (t.id === action.file.id ? action.file : t));
    }
    case 'deleted': {
      fetch('http://127.0.0.1:5000/delete/' + action.id, {
        method: 'DELETE',
      });

      return files.filter(t => t.id !== action.id);
    }
    case 'search': {
      return files.filter(t => t.name.includes(action.keyword))
    }
    default: {
      throw new Error('Unknown action: ' + action.type);
    }
  }
};

export function FilesProvider({ children }) {
  const [files, dispatch] = useReducer(filesReducer, []);

  useEffect(() => {
    // Call fetchFiles within useEffect
    fetchFiles(dispatch, handleFetchFiles);
  }, [dispatch, handleFetchFiles]);

  console.log(files)

  return (
    <FilesContext.Provider value={files}>
      <FilesDispatchContext.Provider value={dispatch}>
        {children}
      </FilesDispatchContext.Provider>
    </FilesContext.Provider>
  );
}

export function useFiles() {
  return useContext(FilesContext);
}

export function useFilesDispatch() {
  return useContext(FilesDispatchContext);
}