# Xiaopacai AI Chat 详细说明书

文档类型：用户/运维/开发统一说明书（非 README）  
适用版本：当前仓库代码（桌面端 Electron + Web 服务器端）  
语言：中文

---

## 1. 产品定位与版本组成

Xiaopacai AI Chat 是一个以“树状对话”为核心的数据结构化聊天应用，包含两个运行形态：

1. 桌面端（Electron）
2. Web 服务器端（Node.js + Express + 浏览器）

两个版本共享核心交互与对话结构，Web 版额外提供账号体系与多用户隔离。

---

## 2. 功能总览

### 2.1 核心能力

1. 树状对话结构（消息分支、分支切换、分支删除）
2. API 预设管理（多预设、重命名、删除、新建）
3. 多 API 格式请求（OpenAI 兼容 / Claude）
4. 模型下拉刷新（按当前预设请求模型列表）
5. OpenRouter 提供商路由指定（可选）
6. 每个对话独立系统提示词
7. 消息级操作（复制、编辑、重试、删除）
8. AI 消息记录“生成模型名”，历史消息显示对应模型
9. 生成参数全套滑条控制与一键重置
10. Markdown 渲染 + 代码高亮 + 代码块一键复制
11. Enter/Ctrl+Enter 发送模式切换
12. 主题切换（深色/浅色）
13. 消息字体大小与消息区域宽度调节
14. 滚动位置记忆与智能滚动
15. 流式输出、停止生成、状态提示

### 2.2 桌面端额外能力

1. 本地文件系统存储（每个对话独立 JSON）
2. API Key 系统级加密（Electron safeStorage）
3. 右键中文菜单（撤销/重做/剪切/复制/粘贴/全选）
4. AI 消息中的外链统一转系统浏览器打开
5. Ctrl + 鼠标滚轮缩放（50%~200%）和 Ctrl + 0 重置

### 2.3 Web 端额外能力

1. 登录/注册（用户名密码）
2. Session 会话认证
3. 多用户数据隔离存储
4. 对话元数据与完整内容分层缓存
5. 移动端竖屏输入栏可视高度修正（含 Edge）
6. 移动端竖屏隐藏快捷键提示，仅保留输入框

---

## 3. 界面结构说明

### 3.1 顶栏

1. 应用 Logo 与当前模型徽章
2. 主题切换按钮
3. 运行状态显示：
   1. 绿色：就绪
   2. 黄色：生成中
   3. 红色：出错

### 3.2 左侧轨道栏

1. 参数配置面板开关
2. 对话列表面板开关

Web 版在移动端顶部额外有“参数/历史”快捷按钮。

### 3.3 参数配置面板

包含四个可折叠区块：

1. API 设置
2. 生成参数
3. 功能选项
4. 系统提示词

底部显示统计信息：

1. 消息数
2. 总字符数

### 3.4 对话列表面板

1. 新建对话
2. 对话项点击加载
3. 对话项操作：
   1. 重命名
   2. 复制
   3. 删除

### 3.5 主聊天区域

1. 消息列表（用户/AI 双侧布局）
2. 消息上方名称行（用户显示“你”，AI 显示该消息对应模型名）
3. 输入区 + 发送/停止按钮
4. 快捷键提示与字数计数

---

## 4. API 设置模块详解

### 4.1 API 预设管理

1. 支持多预设切换
2. 支持新建预设
3. 支持重命名预设（就地编辑）
4. 支持删除预设（至少保留一个）

### 4.2 预设字段

1. API Endpoint
2. API Key（界面遮罩显示）
3. 模型名称
4. 提供商（仅 OpenRouter 时显示）
5. API 格式（OpenAI 兼容 / Claude）

### 4.3 模型下拉

1. 点击刷新会请求 `.../models`
2. 优先尝试 OpenAI 风格模型接口
3. 失败后尝试 Claude 风格模型接口
4. 获取到模型后可直接点选写入模型字段

### 4.4 提供商下拉（OpenRouter）

可选常见 provider，如 OpenAI / Anthropic / Google / DeepSeek 等。

### 4.5 格式值规范化

内部只保存标准值：

1. `openai`
2. `claude`

历史脏值会自动回退为 `openai`，避免出现格式显示异常。

### 4.6 下拉菜单互斥逻辑

