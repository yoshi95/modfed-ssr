const { RawSource } = require('webpack-sources')
const { RuntimeGlobals, Template } = require('webpack')

function containerEntryCodeGenOverride({
  runtimeName,
  chunkToRemotesMapping,
  idToExternalAndNameMapping
}) {
  return function singleChunkContainerEntryCodeGeneration({ moduleGraph, chunkGraph, runtimeTemplate }) {
    const sources = new Map();
    const runtimeRequirements = new Set([
      RuntimeGlobals.definePropertyGetters,
      RuntimeGlobals.hasOwnProperty,
      RuntimeGlobals.exports
    ]);
    const getters = [];
  
    for (const block of this.blocks) {
      const { dependencies } = block;
  
      const modules = dependencies.map(dependency => {
        const dep = /** @type {ContainerExposedDependency} */ (dependency);
        return {
          name: dep.exposedName,
          module: moduleGraph.getModule(dep),
          request: dep.userRequest
        };
      });
  
      let str;
  
      if (modules.some(m => !m.module)) {
        str = runtimeTemplate.throwMissingModuleErrorBlock({
          request: modules.map(m => m.request).join(", ")
        });
      } else {
        str = `return ${runtimeTemplate.blockPromise({
          block,
          message: "",
          chunkGraph,
          runtimeRequirements
        })}.then(${runtimeTemplate.returningFunction(
          runtimeTemplate.returningFunction(
            `(${modules
              .map(({ module, request }) =>
                runtimeTemplate.moduleRaw({
                  module,
                  chunkGraph,
                  request,
                  weak: false,
                  runtimeRequirements
                })
              )
              .join(", ")})`
          )
        )});`;
      }
  
      getters.push(
        `${JSON.stringify(modules[0].name)}: ${runtimeTemplate.basicFunction(
          "",
          str
        )}`
      );
    }
  
    const source = Template.asString([
      `var moduleMap = {`,
      Template.indent(getters.join(",\n")),
      "};",
      `var get = ${runtimeTemplate.basicFunction("module, getScope", [
        `${RuntimeGlobals.currentRemoteGetScope} = getScope;`,
        // reusing the getScope variable to avoid creating a new var (and module is also used later)
        "getScope = (",
        Template.indent([
          `${RuntimeGlobals.hasOwnProperty}(moduleMap, module)`,
          Template.indent([
            "? moduleMap[module]()",
            `: Promise.resolve().then(${runtimeTemplate.basicFunction(
              "",
              "throw new Error('Module \"' + module + '\" does not exist in container.');"
            )})`
          ])
        ]),
        ");",
        `${RuntimeGlobals.currentRemoteGetScope} = undefined;`,
        "return getScope;"
      ])};`,
      `var init = ${runtimeTemplate.basicFunction("shareScope, initScope", [
        `if (!${RuntimeGlobals.shareScopeMap}) return;`,
        `var name = ${JSON.stringify(this._shareScope)}`,
        `var oldScope = ${RuntimeGlobals.shareScopeMap}[name];`,
        `if(oldScope && oldScope !== shareScope) throw new Error("Container initialization failed as it has already been initialized with a different share scope");`,
        `${RuntimeGlobals.shareScopeMap}[name] = shareScope;`,
        'let initResult;',
        `return ${RuntimeGlobals.initializeSharing}(name, initScope)
          .then(val => {
            initResult = val;
            return Promise.all(
              [${Object.keys(chunkToRemotesMapping).map(key => `'${key}'`)}]
                .map(chunkId => ${runtimeName}(chunkId, [] ))
            )
          })
          .then(() => initResult);`
      ])};`,
      "",
      "// This exports getters to disallow modifications",
      `${RuntimeGlobals.definePropertyGetters}(exports, {`,
      Template.indent([
        `get: ${runtimeTemplate.returningFunction("get")},`,
        `init: ${runtimeTemplate.returningFunction("init")}`
      ]),
      "});"
    ]);
  
    sources.set(
      "javascript",
      this.useSourceMap || this.useSimpleSourceMap
        ? new OriginalSource(source, "webpack/container-entry")
        : new RawSource(source)
    );
  
    return {
      sources,
      runtimeRequirements
    };
  }
}

module.exports = containerEntryCodeGenOverride;
