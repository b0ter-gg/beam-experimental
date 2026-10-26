const { contextBridge, ipcRenderer, clipboard } = require('electron');
contextBridge.exposeInMainWorld('beam', {
  getSources: () => ipcRenderer.invoke('get-sources'),
  selectSource: id => ipcRenderer.invoke('select-source', id),
  copy: text => clipboard.writeText(text),
  paste: () => clipboard.readText()
});
