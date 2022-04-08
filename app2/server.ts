import express, { Request, Response } from 'express'
import fetch from 'node-fetch'

const PORT = process.env.PORT || '3002';
const app = express();

let fetchAssetManifest: Promise<Record<string, string>>;

app.use('/static', express.static('dist/static'))
app.use('/server', express.static('dist/server'))

app.get('/', async (req: Request, res: Response) => {
  // maybe get data
  const manifest = await fetchAssetManifest as Record<string, string>
  let render = await import('./src/server-renderer')
    .then(({ default: renderer }) => renderer)
  render(req, res, manifest)
})

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
  fetchAssetManifest = fetch(`http://localhost:${PORT}/static/manifest.json`)
    .then(res => res.json()) as Promise<Record<string, string>>;
})

