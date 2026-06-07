import express from "express"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() })
})

const distDir = path.resolve(__dirname, "..", "dist")
app.use(express.static(distDir))

app.get("*", (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"))
})

const host = process.env.HOST ?? "0.0.0.0"
const port = Number(process.env.PORT ?? 8090)

app.listen(port, host, () => {
  process.stdout.write(`listening on http://${host}:${port}\n`)
})

