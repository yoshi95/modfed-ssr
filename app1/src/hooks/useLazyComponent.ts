import React, { lazy, useMemo } from 'react'

const lazyComponents = new Map<string, React.LazyExoticComponent<any>>()

const useLazyComponent = (key: string, imports: Promise<any>) => {
  const memorizedComponent = useMemo(
    () => {
      let component = lazyComponents.get(key)
      if (component) return component

      console.log(`constructing memo for ${key}`)
      component = lazy(() => imports)
      lazyComponents.set(key, component)

      return component
    },
    [key]
  )

  return memorizedComponent
}

export default useLazyComponent
