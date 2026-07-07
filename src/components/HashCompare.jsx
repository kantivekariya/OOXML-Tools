import { useState } from 'react';

function renderHash(hash, other, theme) {
  const matchClass = theme === 'light' ? 'text-gray-700' : 'text-gray-300';
  const mismatchClass =
    theme === 'light'
      ? 'text-red-600 bg-red-100 rounded-sm'
      : 'text-red-400 bg-red-900 bg-opacity-50 rounded-sm';
  return hash.split('').map((ch, i) => {
    const match = other[i] === ch;
    return (
      <span key={i} className={match ? matchClass : mismatchClass}>
        {ch}
      </span>
    );
  });
}

function CopyButton({ text, theme }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard unavailable, ignore
    }
  };
  const hoverClass = theme === 'light' ? 'hover:text-gray-900' : 'hover:text-white';
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`text-[10px] text-gray-400 flex-shrink-0 ${hoverClass}`}
    >
      {copied ? '✅ Copied' : '📋 Copy'}
    </button>
  );
}

export default function HashCompare({ hashA, hashB, nameA = 'File A', nameB = 'File B', theme = 'dark' }) {
  const [expanded, setExpanded] = useState(false);

  if (!hashA || !hashB) return null;
  const identical = hashA === hashB;
  const isLight = theme === 'light';

  const containerBorder = isLight ? 'border border-gray-200' : 'border border-editor-border';
  const bodyBg = isLight ? 'bg-gray-50' : 'bg-black bg-opacity-25';
  const labelColor = 'text-gray-500';
  const toggleTextColor = isLight ? 'text-gray-500' : 'text-gray-300';
  const footerColor = isLight ? 'text-gray-500' : 'text-gray-500';
  const matchClass = isLight
    ? 'bg-green-50 text-green-700 hover:bg-green-100'
    : 'bg-green-900 bg-opacity-40 text-green-400 hover:bg-opacity-60';
  const mismatchClass = isLight
    ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
    : 'bg-yellow-900 bg-opacity-40 text-yellow-400 hover:bg-opacity-60';

  return (
    <div className={`${containerBorder} rounded-md overflow-hidden`}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold transition-colors ${
          identical ? matchClass : mismatchClass
        }`}
      >
        <span>{identical ? '✅ Hashes match' : '⚠️ Hashes differ (SHA-256 mismatch)'}</span>
        <span className={toggleTextColor}>{expanded ? '▾ Hide' : '▸ Compare hashes'}</span>
      </button>
      {expanded && (
        <div className={`p-2 space-y-3 ${bodyBg}`}>
          <div>
            <div className="flex items-center justify-between mb-1 gap-2 min-w-0">
              <span className={`text-[10px] uppercase tracking-wide ${labelColor} truncate`} title={nameA}>
                {nameA}
              </span>
              <CopyButton text={hashA} theme={theme} />
            </div>
            <div className="font-mono text-[11px] break-all leading-relaxed">
              {renderHash(hashA, hashB, theme)}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1 gap-2 min-w-0">
              <span className={`text-[10px] uppercase tracking-wide ${labelColor} truncate`} title={nameB}>
                {nameB}
              </span>
              <CopyButton text={hashB} theme={theme} />
            </div>
            <div className="font-mono text-[11px] break-all leading-relaxed">
              {renderHash(hashB, hashA, theme)}
            </div>
          </div>
          {!identical && (
            <p className={`text-[10px] ${footerColor}`}>
              Highlighted characters show where the two hashes diverge.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
