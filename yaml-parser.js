// 简单的YAML解析器，用于解析key: value格式
function parseSimpleYAML(yamlText) {
  const result = {};
  const lines = yamlText.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmedLine.substring(0, colonIndex).trim();
        const value = trimmedLine.substring(colonIndex + 1).trim();
        result[key] = value;
      }
    }
  }
  
  return result;
}

// 导出函数供其他脚本使用
window.parseSimpleYAML = parseSimpleYAML;