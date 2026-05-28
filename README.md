# OOXML Tools

A powerful web-based tool for viewing, analyzing, and comparing OOXML (Office Open XML) documents such as `.docx`, `.xlsx`, `.xlsm`, `.pptx`, and other Microsoft Office file formats.

![OOXML Tools Interface](https://img.shields.io/badge/OOXML-Tools-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-2.0.0-brightgreen)

## Features

### Modern UI with Tailwind CSS
- Professional interface inspired by VS Code and GitHub
- Dark editor theme for comfortable XML viewing
- Responsive layout for desktop and tablet
- Smooth animations and polished hover/active states

### Multi-File Explorer
- **Load multiple files at once** — drag & drop or Ctrl+click to select several files in the file picker
- **Add files on the fly** — use the "Add File" button in the sidebar after your first file is loaded
- **Per-file collapsible trees** — each loaded file appears as its own expandable section with a colored type indicator (green for `.xlsx`/`.xlsm`, blue for `.docx`, orange for `.pptx`)
- **Hierarchical directory view** — folders expand/collapse with animated chevrons and open/closed folder icons
- **File type icons** — `.xml` files shown with a blue code icon; `.rels` files with a purple link icon
- **Remove any file** — hover a file group header to reveal the remove button; the viewer clears automatically if the active file is removed

### Professional XML Viewer
- VS Code-style syntax highlighting (elements, attributes, values, comments, CDATA)
- Auto-formatting and indentation via DOMParser
- File path breadcrumb in the header: `filename.xlsx › xl/workbook.xml`
- Fast rendering for large XML files

### Advanced Comparison Mode
- Side-by-side diff view with Git-style highlighting
  - Green — added lines
  - Red — removed lines
  - Yellow — modified files in tree
- Synchronized vertical and horizontal scrolling
- Real-time diff statistics (+additions / −deletions)
- LCS (Longest Common Subsequence) algorithm for accurate diffs
- File tabs with remove buttons

### User Experience
- Toast notifications for all actions (load, remove, error)
- Loading overlay during file processing
- Drag & drop onto the upload area loads all dropped files at once

## Supported File Formats

| Extension | Format |
|-----------|--------|
| `.docx` | Word Document |
| `.xlsx` | Excel Spreadsheet |
| `.xlsm` | Excel Macro-Enabled Workbook |
| `.pptx` | PowerPoint Presentation |
| `.dotx` | Word Template |
| `.xltx` | Excel Template |
| `.potx` | PowerPoint Template |

## Installation & Setup

### Option 1: Direct Open
1. Clone or download this repository
2. Open `index.html` in any modern web browser — no build step required

### Option 2: Local Server
```bash
# Clone the repository
git clone https://github.com/your-username/ooxml-tools.git
cd ooxml-tools

# Python 3
python -m http.server 8000

# Node.js
npx serve .
```
Then open `http://localhost:8000`.

## Usage Guide

### Exploring Multiple Files
1. **Upload** — drag & drop one or more OOXML files onto the landing area, or click "Select OOXML File" and Ctrl+click to pick several files at once
2. **Add more** — once in the sidebar, click **Add File** to load additional files without leaving the viewer
3. **Navigate** — click a file group header to expand/collapse its internal directory tree; click any `.xml` or `.rels` entry to view its content
4. **Remove** — hover any file group header and click the × to remove it; the rest stay loaded

### Comparing Two Files
1. Switch to **Compare** mode via the header button
2. Load two OOXML files (drag & drop or click each card)
3. Browse the shared file tree — modified/added/removed entries are color-coded
4. Click any entry to see the side-by-side diff

## Project Structure

```
ooxml-tools/
├── index.html     # UI structure and styles
├── script.js      # OOXMLTools class and all logic
└── README.md      # This file
```

## Technical Details

### Dependencies
- **JSZip 3.10** — reads ZIP-based OOXML packages (loaded from CDN)
- **Tailwind CSS** — utility-first styling (loaded from CDN)
- **Browser APIs** — DOMParser for XML, FileReader/File API for uploads

### Browser Compatibility
| Browser | Version |
|---------|---------|
| Chrome | 60+ |
| Firefox | 55+ |
| Safari | 12+ |
| Edge | 79+ |

### Architecture
- **Client-side only** — no server, no build tools
- **Single class** — `OOXMLTools` owns all state and DOM interactions
- **Keyed file map** — each loaded file gets a unique key (`file1`, `file2`, …) so multiple files coexist without conflict

## Use Cases

- **Developers** — debug OOXML generation, understand part relationships, compare template versions
- **Document Analysts** — examine metadata, styles, and content structure
- **QA Teams** — verify document output against expected structure, validate template changes

## Acknowledgments

- Inspired by the [OOXML Tools Chrome Extension](https://chromewebstore.google.com/detail/ooxml-tools/bjmmjfdegplhkefakjkccocjanekbapn)
- Built with modern web technologies for developers and document processing professionals

---

Developed by **Kanti Vekariya**
