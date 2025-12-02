// GitHub仓库状态检查器 - 后台脚本

// 默认配置
const DEFAULT_CONFIG = {
  serverHost: 'windy.run',
  serverPort: '8000'
};

chrome.runtime.onInstalled.addListener(async () => {
  console.log('GitHub仓库状态检查器扩展已安装');

  // 初始化默认配置（如果不存在）
  const config = await chrome.storage.sync.get(DEFAULT_CONFIG);
  if (!config.serverHost || !config.serverPort) {
    await chrome.storage.sync.set(DEFAULT_CONFIG);
  }
});

// 处理来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchYAML') {
    fetchYAMLFile().then(sendResponse);
    return true; // 保持消息通道开放用于异步响应
  } else if (request.action === 'testConnection') {
    testConnection(request.serverHost, request.serverPort).then(sendResponse);
    return true; // 保持消息通道开放用于异步响应
  }
});

// 获取YAML文件的函数
async function fetchYAMLFile() {
  try {
    // 从存储中获取配置
    const config = await chrome.storage.sync.get(DEFAULT_CONFIG);
    const serverHost = config.serverHost || DEFAULT_CONFIG.serverHost;
    const serverPort = config.serverPort || DEFAULT_CONFIG.serverPort;

    // 添加时间戳参数防止缓存，并设置no-cache headers
    const timestamp = Date.now();
    const url = `http://${serverHost}:${serverPort}/github_repo_state.yaml?_t=${timestamp}`;

    console.log('正在获取YAML文件:', url);

    const response = await fetch(url, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const yamlText = await response.text();
    return { success: true, data: yamlText };
  } catch (error) {
    console.error('获取YAML文件失败:', error);
    return { success: false, error: error.message };
  }
}

// 测试连接函数
async function testConnection(serverHost, serverPort) {
  try {
    const timestamp = Date.now();
    const url = `http://${serverHost}:${serverPort}/github_repo_state.yaml?_t=${timestamp}`;

    console.log('测试连接:', url);

    const startTime = Date.now();
    const response = await fetch(url, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const yamlText = await response.text();

    // 简单解析YAML来计算记录数
    let parsedCount = 0;
    const lines = yamlText.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes(':')) {
        parsedCount++;
      }
    }

    // 限制预览内容长度
    const contentPreview = yamlText.length > 500
      ? yamlText.substring(0, 500) + '\n...(内容过长，已截断)'
      : yamlText;

    return {
      success: true,
      data: {
        url: url,
        status: `${response.status} ${response.statusText}`,
        size: yamlText.length,
        content: contentPreview,
        parsedCount: parsedCount,
        responseTime: responseTime
      }
    };
  } catch (error) {
    console.error('测试连接失败:', error);

    // 提供更详细的错误信息
    let errorMessage = error.message;
    if (error.message.includes('Failed to fetch')) {
      errorMessage = `无法连接到服务器 ${serverHost}:${serverPort}\n\n可能的原因：\n1. 服务器未运行\n2. 端口号错误\n3. 防火墙阻止了连接\n4. 文件路径不正确（应该是 /github_repo_state.yaml）`;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}