打开一个下拉时会自动关闭其他下拉，防止多个菜单同时展开。

### 4.7 初始化默认预设配置（开发者）

这部分用于配置“首次启动/无设置数据时”的默认 API 预设。

生效条件：

1. 当前用户没有历史 `settings` 数据（即首次初始化）。
2. 一旦已有保存的预设，应用会优先读取已保存内容，不再使用初始化默认值。

配置位置：

1. 桌面端默认预设定义：`index.html` 的 `getDefaultPresets()`
2. Web 端默认预设定义：`web-version/index.html` 的 `getDefaultPresets()`
3. 首次默认 API Key 回退值：
   1. 桌面端：`index.html` 的 `loadSettings()` 中 `fullApiKeys[activePresetId] = ''`
   2. Web 端：`web-version/index.html` 的 `loadSettings()` 中 `fullApiKeys[activePresetId] = ''`

当前仓库默认初始化内容（两端已统一）：

```js
{
  id: 'preset_default',
  name: '新预设',
  url: '',
  model: '',
  format: 'openai'
}
```

字段建议：

1. `name`：建议简洁可识别，如 `新预设`、`OpenRouter 默认`。
2. `url`：建议填写完整聊天接口路径，例如 `.../v1/chat/completions`。
3. `model`：可留空，或填写常用默认模型名。
4. `format`：仅使用 `openai` 或 `claude`。
5. `provider`：仅在 OpenRouter 场景需要，可留空。

如何让改动立即对“已有用户”生效：

1. 桌面端：
   1. 关闭应用。
   2. 删除 `data/settings.json`（或手动清空其中 `presets`）。
   3. 重启应用。
2. Web 端（按用户）：
   1. 停止服务或确保无人操作。
   2. 删除 `web-version/data/<username>/settings.json`（或清空其中 `presets`）。
   3. 重新登录后会按新默认预设初始化。

注意事项：

1. 修改的是“初始化模板”，不会自动覆盖老用户已保存预设。
2. `format` 若写非标准值会被系统规范化回 `openai`。
3. 若你希望每次启动都强制刷新默认预设，需要额外改 `loadSettings()` 逻辑（当前设计不是强制覆盖）。

---

## 5. 生成参数与功能选项

### 5.1 生成参数（均可实时调整）

1. Max Tokens
2. Chat Memory（上下文轮数）
3. Temperature
4. Top P
5. Top K
6. Frequency Penalty
7. Presence Penalty
8. Repetition Penalty
9. Min P
10. Top A

支持“一键重置所有参数”。

### 5.2 功能选项开关

1. 流式传输
2. Markdown 渲染
3. 代码高亮
4. Enter 发送模式

### 5.3 显示调节

1. 消息字体大小（12~24）
2. 消息区域宽度（600~1800）
3. 两项均支持重置
4. 调节过程中尽量保持当前阅读位置稳定

### 5.4 系统提示词

1. 按“对话”独立保存
2. 切换对话会加载对应系统提示词
3. 请求时按当前对话注入

---

## 6. 消息发送与停止机制

### 6.1 发送模式

可切换两种：

1. Enter 发送，Ctrl/Shift+Enter 换行
2. Ctrl/Shift+Enter 发送，Enter 换行

默认值：

1. 桌面端：默认 Enter 发送
2. Web 端：默认 Enter 换行（Ctrl/Shift+Enter 发送）

### 6.2 发送流程

1. 输入消息
2. 创建用户消息节点
3. 预创建 AI 消息占位
4. 根据格式与参数发起请求
5. 流式或非流式写回
6. 保存对话并更新 UI

### 6.3 停止生成

1. 发送按钮在生成时变为停止按钮
2. 使用 `AbortController` 中断当前对话请求
3. 已返回文本会保留并标记“已停止”

### 6.4 请求构造差异

1. OpenAI 兼容：
   1. `Authorization: Bearer ...`
   2. `messages` 内可注入 system role
2. Claude：
   1. `x-api-key`
   2. `anthropic-version`
   3. `system` 字段单独传递

OpenRouter + provider 时自动追加 `provider.order`。

---

## 7. 树状对话与分支机制

### 7.1 数据模型核心

每个对话包含：

1. `rootMessageId`（根节点，系统消息）
2. `messages`（消息字典）
3. `branchNodes`（分支节点字典）

