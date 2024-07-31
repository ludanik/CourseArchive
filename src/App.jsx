import SearchFile from './SearchFile.jsx';
import FileList from './FileList.jsx';
import UploadFile from './UploadFile.jsx'
import { FilesProvider } from './FilesContext.jsx';

export default function FileApp() {
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
