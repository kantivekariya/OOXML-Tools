
export default function Header({ currentMode, onModeChange }) {
  return (
    <header className="bg-gray-800 text-white shadow-lg flex-shrink-0">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">OOXML Tools</h1>
            <p className="text-gray-300 text-sm">Professional Document Analyzer &amp; Diff Tool</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onModeChange('viewer')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentMode === 'viewer'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              🔍 Explorer
            </button>
            <button
              onClick={() => onModeChange('compare')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentMode === 'compare'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              🔄 Compare
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
