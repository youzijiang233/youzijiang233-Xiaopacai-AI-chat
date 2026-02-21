const { app, BrowserWindow, Menu, ipcMain, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

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
    title: 'AI Chat',
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
