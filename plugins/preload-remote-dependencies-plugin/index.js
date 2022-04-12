const SingleChunkRemoteRuntimeModule = require('./SingleChunkremoteRuntimeModule')
const containerEntryCodeGenOverride = require('./containerEntryCodeGenOverride')
const getRemoteChunkMap = require('./get-module-mapping')

/**
 * @typedef {import('webpack').Compiler} Compiler
 */
class PreloadRemoteDependenciesPlugin {
  /**
   * 
   * @param {Compiler} compiler 
   */
  apply(compiler) {
    compiler.hooks.compilation.tap(
      "SingleChunkRemoteRuntimeCheckPlugin",
      compilation => {
        const singleChunkRemoteRuntime = '__webpack_require__.sremotes';
        let chunkToRemotesMapping = {};
        let idToExternalAndNameMapping = {};

        compilation.hooks.runtimeRequirementInTree
          .for(singleChunkRemoteRuntime)
          .tap("SingleChunkRemoteRuntimeCheckPlugin", (chunk, set) => {
            compilation.addRuntimeModule(
              chunk,
              new SingleChunkRemoteRuntimeModule({
                runtimeName: singleChunkRemoteRuntime,
                chunkToRemotesMapping,
                idToExternalAndNameMapping
              })
            );
            return true;
          });

        
        compilation.hooks.beforeCodeGeneration
          .tap("SingleChunkRemoteRuntimeCheckPlugin", () => {
            const { chunkGraph, chunks } = compilation
            Array.from(chunks).forEach(chunk => {
              if (chunk.hasAsyncChunks()) return;
              const modules = chunkGraph.getChunkModules(chunk)
                  .filter(mod => mod.constructor && mod.constructor.name === 'ContainerEntryModule')
              if (modules.length === 0) return;

              // get remotes mapping for chunk
              const {
                chunkToRemotesMapping,
                idToExternalAndNameMapping
              } = getRemoteChunkMap(chunk, chunkGraph);
              
              if (!chunkToRemotesMapping || Object.keys(chunkToRemotesMapping).length === 0) return;

              Array.from(modules).forEach(mod => {
                mod.codeGeneration = containerEntryCodeGenOverride({
                  runtimeName: singleChunkRemoteRuntime,
                  chunkToRemotesMapping,
                  idToExternalAndNameMapping
                }).bind(mod)
              })
              
            });

          })
        
        compilation.hooks.additionalChunkRuntimeRequirements.tap(
          "SingleChunkRemoteRuntimeCheckPlugin",
          (chunk, set, { chunkGraph }) => {
            if (chunk.hasAsyncChunks()) return;

            const {
              chunkToRemotesMapping: chunkMapping,
              idToExternalAndNameMapping: idMapping
            } = getRemoteChunkMap(chunk, chunkGraph);

            if (!chunkMapping) return;

            chunkToRemotesMapping = chunkMapping;
            idToExternalAndNameMapping = idMapping;

            set.add(singleChunkRemoteRuntime);

          }
        )



        
      }
    )
        
        
  }
}

module.exports = PreloadRemoteDependenciesPlugin
