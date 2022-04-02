import React from 'react'

export default ({ msg }: {msg: string}) => (
  <div style={{ padding: '0.1rem', backgroundColor: 'yellow' }}>
    <h1>{msg}</h1>
  </div>
)