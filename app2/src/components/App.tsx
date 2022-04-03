import React from 'react'
import RemoteComponent from 'app1/RemoteComponent'
import Marketing from 'app1/Marketing'
import app2Hook from 'app2/useApp2ConsoleMessage'

export default () => {
  app2Hook('this is app2 ');

  return (
    <>
      <h1>App 2</h1>
      <RemoteComponent name={"app 2 msg"} />
      <Marketing color={"red"}>
        <Marketing color={"yellow"} />
      </Marketing>
      <Marketing color={"green"} />
      <Marketing color={"red"} />
    </>
  )
}