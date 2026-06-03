export function formatXML(xmlString) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) return xmlString;
    return prettifyXML(xmlDoc.documentElement, 0);
  } catch {
    return xmlString;
  }
}

export function prettifyXML(node, indent = 0) {
  const indentStr = '  '.repeat(indent);
  let result = '';

  if (node.nodeType === Node.ELEMENT_NODE) {
    result += indentStr + '<' + node.nodeName;

    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      result += ` ${attr.name}="${attr.value}"`;
    }

    if (node.childNodes.length === 0) {
      result += '/>\n';
    } else {
      result += '>\n';
      for (const child of node.childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          result += prettifyXML(child, indent + 1);
        } else if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent.trim();
          if (text) result += '  '.repeat(indent + 1) + text + '\n';
        }
      }
      result += indentStr + '</' + node.nodeName + '>\n';
    }
  }

  return result;
}

export function applySyntaxHighlighting(xmlContent) {
  let highlighted = xmlContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  highlighted = highlighted.replace(
    /(&lt;\?xml[^&]*\?&gt;)/g,
    '<span class="xml-declaration">$1</span>'
  );

  highlighted = highlighted.replace(
    /(&lt;!--[\s\S]*?--&gt;)/g,
    '<span class="xml-comment">$1</span>'
  );

  highlighted = highlighted.replace(
    /(&lt;!\[CDATA\[[\s\S]*?\]\]&gt;)/g,
    '<span class="xml-cdata">$1</span>'
  );

  highlighted = highlighted.replace(
    /(&lt;\/?)([a-zA-Z][a-zA-Z0-9:._-]*)((?:\s+[a-zA-Z][a-zA-Z0-9:._-]*\s*=\s*"[^"]*")*)\s*(\/?&gt;)/g,
    function (match, openBracket, elementName, attributes, closeBracket) {
      let result = '<span class="xml-bracket">' + openBracket + '</span>';
      result += '<span class="xml-element">' + elementName + '</span>';
      if (attributes) {
        result += attributes.replace(
          /(\s+)([a-zA-Z][a-zA-Z0-9:._-]*)\s*=\s*("[^"]*")/g,
          '$1<span class="xml-attribute-name">$2</span>=<span class="xml-attribute-value">$3</span>'
        );
      }
      result += '<span class="xml-bracket">' + closeBracket + '</span>';
      return result;
    }
  );

  return highlighted;
}
