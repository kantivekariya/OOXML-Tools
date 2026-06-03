# OOXML Tools

A professional web-based tool for viewing, editing, and comparing OOXML documents — `.docx`, `.xlsx`, `.xlsm`, `.pptx`, and other Microsoft Office formats. Built with React, Vite, and Tailwind CSS.

![Version](https://img.shields.io/badge/version-3.0.0-brightgreen)
![React](https://img.shields.io/badge/React-19-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Multi-File Explorer
- Load multiple OOXML files via drag & drop or file picker
- Per-file collapsible trees with colored type indicators (green `.xlsx`, blue `.docx`, orange `.pptx`)
- Hierarchical directory view with animated folder expand/collapse
- **Delete any XML/rels file** from the archive directly from the sidebar — hover a file node to reveal the trash icon

### XML Editor
- VS Code-style syntax highlighting (elements, attributes, values, comments, declarations, CDATA)
- Auto-formatted and indented output via `DOMParser`
- **Per-line edit** — hover any line, click the pencil icon to edit inline; `Enter` commits, `Escape` cancels
- **Per-line delete** — hover any line, click the trash icon; confirmation required
- **Save Changes** — persists edits back to the in-memory OOXML package with a confirmation dialog
- **Remove File** button in the content header to remove the current OOXML file from the workspace

### Compare Mode
- Side-by-side diff with LCS (Longest Common Subsequence) algorithm
- Color-coded lines: green (added), red (removed); yellow label (modified files in tree)
- Synchronized vertical and horizontal scrolling across both panels
- Real-time diff statistics (+additions / −deletions)
- File tabs with remove buttons

### UX Details
- Confirmation dialogs on all destructive actions (delete line, delete XML file, remove OOXML, save, clear)
- Toast notifications for every action (success / error / info / warning)
- Loading overlay during file processing
- Dark editor theme throughout

## Supported Formats

| Extension | Format |
|-----------|--------|
| `.docx` | Word Document |
| `.xlsx` | Excel Spreadsheet |
| `.xlsm` | Excel Macro-Enabled Workbook |
| `.pptx` | PowerPoint Presentation |
| `.dotx` | Word Template |
| `.xltx` | Excel Template |
| `.potx` | PowerPoint Template |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
  App.jsx                   # Root state and orchestration
  main.jsx
  index.css                 # Tailwind + custom CSS (syntax highlight, line-row, scrollbar)
  components/
    Header.jsx              # Mode toggle (Explorer / Compare)
    UploadArea.jsx          # Drag-drop and file input cards
    Sidebar.jsx             # Collapsible file groups and file tree
    FileTreeNode.jsx        # Recursive folder/file nodes with delete icon
    ContentViewer.jsx       # Per-line editable XML viewer
    CompareView.jsx         # Side-by-side diff with synchronized scroll
    ConfirmDialog.jsx       # Promise-based confirmation modal
    LoadingOverlay.jsx
    ToastContainer.jsx
    ui/                     # Shared UI primitives (Button, Badge, AlertDialog)
  lib/
    xmlUtils.js             # formatXML, prettifyXML, applySyntaxHighlighting
    diffUtils.js            # computeDiff (LCS), generateProfessionalDiff
    fileUtils.js            # isOOXMLFile, getFileIcon, getFileTypeColor, loadOOXMLFile
  hooks/
    useToast.js             # Toast queue state
    useConfirm.js           # await-able confirm dialog hook
```

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 19 | UI components and state |
| Vite 8 | Build tool and dev server |
| Tailwind CSS 3 | Utility-first styling |
| JSZip 3.10 | OOXML ZIP extraction |
| lucide-react | Icons |
| clsx + tailwind-merge | Class utilities |

## Browser Compatibility

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 14+ |
| Edge | 90+ |

## Use Cases

- **Developers** — debug OOXML generation, inspect part relationships, edit XML content directly
- **Document Analysts** — examine metadata, styles, and content structure
- **QA Teams** — validate document output against expected structure, compare template versions

## Acknowledgments

- Inspired by the [OOXML Tools Chrome Extension](https://chromewebstore.google.com/detail/ooxml-tools/bjmmjfdegplhkefakjkccocjanekbapn)

---

Developed by **Kanti Vekariya**
