import React, { ReactNodeList } from 'react'
import type { Request, Response } from 'express'
import { renderToPipeableStream } from 'react-dom/server'

export default (
  req: Request,
  res: Response,
  manifest: Record<string, string>,
  nodes: ReactNodeList
) => {
  let didError = false;
  const { pipe, abort } = renderToPipeableStream(
    nodes,
    {
      bootstrapScripts: [manifest['main.js']],
      onShellReady() {
        res.statusCode = didError ? 500 : 200;
        res.setHeader('Content-Type', 'text/html')
        pipe(res)
      },
      onError(err) {
        didError = true
        console.error(err)
      },
      onShellError(err) {
        // Something errored before we could complete the shell so we emit an alternative shell.
        res.statusCode = 500;
        console.error(err)
        res.send('<!doctype><p>Error</p>');
      }
    }
  )
  setTimeout(abort, 1000);

}




