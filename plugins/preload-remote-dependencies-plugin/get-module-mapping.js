
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

module.exports = getRemoteChunkMap
