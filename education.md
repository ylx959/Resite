# Reset、Save JSON、Import：資料怎麼來回而不走樣

這份文件說明三個按鈕背後的做法，以及什麼情況下資料**完全不變**、什麼情況下**會被修正**、什麼情況下**整個被拒絕**。

---

## 0. 先記住一句話

> 整個 app 只有**一份**履歷資料（`Resume` 物件）。
> 存檔、匯出、匯入、重設，都只是把這一份資料「換成另一份」或「複製一份出去」。
> 從外面進來的資料，一律先過 `parseResume` 這道門。

```
                 ┌──────────── Save JSON ───────────► xxx.resume.json（下載）
                 │
  Resume（記憶體）◄── replace ── Import ◄── parseResume ◄── 你選的 .json 檔
                 ◄── replace ── Reset  ◄── sampleResume（程式裡的範例）
                 │
                 └── 300ms 後自動 ──► localStorage ── 下次開啟 ── parseResume ──► Resume
```

---

## 1. 相關檔案一覽

| 檔案 | 角色 |
| --- | --- |
| `src/types/resume.ts` | `Resume` 的資料形狀。全部是字串、布林、陣列、物件，沒有函式、沒有 `Date`。 |
| `src/resume/reducer.ts` | `resumeReducer`：唯一能改資料的地方。Import 和 Reset 都用其中的 `replace`。 |
| `src/resume/sample.ts` | `sampleResume`：Reset 會換回的範例履歷。 |
| `src/utils/validation.ts` | `parseResume` / `parseResumeJson`：檢查並整理外部資料的「海關」。 |
| `src/utils/storage.ts` | `loadResume` / `saveResume`：讀寫瀏覽器 localStorage。 |
| `src/hooks/useResumeStore.ts` | 開啟時讀存檔、之後每次修改自動存檔。 |
| `src/utils/download.ts` | `downloadBlob`：把資料變成檔案下載。 |
| `src/App.tsx` | 三個按鈕真正做的事（`actions` 物件）。 |
| `src/components/app/Toolbar.tsx` | 三個按鈕本身（Import、Save JSON、重設）。 |
| `src/components/ui/ConfirmButton.tsx` | 重設要按兩次的確認按鈕。 |
| `src/utils/validation.test.ts`、`src/utils/storage.test.ts` | 證明「來回不走樣」的測試。 |

---

## 2. 為什麼資料「可以」完全不變？關鍵在資料形狀

`src/types/resume.ts` 刻意只用 JSON 能表達的東西：

```ts
export type Resume = {
  version: typeof RESUME_VERSION   // 1
  profile: Profile                 // name, title, icon, links
  sections: Section[]
  settings: Settings               // template, accent, lang
}
```

- 沒有 `Date`、`Map`、`class`、函式。這些東西 `JSON.stringify` 之後會變形或消失。
- 圖片（大頭照、icon）存成 `data:image/...;base64,...` **字串**，所以也能原封不動放進 JSON。
- 每個區塊、每個項目都有自己的 `id`，存出去再讀回來，`id` 一樣，順序也一樣。

所以 `JSON.parse(JSON.stringify(resume))` 會得到一模一樣的內容。整個流程能來回不走樣，就是建立在這一點上。

---

## 3. Save JSON：複製一份出去

`src/App.tsx`

```ts
exportJson: () =>
  downloadBlob(
    new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' }),
    `${fileSlug(resume)}.resume.json`,
  ),
```

1. `JSON.stringify(resume, null, 2)`：把目前的資料轉成文字，縮排 2 格方便人看。
2. 包成 `Blob`，交給 `downloadBlob`。

`src/utils/download.ts`

```ts
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob) // 給這份資料一個暫時網址
  const a = document.createElement('a')
  a.href = url
  a.download = filename                 // 告訴瀏覽器「下載」，不是「打開」
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000) // 用完釋放記憶體
}
```

