
const { RuntimeModule } = require('webpack')
const RemoteRuntimeTemplate = require('./remote-runtime-template')

class SingleChunkRemoteRuntimeModule extends RuntimeModule {
	constructor({
    runtimeName,
    chunkToRemotesMapping,
    idToExternalAndNameMapping
  }) {
		super("single-remotes loading");
    this.template = new RemoteRuntimeTemplate({
			runtimeName,
			chunkToRemotesMapping,
			idToExternalAndNameMapping
		})
	}

	/**
	 * @returns {string} runtime code
	 */
	generate() {
		const { compilation } = this;
		const { runtimeTemplate } = compilation
		return this.template.build({ runtimeTemplate });
	}
}

module.exports = SingleChunkRemoteRuntimeModule