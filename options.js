// 默认配置
const DEFAULT_CONFIG = {
  serverHost: 'windy.run',
  serverPort: '8000'
};

// 加载已保存的设置
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(DEFAULT_CONFIG);
    document.getElementById('serverHost').value = result.serverHost;
    document.getElementById('serverPort').value = result.serverPort;
  } catch (error) {
    console.error('加载设置失败:', error);
    showStatus('加载设置失败: ' + error.message, 'error');
  }
}

// 保存设置
async function saveSettings(event) {
  event.preventDefault();

  const serverHost = document.getElementById('serverHost').value.trim();
  const serverPort = document.getElementById('serverPort').value.trim();

  // 验证输入
  if (!serverHost) {
    showStatus('请输入服务器地址', 'error');
    return;
  }

  if (!serverPort || isNaN(serverPort) || parseInt(serverPort) < 1 || parseInt(serverPort) > 65535) {
    showStatus('请输入有效的端口号 (1-65535)', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({
      serverHost: serverHost,
      serverPort: serverPort
    });

    showStatus('设置已保存成功！', 'success');

    // 通知后台脚本配置已更新
    chrome.runtime.sendMessage({ action: 'configUpdated' });
  } catch (error) {
    console.error('保存设置失败:', error);
    showStatus('保存设置失败: ' + error.message, 'error');
  }
}

// 重置为默认设置
async function resetSettings() {
  try {
    await chrome.storage.sync.set(DEFAULT_CONFIG);
    document.getElementById('serverHost').value = DEFAULT_CONFIG.serverHost;
    document.getElementById('serverPort').value = DEFAULT_CONFIG.serverPort;
    showStatus('已恢复默认设置', 'success');

    // 通知后台脚本配置已更新
    chrome.runtime.sendMessage({ action: 'configUpdated' });
  } catch (error) {
    console.error('重置设置失败:', error);
    showStatus('重置设置失败: ' + error.message, 'error');
  }
}

// 显示状态消息
function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;
  statusDiv.style.display = 'block';

  // 3秒后自动隐藏
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

// 显示测试结果消息
function showTestResult(message, type) {
  const testResultDiv = document.getElementById('testResult');
  testResultDiv.innerHTML = message;
  testResultDiv.className = 'status ' + type;
  testResultDiv.style.display = 'block';

  // 10秒后自动隐藏（给更多时间阅读测试结果）
  setTimeout(() => {
    testResultDiv.style.display = 'none';
  }, 10000);
}

// 测试连接
async function testConnection() {
  const serverHost = document.getElementById('serverHost').value.trim();
  const serverPort = document.getElementById('serverPort').value.trim();
  const testBtn = document.getElementById('testBtn');

  // 验证输入
  if (!serverHost) {
    showTestResult('请先输入服务器地址', 'error');
    return;
  }

  if (!serverPort || isNaN(serverPort) || parseInt(serverPort) < 1 || parseInt(serverPort) > 65535) {
    showTestResult('请输入有效的端口号 (1-65535)', 'error');
    return;
  }

  // 禁用按钮，防止重复点击
  testBtn.disabled = true;
  testBtn.textContent = '测试中...';
  showTestResult('正在连接服务器...', 'success');

  try {
    // 通过后台脚本测试连接
    const response = await chrome.runtime.sendMessage({
      action: 'testConnection',
      serverHost: serverHost,
      serverPort: serverPort
    });

    if (response.success) {
      const data = response.data;
      let resultMessage = `<strong>✓ 连接成功！</strong><br><br>`;
      resultMessage += `<strong>URL:</strong> ${data.url}<br>`;
      resultMessage += `<strong>响应状态:</strong> ${data.status}<br>`;
      resultMessage += `<strong>文件大小:</strong> ${data.size} 字节<br><br>`;
      resultMessage += `<strong>YAML内容预览:</strong><br>`;
      resultMessage += `<pre style="background: #f6f8fa; padding: 10px; border-radius: 3px; margin-top: 5px; max-height: 200px; overflow-y: auto; font-size: 12px;">${escapeHtml(data.content)}</pre>`;

      if (data.parsedCount !== undefined) {
        resultMessage += `<br><strong>解析到 ${data.parsedCount} 个仓库记录</strong>`;
      }

      showTestResult(resultMessage, 'success');
    } else {
      showTestResult(`<strong>✗ 连接失败</strong><br><br>${escapeHtml(response.error)}`, 'error');
    }
  } catch (error) {
    showTestResult(`<strong>✗ 测试失败</strong><br><br>${escapeHtml(error.message)}`, 'error');
  } finally {
    // 恢复按钮状态
    testBtn.disabled = false;
    testBtn.textContent = '测试连接';
  }
}

// HTML转义函数，防止XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  // 绑定事件
  document.getElementById('settingsForm').addEventListener('submit', saveSettings);
  document.getElementById('testBtn').addEventListener('click', testConnection);
  document.getElementById('resetBtn').addEventListener('click', resetSettings);
});