**重點：Save JSON 只讀不寫。** 它沒有呼叫 `dispatch`，所以畫面上的履歷和 localStorage 都不會被改到。

---

## 4. Import：外面的資料要先過海關

### 4.1 按鈕

`src/components/app/Toolbar.tsx`：一個藏起來的 `<input type="file">`，Import 按鈕只是幫你點它。

```tsx
<input
  ref={fileInput}
  type="file"
  accept="application/json,.json"
  className="sr-only"
  onChange={(e) => {
    const file = e.target.files?.[0]
    if (file) actions.importJson(file)
    e.target.value = ''   // 清空，同一個檔案再選一次也會觸發
  }}
/>
```

### 4.2 讀檔 → 檢查 → 取代

`src/App.tsx`

```ts
const importJson = async (file: File) => {
  const result = parseResumeJson(await file.text())
  if (!result.ok) return setNotice({ tone: 'error', text: `Couldn't import ${file.name}: ${result.error}` })
  dispatch({ type: 'replace', resume: result.resume })
  setNotice({ tone: 'ok', text: `Imported ${file.name}.` })
}
```

順序很重要：

1. **先檢查**（`parseResumeJson`）。
2. **全部通過才取代**（`dispatch replace`）。
3. 只要有一個錯誤就 `return`，**目前的履歷一個字都不會動**。

這叫做「全有或全無」：不會發生匯入到一半、資料變成一半新一半舊的情況。

### 4.3 海關：`parseResume`

`src/utils/validation.ts`

```ts
export function parseResumeJson(text: string): ParseResult {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'This file is not valid JSON.' }
  }
  return parseResume(data)
}
```

`parseResume` 不是「看一看就放行」，而是**依照 `Resume` 的形狀，一個欄位一個欄位重新組出一份新物件**。每個欄位都有自己的小檢查員（decoder）：

```ts
const text = (fallback = '', max = MAX_TEXT) => (value, path) => {
  if (value === undefined || value === null) return fallback            // 沒填 → 用預設值
  if (typeof value !== 'string') return fail(path, 'text')               // 型別錯 → 拒絕
  return value.length > max ? fail(path, `at most ...`) : value          // 太長 → 拒絕；否則原樣保留
}
```

最上層長這樣（節錄）：

```ts
return {
  version: RESUME_VERSION,
  profile: {
    name:  text('', 200)(profile.name,  `${path}.profile.name`),
    title: text('', 200)(profile.title, `${path}.profile.title`),
    icon:  text('', MAX_IMAGE)(profile.icon, `${path}.profile.icon`),
    links: ids(link)(profile.links, `${path}.profile.links`),
  },
  sections: ids(section)(o.sections, `${path}.sections`),
  settings: settings(o.settings, `${path}.settings`),
}
```

`path` 參數讓錯誤訊息可以精準指出哪裡錯，例如 `resume.sections[0].kind should be one of text, timeline, tags, people, links.`

---

## 5. 三種結果：不變、被修正、被拒絕

### ✅ 完全不變

由本 app **Save JSON 存出來的檔案**，再 Import 回去，內容一模一樣。

原因：每個 decoder 在值「本來就正確」時，都直接回傳原值；`id` 沒重複就保留原本的 `id`。

```ts
function withUniqueIds(items) {
  const seen = new Set<string>()
  return items.map((item) => {
    const id = item.id && !seen.has(item.id) ? item.id : createId() // 原本的 id 好好的就照用
    seen.add(id)
    return id === item.id ? item : { ...item, id }
  })
}
```

有測試直接證明這件事（`src/utils/validation.test.ts`）：

```ts
it('accepts an exported resume unchanged', () => {
  expect(parseResume(JSON.parse(JSON.stringify(sampleResume)))).toEqual({ ok: true, resume: sampleResume })
})
```

這行測試就是「Save JSON 再 Import」的縮小版：先 `stringify`（存出去），再 `parse`（讀回來），結果必須**完全等於**原本的資料。

### 🔧 被修正（會改，但是往安全的方向改）

檔案是手寫的、舊版本、或缺東西時，`parseResume` 會補齊或修好，而不是直接拒絕：

| 檔案裡的情況 | 匯入後變成 | 程式位置 |
| --- | --- | --- |
| 欄位沒寫（例如沒有 `icon`、`subtitle`） | 空字串 `''` | `text('')` 的 fallback |
| 沒寫 `visible` | `true`（顯示） | `bool(true)` |
| 沒寫 `current` | `false` | `bool(false)` |
| 沒寫 `highlights` 等清單 | `[]` | `list()` |
| 沒寫 `settings` | `{ template: 'minimal', accent: '#ff4a00', lang: 'en' }` | `settings` decoder |
| `lang` 不是合法語言代碼 | `'en'` | `settings` decoder |
| 沒寫 `version` | `1` | `resume` decoder |
| `id` 缺少或重複 | 產生新的隨機 `id` | `withUniqueIds` |
| 多出 app 不認識的欄位（例如 `"foo": 1`） | **丟掉** | decoder 只挑認識的欄位組新物件 |

最後一點是安全設計：因為是「重新組一份」而不是「整包信任」，奇怪的欄位永遠進不來。

### ⛔ 被拒絕（目前的履歷完全不動）

| 情況 | 錯誤訊息範例 |
| --- | --- |
| 根本不是 JSON | `This file is not valid JSON.` |
| 該是文字的地方放了數字 | `resume.profile.name should be text.` |
| 不認識的區塊種類 | `resume.sections[0].kind should be one of text, timeline, tags, people, links.` |
| 該是清單卻不是 | `resume.sections should be a list.` |
| 顏色不是 `#rrggbb` | `resume.settings.accent should be a hex color like #ff4a00.` |
| 文字太長、圖片太大 | `... should be at most 1,500,000 characters.` |
| 新版本 app 存的檔案 | `resume.version should be 1 (this file is from a newer version of Resite).` |

