import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { applySyntaxHighlighting } from '../lib/xmlUtils';

const RawEditor = lazy(() => import('./RawEditor'));

const editSvg = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const deleteSvg = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

function LineRow({ line, index, onLineChange, onDeleteLine }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(line);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!editing) setValue(line);
  }, [line, editing]);

  const startEdit = () => {
    setValue(line);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    if (value !== line) onLineChange(index, value);
  };

  const cancel = () => {
    setEditing(false);
    setValue(line);
  };

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  return (
    <div className="line-row">
      <span className="line-num">{index + 1}</span>
      {editing ? (
        <textarea
          ref={textareaRef}
          className="line-textarea"
          value={value}
          rows={1}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit(); }
            if (e.key === 'Escape') cancel();
          }}
        />
      ) : (
        <span
          className="line-content"
          dangerouslySetInnerHTML={{ __html: applySyntaxHighlighting(line) }}
        />
      )}
      {!editing && (
        <div className="line-actions">
          <button className="line-edit-btn" title="Edit line" onClick={startEdit}>
            {editSvg}
          </button>
          <button className="line-delete-btn" title="Delete line" onClick={() => onDeleteLine(index)}>
            {deleteSvg}
          </button>
        </div>
      )}
    </div>
  );
}


export default function ContentViewer({ lines, rawEditMode, rawContent, onLineChange, onDeleteLine, onRawContentChange }) {
  if (rawEditMode) {
    return (
      <div className="w-full h-full overflow-hidden">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-editor-bg text-gray-400 text-sm">
            Loading editor…
          </div>
        }>
          <RawEditor content={rawContent} onChange={onRawContentChange} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 text-editor-text font-mono text-sm overflow-auto custom-scrollbar">
      {lines.map((line, index) => (
        <LineRow
          key={index}
          line={line}
          index={index}
          onLineChange={onLineChange}
          onDeleteLine={onDeleteLine}
        />
      ))}
    </div>
  );
}
