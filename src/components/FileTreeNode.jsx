import { useState } from 'react';

const xmlIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#75bfff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
);

const relsIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const chevronSvg = (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const trashSvg = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

function FolderIcon({ open }) {
  if (open) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#f0c870" stroke="none">
        <path d="M20 6h-8l-2-2H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#e8c07a" stroke="none">
      <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
    </svg>
  );
}

export default function FileTreeNode({ node, name, fileKey, currentFilePath, onSelectFile, onDeleteXmlFile }) {
  const [expanded, setExpanded] = useState(false);

  if (node.isFile) {
    const icon = node.fullPath.endsWith('.rels') ? relsIcon : xmlIcon;
    const isActive = node.fullPath === currentFilePath;
    return (
      <div
        className={`tree-file-node tree-item ${isActive ? 'active' : ''}`}
        onClick={() => onSelectFile(fileKey, node.fullPath)}
      >
        <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>
        <span className="tree-node-label">{name}</span>
        {onDeleteXmlFile && (
          <button
            className="tree-file-delete"
            title={`Delete ${name}`}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteXmlFile(fileKey, node.fullPath);
            }}
          >
            {trashSvg}
          </button>
        )}
      </div>
    );
  }

  const hasChildren = Object.keys(node.children).length > 0;

  return (
    <div>
      <div
        className="tree-folder-node"
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren) setExpanded((v) => !v);
        }}
      >
        <span
          className={`sidebar-chevron ${expanded ? 'open' : ''}`}
          style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
        >
          {chevronSvg}
        </span>
        <span style={{ flexShrink: 0, display: 'flex' }}>
          <FolderIcon open={expanded} />
        </span>
        <span className="tree-node-label">{name}</span>
      </div>
      {expanded && hasChildren && (
        <div className="tree-children-container">
          {Object.keys(node.children)
            .sort()
            .map((childName) => (
              <FileTreeNode
                key={childName}
                node={node.children[childName]}
                name={childName}
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
