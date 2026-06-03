import { useRef, useState } from 'react';
import { isOOXMLFile } from '../lib/fileUtils';

export default function UploadArea({ mode, loadedFiles, onFilesSelected, onDrop, onRemoveFile }) {
  const explorerInputRef = useRef(null);
  const compare1InputRef = useRef(null);
  const compare2InputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const fileKeys = Object.keys(loadedFiles);
  const file1Data = loadedFiles['file1'];
  const file2Data = loadedFiles['file2'];

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(isOOXMLFile);
    if (files.length === 0) {
      onDrop([], 'invalid');
      return;
    }
    onDrop(files, mode);
  };

  const handleExplorerInput = (e) => {
    const files = Array.from(e.target.files);
    onFilesSelected(files, 'explorer');
    e.target.value = '';
  };

  const handleCompare1Input = (e) => {
    const file = e.target.files[0];
    if (file) onFilesSelected([file], 'compare1');
    e.target.value = '';
  };

  const handleCompare2Input = (e) => {
    const file = e.target.files[0];
    if (file) onFilesSelected([file], 'compare2');
    e.target.value = '';
  };

  return (
    <div
      className={`w-full flex items-center justify-center bg-white border-2 border-dashed transition-colors ${
        dragOver ? 'border-blue-400' : 'border-gray-300 hover:border-blue-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center p-8 max-w-2xl w-full">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Drop OOXML Files Here</h3>
        <p className="text-gray-500 mb-6">Supports .docx, .xlsx, .xlsm, .pptx and other OOXML formats</p>

        {mode === 'viewer' ? (
          <div>
            <div
              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => explorerInputRef.current?.click()}
            >
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-3">📄</div>
                <span className="text-gray-600 font-medium">Select OOXML File</span>
                <p className="text-sm text-gray-400 mt-1">Supports .docx, .xlsx, .xlsm, .pptx</p>
              </div>
            </div>
            <input
              ref={explorerInputRef}
              type="file"
              className="hidden"
              accept=".docx,.xlsx,.xlsm,.pptx,.dotx,.xltx,.potx"
              multiple
              onChange={handleExplorerInput}
            />
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File 1 Card */}
              {file1Data ? (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg hover:border-blue-400 transition-colors">
                  <div className="flex items-center justify-between h-32 p-2">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="text-2xl">📄</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-800 truncate">{file1Data.name}</div>
                        <div className="text-sm text-gray-500">Ready to compare</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveFile('file1')}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => compare1InputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center h-32">
                    <div className="text-3xl mb-2">📄</div>
                    <span className="text-gray-600 font-medium text-center">Select First File</span>
                  </div>
                </div>
              )}

              {/* File 2 Card */}
              {file2Data ? (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg hover:border-green-400 transition-colors">
                  <div className="flex items-center justify-between h-32 p-2">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="text-2xl">📄</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-800 truncate">{file2Data.name}</div>
                        <div className="text-sm text-gray-500">Ready to compare</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveFile('file2')}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors cursor-pointer"
                  onClick={() => compare2InputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center h-32">
                    <div className="text-3xl mb-2">📄</div>
                    <span className="text-gray-600 font-medium text-center">Select Second File</span>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">Or drag and drop two files to compare them</p>
            </div>

            <input
              ref={compare1InputRef}
              type="file"
              className="hidden"
              accept=".docx,.xlsx,.xlsm,.pptx,.dotx,.xltx,.potx"
              onChange={handleCompare1Input}
            />
            <input
              ref={compare2InputRef}
              type="file"
              className="hidden"
              accept=".docx,.xlsx,.xlsm,.pptx,.dotx,.xltx,.potx"
              onChange={handleCompare2Input}
            />
          </div>
        )}
      </div>
    </div>
  );
}
