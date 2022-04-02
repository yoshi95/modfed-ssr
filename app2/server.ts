import express from 'express'

const PORT = process.env.PORT || '3002';
const app = express();

app.use(express.static('dist/static'))

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`)
})

