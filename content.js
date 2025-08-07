// GitHub仓库状态检查器 - 内容脚本

(function() {
  'use strict';

  // 检查是否在GitHub仓库页面
  function isGitHubRepoPage() {
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(part => part);
    return pathParts.length >= 2 && !pathParts.includes('settings') && !pathParts.includes('issues');
  }

  // 获取当前仓库的URL
  function getCurrentRepoUrl() {
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(part => part);
    if (pathParts.length >= 2) {
      return `https://github.com/${pathParts[0]}/${pathParts[1]}`;
    }
    return null;
  }

  // 获取当前仓库的名称（owner/repo格式）
  function getCurrentRepoName() {
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(part => part);
    if (pathParts.length >= 2) {
      return `${pathParts[0]}/${pathParts[1]}`;
    }
    return null;
  }

  // 通过后台脚本获取远程YAML文件
  async function fetchYAMLFile() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'fetchYAML' });
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('获取YAML文件失败:', error);
      return null;
    }
  }

  // 解析YAML文件
  function parseYAML(yamlText) {
    const result = {};
    const lines = yamlText.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex > 0) {
          let key = trimmedLine.substring(0, colonIndex).trim();
          let value = trimmedLine.substring(colonIndex + 1).trim();
          
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

  // 创建显示结果的元素
  function createResultDisplay(message, isMatch = false) {
    // 移除已存在的显示元素
    const existingDisplay = document.getElementById('github-repo-checker-display');
    if (existingDisplay) {
      existingDisplay.remove();
    }

    const display = document.createElement('div');
    display.id = 'github-repo-checker-display';
    display.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: ${isMatch ? '#d4edda' : '#f8d7da'};
      border: 1px solid ${isMatch ? '#c3e6cb' : '#f5c6cb'};
      color: ${isMatch ? '#155724' : '#721c24'};
      padding: 10px 15px;
      border-radius: 5px;
      font-size: 14px;
      font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
      z-index: 10000;
      max-width: 300px;
      word-wrap: break-word;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    
    display.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">GitHub仓库状态检查</div>
      <div>${message}</div>
      <button onclick="this.parentElement.remove()" style="
        position: absolute;
        top: 5px;
        right: 5px;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: inherit;
      ">×</button>
    `;

    document.body.appendChild(display);

    // 5秒后自动移除
    setTimeout(() => {
      if (display.parentNode) {
        display.remove();
      }
    }, 5000);
  }

  // 主要检查函数
  async function checkRepoStatus() {
    if (!isGitHubRepoPage()) {
      return;
    }

    const currentRepoUrl = getCurrentRepoUrl();
    const currentRepoName = getCurrentRepoName();
    if (!currentRepoUrl || !currentRepoName) {
      return;
    }

    console.log('当前仓库URL:', currentRepoUrl);
    console.log('当前仓库名称:', currentRepoName);

    // 显示加载状态
    createResultDisplay('正在检查仓库状态...', false);

    // 获取并解析YAML文件
    const yamlText = await fetchYAMLFile();
    if (!yamlText) {
      createResultDisplay('无法获取远程状态文件，请检查网络连接或服务器状态', false);
      return;
    }

    const repoStates = parseYAML(yamlText);
    console.log('解析的仓库状态:', repoStates);

    // 检查是否有匹配 - 支持两种格式：完整URL和仓库名称
    let status = null;
    let matchKey = null;
    
    if (repoStates[currentRepoUrl]) {
      status = repoStates[currentRepoUrl];
      matchKey = currentRepoUrl;
    } else if (repoStates[currentRepoName]) {
      status = repoStates[currentRepoName];
      matchKey = currentRepoName;
    }

    if (status) {
      createResultDisplay(`匹配找到！键: ${matchKey}<br>状态: ${status}`, true);
    } else {
      createResultDisplay('未找到匹配', false);
    }
  }

  // 页面加载完成后执行检查
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkRepoStatus);
  } else {
    checkRepoStatus();
  }

  // 监听URL变化（用于SPA导航）
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(checkRepoStatus, 1000); // 延迟执行，确保页面加载完成
    }
  }).observe(document, {subtree: true, childList: true});

})();