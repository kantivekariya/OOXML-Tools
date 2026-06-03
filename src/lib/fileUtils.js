import JSZip from 'jszip';

export const OOXML_EXTENSIONS = ['.docx', '.xlsx', '.xlsm', '.pptx', '.dotx', '.xltx', '.potx'];

export function isOOXMLFile(file) {
  return OOXML_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
}

export function getFileIcon(fileName) {
  const name = fileName.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xlsm') || name.endsWith('.xltx')) return '📊';
  if (name.endsWith('.docx') || name.endsWith('.dotx')) return '📝';
  if (name.endsWith('.pptx') || name.endsWith('.potx')) return '📋';
  return '📄';
}

export function getFileTypeColor(fileName) {
  const name = fileName.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xlsm') || name.endsWith('.xltx')) return '#22c55e';
  if (name.endsWith('.docx') || name.endsWith('.dotx')) return '#3b82f6';
  if (name.endsWith('.pptx') || name.endsWith('.potx')) return '#f97316';
  return '#6b7280';
}

export async function loadOOXMLFile(file) {
  const zip = await JSZip.loadAsync(file);
  const files = {};

  for (const fileName in zip.files) {
    if (fileName.endsWith('.xml') || fileName.endsWith('.rels')) {
      const content = await zip.files[fileName].async('text');
      files[fileName] = content;
    }
  }

  return { name: file.name, zip, files };
}

export async function downloadOOXMLFile(fileData) {
  const { name, zip: originalZip, files: modifiedFiles } = fileData;
  const newZip = new JSZip();

  for (const fileName in originalZip.files) {
    const entry = originalZip.files[fileName];
    if (entry.dir) continue;
    if (modifiedFiles[fileName] !== undefined) {
      newZip.file(fileName, modifiedFiles[fileName]);
    } else {
      const content = await entry.async('arraybuffer');
      newZip.file(fileName, content);
    }
  }

  const blob = await newZip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
