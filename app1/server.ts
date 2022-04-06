import express, { Request, Response } from 'express'
import fetch from 'node-fetch'

const PORT = process.env.PORT || '3001';
const app = express();

const fetchRenderer = import('./src/server-renderer')
  .then(({ default: renderer }) => renderer)

let fetchAssetManifest: Promise<Record<string, string>>;

app.use('/static', express.static('dist/static'))

app.get('/', async (req: Request, res: Response) => {
  // maybe get data
  const manifest = await fetchAssetManifest as Record<string, string>
  const render = await fetchRenderer
  render(req, res, manifest)
})

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
  fetchAssetManifest = fetch('http://localhost:3001/static/manifest.json')
    .then(res => res.json()) as Promise<Record<string, string>>;
})

