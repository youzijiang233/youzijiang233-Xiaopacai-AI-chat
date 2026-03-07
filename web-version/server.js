const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// 数据目录
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    // 如果 users.json 不存在，创建空数组
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('初始化数据目录失败:', error);
  }
}

// 读取所有用户
async function getUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// 保存所有用户
async function saveUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// 获取用户目录
function getUserDir(username) {
  return path.join(DATA_DIR, username);
}

// 确保用户目录存在
async function ensureUserDir(username) {
  const userDir = getUserDir(username);
  const convsDir = path.join(userDir, 'conversations');
  await fs.mkdir(userDir, { recursive: true });
  await fs.mkdir(convsDir, { recursive: true });
}

// 初始化
ensureDataDir();

// 中间件
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Session 配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'xiaopacai-chat-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 天
  }
}));

// 静态文件服务（仅暴露前端必需资源，避免泄露 data/.env 等敏感文件）
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/lib', express.static(path.join(__dirname, 'lib')));

// 认证中间件
function requireAuth(req, res, next) {
  if (!req.session.username) {
    return res.status(401).json({ success: false, error: '未登录' });
  }
  next();
}

// ========== 用户认证 API ==========

// 注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({ success: false, error: '用户名和密码不能为空' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.json({ success: false, error: '用户名长度必须在 3-20 个字符之间' });
    }

    if (password.length < 6) {
      return res.json({ success: false, error: '密码长度至少 6 个字符' });
    }

    // 检查用户名是否包含非法字符
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.json({ success: false, error: '用户名只能包含字母、数字、下划线和连字符' });
    }

    const users = await getUsers();

    // 检查用户名是否已存在
    if (users.find(u => u.username === username)) {
      return res.json({ success: false, error: '用户名已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const newUser = {
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await saveUsers(users);

    // 创建用户目录
    await ensureUserDir(username);

    // 自动登录
    req.session.username = username;

    res.json({ success: true, user: { username } });
  } catch (error) {
    console.error('注册错误:', error);
    res.json({ success: false, error: '注册失败' });
  }
});

// 登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({ success: false, error: '用户名和密码不能为空' });
    }

    const users = await getUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.json({ success: false, error: '用户名或密码错误' });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.json({ success: false, error: '用户名或密码错误' });
    }

    // 设置 session
    req.session.username = username;

    res.json({ success: true, user: { username } });
  } catch (error) {
    console.error('登录错误:', error);
    res.json({ success: false, error: '登录失败' });
  }
});

// 登出
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// 获取当前用户
app.get('/api/auth/me', (req, res) => {
  if (!req.session.username) {
    return res.json({ success: false, error: '未登录' });
  }

  res.json({ success: true, user: { username: req.session.username } });
});

// ========== 用户设置 API ==========

// 获取设置
app.get('/api/settings', requireAuth, async (req, res) => {
  try {
    const settingsFile = path.join(getUserDir(req.session.username), 'settings.json');

    try {
      const data = await fs.readFile(settingsFile, 'utf8');
      res.json({ success: true, data: JSON.parse(data) });
    } catch {
      // 文件不存在，返回空对象
      res.json({ success: true, data: {} });
    }
  } catch (error) {
    console.error('获取设置错误:', error);
    res.json({ success: false, error: '获取设置失败' });
  }
});

