
import React from 'react'
import { client as renderer } from 'gap-renderer'
import App from './components/App'

export default () => renderer(<App assets={(window as any).assetManifest}/>)

