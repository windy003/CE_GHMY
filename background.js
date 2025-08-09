// GitHub仓库状态检查器 - 后台脚本

chrome.runtime.onInstalled.addListener(() => {
  console.log('GitHub仓库状态检查器扩展已安装');
});

// 处理来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchYAML') {
    fetchYAMLFile().then(sendResponse);
    return true; // 保持消息通道开放用于异步响应
  }
});

// 获取YAML文件的函数
async function fetchYAMLFile() {
  try {
    // 添加时间戳参数防止缓存，并设置no-cache headers
    const timestamp = Date.now();
    const url = `http://windy.run:8000/github_repo_state.yaml?_t=${timestamp}`;
    
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