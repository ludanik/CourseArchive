import { createContext, useContext, useReducer, useEffect } from 'react';

const FilesContext = createContext(null);
const FilesDispatchContext = createContext(null);

const handleFetchFiles = async () => {
  try {
    const result = await fetch('http://127.0.0.1:5000/files', {
      method: 'GET',
    });

    const data = await result.json();
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
      return [...files, {
        id: action.id,
        text: action.text,
        done: false,
      }];
    }
    case 'changed': {
      return files.map(t => (t.id === action.file.id ? action.file : t));
    }
    case 'deleted': {
      fetch('http://127.0.0.1:5000/delete/' + action.id, {
        method: 'GET',
      });

      return files.filter(t => t.id !== action.id);
    }
    default: {
      throw new Error('Unknown action: ' + action.type);
    }
  }
};

export function FilesProvider({ children }) {
  const [files, dispatch] = useReducer(filesReducer, []);

  useEffect(() => {
    const fetchFiles = async () => {
      const initialFiles = await handleFetchFiles();
      dispatch({ type: 'set', files: initialFiles });
    };

    fetchFiles();
  }, []);

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