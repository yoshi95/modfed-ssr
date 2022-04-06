import React from 'react'
import RemoteComponent from './RemoteComponent'
import app2Hook from 'app2/useApp2ConsoleMessage'
import Marketing from './marketing/index'
import { Html } from 'gap-renderer'

export default ({ assets }: { assets: Record<string, string>}) => {
  app2Hook('app 1 message')
  return (
    <Html assets={assets} title="App1">
      <h1>App 1 Body here</h1>
      <RemoteComponent name={'this is from app1'} />
      <Marketing />
    </Html>
  )
}