import React, { ReactNodeList } from 'react'
import { hydrateRoot } from 'react-dom/client'

export default (
  nodes: ReactNodeList) => {
  hydrateRoot(document, nodes)
}

