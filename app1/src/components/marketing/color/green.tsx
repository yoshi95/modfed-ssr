import React, { PropsWithChildren } from 'react'
import app2Hook from 'app2/useApp2ConsoleMessage'

export default ({ msg, children }: PropsWithChildren<{msg: string}>) => {
  app2Hook('this is app2Hook call from green marketing')
  return (
    <div style={{ padding: '0.1rem', backgroundColor: 'green' }}>
      <h1>{msg}</h1>
      {children}
    </div>
  )
}