// 保存设置
app.post('/api/settings', requireAuth, async (req, res) => {
  try {
    const { data } = req.body;
    const settingsFile = path.join(getUserDir(req.session.username), 'settings.json');

    await fs.writeFile(settingsFile, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('保存设置错误:', error);
    res.json({ success: false, error: '保存设置失败' });
  }
});

// 获取当前活动对话 ID
app.get('/api/active-conversation', requireAuth, async (req, res) => {
  try {
    const activeFile = path.join(getUserDir(req.session.username), 'active.json');

    try {
      const data = await fs.readFile(activeFile, 'utf8');
      res.json({ success: true, data: JSON.parse(data) });
    } catch {
      res.json({ success: true, data: null });
    }
  } catch (error) {
    console.error('获取活动对话错误:', error);
    res.json({ success: false, error: '获取活动对话失败' });
  }
});

// 保存当前活动对话 ID
app.post('/api/active-conversation', requireAuth, async (req, res) => {
  try {
    const { id } = req.body;
    const userDir = getUserDir(req.session.username);
    const activeFile = path.join(userDir, 'active.json');

    await fs.mkdir(userDir, { recursive: true });
    await fs.writeFile(activeFile, JSON.stringify(id ?? null, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('保存活动对话错误:', error);
    res.json({ success: false, error: '保存活动对话失败' });
  }
});

// ========== 对话管理 API ==========

// 保存对话
app.post('/api/conversations', requireAuth, async (req, res) => {
  try {
    const { conversation } = req.body;

    if (!conversation || !conversation.id) {
      return res.json({ success: false, error: '无效的对话数据' });
    }

    const convsDir = path.join(getUserDir(req.session.username), 'conversations');
    const title = conversation.title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
    const filename = path.join(convsDir, `${title}_${conversation.id}.json`);

    // 删除该对话ID的所有旧文件（处理标题改变的情况）
    try {
      const files = await fs.readdir(convsDir);
      const oldFiles = files.filter(f => f.endsWith(`_${conversation.id}.json`) && f !== `${title}_${conversation.id}.json`);

      for (const oldFile of oldFiles) {
        await fs.unlink(path.join(convsDir, oldFile));
      }
    } catch (e) {
      // 忽略删除旧文件的错误
    }

    await fs.writeFile(filename, JSON.stringify(conversation, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('保存对话错误:', error);
    res.json({ success: false, error: '保存对话失败' });
  }
});

// 删除对话
app.delete('/api/conversations/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const convsDir = path.join(getUserDir(req.session.username), 'conversations');

    // 查找匹配的文件
    const files = await fs.readdir(convsDir);
    const targetFile = files.find(f => f.endsWith(`_${id}.json`));

    if (targetFile) {
      await fs.unlink(path.join(convsDir, targetFile));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('删除对话错误:', error);
    res.json({ success: false, error: '删除对话失败' });
  }
});

// 批量加载对话（仅元数据）
app.post('/api/conversations/batch', requireAuth, async (req, res) => {
  try {
    const convsDir = path.join(getUserDir(req.session.username), 'conversations');

    try {
      const files = await fs.readdir(convsDir);

      // 并行读取所有文件，只提取元数据
      const conversationPromises = files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          try {
            const filePath = path.join(convsDir, file);
            const data = await fs.readFile(filePath, 'utf8');

            // 检查文件是否为空
            if (!data || data.trim().length === 0) {
              console.error(`对话文件为空: ${file}`);
              return null;
            }

            const conv = JSON.parse(data);

            // 计算消息条数（排除系统消息）
            let messageCount = 0;
            if (conv.messages) {
              messageCount = Object.values(conv.messages).filter(m => m.role !== 'system').length;
            }

            // 只返回元数据，不包含 messages
            return {
              id: conv.id,
              title: conv.title,
              updatedAt: conv.updatedAt,
              createdAt: conv.createdAt,
              messageCount: messageCount
            };
          } catch (e) {
            console.error(`读取对话文件失败: ${file}`, e.message);
            return null;
          }
        });

      const conversations = (await Promise.all(conversationPromises)).filter(c => c !== null);

      // 按更新时间排序
      conversations.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

      res.json({ success: true, conversations });
    } catch {
      // 目录不存在，返回空数组
      res.json({ success: true, conversations: [] });
    }
  } catch (error) {
    console.error('批量加载对话错误:', error);
    res.json({ success: false, error: '加载对话失败' });
  }
});

// 加载单个对话的完整内容
app.get('/api/conversations/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const convsDir = path.join(getUserDir(req.session.username), 'conversations');

    // 查找匹配的文件
    const files = await fs.readdir(convsDir);
    const targetFile = files.find(f => f.endsWith(`_${id}.json`));

    if (!targetFile) {
      return res.json({ success: false, error: '对话不存在' });
    }

    const filePath = path.join(convsDir, targetFile);
    const data = await fs.readFile(filePath, 'utf8');

    // 检查文件是否为空
    if (!data || data.trim().length === 0) {
      console.error(`对话文件为空: ${targetFile}`);
      return res.json({ success: false, error: '对话文件损坏' });
    }

    const conversation = JSON.parse(data);

    res.json({ success: true, conversation });
  } catch (error) {
    console.error('加载对话错误:', error.message);
    res.json({ success: false, error: '加载对话失败: ' + error.message });
  }
});

// ========== 前端路由 ==========

// 登录页面
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// 主应用（需要登录）
app.get('/', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 其他路由也重定向到主页（SPA）
app.get('*', (req, res) => {
  if (!req.session.username && !req.path.startsWith('/api/')) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Xiaopacai AI Chat 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 用户可以通过浏览器访问并注册/登录使用服务`);
  console.log(`💾 数据存储在 data/ 文件夹中`);
});

// 优雅关闭
process.on('SIGINT', () => {
  process.exit(0);
});
