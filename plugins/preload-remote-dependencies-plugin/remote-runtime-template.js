
const { RuntimeGlobals, Template } = require('webpack')

class RemoteRuntimeTemplate {
	constructor({
		runtimeName,
		chunkToRemotesMapping,
		idToExternalAndNameMapping,
    allowFlush = false,
    flushRuntime
	}) {
		this.runtimeName = runtimeName;
    this.chunkToRemotesMapping = chunkToRemotesMapping;
    this.idToExternalAndNameMapping = idToExternalAndNameMapping;
    this.allowFlush = allowFlush;
    this.flushRuntime = flushRuntime;
	}

	build({ runtimeTemplate }) {
		return Template.asString([
			`var chunkMapping = ${JSON.stringify(
				this.chunkToRemotesMapping,
				null,
				"\t"
			)};`,
			`var idToExternalAndNameMapping = ${JSON.stringify(
				this.idToExternalAndNameMapping,
				null,
				"\t"
			)};`,
      this.allowFlush ? `${this.flushRuntime} = ${runtimeTemplate.basicFunction("", [
        Template.indent[
          `Object.entries(idToExternalAndNameMapping).forEach(${
            runtimeTemplate.basicFunction("entry", [
              'const [key, data] = entry',
              'delete data.p'
            ])
          }`
        ]
      ])}` : '// no flush runtime',
			`${this.runtimeName} = ${runtimeTemplate.basicFunction("chunkId, promises", [
				`if(${RuntimeGlobals.hasOwnProperty}(chunkMapping, chunkId)) {`,
				Template.indent([
					`chunkMapping[chunkId].forEach(${runtimeTemplate.basicFunction("id", [
						`var getScope = ${RuntimeGlobals.currentRemoteGetScope};`,
						"if(!getScope) getScope = [];",
						"var data = idToExternalAndNameMapping[id];",
						"if(getScope.indexOf(data) >= 0) return;",
						"getScope.push(data);",
						`if(data.p) return promises.push(data.p);`,
						`var onError = ${runtimeTemplate.basicFunction("error", [
							'if(!error) error = new Error("Container missing");',
							'if(typeof error.message === "string")',
							Template.indent(
								`error.message += '\\nwhile loading "' + data[1] + '" from ' + data[2];`
							),
							`${
								RuntimeGlobals.moduleFactories
							}[id] = ${runtimeTemplate.basicFunction("", ["throw error;"])}`,
							"data.p = 0;"
						])};`,
						`var handleFunction = ${runtimeTemplate.basicFunction(
							"fn, arg1, arg2, d, next, first",
							[
								"try {",
								Template.indent([
									"var promise = fn(arg1, arg2);",
									"if(promise && promise.then) {",
									Template.indent([
										`var p = promise.then(${runtimeTemplate.returningFunction(
											"next(result, d)",
											"result"
										)}, onError);`,
										`if(first) promises.push(data.p = p); else return p;`
									]),
									"} else {",
									Template.indent(["return next(promise, d, first);"]),
									"}"
								]),
								"} catch(error) {",
								Template.indent(["onError(error);"]),
								"}"
							]
						)}`,
						`var onExternal = ${runtimeTemplate.returningFunction(
							`external ? handleFunction(${RuntimeGlobals.initializeSharing}, data[0], 0, external, onInitialized, first) : onError()`,
							"external, _, first"
						)};`,
						`var onInitialized = ${runtimeTemplate.returningFunction(
							`handleFunction(external.get, data[1], getScope, 0, onFactory, first)`,
							"_, external, first"
						)};`,
						`var onFactory = ${runtimeTemplate.basicFunction("factory", [
							"data.p = 1;",
							`${
								RuntimeGlobals.moduleFactories
							}[id] = ${runtimeTemplate.basicFunction("module", [
								"module.exports = factory();"
							])}`
						])};`,
						"handleFunction(__webpack_require__, data[2], 0, 0, onExternal, 1);"
					])});`
				]),
				"}"
			])}`
		]);
	}
}

module.exports = RemoteRuntimeTemplate;
