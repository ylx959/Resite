//only for vitest 測試設定（npm run test / test:run 會讀這個檔）
//跟 next build 無關，不會進到部署出去的網站
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  //讓測試裡的 `@/xxx` 指到 `src/xxx`，跟 tsconfig.json 的 paths 對應
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  //測試跑在 node 環境（沒有 DOM），所以只測 buildSite、parseResume、reducer 這類模組
  test: { environment: 'node' },
})
