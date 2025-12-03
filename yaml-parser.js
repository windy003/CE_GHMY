// 简单的YAML解析器，用于解析key: value格式
function parseSimpleYAML(yamlText) {
  const result = {};
  const lines = yamlText.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      let colonIndex = -1;
      let key = '';
      let value = '';

      // 检查是否以引号开始（支持双引号和单引号）
      if (trimmedLine.startsWith('"') || trimmedLine.startsWith("'")) {
        const quoteChar = trimmedLine[0];
        // 找到匹配的结束引号
        const endQuoteIndex = trimmedLine.indexOf(quoteChar, 1);
        if (endQuoteIndex > 0) {
          // 引号后面应该跟着冒号
          colonIndex = trimmedLine.indexOf(':', endQuoteIndex);
          if (colonIndex > 0) {
            key = trimmedLine.substring(0, colonIndex).trim();
            value = trimmedLine.substring(colonIndex + 1).trim();
          }
        }
      } else {
        // 没有引号的情况，使用第一个冒号
        colonIndex = trimmedLine.indexOf(':');
        if (colonIndex > 0) {
          key = trimmedLine.substring(0, colonIndex).trim();
          value = trimmedLine.substring(colonIndex + 1).trim();
        }
      }

      if (key && colonIndex > 0) {
        // 移除键和值的引号
        if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
          key = key.slice(1, -1);
        }
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        result[key] = value;
      }
    }
  }

  return result;
}

// 导出函数供其他脚本使用
window.parseSimpleYAML = parseSimpleYAML;