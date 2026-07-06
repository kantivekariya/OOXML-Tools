import { useState } from 'react';

export default function HashBadge({ hash, label = 'SHA-256' }) {
  const [copied, setCopied] = useState(false);

  if (!hash) {
    return <span className="text-[10px] text-gray-500 italic">hash unavailable</span>;
  }

  const short = `${hash.slice(0, 8)}…${hash.slice(-6)}`;

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard unavailable, ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`${label}\n${hash}\n\nClick to copy full hash`}
      className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-[10px] font-mono text-gray-200 hover:text-white transition-colors max-w-full flex-shrink-0"
    >
      <span className="uppercase tracking-wide text-gray-400 flex-shrink-0">{label}</span>
      <span className="truncate">{short}</span>
      <span className="flex-shrink-0">{copied ? '✅' : '📋'}</span>
    </button>
  );
}