這些錯誤都由 `fail()` 丟出 `DecodeError`，再在 `parseResume` 的 `try/catch` 變成 `{ ok: false, error }`。`importJson` 看到 `ok: false` 就只顯示紅色通知，不呼叫 `dispatch`。

---

## 6. Reset：換回範例

### 6.1 為什麼要按兩次

`src/components/app/Toolbar.tsx`

```tsx
<ConfirmIconButton label="Reset to the sample resume" confirmLabel="Reset all?" onConfirm={actions.reset}>
  <Reset />
</ConfirmIconButton>
```

`ConfirmIconButton`（`src/components/ui/ConfirmButton.tsx`）第一下只會展開成「Reset all?」。3 秒內再按一次才會真的執行；失去焦點或按 Esc 也會取消。這樣可以避免誤觸把資料洗掉。

### 6.2 做了什麼

`src/App.tsx`

```ts
reset: () => {
  dispatch({ type: 'replace', resume: sampleResume })
  setNotice({ tone: 'ok', text: 'Reset to the sample resume.' })
},
```

`src/resume/reducer.ts`

```ts
case 'replace':
  return action.resume
```

就這樣：整份資料換成 `sampleResume`。接著自動存檔（見第 7 節）會在 300ms 後把範例寫進 localStorage，**蓋掉你原本的存檔**。

### 6.3 範例本身為什麼不會被改壞？

Reset 之後你繼續編輯，改的會不會是 `sampleResume` 本身？不會。`resumeReducer` 每次都**回傳新物件**，從不修改舊物件：

```ts
case 'profile':
  return { ...resume, profile: { ...resume.profile, ...action.patch } } // 複製，不是改原本的
```

所以 `sampleResume` 永遠保持乾淨，第二次 Reset 也會得到一樣的範例。`src/resume/reducer.test.ts` 裡的 `does not mutate the previous state` 測試保證了這點。