渲染时只显示“当前激活路径”。

### 7.2 重试（Retry）

1. 对用户消息重试：在该用户消息下创建/复用分支节点，生成新的 AI 分支回复
2. 对 AI 消息重试：在其父级路径下创建/复用分支节点，生成替代 AI 回复

### 7.3 编辑（Edit）

1. AI 消息：可编辑并保存
2. 用户消息：可编辑并保存，或“保存并重新生成”
3. “保存并重新生成”会创建新分支，不覆盖原路径

### 7.4 删除（Delete）规则

1. 有子节点且父为分支节点：仅清空内容保留结构
2. 有子节点且父为普通消息：提升子节点并删除当前消息
3. 无子节点：直接删除，并按需收缩/移除分支节点

### 7.5 分支切换

每个分支点显示 `x/y` 指示器，可左右切换激活分支。

---

## 8. 对话管理

### 8.1 新建对话

1. 自动创建系统根消息
2. 标题初始为“新对话”

### 8.2 自动标题

首次用户消息后可自动将标题改为该消息前缀。

### 8.3 重命名

1. 列表就地编辑
2. 对话文件名随标题变化同步调整

### 8.4 复制

1. 深拷贝整棵对话树
2. 重映射消息/分支 ID
3. 标题追加“(副本)”

### 8.5 删除

1. 删除当前对话文件
2. 若删除的是当前会话，自动切到下一条或新建

### 8.6 滚动位置记忆

1. 切换对话会恢复上次滚动位置
2. 滚动保存采用防抖写入

---

## 9. 消息显示与渲染

### 9.1 模型名显示规则

1. 每条 AI 消息在创建时记录 `model`
2. 显示时优先显示消息自身 `model`
3. 若缺失才回退到当前预设模型

### 9.2 Markdown 与代码

1. 支持 GFM 换行
2. 代码块支持语言标签和高亮
3. 每个代码块有“复制”按钮

### 9.3 复制消息

消息操作栏复制按钮可复制该气泡纯文本内容。

---

## 10. 快捷键与交互

### 10.1 输入区快捷键

取决于发送模式（见 6.1）。

### 10.2 编辑框快捷键

1. `Esc` 取消编辑
2. 保存快捷键跟随发送模式

### 10.3 缩放（桌面优先）

1. `Ctrl + 鼠标滚轮`：缩放
2. `Ctrl + 0`：重置缩放

---

## 11. 桌面端（Electron）专项说明

### 11.1 数据存储

1. 开发环境：项目目录 `data/`
2. 打包后：可执行文件同级 `data/`
3. 对话文件：`data/conversations/<标题>_<id>.json`
4. 设置：`data/settings.json`
5. 活动会话：`data/active.json`

### 11.2 安全

1. API Key 优先使用系统级加密（safeStorage）
2. 非 Electron 场景有降级加密逻辑（仅开发/兼容用途）

### 11.3 应用关闭保护

主进程关闭前通知渲染进程保存当前会话，保存完成后再真正退出。

### 11.4 链接与右键菜单

1. AI 文本里的外链点击后会转系统浏览器打开
2. 应用内右键菜单为中文项：
   1. 撤销
   2. 重做
   3. 剪切
   4. 复制
   5. 粘贴
   6. 全选

---

## 12. Web 端专项说明

### 12.1 账号与认证

1. 登录页支持“登录/注册”切换
2. 用户名规则：3~20 位，字母/数字/下划线/连字符
3. 密码规则：至少 6 位
4. 注册成功自动登录
5. 主页面未登录会跳转 `/login`

### 12.2 服务端存储结构

1. `web-version/data/users.json`：账号列表（密码哈希）
2. `web-version/data/<username>/settings.json`
3. `web-version/data/<username>/active.json`
4. `web-version/data/<username>/conversations/*.json`

### 12.3 服务端 API（核心）

认证：

1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `POST /api/auth/logout`
4. `GET /api/auth/me`

设置：

1. `GET /api/settings`
2. `POST /api/settings`
3. `GET /api/active-conversation`
4. `POST /api/active-conversation`

对话：

1. `POST /api/conversations`（保存完整对话）
2. `DELETE /api/conversations/:id`
3. `POST /api/conversations/batch`（仅元数据）
4. `GET /api/conversations/:id`（完整内容）

