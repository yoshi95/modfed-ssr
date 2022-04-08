
const buildRemote = (name, url) => `promise (() => {
  globalThis.fetchedRemotes = globalThis.fetchedRemotes || {};
  if (globalThis.fetchedRemotes['${name}']) {
    return globalThis.fetchedRemotes['${name}'];
  }
  const remotePromise = globalThis.fetchedRemotes['${name}'] = new Promise((resolve, reject) => {
    const fetch = require('node-fetch');
    const vm = require('vm');
    
    fetch('${url}')
      .then(res => res.text())
      .then(code => {
        const module = { exports: undefined }
        const context = vm.createContext({ module, require, __dirname, fetchedRemotes: globalThis.fetchedRemotes })
        const script = new vm.Script(
          code, 
          { filename: 'remote-entry-${name}.js' }
        )
        script.runInContext(context);
        resolve(module.exports)
      })
      .catch(err => reject(err))
  });
  return remotePromise;
})();
`

module.exports = buildRemote;
