import React, { PropsWithChildren } from 'react'

export default ({ msg, children }: PropsWithChildren<{msg: string}>) => (
  <div style={{ padding: '0.1rem', backgroundColor: 'red' }}>
    <h1>{msg}</h1>
    {children}
  </div>
)