### 12.4 Web 性能策略

1. 对话列表缓存（TTL 5 秒）
2. 完整对话缓存（TTL 60 秒，最多 100 条）
3. 元数据/完整内容分层加载
4. 消息渲染使用 `DocumentFragment` 批量插入
5. 代码高亮延迟执行，减轻主线程阻塞
6. Markdown 渲染缓存（避免重复解析）

### 12.5 移动端适配

1. 使用 `visualViewport` 同步可视高度，修复输入栏被浏览器工具栏遮挡
2. 竖屏移动端隐藏底部快捷键提示，仅保留输入框

### 12.6 端口与启动

1. 默认端口：`5638`
2. 启动脚本：
   1. Windows：`web-version/start.bat`
   2. Linux/Mac：`web-version/start.sh`
   3. 或 `npm start`

---

## 13. 配置与文件格式

### 13.1 会话 JSON（核心字段）

```json
{
  "id": "16位ID",
  "title": "对话标题",
  "autoTitleGenerated": true,
  "rootMessageId": "系统消息ID",
  "messages": {
    "msgId": {
      "id": "msgId",
      "role": "user|assistant|system",
      "model": "仅assistant可有",
      "content": "文本",
      "parentId": "父节点ID",
      "children": ["子节点ID"],
      "timestamp": 0
    }
  },
  "branchNodes": {
    "nodeId": {
      "id": "nodeId",
      "parentMessageId": "父消息ID",
      "activeChildId": "当前分支首消息ID",
      "branches": [
        {
          "id": "branchId",
          "firstMessageId": "分支首消息ID",
          "createdAt": 0
        }
      ]
    }
  },
  "systemPrompt": "",
  "scrollPosition": 0,
  "createdAt": 0,
  "updatedAt": 0
}
```

### 13.2 设置数据（典型）

1. API 预设数组（含加密 key）
2. 活动预设 ID
3. 各生成参数值
4. 开关状态（stream/md/hl/enterToSend）
5. 主题、缩放、面板状态、折叠状态
6. 字体大小、消息宽度

---

## 14. 典型使用流程

### 14.1 首次配置

1. 打开参数配置面板
2. 填写 Endpoint / API Key / 模型名
3. 选择 API 格式
4. 发送测试消息

### 14.2 高级对话操作

1. 在某条 AI 消息点“重试”生成替代分支
2. 通过 `x/y` 分支控件切换分支
3. 对用户消息使用“保存并重新生成”创建新分支路径
4. 不需要的分支可删除

### 14.3 多预设切换

1. 新建多个 API 预设（不同平台/模型）
2. 在预设下拉中切换
3. 每个预设独立保存 endpoint/key/model/format/provider

---

## 15. 常见问题排查

### 15.1 API Key 报非法字符

原因：输入了中文或非 ASCII 字符。  
处理：重新粘贴纯英文 API Key。

### 15.2 生成中断或报错

1. 检查 Endpoint 与格式是否匹配
2. 检查模型名是否有效
3. 检查网络和 API 平台返回

### 15.3 API 格式显示异常

系统会自动规范化为 `openai` 或 `claude`；若历史数据脏值已自动回退为 `openai`。

### 15.4 Web 登录后跳回登录页

通常为 session 失效或服务重启；重新登录即可。

---

## 16. 已实现但需注意的行为

1. Web 端后端已提供 `/api/auth/logout`，当前主界面未提供显式“退出登录”按钮。
2. 对话树是结构化模型，删除/重试/编辑会触发节点重连或分支重建，不是简单线性覆盖。
3. 历史消息显示的模型名来自消息创建时记录，不会随当前顶栏模型名反向改写。

---

## 17. 术语表

1. 预设：一组 API 配置模板
2. 分支节点：承载多个候选子路径的树节点
3. 激活分支：当前渲染路径使用的分支
4. 渲染路径：从根节点到当前可见链路
5. 系统提示词：每个对话独立的 system 指令

---

## 18. 维护建议（可选）

1. 定期备份 `data/`（桌面端）或 `web-version/data/`（Web 端）
2. Web 生产环境务必修改 `SESSION_SECRET`
3. 若要做二次开发，优先保持 `messages + branchNodes` 结构一致性
