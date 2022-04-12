
const buildRemote = (name, url) => `promise (() => {
  globalThis.fetchedRemotes = globalThis.fetchedRemotes || {};
  if (globalThis.fetchedRemotes['${name}']) {
    return globalThis.fetchedRemotes['${name}'];
  }
  const remotePromise = globalThis.fetchedRemotes['${name}'] = new Promise((resolve, reject) => {
    const fetch = require('node-fetch');
    const Module = require('module');
    
    console.log('==== fetching remote ${name}: ${url}');
    fetch('${url}')
      .then(res => res.text())
      .then(code => {
        const filename = 'remote-entry-${name}.js';
        const m = new Module(filename, module.parent);
        m.filename = filename;
        m._compile(code, filename);
        resolve(m.exports)
      })
      .catch(err => reject(err))
  });
  return remotePromise;
})();
`

module.exports = buildRemote;
