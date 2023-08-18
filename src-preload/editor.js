const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('EditorPreload', {
  getInitialFile: () => ipcRenderer.invoke('get-initial-file'),
  getFile: (id) => ipcRenderer.invoke('get-file', id),
  openedFile: (id) => ipcRenderer.invoke('opened-file', id),
  closedFile: () => ipcRenderer.invoke('closed-file'),
  showSaveFilePicker: suggestedName => ipcRenderer.invoke('show-save-file-picker', suggestedName),
  showOpenFilePicker: () => ipcRenderer.invoke('show-open-file-picker'),
  setChanged: (changed) => ipcRenderer.invoke('set-changed', changed),
  openNewWindow: () => ipcRenderer.invoke('open-new-window'),
  openAddonSettings: () => ipcRenderer.invoke('open-addon-settings'),
  openPackager: () => ipcRenderer.invoke('open-packager'),
  openDesktopSettings: () => ipcRenderer.invoke('open-desktop-settings'),
  openPrivacy: () => ipcRenderer.invoke('open-privacy'),
  openAbout: () => ipcRenderer.invoke('open-about'),
  setExportForPackager: (callback) => {
    exportForPackager = callback;
  }
});

let exportForPackager = () => Promise.reject(new Error('exportForPackager missing'));

ipcRenderer.on('export-project-to-port', (e) => {
  const port = e.ports[0];
  exportForPackager()
    .then(({data, name}) => {
      port.postMessage({ data, name });
    })
    .catch((error) => {
      console.error(error);
      port.postMessage({ error: true });
    });
});

window.addEventListener('message', (e) => {
  if (e.source === window) {
    const data = e.data;
    if (data && typeof data.ipcStartWriteStream === 'number') {
      ipcRenderer.postMessage('start-write-stream', data.ipcStartWriteStream, e.ports);
    }
  }
});
