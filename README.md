# OOXML Tools

A powerful web-based tool for viewing, editing, analyzing, and comparing OOXML (Office Open XML) documents such as `.docx`, `.xlsx`, `.pptx`, and other Microsoft Office file formats.

![OOXML Tools Interface](https://img.shields.io/badge/OOXML-Tools-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)

## 🚀 Features

### 🎨 **Modern UI with Tailwind CSS**
- **Professional Interface**: Clean, modern design inspired by GitHub and VSCode
- **Dark Editor Theme**: Comfortable dark theme for XML viewing and editing
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: Polished transitions and hover effects

### 📁 **Smart File Explorer**
- **Hierarchical Directory Structure**: Navigate OOXML files with a professional file tree
- **Collapsible Folders**: Click to expand/collapse directories for organized viewing
- **File Type Recognition**: Automatically identifies XML files and folder structures
- **Drag & Drop Support**: Simply drag OOXML files into the application
- **Visual Status Indicators**: Clear icons and colors for different file states

### 🎯 **Professional XML Viewer**
- **VS Code-Style Syntax Highlighting**: Beautiful color-coded XML with proper syntax highlighting
- **Auto-Formatting**: XML content is automatically formatted and indented for readability
- **Dark Theme Editor**: Comfortable viewing experience for long editing sessions
- **Fast Rendering**: Optimized display for large XML files

### 🔄 **Advanced Comparison Mode**
- **Git-Style Diff View**: Professional side-by-side comparison like GitHub/VSCode
- **Line-by-Line Highlighting**: 
  - 🟢 **Green**: Added lines with proper background highlighting
  - 🔴 **Red**: Removed lines with clear visual indicators
  - 📝 **Yellow**: Modified files in file tree
- **Synchronized Scrolling**: Both panels scroll together for easy comparison
- **File Management**: Add/remove files dynamically with clear file tabs
- **Diff Statistics**: Real-time counters showing +additions and -deletions
- **LCS Algorithm**: Uses Longest Common Subsequence for accurate diff calculation

### ⚡ **Enhanced User Experience**
- **Toast Notifications**: Beautiful animated notifications for all actions
- **Loading States**: Professional loading indicators during file processing
- **Error Handling**: Graceful error messages with helpful feedback
- **File Tabs**: Manage multiple files with clear tabs and remove buttons
- **Instant Feedback**: Immediate visual feedback for all user interactions

## 📋 Supported File Formats

- `.docx` - Word Documents
- `.xlsx` - Excel Spreadsheets  
- `.pptx` - PowerPoint Presentations
- `.dotx` - Word Templates
- `.xltx` - Excel Templates
- `.potx` - PowerPoint Templates

## 🛠️ Installation & Setup

### Option 1: Direct Download
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Start analyzing OOXML files immediately!

### Option 2: Local Server (Recommended)
```bash
# Clone the repository
git clone https://github.com/your-username/ooxml-tools.git
cd ooxml-tools

# Start a local server (Python 3)
python -m http.server 8000

# Or with Node.js
npx serve .

# Open http://localhost:8000 in your browser
```

## 📖 Usage Guide

### **Basic File Analysis**
1. **Upload File**: Drag & drop an OOXML file or click "Select File 1"
2. **Explore Structure**: Use the file tree to navigate directories
3. **View Content**: Click any XML file to view formatted content with syntax highlighting
4. **Edit Files**: Modify XML content directly in the editor (if needed)

### **File Comparison**
1. **Enable Compare Mode**: Click the "Compare Mode" button
2. **Load Two Files**: Upload or drag two OOXML files
3. **Analyze Differences**: Files with changes are highlighted in the tree
4. **View Side-by-Side**: Click files to see detailed comparisons

### **Keyboard Shortcuts**
- **Click Folder**: Expand/collapse directory
- **Click File**: Open file in viewer
- **Save Changes**: Use the save button when editing

## 🏗️ Project Structure

```
ooxml-tools/
├── index.html          # Main HTML file with UI structure
├── script.js           # JavaScript functionality
├── README.md           # Project documentation
└── assets/             # (Optional) Additional resources
```

## 🔧 Technical Details

### **Dependencies**
- **JSZip**: For reading ZIP-based OOXML files
- **Browser APIs**: DOMParser for XML processing
- **Modern JavaScript**: ES6+ features for clean code

### **Browser Compatibility**
- ✅ Chrome 60+
- ✅ Firefox 55+  
- ✅ Safari 12+
- ✅ Edge 79+

### **Architecture**
- **Client-Side Only**: No server-side processing required
- **Modular Design**: Separated HTML structure and JavaScript logic
- **Object-Oriented**: Clean class-based architecture
- **Event-Driven**: Responsive UI with proper event handling

## 🎯 Use Cases

### **For Developers**
- Debug OOXML document generation issues
- Understand document structure and relationships
- Compare document versions for troubleshooting
- Analyze template structures

### **For Document Analysts**
- Examine document metadata and properties
- Understand complex document relationships
- Compare document formatting and content
- Extract specific XML components

### **For QA Teams**
- Verify document generation accuracy
- Compare expected vs actual document output
- Identify structural differences in documents
- Validate template implementations

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Development Guidelines**
- Follow existing code style and conventions
- Add comments for complex functionality
- Test across different browsers
- Update documentation for new features

## 🙏 Acknowledgments

- Inspired by the [OOXML Tools Chrome Extension](https://chromewebstore.google.com/detail/ooxml-tools/bjmmjfdegplhkefakjkccocjanekbapn)
- Built with modern web technologies and best practices
- Designed for developers, analysts, and document processing professionals

## 📞 Support

If you encounter any issues or have questions:

1. **Check the Issues**: Look for existing solutions
2. **Create an Issue**: Describe your problem with details
3. **Contribute**: Help improve the tool for everyone

---

**Made with ❤️ for the OOXML community** 
