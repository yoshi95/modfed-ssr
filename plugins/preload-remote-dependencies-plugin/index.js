const SingleChunkRemoteRuntimeModule = require('./SingleChunkremoteRuntimeModule')
const containerEntryCodeGenOverride = require('./containerEntryCodeGenOverride')

class PreloadRemoteDependenciesPlugin {
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

        function getRemoteChunkMap(chunk, chunkGraph) {
          const modules = Array.from(chunk.groupsIterable)
            .reduce((result, chunkGroup) => [...result, ...chunkGroup.chunks],[])
            .reduce((result, groupChunk) => [
              ...result,
              ...Array.from(chunkGraph.getChunkModulesIterableBySourceType(
                groupChunk,
                "remote"
              ) || [])
            ], []);

          if (!modules || !modules.length) return {};

          const chunkToRemotesMapping = {};
          const idToExternalAndNameMapping = {};
          const { moduleGraph } = chunkGraph;
          const remotes = (chunkToRemotesMapping[chunk.id] = []);

          for (const m of modules) {
            const module = m;
            const name = module.internalRequest;
            const id = chunkGraph.getModuleId(module);
            const shareScope = module.shareScope;
            const dep = module.dependencies[0];
            const externalModule = moduleGraph.getModule(dep);
            const externalModuleId =
              externalModule && chunkGraph.getModuleId(externalModule);
            remotes.push(id);
            idToExternalAndNameMapping[id] = [shareScope, name, externalModuleId];
          }

          return {
            chunkToRemotesMapping,
            idToExternalAndNameMapping
          }
        }
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

              modules.forEach(mod => {
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
