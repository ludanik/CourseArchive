import { createContext, useContext, useReducer } from 'react';

const FilesContext = createContext(null);

const FilesDispatchContext = createContext(null);

export function FilesProvider({ children }) {
  const [files, dispatch] = useReducer(
    filesReducer,
    initialFiles
  );

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

function filesReducer(files, action) {
  switch (action.type) {
    case 'added': {
      return [...files, {
        id: action.id,
        text: action.text,
        done: false
      }];
    }
    case 'changed': {
      return files.map(t => {
        if (t.id === action.file.id) {
          return action.file;
        } else {
          return t;
        }
      });
    }
    case 'deleted': {
      return files.filter(t => t.id !== action.id);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

const initialFiles = [
  { id: 0, text: 'Philosopher’s Path', done: true },
  { id: 1, text: 'Visit the temple', done: false },
  { id: 2, text: 'Drink matcha', done: false }
];
