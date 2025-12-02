# GitHub仓库状态检查器 Chrome扩展

## 功能
在GitHub仓库页面自动检查仓库地址是否在远程YAML文件中有对应记录，并显示匹配结果。

## 安装步骤
1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 启用右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择包含这些文件的文件夹

## 配置服务器地址
1. 点击Chrome工具栏中的扩展图标
2. 右键点击扩展，选择"选项"（或点击"详情"后找到"扩展程序选项"）
3. 在设置页面输入你的服务器地址和端口
   - **服务器地址**: 输入域名或IP地址（如 `windy.run` 或 `192.168.1.100`）
   - **端口**: 输入端口号（如 `8000`）
4. 点击"保存设置"

**默认配置**:
- 服务器地址: `windy.run`
- 端口: `8000`
- 完整URL: `http://windy.run:8000/github_repo_state.yaml`

## YAML文件格式说明

`github_repo_state.yaml` 文件支持两种格式（**推荐使用简短格式**）：

### 1. 简短格式（推荐）
```yaml
"owner/repo": "状态描述"
```

示例：
```yaml
"windy003/CE_GHMY": "可用"
"martinmimigames/little-file-explorer": "测试中"
"torvalds/linux": "不可用"
```

### 2. 完整URL格式
```yaml
"https://github.com/owner/repo": "状态描述"
```

示例：
```yaml
"https://github.com/windy003/CE_GHMY": "可用"
```

**注意**：
- 两种格式都可以使用，但推荐使用简短格式（更简洁）
- 键和值都需要用引号包围
- 状态描述可以是任意文本，如"可用"、"不可用"、"测试中"等

## 使用方法
1. 配置好服务器地址后，访问任意GitHub仓库页面
2. 扩展会自动从配置的服务器获取 `github_repo_state.yaml` 文件
3. 比对当前仓库URL与文件中的记录
4. 在页面右上角显示匹配结果：
   - 绿色提示：找到匹配，显示对应的状态值
   - 红色提示：未找到匹配

## 文件说明
- `manifest.json`: 扩展清单文件
- `content.js`: 内容脚本，处理页面检测和匹配逻辑
- `background.js`: 后台服务脚本，处理HTTP请求和配置管理
- `yaml-parser.js`: 简单的YAML解析器
- `options.html`: 配置页面界面
- `options.js`: 配置页面脚本，处理设置的保存和加载

## 权限说明
- `activeTab`: 访问当前标签页
- `storage`: 存储用户配置（服务器地址和端口）
- `https://github.com/*`: 访问GitHub页面
- `http://*/*` 和 `https://*/*`: 访问用户配置的任意HTTP/HTTPS服务器以获取YAML文件

## 技术说明
- 使用后台服务脚本处理HTTP请求，避免HTTPS页面上的混合内容问题
- 内容脚本通过消息传递与后台脚本通信
- 支持实时显示加载状态和错误信息