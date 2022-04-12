/**
 * @typedef {import('webpack').Compiler} Compiler
 */


const { RuntimeGlobals, RuntimeModule, Template } = require('webpack')
// const getRemoteChunkMap = require('./preload-remote-dependencies-plugin/get-module-mapping')

class FlushExternalRuntimeModule extends RuntimeModule {
  constructor({
    runtimeName,
    clearRemotesRuntime,
    clearSharedRuntime,
    chunkToRemotesMapping
  }) {
    super("remote flush");
    this.runtimeName = runtimeName;
    this.clearSharedRuntime = clearSharedRuntime;
    this.clearRemotesRuntime = clearRemotesRuntime;
    this.chunkToRemotesMapping = chunkToRemotesMapping
  }

  /**
  * @returns {string} runtime code
  */
  generate() {
    const { compilation } = this;
    const { runtimeTemplate } = compilation;

    return Template.asString([
      /*
      `const remotes = ${
        JSON.stringify(
          Object.entries(this.chunkToRemotesMapping).reduce((result, entry) => [
            ...result, ...entry[1]
          ], []),
          null, 2)
      };`,
      */
      `${this.runtimeName} = ${runtimeTemplate.basicFunction("", [
        Template.indent([
          `${this.clearRemotesRuntime}();`,
          `${this.clearSharedRuntime}();`,
          'globalThis.fetchedRemotes = {};',
          '__webpack_module_cache__ = {}',
        ])
      ])}`
    ]);
  }
}

class FlushExternalPlugin {
  /**
   *
   * @param {Compiler} compiler
   */
  apply(compiler) {
    compiler.hooks.compilation.tap(
      "FlushExternalPlugin",
      compilation => {
        const flushExternalRuntime = '__webpack_require__.flushExternals';
        const clearRemotesRuntime = `${RuntimeGlobals.require}.clearRemotes`;
        const clearSharedRuntime = `${RuntimeGlobals.require}.clearSharedRuntime`;
        const chunkToRemotesMapping = {}

        compilation.hooks.runtimeRequirementInTree
          .for(flushExternalRuntime)
          .tap("FlushExternalPlugin", (chunk, set) => {
            compilation.addRuntimeModule(
              chunk,
              new FlushExternalRuntimeModule({
                runtimeName: flushExternalRuntime,
                clearSharedRuntime,
                clearRemotesRuntime,
                chunkToRemotesMapping
              })
            );
            return true;
          });

        compilation.hooks.afterRuntimeRequirements
          .tap("FlushExternalPlugin", () => {
            const { chunkGraph, chunks, runtimeTemplate } = compilation
            Array.from(chunks).forEach(chunk => {
              const modules = chunkGraph.getChunkModules(chunk)
                  .filter(mod => mod.constructor && mod.constructor.name === 'RemoteRuntimeModule')
              if (modules.length === 0) return;
              
              Array.from(modules).forEach(mod => {
                const originalGenerate = mod.generate.bind(mod);
                mod.generate = (function generate() {
                  return `${
                    originalGenerate()
                  }
                  ${clearRemotesRuntime} = ${runtimeTemplate.basicFunction("", [
                    Template.indent([
                      `Object.entries(idToExternalAndNameMapping).forEach(${
                        runtimeTemplate.basicFunction("entry", [
                          'const [key, data] = entry',
                          'delete data.p'
                        ])
                      })`
                    ])
                  ])};`
                }).bind(mod)
              })
              
            });

            Array.from(chunks).forEach(chunk => {
              const modules = chunkGraph.getChunkModules(chunk)
                  .filter(mod => mod.constructor && mod.constructor.name === 'ShareRuntimeModule')
              if (modules.length === 0) return;
              
              Array.from(modules).forEach(mod => {
                const originalGenerate = mod.generate.bind(mod);
                mod.generate = (function generate() {
                  return `${
                    originalGenerate()
                  }
                  ${clearSharedRuntime} = ${runtimeTemplate.basicFunction("", [
                    Template.indent([
                      'initPromises = {};',
                      'initTokens = {};',
                      '__webpack_require__.S = {}'
                    ])
                  ])};`
                }).bind(mod)
              })
              
            });

          })

          compilation.hooks.additionalChunkRuntimeRequirements.tap(
            "FlushExternalPlugin",
            (chunk, set, { chunkGraph }) => {
              const remotes = Array.from(chunk.groupsIterable)
                .reduce((result, chunkGroup) => [...result, ...chunkGroup.chunks],[])
                .reduce((result, groupChunk) => [
                  ...result,
                  ...Array.from(chunkGraph.getChunkModulesIterableBySourceType(
                    groupChunk,
                    "remote"
                  ) || [])
                ], []).reduce((result,mod) => [...result, ...mod.externalRequests], [])
              
              if (remotes.length) {
                chunkToRemotesMapping[chunk.id] = remotes;
              }
              set.add(flushExternalRuntime);

            }
          )

      }
    )
  }
}

module.exports = FlushExternalPlugin;
