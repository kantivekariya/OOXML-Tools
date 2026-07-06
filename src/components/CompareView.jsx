import { useRef, useEffect } from 'react';
import HashBadge from './HashBadge';

function DiffLine({ entry }) {
  const { lineNum, html, type } = entry;

  let className = 'diff-line';
  if (type === 'delete') className += ' bg-red-900 bg-opacity-50 border-l-4 border-red-500';
  else if (type === 'insert') className += ' bg-green-900 bg-opacity-50 border-l-4 border-green-500';
  else if (type === 'placeholder') className += ' bg-gray-800 bg-opacity-50';

  return (
    <div className={className}>
      <span className="diff-line-number">{lineNum ?? ''}</span>
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export default function CompareView({
  file1Name,
  file2Name,
  leftLines,
  rightLines,
  stats,
  identical,
  hash1,
  hash2,
  onClear,
  onRemoveFile1,
  onRemoveFile2,
}) {
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;

    const handleLeft = (e) => {
      if (!isScrolling.current) {
        isScrolling.current = true;
        right.scrollTop = left.scrollTop;
        right.scrollLeft = left.scrollLeft;
        requestAnimationFrame(() => { isScrolling.current = false; });
      }
    };

    const handleRight = (e) => {
      if (!isScrolling.current) {
        isScrolling.current = true;
        left.scrollTop = right.scrollTop;
        left.scrollLeft = right.scrollLeft;
        requestAnimationFrame(() => { isScrolling.current = false; });
      }
    };

    const handleWheelLeft = (e) => {
      if (!isScrolling.current) {
        e.preventDefault();
        isScrolling.current = true;
        left.scrollLeft += e.deltaX;
        left.scrollTop += e.deltaY;
        right.scrollLeft += e.deltaX;
        right.scrollTop += e.deltaY;
        requestAnimationFrame(() => { isScrolling.current = false; });
      }
    };

    const handleWheelRight = (e) => {
      if (!isScrolling.current) {
        e.preventDefault();
        isScrolling.current = true;
        left.scrollLeft += e.deltaX;
        left.scrollTop += e.deltaY;
        right.scrollLeft += e.deltaX;
        right.scrollTop += e.deltaY;
        requestAnimationFrame(() => { isScrolling.current = false; });
      }
    };

    left.addEventListener('scroll', handleLeft, { passive: true });
    right.addEventListener('scroll', handleRight, { passive: true });
    left.addEventListener('wheel', handleWheelLeft, { passive: false });
    right.addEventListener('wheel', handleWheelRight, { passive: false });

    return () => {
      left.removeEventListener('scroll', handleLeft);
      right.removeEventListener('scroll', handleRight);
      left.removeEventListener('wheel', handleWheelLeft);
      right.removeEventListener('wheel', handleWheelRight);
    };
  }, [leftLines, rightLines]);

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Compare Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">File Comparison</h3>
          <div className="flex items-center space-x-4">
            {identical === true && (
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                ✅ Files are identical
              </span>
            )}
            {identical === false && (
              <span className="text-sm font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                ⚠️ Files differ
              </span>
            )}
            {stats && (
              <div className="text-sm text-gray-600">
                <span className="text-green-600">+{stats.added}</span>{' '}
                <span className="text-red-600">-{stats.removed}</span>
              </div>
            )}
            <button
              onClick={onClear}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      </div>

      {/* File Tabs */}
      {(file1Name || file2Name) && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex-shrink-0">
          <div className="flex space-x-4">
            {file1Name && (
              <div className="px-4 py-2 bg-white border border-gray-300 rounded-t-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[10rem]" title={file1Name}>
                    {file1Name}
                  </span>
                  <button
                    onClick={onRemoveFile1}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            {file2Name && (
              <div className="px-4 py-2 bg-white border border-gray-300 rounded-t-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[10rem]" title={file2Name}>
                    {file2Name}
                  </span>
                  <button
                    onClick={onRemoveFile2}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Panels */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/2 border-r border-gray-300 flex flex-col min-h-0 max-h-full flex-shrink-0">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0 flex items-center justify-between gap-2 min-w-0">
            <h4 className="font-medium text-gray-800 truncate">{file1Name || 'Select first file'}</h4>
            {hash1 && <HashBadge hash={hash1} />}
          </div>
          <div
            ref={leftRef}
            className="flex-1 bg-editor-bg text-editor-text font-mono text-sm leading-6 overflow-y-auto overflow-x-auto custom-scrollbar p-4 min-h-0 max-h-full min-w-0"
          >
            {leftLines.map((entry, i) => (
              <DiffLine key={i} entry={entry} />
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col min-h-0 max-h-full flex-shrink-0">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0 flex items-center justify-between gap-2 min-w-0">
            <h4 className="font-medium text-gray-800 truncate">{file2Name || 'Select second file'}</h4>
            {hash2 && <HashBadge hash={hash2} />}
          </div>
          <div
            ref={rightRef}
            className="flex-1 bg-editor-bg text-editor-text font-mono text-sm leading-6 overflow-y-auto overflow-x-auto custom-scrollbar p-4 min-h-0 max-h-full min-w-0"
          >
            {rightLines.map((entry, i) => (
              <DiffLine key={i} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
