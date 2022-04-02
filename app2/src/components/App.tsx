import React from 'react'
import RemoteComponent from 'app1/RemoteComponent'
import Marketing from 'app1/Marketing'
import useApp2ConsoleMessage from '../hooks/app2Hook'

export default () => {
  useApp2ConsoleMessage('this is app2 ');

  return (
    <>
      <h1>App 2</h1>
      <RemoteComponent name={"app 2 msg"} />
      <Marketing color={"red"} />
    </>
  )
}