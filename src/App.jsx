import { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import Sidebar from './components/Sidebar';
import ContentViewer from './components/ContentViewer';
import CompareView from './components/CompareView';
import ConfirmDialog from './components/ConfirmDialog';
import LoadingOverlay from './components/LoadingOverlay';
import ToastContainer from './components/ToastContainer';
import { isOOXMLFile, loadOOXMLFile, downloadOOXMLFile } from './lib/fileUtils';
import { formatXML } from './lib/xmlUtils';
import { generateProfessionalDiff } from './lib/diffUtils';
import { useToast } from './hooks/useToast';
import { useConfirm } from './hooks/useConfirm';

export default function App() {
  const [currentMode, setCurrentMode] = useState('viewer');
  const [loadedFiles, setLoadedFiles] = useState({});
  const fileKeyCounter = useRef(0);
  const [currentFileKey, setCurrentFileKey] = useState(null);
  const [currentFilePath, setCurrentFilePath] = useState(null);
  const [currentLines, setCurrentLines] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isRawEditMode, setIsRawEditMode] = useState(false);
  const [rawEditContent, setRawEditContent] = useState('');
  const [originalLines, setOriginalLines] = useState([]);
  const [editHistory, setEditHistory] = useState([]); // stack of lines[] snapshots (max 20)
  const [loading, setLoading] = useState(false);

  // Compare diff state
  const [diffResult, setDiffResult] = useState(null);

  const { toasts, showToast, removeToast } = useToast();
  const { dialog, confirm, onConfirm, onCancel } = useConfirm();

  const loadFile = useCallback(
    async (file, fileKey) => {
      if (!isOOXMLFile(file)) {
        showToast('Please select a valid OOXML file (.docx, .xlsx, .xlsm, .pptx, etc.)', 'error');
        return;
      }
      try {
        setLoading(true);
        const data = await loadOOXMLFile(file);
        setLoadedFiles((prev) => ({ ...prev, [fileKey]: data }));
        showToast(`Loaded ${file.name} successfully`, 'success');
      } catch (err) {
        showToast(`Error loading file: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const handleModeChange = useCallback((mode) => {
    setCurrentMode(mode);
    setCurrentFileKey(null);
    setCurrentFilePath(null);
    setCurrentLines([]);
    setOriginalLines([]);
    setEditHistory([]);
    setIsEditing(false);
    setIsRawEditMode(false);
    setRawEditContent('');
    setDiffResult(null);
  }, []);

  const handleFilesSelected = useCallback(
    (files, context) => {
      if (context === 'explorer') {
        const valid = files.filter(isOOXMLFile);
        const invalid = files.length - valid.length;
        valid.forEach((file) => {
          fileKeyCounter.current += 1;
          loadFile(file, 'file' + fileKeyCounter.current);
        });
        if (invalid > 0) {
          showToast(`${invalid} file(s) skipped — unsupported format`, 'error');
        }
      } else if (context === 'compare1') {
        if (files[0] && isOOXMLFile(files[0])) {
          loadFile(files[0], 'file1');
        } else if (files[0]) {
          showToast('Please select a valid OOXML file', 'error');
        }
      } else if (context === 'compare2') {
        if (files[0] && isOOXMLFile(files[0])) {
          loadFile(files[0], 'file2');
        } else if (files[0]) {
          showToast('Please select a valid OOXML file', 'error');
        }
      }
    },
    [loadFile, showToast]
  );

  const handleDrop = useCallback(
    (files, mode) => {
      if (mode === 'invalid') {
        showToast('Please drop valid OOXML files (.docx, .xlsx, .xlsm, .pptx, etc.)', 'error');
        return;
      }
      if (mode === 'compare') {
        if (files.length >= 2) {
          loadFile(files[0], 'file1');
          setTimeout(() => loadFile(files[1], 'file2'), 100);
        } else if (files.length === 1) {
          const fileKeys = Object.keys(loadedFiles);
          if (fileKeys.length === 0) {
            loadFile(files[0], 'file1');
          } else if (!fileKeys.includes('file2')) {
            loadFile(files[0], 'file2');
          } else {
            loadFile(files[0], 'file1');
          }
        }
      } else {
        files.forEach((file) => {
          fileKeyCounter.current += 1;
          loadFile(file, 'file' + fileKeyCounter.current);
        });
      }
    },
    [loadFile, loadedFiles, showToast]
  );

  const handleAddFile = useCallback(
    (files) => {
      const valid = files.filter(isOOXMLFile);
      const invalid = files.length - valid.length;
      valid.forEach((file) => {
        fileKeyCounter.current += 1;
        loadFile(file, 'file' + fileKeyCounter.current);
      });
      if (invalid > 0) {
        showToast(`${invalid} file(s) skipped — unsupported format`, 'error');
      }
    },
    [loadFile, showToast]
  );

  const doRemoveFile = useCallback(
    (fileKey) => {
      setLoadedFiles((prev) => {
        const next = { ...prev };
        delete next[fileKey];
        return next;
      });
      if (currentFileKey === fileKey) {
        setCurrentFileKey(null);
        setCurrentFilePath(null);
        setCurrentLines([]);
        setIsEditing(false);
      }
      if (currentMode === 'compare') {
        setDiffResult(null);
      }
      showToast('File removed', 'info');
    },
    [currentFileKey, currentMode, showToast]
  );

  const handleRemoveFile = useCallback(
    async (fileKey) => {
      const fileName = loadedFiles[fileKey]?.name || 'this file';
      const confirmed = await confirm(
        'Remove File',
        `Remove "${fileName}" from the workspace?`,
        'Remove File',
        '🗑️'
      );
      if (confirmed) doRemoveFile(fileKey);
    },
    [loadedFiles, confirm, doRemoveFile]
  );

  const handleSelectFile = useCallback(
    (fileKey, filePath) => {
      setCurrentFileKey(fileKey);
      setCurrentFilePath(filePath);
      setIsRawEditMode(false);
      setRawEditContent('');
      setIsEditing(false);
      setEditHistory([]);
      setLoadedFiles((prev) => {
        const fileData = prev[fileKey];
        if (fileData) {
          const content = fileData.files[filePath] || '';
          const formatted = formatXML(content);
          const lines = formatted.split('\n');
          setCurrentLines(lines);
          setOriginalLines(lines);
        }
        return prev;
      });
    },
    []
  );

  const handleLineChange = useCallback((index, newValue) => {
    setEditHistory((h) => [...h.slice(-19), [...currentLines]]);
    setCurrentLines((prev) => {
      const next = [...prev];
      next[index] = newValue;
      return next;
    });
    setIsEditing(true);
  }, [currentLines]);

  const handleDeleteLine = useCallback(
    async (index) => {
      const line = currentLines[index]?.trim() || '';
      const snippet = line.length > 80 ? line.slice(0, 80) + '…' : line;
      const confirmed = await confirm(
        'Delete Line',
        `Delete line ${index + 1}?${snippet ? '\n\n' + snippet : ''}`,
        'Delete Line',
        '⚠️'
      );
      if (!confirmed) return;
      setEditHistory((h) => [...h.slice(-19), [...currentLines]]);
      setCurrentLines((prev) => prev.filter((_, i) => i !== index));
      setIsEditing(true);
      showToast('Line deleted', 'info');
    },
    [currentLines, confirm, showToast]
  );

  // Toggle between line-view and raw-edit modes
  const handleToggleEditMode = useCallback(() => {
    if (!isRawEditMode) {
      // Push current state to history before entering raw edit mode
      setEditHistory((h) => [...h.slice(-19), [...currentLines]]);
      setRawEditContent(currentLines.join('\n'));
      setIsRawEditMode(true);
      setIsEditing(true);
    } else {
      // Leave raw edit mode — sync textarea back to line array
      const lines = rawEditContent.split('\n');
      setCurrentLines(lines);
      setIsRawEditMode(false);
    }
  }, [isRawEditMode, currentLines, rawEditContent]);

  const handleRawContentChange = useCallback((value) => {
    setRawEditContent(value);
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!currentFileKey || !currentFilePath) return;
    const confirmed = await confirm(
      'Save Changes',
      `Save changes to "${currentFilePath}"?\n\nThis will update the file in memory and affect any future comparisons in this session.`,
      'Save Changes',
      '💾'
    );
    if (!confirmed) return;

    // If still in raw edit mode, commit the textarea content first
    const lines = isRawEditMode ? rawEditContent.split('\n') : currentLines;
    const content = lines.join('\n');

    setCurrentLines(lines);
    setOriginalLines(lines);
    setEditHistory([]);
    setIsRawEditMode(false);
    setRawEditContent('');
    setLoadedFiles((prev) => ({
      ...prev,
      [currentFileKey]: {
        ...prev[currentFileKey],
        files: { ...prev[currentFileKey].files, [currentFilePath]: content },
      },
    }));
    setIsEditing(false);
    showToast('Changes saved', 'success');
  }, [currentFileKey, currentFilePath, currentLines, isRawEditMode, rawEditContent, confirm, showToast]);

  const handleUndo = useCallback(() => {
    if (editHistory.length === 0) return;
    const prev = editHistory[editHistory.length - 1];
    setCurrentLines([...prev]);
    setEditHistory((h) => h.slice(0, -1));
    // If we were in raw edit mode, exit it and restore the previous lines
    if (isRawEditMode) {
      setRawEditContent(prev.join('\n'));
      setIsRawEditMode(false);
    }
    // If we've undone back to the original content, clear the dirty flag
    const isClean = prev.join('\n') === originalLines.join('\n');
    setIsEditing(!isClean);
  }, [editHistory, isRawEditMode, originalLines]);

  const handleDiscard = useCallback(async () => {
    const confirmed = await confirm(
      'Discard Changes',
      'Discard all unsaved changes and revert to the original content?',
      'Discard',
      '↩️'
    );
    if (!confirmed) return;
    setCurrentLines([...originalLines]);
    setRawEditContent(originalLines.join('\n'));
    setIsRawEditMode(false);
    setEditHistory([]);
    setIsEditing(false);
    showToast('Changes discarded', 'info');
  }, [originalLines, confirm, showToast]);

  const handleDownload = useCallback(async () => {
    if (!currentFileKey) return;
    const fileData = loadedFiles[currentFileKey];
    if (!fileData) return;
    try {
      setLoading(true);
      await downloadOOXMLFile(fileData);
      showToast(`Downloaded ${fileData.name}`, 'success');
    } catch (err) {
      showToast(`Error downloading file: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentFileKey, loadedFiles, showToast]);

  const handleDeleteXmlFile = useCallback(async (fileKey, filePath) => {
    const confirmed = await confirm(
      'Delete File',
      `Delete "${filePath}" from the archive?\n\nThis will remove it from the loaded OOXML package.`,
      'Delete File',
      '🗑️'
    );
    if (!confirmed) return;
    setLoadedFiles((prev) => {
      const filesCopy = { ...prev[fileKey].files };
      delete filesCopy[filePath];
      return { ...prev, [fileKey]: { ...prev[fileKey], files: filesCopy } };
    });
    if (currentFileKey === fileKey && currentFilePath === filePath) {
      setCurrentFilePath(null);
      setCurrentLines([]);
      setIsEditing(false);
    }
    showToast(`Deleted ${filePath.split('/').pop()}`, 'info');
  }, [confirm, currentFileKey, currentFilePath, showToast]);

  const handleDeleteCurrentFile = useCallback(async () => {
    if (!currentFileKey) return;
    const fileName = loadedFiles[currentFileKey]?.name || 'this file';
    const confirmed = await confirm(
      'Remove File',
      `Remove "${fileName}" from the workspace?`,
      'Remove File',
      '🗑️'
    );
    if (confirmed) doRemoveFile(currentFileKey);
  }, [currentFileKey, loadedFiles, confirm, doRemoveFile]);

  const handleClearComparison = useCallback(async () => {
    const confirmed = await confirm(
      'Clear Comparison',
      'Remove all loaded files and reset the workspace?',
      'Clear All',
      '🧹'
    );
    if (!confirmed) return;
    setLoadedFiles({});
    setDiffResult(null);
    showToast('Comparison cleared', 'info');
  }, [confirm, showToast]);

  const handleSelectCompareFile = useCallback(
    (filePath) => {
      setLoadedFiles((prev) => {
        const fileKeys = Object.keys(prev);
        if (fileKeys.length < 2) return prev;
        const file1 = prev[fileKeys[0]];
        const file2 = prev[fileKeys[1]];
        const content1 = file1.files[filePath] || '(File not present)';
        const content2 = file2.files[filePath] || '(File not present)';
        const formatted1 = formatXML(content1);
        const formatted2 = formatXML(content2);
        const result = generateProfessionalDiff(formatted1, formatted2);
        setDiffResult(result);
        return prev;
      });
    },
    []
  );

  const fileKeys = Object.keys(loadedFiles);
  const showUpload = currentMode === 'viewer' ? fileKeys.length === 0 : fileKeys.length === 0;
  const showSidebar = fileKeys.length > 0;
  const showViewerContent = currentMode === 'viewer' && fileKeys.length > 0;
  const showCompareContent = currentMode === 'compare' && fileKeys.length >= 2;
  const showCompareUploadSecond = currentMode === 'compare' && fileKeys.length === 1;

  const compareFileKeys = Object.keys(loadedFiles);
  const file1Name = compareFileKeys[0] ? loadedFiles[compareFileKeys[0]]?.name : null;
  const file2Name = compareFileKeys[1] ? loadedFiles[compareFileKeys[1]]?.name : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      <Header currentMode={currentMode} onModeChange={handleModeChange} />

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Upload Area */}
        {showUpload && (
          <UploadArea
            mode={currentMode}
            loadedFiles={loadedFiles}
            onFilesSelected={handleFilesSelected}
            onDrop={handleDrop}
            onRemoveFile={handleRemoveFile}
          />
        )}

        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            mode={currentMode}
            loadedFiles={loadedFiles}
            currentFilePath={currentFilePath}
            onSelectFile={handleSelectFile}
            onRemoveFile={handleRemoveFile}
            onDeleteXmlFile={handleDeleteXmlFile}
            onAddFile={handleAddFile}
            onSelectCompareFile={handleSelectCompareFile}
          />
        )}

        {/* Main content */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Viewer mode */}
          {showViewerContent && (
            <div className="flex-1 flex min-h-0">
              <div className="flex-1 flex flex-col bg-white min-h-0">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex-shrink-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-gray-800 truncate min-w-0">
                      {currentFileKey && currentFilePath
                        ? `${loadedFiles[currentFileKey]?.name}  ›  ${currentFilePath}`
                        : 'Select a file to view'}
                    </h4>
                    <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                      {currentFileKey && (
                        <>
                          <button
                            onClick={handleToggleEditMode}
                            className={`px-3 py-1.5 rounded text-sm transition-colors ${
                              isRawEditMode
                                ? 'bg-blue-700 text-white hover:bg-blue-800'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title={isRawEditMode ? 'Switch to line view' : 'Edit full file'}
                          >
                            {isRawEditMode ? '👁 View' : '✏️ Edit'}
                          </button>
                          {editHistory.length > 0 && (
                            <button
                              onClick={handleUndo}
                              className="px-3 py-1.5 rounded text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                              title={`Undo last change (${editHistory.length} step${editHistory.length !== 1 ? 's' : ''} available)`}
                            >
                              ↩ Undo
                            </button>
                          )}
                          {isEditing && (
                            <button
                              onClick={handleDiscard}
                              className="px-3 py-1.5 rounded text-sm bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                              title="Discard all unsaved changes"
                            >
                              ✕ Discard
                            </button>
                          )}
                          <button
                            onClick={handleDownload}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                            title="Download updated OOXML file"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Download
                          </button>
                          <button
                            onClick={handleDeleteCurrentFile}
                            className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            🗑️ Remove File
                          </button>
                        </>
                      )}
                      {isEditing && (
                        <button
                          onClick={handleSave}
                          className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          💾 Save Changes
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative min-h-0">
                  <div className="absolute inset-0 bg-editor-bg">
                    {currentLines.length > 0 ? (
                      <ContentViewer
                        lines={currentLines}
                        rawEditMode={isRawEditMode}
                        rawContent={rawEditContent}
                        onLineChange={handleLineChange}
                        onDeleteLine={handleDeleteLine}
                        onRawContentChange={handleRawContentChange}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        Select a file from the sidebar to view its content
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compare mode: show upload for second file while first is loaded */}
          {showCompareUploadSecond && (
            <UploadArea
              mode={currentMode}
              loadedFiles={loadedFiles}
              onFilesSelected={handleFilesSelected}
              onDrop={handleDrop}
              onRemoveFile={handleRemoveFile}
            />
          )}

          {/* Compare mode with 2 files */}
          {showCompareContent && (
            <CompareView
              file1Name={file1Name}
              file2Name={file2Name}
              leftLines={diffResult?.leftLines || []}
              rightLines={diffResult?.rightLines || []}
              stats={diffResult?.stats || null}
              onClear={handleClearComparison}
              onRemoveFile1={() => handleRemoveFile(compareFileKeys[0])}
              onRemoveFile2={() => handleRemoveFile(compareFileKeys[1])}
            />
          )}
        </main>
      </div>

      <footer className="bg-gray-800 text-gray-400 text-center text-xs py-2 flex-shrink-0">
        Developed by <span className="text-white font-medium">Kanti Vekariya</span>
      </footer>

      <LoadingOverlay visible={loading} />
      <ConfirmDialog dialog={dialog} onConfirm={onConfirm} onCancel={onCancel} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
