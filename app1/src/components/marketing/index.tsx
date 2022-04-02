import React, { lazy, Suspense, useMemo } from 'react'

const Empty = (): null => null
const Error = () => <h1>Error loading component!!!</h1>

export default ({ color = 'green' }: {color?: string}) => {
  const ColorComponent = useMemo(
    () => lazy(() => import(`./color/${color}`)),
    [color]
  )
  return (
    <>
      <h1>this is color: {color}</h1>
      <Suspense fallback={<Empty />}>
        <ColorComponent msg={`this is ${color}`} />
      </Suspense>
    </>
  )
}
