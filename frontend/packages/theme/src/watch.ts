import { type ChildProcess, spawn } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import chokidar from "chokidar"

const __dirname = dirname(fileURLToPath(import.meta.url))
const tokensDir = resolve(__dirname, "tokens")
const buildScript = resolve(__dirname, "build.ts")

let building = false
let queued = false

function runBuild(): void {
  if (building) {
    queued = true
    return
  }
  building = true
  console.log("[css:watch] Building tokens...")
  const child: ChildProcess = spawn("tsx", [buildScript], {
    stdio: "inherit",
    cwd: resolve(__dirname, ".."),
  })
  child.on("close", () => {
    building = false
    if (queued) {
      queued = false
      runBuild()
    }
  })
}

// Initial build
runBuild()

// Watch token files
chokidar
  .watch(`${tokensDir}/**/*.json`, { ignoreInitial: true })
  .on("add", runBuild)
  .on("change", runBuild)
  .on("unlink", runBuild)

console.log("[css:watch] Watching src/tokens/**/*.json for changes...")
