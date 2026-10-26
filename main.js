const { app, BrowserWindow, ipcMain, desktopCapturer, session } = require('electron');
const path = require('path');

let selectedSourceId = null;

ipcMain.handle('get-sources', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
    thumbnailSize: { width: 320, height: 180 }
  });
  return sources.map(s => ({ id: s.id, name: s.name, thumb: s.thumbnail.toDataURL() }));
});
ipcMain.handle('select-source', (_e, id) => { selectedSourceId = id; });

function createWindow() {
  const win = new BrowserWindow({
    width: 900, height: 680, minWidth: 560, minHeight: 520,
    backgroundColor: '#0f1115', autoHideMenuBar: true, title: 'Beam',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  win.loadFile('index.html');
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(true));
  session.defaultSession.setDisplayMediaRequestHandler(async (request, callback) => {
    try {
      const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] });
      const src = sources.find(s => s.id === selectedSourceId) || sources[0];
      if (!src) return callback({});
      const result = { video: src };
      if (request.audioRequested && process.platform === 'win32') result.audio = 'loopback';
      callback(result);
    } catch (e) { callback({}); }
  });
  createWindow();
});

app.on('window-all-closed', () => app.quit());
