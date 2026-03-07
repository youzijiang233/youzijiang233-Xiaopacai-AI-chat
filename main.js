const { app, BrowserWindow, Menu, ipcMain, safeStorage, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

function isExternalHttpUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

// 数据存储目录
// 开发环境：项目根目录/data
// 打包后：应用安装目录/data（与 exe 同级）
const dataDir = app.isPackaged
  ? path.join(path.dirname(process.execPath), 'data')
  : path.join(app.getAppPath(), 'data');

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// IPC 处理器：加密数据（使用系统级加密）
ipcMain.handle('encrypt-data', async (event, plaintext) => {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      return { success: false, error: '系统加密不可用' };
    }
    const buffer = safeStorage.encryptString(plaintext);
    return { success: true, data: buffer.toString('base64') };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC 处理器：解密数据（使用系统级加密）
ipcMain.handle('decrypt-data', async (event, encrypted) => {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      return { success: false, error: '系统加密不可用' };
    }
    const buffer = Buffer.from(encrypted, 'base64');
    const plaintext = safeStorage.decryptString(buffer);
    return { success: true, data: plaintext };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC 处理器：读取数据文件
ipcMain.handle('read-data', async (event, filename) => {
  try {
    const filePath = path.join(dataDir, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC 处理器：写入数据文件
ipcMain.handle('write-data', async (event, filename, data) => {
  try {
    await ensureDataDir();
    const filePath = path.join(dataDir, filename);
    await fs.writeFile(filePath, data, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC 处理器：检查文件是否存在
ipcMain.handle('file-exists', async (event, filename) => {
  try {
    const filePath = path.join(dataDir, filename);
    await fs.access(filePath);
    return { success: true, exists: true };
  } catch {
    return { success: true, exists: false };
  }
});

// IPC 处理器：列出文件夹中的所有文件
ipcMain.handle('list-files', async (event, folderName) => {
  try {
    const folderPath = path.join(dataDir, folderName);
    await fs.access(folderPath);
    const files = await fs.readdir(folderPath);
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message, files: [] };
  }
});

// IPC 处理器：删除文件
ipcMain.handle('delete-file', async (event, filename) => {
  try {
    const filePath = path.join(dataDir, filename);
    await fs.unlink(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC 处理器：确保文件夹存在
ipcMain.handle('ensure-folder', async (event, folderName) => {
  try {
    const folderPath = path.join(dataDir, folderName);
    await fs.mkdir(folderPath, { recursive: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC 处理器：保存完成通知
ipcMain.on('save-completed', () => {
  if (mainWindow) {
    mainWindow.destroy();
  }
});

// IPC 处理器：设置缩放级别
ipcMain.handle('set-zoom-level', async (event, level) => {
  if (mainWindow) {
    mainWindow.webContents.setZoomFactor(level);
  }
  return { success: true };
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0d0f14',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    // icon: path.join(__dirname, 'assets/icon.ico'),  // Uncomment when icon is ready
    title: 'Xiaopacai AI Chat',
    show: false
  });

  mainWindow.loadFile('index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Remove default menu bar
  Menu.setApplicationMenu(null);

  // 外部链接：统一在系统浏览器打开，避免在应用内跳转
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalHttpUrl(url)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (isExternalHttpUrl(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // 右键菜单：桌面端支持复制/粘贴等常用编辑操作
  mainWindow.webContents.on('context-menu', (_event, params) => {
    if (!mainWindow) return;

    const wc = mainWindow.webContents;
    const template = [];
    const editFlags = params.editFlags || {};
    const hasSelection = Boolean(params.selectionText && params.selectionText.trim().length > 0);

    if (params.isEditable) {
      template.push(
        { label: '撤销', enabled: editFlags.canUndo !== false, click: () => wc.undo() },
        { label: '重做', enabled: editFlags.canRedo !== false, click: () => wc.redo() },
        { type: 'separator' },
        { label: '剪切', enabled: editFlags.canCut !== false, click: () => wc.cut() },
        { label: '复制', enabled: editFlags.canCopy !== false, click: () => wc.copy() },
        { label: '粘贴', enabled: editFlags.canPaste !== false, click: () => wc.paste() },
        { label: '全选', enabled: editFlags.canSelectAll !== false, click: () => wc.selectAll() }
      );
    } else if (hasSelection) {
      template.push(
        { label: '复制', enabled: editFlags.canCopy !== false, click: () => wc.copy() },
        { type: 'separator' },
        { label: '全选', enabled: editFlags.canSelectAll !== false, click: () => wc.selectAll() }
      );
    }

    if (template.length === 0) return;
    Menu.buildFromTemplate(template).popup({ window: mainWindow });
  });

  // 窗口关闭前通知渲染进程保存数据
  mainWindow.on('close', (e) => {
    if (mainWindow) {
      e.preventDefault();
      mainWindow.webContents.send('app-closing');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
