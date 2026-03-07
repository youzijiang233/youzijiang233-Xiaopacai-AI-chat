# Xiaopacai AI Chat - Web 服务器版

基于文件系统的多用户 AI 聊天应用服务器版本。

![Version](https://img.shields.io/badge/version-1.4.1-blue)

## 特性

- 🔐 用户注册和登录系统
- 💾 基于文件系统的数据存储
- 👥 多用户支持，数据完全隔离
- 📱 响应式设计，支持移动端
- 🔒 密码加密存储（bcrypt）
- 💬 对话历史管理
- ⚙️ 个性化设置保存

## 数据存储结构

```
web-version/
├── data/
│   ├── users.json              # 用户账号密码
│   ├── username1/
│   │   ├── settings.json       # 用户设置
│   │   └── conversations/      # 对话历史
│   │       ├── 对话1_id.json
│   │       └── 对话2_id.json
│   └── username2/
│       ├── settings.json
│       └── conversations/
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量（可选）

`start.bat` / `start.sh` 首次运行时会自动创建 `.env`，并自动生成随机 `SESSION_SECRET`。  
如果你希望手动管理配置，也可以按下面方式创建：

复制 `.env.example` 为 `.env` 并修改：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```
SESSION_SECRET=your-secret-key-here
PORT=5638
NODE_ENV=development
```

### 3. 启动服务器

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
./start.sh
```

或直接使用 npm：
```bash
npm start
```

### 4. 访问应用

打开浏览器访问：http://localhost:5638

## 用户管理

### 注册新用户

1. 访问 http://localhost:5638/login
2. 点击"注册"
3. 输入用户名（3-20个字符，仅支持字母、数字、下划线、连字符）
4. 输入密码（至少6个字符）

### 登录

使用注册的用户名和密码登录即可。

## 数据备份

### 备份用户数据

只需复制 `data/` 文件夹即可备份所有用户数据：

```bash
# 备份
cp -r data/ data_backup_$(date +%Y%m%d)/

# 恢复
cp -r data_backup_20260301/ data/
```

### 导出单个用户数据

直接复制对应用户的文件夹：

```bash
cp -r data/username/ /path/to/backup/
```

## 从本地版本迁移

本地版本的数据存储结构与服务器版本完全一致，可以直接迁移：

1. 找到本地版本的数据目录（通常在用户目录下）
2. 复制 `settings.json` 和 `conversations/` 文件夹
3. 在服务器上注册相同的用户名
4. 将文件复制到 `data/用户名/` 目录下

## 安全建议

1. **修改 SESSION_SECRET**：在生产环境中务必修改 `.env` 中的 `SESSION_SECRET`
2. **使用 HTTPS**：生产环境建议使用反向代理（如 Nginx）配置 HTTPS
3. **定期备份**：定期备份 `data/` 文件夹
4. **限制访问**：使用防火墙限制服务器访问
5. **强密码**：建议用户使用强密码

## 开发

### 开发模式

使用 nodemon 自动重启：

```bash
npm run dev
```

### 目录结构

```
web-version/
├── data/               # 用户数据目录
├── assets/            # 静态资源（图标等）
├── lib/               # 前端库
├── index.html         # 主应用页面
├── login.html         # 登录页面
├── server.js          # 服务器代码
├── package.json       # 依赖配置
└── README.md          # 本文件
```

## 技术栈

- **后端**: Node.js + Express
- **认证**: express-session + bcryptjs
- **存储**: 文件系统（JSON）
- **前端**: 原生 HTML/CSS/JavaScript

## 常见问题

### Q: 服务器重启后需要重新登录？

A: 是的，session 存储在内存中，服务器重启后会清空。这是正常行为。

### Q: 如何修改端口？

A: 在 `.env` 文件中设置 `PORT=端口号`，或在启动时设置环境变量：
```bash
PORT=8080 npm start
```

### Q: 忘记密码怎么办？

A: 目前没有找回密码功能。管理员可以直接编辑 `data/users.json` 删除对应用户，让用户重新注册。

### Q: 可以在公网访问吗？

A: 可以，但建议：
1. 使用 Nginx 等反向代理配置 HTTPS
2. 设置强密码策略
3. 定期备份数据
4. 考虑添加访问限制

## 版本信息

### v1.4.1 (2026-03-08)
- 🚀 Web 版本号升级到 1.4.1
- 🔐 Windows 启动脚本首次初始化 `.env` 时自动生成随机 `SESSION_SECRET`
- 📱 移动端输入栏可视区域适配增强，减少浏览器工具栏遮挡问题
- ⚡ 对话加载与缓存逻辑优化（元数据/完整内容分层缓存）

## 许可证

MIT License

## 支持

如有问题或建议，请提交 Issue。
