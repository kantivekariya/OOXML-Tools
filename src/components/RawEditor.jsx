import CodeMirror from '@uiw/react-codemirror';
import { xml } from '@codemirror/lang-xml';
import { oneDark } from '@codemirror/theme-one-dark';

const extensions = [xml()];

export default function RawEditor({ content, onChange }) {
  return (
    <CodeMirror
      value={content}
      theme={oneDark}
      extensions={extensions}
      onChange={onChange}
      height="100%"
      style={{ height: '100%', fontSize: '13px' }}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        bracketMatching: true,
        autocompletion: true,
        highlightActiveLine: true,
        indentOnInput: true,
      }}
    />
  );
}