> 💡 Reset 沒有「復原」。想保險的話，**先 Save JSON，再 Reset**，需要時再 Import 回來。這就是三個按鈕一起用的方式。

---

## 7. 自動存檔與開啟時讀取

`src/hooks/useResumeStore.ts`

```ts
// 開啟時：讀 localStorage，讀不到或壞掉就用範例
useEffect(() => {
  dispatch({ type: 'loaded', resume: loadResume(window.localStorage) ?? sampleResume })
}, [])

// 每次 resume 改變：等 300ms 沒再改，才真的存
useEffect(() => {
  if (!resume) return
  if (!loaded.current) { loaded.current = true; return } // 剛讀進來的那次不用存
  setSave({ state: 'pending' })
  const timer = window.setTimeout(() => {
    const result = saveResume(window.localStorage, resume)
    setSave(result.ok ? { state: 'saved' } : { state: 'error', message: result.error })
  }, SAVE_DELAY_MS)
  return () => window.clearTimeout(timer) // 300ms 內又改了 → 取消上一次，重新計時
}, [resume])
```

`src/utils/storage.ts`

```ts
export function loadResume(store) {
  try {
    const raw = store.getItem(STORAGE_KEY)            // 'resume-creator:v1'
    if (raw === null) return null
    const result = parseResume(JSON.parse(raw))       // 自己的存檔也要過海關！
    return result.ok ? result.resume : null
  } catch {
    return null
  }
}
```

注意：**連自己存的 localStorage 也要過 `parseResume`**。因為它可能是舊版本存的、被瀏覽器擴充套件改過，或者只寫了一半。localStorage 和匯入的檔案用同一道門，所以兩邊的規則完全一致。

`saveResume` 失敗時（例如空間滿了）不會讓 app 當掉，只會讓頂部的「Saved」變成紅點「Not saved」。

---

## 8. 三個按鈕一起看

| 動作 | 讀什麼 | 經過 `parseResume`？ | 改目前的履歷？ | 改 localStorage？ |
| --- | --- | --- | --- | --- |
| Save JSON | 目前的 `resume` | 否（自己的資料，已經是正確形狀） | 否 | 否 |
| Import | 你選的檔案 | **是** | 通過才會 `replace` | 300ms 後自動存 |
| Reset | `sampleResume` | 否（程式內建，型別保證正確） | 是，`replace` | 300ms 後自動存 |
| 開啟 app | localStorage | **是** | 讀進來當起點 | 否 |

---

## 9. 自己動手驗證

```bash
npm run test:run
```

相關測試：

- `validation.test.ts` → `accepts an exported resume unchanged`：存出再讀回，完全不變。
- `validation.test.ts` → `fills defaults for missing optional fields`：缺欄位會補齊。
- `validation.test.ts` → `regenerates missing and duplicate ids`：壞掉的 id 會修好。
- `validation.test.ts` → `rejects ...`：各種該拒絕的情況和錯誤訊息。
- `validation.test.ts` → `examples/raymond-yang.resume.json imports cleanly`：範例檔能匯入。
- `storage.test.ts` → `round-trips a resume`：localStorage 存了再讀，完全不變。
- `storage.test.ts` → `returns null for corrupt or invalid data`：壞掉的存檔不會讓 app 當掉。

### 小練習

1. 按 **Save JSON**，用編輯器打開下載的檔案，把某個 `"visible": true` 整行刪掉，再 **Import**。那個區塊還是顯示的（被補成 `true`）。
2. 把 `"name": "..."` 改成 `"name": 123` 再 Import。你會看到 `resume.profile.name should be text.`，畫面上的履歷完全沒變。
3. 在 `profile` 裡加一行 `"hacker": "<script>"`，Import 後再 Save JSON。新檔案裡不會有 `hacker` 這個欄位。
4. 先 Save JSON → Reset → Import 剛剛的檔案。你的履歷會完整回來，連區塊順序和 id 都一樣。
