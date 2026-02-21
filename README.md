# 小趴菜 AI Chat - 树状对话管理的桌面聊天应用

基于 Electron 开发的现代化 AI 聊天桌面应用，支持创新的树状对话分支管理。

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Electron](https://img.shields.io/badge/electron-latest-brightgreen)

## ✨ 核心特性

### 🌳 树状对话分支
- **分支管理**：在任意对话节点创建多个分支
- **分支导航**：使用 `‹ 1/3 ›` 控件在不同分支间切换
- **分支删除**：删除不需要的分支，保持对话树结构完整
- **智能删除**：有子消息的消息删除后变为占位符，保持树结构

### 💬 智能对话管理
- **重试消息**：在任意位置生成替代的 AI 回复
- **编辑重新生成**：修改用户消息并创建新的对话分支
- **对话复制**：复制整个对话树，保留时间戳
- **对话重命名**：就地编辑对话标题
- **独立文件存储**：每个对话单独存储，性能更优

### 🎨 现代化界面
- **主题切换**：支持深色/亮色主题，自动保存偏好
- **滚动位置记忆**：自动保存和恢复查看位置
- Markdown 渲染和代码语法高亮（Highlight.js）
- 流式输出，带打字光标指示器
- 可折叠的设置面板
- 响应式布局，可调整面板大小

### 🔧 高级功能
- **多 API 支持**：OpenAI、DeepSeek 和自定义端点
- **API 预设**：保存和切换不同的 API 配置
- **生成参数**：精细调整 temperature、top-p、top-k、penalties 等
- **增强的编辑体验**：自动调整高度、字符计数、快捷键支持（Ctrl+Enter 保存，Esc 取消）
- **一键重置**：重置所有生成参数到默认值
- **本地存储**：所有数据以 JSON 格式本地存储
- **系统加密**：使用 Electron safeStorage 加密 API 密钥

### 🔒 隐私与安全
- 本地优先架构 - 数据不会离开您的设备
- 系统级加密保护敏感的 API 密钥
- 无遥测或分析
- 便携式数据文件夹，方便备份

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装运行

```bash
# 克隆仓库
git clone https://github.com/youzijiang233/xiaopacai-AI-chat.git

# 进入目录
cd xiaopacai-AI-chat

# 安装依赖
npm install

# 启动应用
npm start
```

### 打包构建

```bash
# 打包为 Windows 安装程序
npm run build

# 打包后的文件在 dist/ 目录
```

## 🎯 使用指南

### 首次配置
1. 点击左侧边栏的**设置**图标
2. 添加 API 配置：
   - API Key（密钥）
   - API Endpoint（端点，如 `https://api.openai.com/v1/chat/completions`）
   - Model（模型名称，如 `gpt-3.5-turbo`）
3. 根据需要调整生成参数
4. 点击设置面板外部关闭

### 基础使用
1. 在底部输入框输入消息
2. 按 `Ctrl+Enter` 或点击发送按钮
3. 等待 AI 回复（会看到打字光标）

### 高级功能

#### 创建分支
- 点击任意 AI 消息的**重试**按钮生成替代回复
- 点击任意用户消息的**编辑**按钮，修改后点击**保存并重新生成**
- 使用 `‹ 1/3 ›` 控件在分支间导航

#### 管理对话
- 点击**新建对话**开始新会话
- 在历史面板中悬停对话项查看操作按钮：
  - **重命名**：点击就地编辑标题
  - **复制**：创建整个对话的副本
  - **删除**：移除对话

#### 删除消息
- 有子消息的消息：内容被清空但保留结构
- 无子消息的消息：完全删除，包括其分支

## 🛠️ 技术栈

- **框架**：Electron
- **UI**：原生 JavaScript + CSS
- **Markdown**：Marked.js
- **语法高亮**：Highlight.js
- **存储**：本地 JSON 文件（每个对话一个文件）
- **加密**：Electron safeStorage API

## 📁 项目结构

```
xiaopacai-AI-chat/
├── assets/              # 应用图标
├── data/                # 用户数据（已忽略）
│   ├── conversations/   # 独立的对话文件
│   ├── settings.json    # 应用设置
│   └── active.json      # 当前活动对话 ID
├── lib/                 # 第三方库
├── index.html           # 主界面
├── main.js              # Electron 主进程
├── preload.js           # 预加载脚本
└── package.json         # 项目配置
```

## 🗺️ 开发路线图

- [ ] 对话搜索功能
- [ ] 导出对话为 Markdown/PDF
- [ ] 插件系统扩展功能
- [ ] 多语言界面支持
- [ ] 可选的云同步

## 📝 版本历史

### v1.2.0 (2025-02-21)
- ✨ 新增主题切换功能（深色/亮色模式）
- 💾 新增滚动位置记忆功能
- ✏️ 优化消息编辑框体验（自动高度、字符计数、快捷键）
- 🐛 修复多个潜在的内存泄漏问题
- 🔒 移除硬编码的 API Key，提升安全性
- 🎨 优化亮色模式的视觉效果
- 🔧 添加 API 响应边界检查，提升稳定性

### v1.1.0 (2025-02-XX)
- 🌳 实现树状对话分支管理系统
- 💬 优化消息发送和滚动体验
- 📁 每个对话独立文件存储

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Marked.js](https://marked.js.org/) - Markdown 渲染
- [Highlight.js](https://highlightjs.org/) - 语法高亮
- [Electron](https://www.electronjs.org/) - 桌面应用框架
- 所有贡献者和用户

## 📧 联系方式

- GitHub: [@youzijiang233](https://github.com/youzijiang233)
- 仓库: [xiaopacai-AI-chat](https://github.com/youzijiang233/xiaopacai-AI-chat)

---

⭐ 如果觉得有帮助，请给个 Star！
