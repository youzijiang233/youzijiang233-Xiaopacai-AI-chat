const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的文件操作 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 读取配置文件
  readData: (filename) => ipcRenderer.invoke('read-data', filename),

  // 写入配置文件
  writeData: (filename, data) => ipcRenderer.invoke('write-data', filename, data),

  // 检查文件是否存在
  fileExists: (filename) => ipcRenderer.invoke('file-exists', filename),

  // 列出文件夹中的所有文件
  listFiles: (folderName) => ipcRenderer.invoke('list-files', folderName),

  // 删除文件
  deleteFile: (filename) => ipcRenderer.invoke('delete-file', filename),

  // 确保文件夹存在
  ensureFolder: (folderName) => ipcRenderer.invoke('ensure-folder', folderName),

  // 加密数据（使用系统级加密）
  encryptData: (plaintext) => ipcRenderer.invoke('encrypt-data', plaintext),

  // 解密数据（使用系统级加密）
  decryptData: (encrypted) => ipcRenderer.invoke('decrypt-data', encrypted),

  // 监听应用关闭事件
  onAppClosing: (callback) => ipcRenderer.on('app-closing', callback),

  // 通知主进程保存完成
  saveCompleted: () => ipcRenderer.send('save-completed')
});
