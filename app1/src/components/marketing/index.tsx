import React, { PropsWithChildren, Suspense } from 'react'
import useLazyComponent from '../../hooks/useLazyComponent'

const Empty = (): null => null

export default ({ color = 'green', children }: PropsWithChildren<{color?: string}>) => {
  const ColorComponent = useLazyComponent(color, import(`./color/${color}`))
  return (
    <>
      <h1>this is color: {color}</h1>
      <Suspense fallback={<Empty />}>
        <ColorComponent msg={`this is ${color}`}>
          {children}
        </ColorComponent>
      </Suspense>
    </>
  )
}
