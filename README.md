# GitHub仓库状态检查器 Chrome扩展

## 功能
在GitHub仓库页面自动检查仓库地址是否在远程YAML文件中有对应记录，并显示匹配结果。

## 安装步骤
1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 启用右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择包含这些文件的文件夹

## 使用方法
1. 安装扩展后，访问任意GitHub仓库页面
2. 扩展会自动获取 `http://windy.run:8000/github_repo_state.yaml` 文件
3. 比对当前仓库URL与文件中的记录
4. 在页面右上角显示匹配结果：
   - 绿色提示：找到匹配，显示对应的状态值
   - 红色提示：未找到匹配

## 文件说明
- `manifest.json`: 扩展清单文件
- `content.js`: 内容脚本，处理页面检测和匹配逻辑
- `background.js`: 后台服务脚本
- `yaml-parser.js`: 简单的YAML解析器

## 权限说明
- `activeTab`: 访问当前标签页
- `storage`: 存储数据（备用）
- `https://github.com/*`: 访问GitHub页面
- `http://windy.run:8000/*`: 获取远程YAML文件

## 技术说明
- 使用后台服务脚本处理HTTP请求，避免HTTPS页面上的混合内容问题
- 内容脚本通过消息传递与后台脚本通信
- 支持实时显示加载状态和错误信息