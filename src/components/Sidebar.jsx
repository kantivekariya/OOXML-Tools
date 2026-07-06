import { useState, useRef } from 'react';
import { getFileIcon, getFileTypeColor, isOOXMLFile } from '../lib/fileUtils';
import FileTreeNode from './FileTreeNode';
import HashBadge from './HashBadge';

function buildTreeStructure(filePaths) {
  const tree = {};
  filePaths.forEach((filePath) => {
    const parts = filePath.split('/');
    let current = tree;
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          isFile: index === parts.length - 1,
          fullPath: parts.slice(0, index + 1).join('/'),
          children: {},
        };
      }
      current = current[part].children;
    });
  });
  return tree;
}

function FileGroup({ fileKey, fileData, currentFilePath, onSelectFile, onRemoveFile, onDeleteXmlFile }) {
  const [open, setOpen] = useState(true);
  const xmlCount = Object.keys(fileData.files).length;
  const typeColor = getFileTypeColor(fileData.name);
  const icon = getFileIcon(fileData.name);

  const files = Object.keys(fileData.files).sort();
  const tree = buildTreeStructure(files);

  return (
    <div className="sidebar-file-group">
      <div className="sidebar-file-header" onClick={() => setOpen((v) => !v)}>
        <span className={`sidebar-chevron ${open ? 'open' : ''}`}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </span>
        <span className="sidebar-type-bar" style={{ background: typeColor }} />
        <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
        <span className="sidebar-filename" title={fileData.name}>{fileData.name}</span>
        <span className="sidebar-count">{xmlCount}</span>
        <button
          className="sidebar-remove"
          title="Remove"
          onClick={(e) => { e.stopPropagation(); onRemoveFile(fileKey); }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="px-2 pb-1.5 pl-6" onClick={(e) => e.stopPropagation()}>
        <HashBadge hash={fileData.hash} />
      </div>
      {open && (
        <div className="sidebar-tree">
          {Object.keys(tree).sort().map((name) => (
            <FileTreeNode
              key={name}
              node={tree[name]}
              name={name}
              fileKey={fileKey}
              currentFilePath={currentFilePath}
              onSelectFile={onSelectFile}
              onDeleteXmlFile={onDeleteXmlFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Comparison file tree node (shows added/removed/modified status)
function CompareTreeNode({ node, name, file1, file2, onSelectFile }) {
  const [expanded, setExpanded] = useState(false);

  if (node.isFile) {
    const inFile1 = Object.prototype.hasOwnProperty.call(file1.files, node.fullPath);
    const inFile2 = Object.prototype.hasOwnProperty.call(file2.files, node.fullPath);

    let status = '';
    let statusClass = '';
    let icon = '📄';

    if (inFile1 && inFile2) {
      if (file1.files[node.fullPath] !== file2.files[node.fullPath]) {
        status = ' (Modified)';
        statusClass = 'text-yellow-400';
        icon = '📝';
      }
    } else if (inFile1 && !inFile2) {
      status = ' (Removed)';
      statusClass = 'text-red-400 line-through';
      icon = '🗑️';
    } else if (!inFile1 && inFile2) {
      status = ' (Added)';
      statusClass = 'text-green-400';
      icon = '✨';
    }

    return (
      <div
        className="tree-item flex items-center p-2 cursor-pointer text-editor-text hover:bg-gray-700 rounded"
        onClick={() => onSelectFile(node.fullPath)}
      >
        <span className="mr-2">{icon}</span>
        <span className={`text-sm ${statusClass}`}>{name}{status}</span>
      </div>
    );
  }

  const hasChildren = Object.keys(node.children).length > 0;

  return (
    <div className="tree-item">
      <div
        className="flex items-center p-2 cursor-pointer text-editor-text hover:bg-gray-700 rounded"
        onClick={(e) => { e.stopPropagation(); if (hasChildren) setExpanded((v) => !v); }}
      >
        <span className={`mr-1 text-xs transform transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
        <span className="mr-2">📁</span>
        <span className="text-sm font-medium">{name}</span>
      </div>
      {expanded && hasChildren && (
        <div className="ml-4">
          {Object.keys(node.children).sort().map((childName) => (
            <CompareTreeNode
              key={childName}
              node={node.children[childName]}
              name={childName}
              file1={file1}
              file2={file2}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  mode,
  loadedFiles,
  currentFilePath,
  onSelectFile,
  onRemoveFile,
  onDeleteXmlFile,
  onAddFile,
  onSelectCompareFile,
}) {
  const addFileInputRef = useRef(null);
  const fileKeys = Object.keys(loadedFiles);
  const count = fileKeys.length;

  const handleAddFileInput = (e) => {
    const files = Array.from(e.target.files);
    onAddFile(files);
    e.target.value = '';
  };

  const renderCompareTree = () => {
    if (fileKeys.length < 2) return null;
    const file1 = loadedFiles[fileKeys[0]];
    const file2 = loadedFiles[fileKeys[1]];
    const allFiles = new Set([...Object.keys(file1.files), ...Object.keys(file2.files)]);
    const tree = buildTreeStructure(Array.from(allFiles));

    return (
      <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
        {Object.keys(tree).sort().map((name) => (
          <CompareTreeNode
            key={name}
            node={tree[name]}
            name={name}
            file1={file1}
            file2={file2}
            onSelectFile={onSelectCompareFile}
          />
        ))}
      </div>
    );
  };

  const getCompareInfo = () => {
    if (fileKeys.length >= 2) {
      return `Comparing ${loadedFiles[fileKeys[0]].name} vs ${loadedFiles[fileKeys[1]].name}`;
    }
    return `${count} file${count !== 1 ? 's' : ''} loaded`;
  };

  const getWholeFileMatch = () => {
    if (fileKeys.length < 2) return null;
    const { hash: hash1 } = loadedFiles[fileKeys[0]];
    const { hash: hash2 } = loadedFiles[fileKeys[1]];
    if (!hash1 || !hash2) return null;
    return hash1 === hash2;
  };
  const wholeFileMatch = mode === 'compare' ? getWholeFileMatch() : null;

  return (
    <aside className="w-80 bg-editor-sidebar border-r border-editor-border text-editor-text flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-editor-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg">File Explorer</h3>
            <p className="text-sm text-gray-400 mt-1">
              {mode === 'compare' ? getCompareInfo() : `${count} file${count !== 1 ? 's' : ''} loaded`}
            </p>
          </div>
          {mode === 'viewer' && (
            <>
              <button
                className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 px-2 py-1.5 rounded-md hover:bg-white hover:bg-opacity-10 transition-all flex-shrink-0"
                title="Add another file"
                onClick={() => addFileInputRef.current?.click()}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span>Add File</span>
              </button>
              <input
                ref={addFileInputRef}
                type="file"
                className="hidden"
                accept=".docx,.xlsx,.xlsm,.pptx,.dotx,.xltx,.potx"
                multiple
                onChange={handleAddFileInput}
              />
            </>
          )}
        </div>
      </div>

      {mode === 'viewer' ? (
        <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
          {fileKeys.map((fileKey) => (
            <FileGroup
              key={fileKey}
              fileKey={fileKey}
              fileData={loadedFiles[fileKey]}
              currentFilePath={currentFilePath}
              onSelectFile={onSelectFile}
              onRemoveFile={onRemoveFile}
              onDeleteXmlFile={onDeleteXmlFile}
            />
          ))}
        </div>
      ) : (
        <>
          {wholeFileMatch !== null && (
            <div className="p-3 border-b border-editor-border flex-shrink-0">
              <div
                className={`text-xs font-semibold px-2 py-1.5 rounded mb-2 ${
                  wholeFileMatch
                    ? 'bg-green-900 bg-opacity-40 text-green-400'
                    : 'bg-yellow-900 bg-opacity-40 text-yellow-400'
                }`}
              >
                {wholeFileMatch ? '✅ Files are identical (SHA-256 match)' : '⚠️ Files differ (SHA-256 mismatch)'}
              </div>
              <div className="space-y-1.5">
                {fileKeys.slice(0, 2).map((fk, idx) => (
                  <div key={fk} className="flex items-center justify-between gap-2 min-w-0">
                    <span
                      className="text-xs text-gray-300 truncate flex-shrink min-w-0"
                      title={loadedFiles[fk].name}
                    >
                      {idx === 0 ? '📄 A' : '📄 B'}: {loadedFiles[fk].name}
                    </span>
                    <HashBadge hash={loadedFiles[fk].hash} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {renderCompareTree()}
        </>
      )}
    </aside>
  );
}
