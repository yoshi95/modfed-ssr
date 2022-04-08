import React from 'react'
import { server as render } from 'gap-renderer'
import type { Request, Response } from 'express'
import App from './components/App'

export default (
  req: Request,
  res: Response,
  manifest: Record<string, string>
) => render(req, res, manifest, <App assets={manifest} />)

