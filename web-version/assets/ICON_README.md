# 应用图标说明

由于无法直接生成 ICO 文件，请按以下步骤创建应用图标：

## 方法 1：使用在线工具
1. 访问 https://www.icoconverter.com/ 或 https://convertio.co/zh/png-ico/
2. 上传一个 256x256 的 PNG 图片（可以是 AI 聊天相关的图标）
3. 转换为 ICO 格式
4. 下载并保存为 `assets/icon.ico`

## 方法 2：使用现有图标
如果暂时不需要自定义图标，可以：
1. 从 Windows 系统中复制一个图标文件
2. 或者暂时注释掉 main.js 中的 icon 配置行

## 推荐图标设计
- 尺寸：256x256 像素
- 主题：深色背景，蓝色或绿色的聊天气泡图标
- 风格：现代、简洁

## 临时解决方案
如果现在就想测试应用，可以先注释掉 main.js 第 13 行的 icon 配置：
```javascript
// icon: path.join(__dirname, 'assets/icon.ico'),
```

这样应用会使用 Electron 的默认图标。
