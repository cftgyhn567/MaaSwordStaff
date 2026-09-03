# 疑難排解

## MXU 找不到 BlueStacks 5

1. 在 BlueStacks「設定 → 進階」開啟 Android Debug Bridge。
2. 在 PowerShell 執行 `./setup-bluestacks-adb.ps1`。
3. 完整退出再重開 MXU。
4. 在連接設定重新整理，選擇 `adb devices -l` 實際列出的裝置。

BlueStacks 內附的是 `HD-Adb.exe`；相容腳本會建立目前使用者專用的標準 `adb.exe` 入口並加入使用者 PATH，不需系統管理員權限。裝置可能是 `emulator-5554`、`emulator-5564` 或其他序號，不要固定假設 `127.0.0.1:5555`。

移除相容入口：

```powershell
./setup-bluestacks-adb.ps1 -Remove
```

## 顯示已連線或 Completed，但遊戲沒有動

把下列能力分開檢查：

1. `adb devices -l` 有正確且狀態為 `device` 的目標。
2. MXU 連到正確 controller／裝置。
3. 能取得目前遊戲的非黑畫面截圖。
4. 當前畫面能命中預期 recognition。
5. 點擊／滑動實際改變畫面。
6. 任務最後出現可驗證的結果狀態。

`controller connected`、`tasks-completed`、`DirectHit` 與 focus 成功日誌分別只證明很小的一段，不是完整成功。若 log 有 `MaaFramework internal error: status 0`、`截图失败` 或 screenshot failure，先解決截圖通道，再改 Pipeline。

## 任務在合理的「沒東西可做」狀態失敗

檢查前一節點的 `next` 是否只有一個可能辨識失敗的候選。常見修法是加入明確的 Done／Skip 狀態，或在 timeout 後經 `on_error` 安全返回；不要用立即成功的 DirectHit 蓋掉應等待的結果。

執行：

```powershell
pnpm audit:pipeline
```

缺少參照是錯誤；單一非 DirectHit 候選是風險提示，需按流程語意判斷。

## OCR 或模板在遊戲更新後誤判

- 確認解析度仍為直式 720×1280、DPI 160，且沒有額外縮放或語言變更。
- 保存新的無損截圖，對照 ROI 是否仍覆蓋正確元素。
- 同時測正樣本、相似負樣本、已領取／售完／禁用等狀態。
- 文字可能被 OCR 拆框；必要時改用穩定圖示模板或縮小 ROI。
- 不要只降低 threshold 讓案例通過；這通常會增加跨頁誤命中。
- 已遮蔽截圖可加入 `tests/screenshots/` 與 `maatools.config.mts`，但目前**沒有任何 script 或 CI 會執行這些案例**（`pnpm check:maa` 只做靜態診斷），所以它不會替你擋下辨識退化。現況與重新啟用順序見 [開發與驗證](./development.md#離線辨識案例的目前狀態)。新截圖被 `.gitignore` 第 15 行擋住時，需要 `git add -f`。

## Custom Action 沒啟動或沒有日誌

```powershell
python --version
python -m pip show maafw
pnpm check:py
```

確認 Python 至少 3.12、`maafw` 是 5.12.3、`interface.json` 的 Agent 路徑正確，並核對 Pipeline 的 `custom_action` 與 `@AgentServer.custom_action(...)` 名稱。直接 `print` 只會進子行程 stdout；需要在 MXU 顯示的訊息要走 MaaFramework 通知。

## `pnpm check` 失敗

依失敗階段處理：

- `format:check`：執行 `pnpm exec prettier <affected-files> --write`，再檢查差異。
- `check:schema`：查看錯誤中的檔案與 JSON path；空檔、重複 task／preset、未知 option 參照都會失敗。
- `check:maa`：`maa-tools check` 的靜態診斷，通常是 Pipeline 結構錯誤或資源遺失；它不會執行截圖案例。
- Python 不在 `pnpm check` 內：Agent 變更要另外跑 `pnpm check:py`。

不要刪除不理解的檔案、放寬 schema 或移除測試案例來換取綠燈。

## MXU 或 release 建置失敗

- `dist/package-mxu` 檔案被鎖：完全退出 MXU／`maa-sword-staff.exe` 後重試。
- 缺少 custom runtime marker：先針對同一平台執行 `pnpm build:mxu`。
- 上游 commit 不符：不要繞過檢查；確認固定 tag 是否被移動或 builder 常數是否經審查更新。
- Windows linker／SDK 缺少：安裝 Visual Studio C++ Build Tools 與 Rust MSVC target，或交由 GitHub Actions 建置。
- Linux Tauri 相依缺少：比照 release workflow 安裝 WebKitGTK、appindicator、rsvg 與 patchelf。

## 新版沒有出現自動更新

依序核對：

1. 目前執行的是帶 `mxu-github-only.json` 的客製 MXU。
2. `interface.json#github` 指向正確 repository，`version` 是正式可比較 SemVer。
3. GitHub Release 已發布，tag 高於目前版本。
4. 對應 OS／架構的 `*-MXU` asset 名稱未被改動。
5. Release 不是 draft；prerelease 與目前更新 channel 符合預期。
6. 網路、GitHub API rate limit、proxy 與寫入／重啟權限正常。

更新 UI 出現不代表安裝成功；仍要驗證下載、解壓、替換、重啟與新版本顯示。

## 實機測試前的安全停點

下列操作如果未取得本次測試的明確允許，先停止並詢問：花費晨星／金幣／晶石／公會幣、刷新商店、購買次數、抽取、捐贈、租借、分解、合成、使用道具或料理、玩家邀請／配對。每次測試都重新確認裝置與帳號，不沿用舊的 emulator ID 或歷史授權。
