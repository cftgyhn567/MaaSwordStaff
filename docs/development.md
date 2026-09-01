# 開發與驗證

## 開發環境

- Node.js 24 或更新版本。
- pnpm 11.5.1（`package.json#packageManager`）。
- Python 3.12 或更新版本；Agent 固定 `maafw==5.12.3`。
- 要在本機建置客製 MXU 時，另需 Git、Rust toolchain、對應 Tauri 系統相依與平台 linker。
- 實機基準：BlueStacks 5、直式 720×1280、DPI 160、ADB 已開啟。

首次安裝：

```powershell
pnpm install --frozen-lockfile
python -m pip install -r requirements.txt
```

`pnpm sync:runtime` 與 `pnpm build:mxu` 是發行準備，不是每次編輯 JSON 都要執行。它們會下載／編譯大型相依，詳細時機見 [發布流程](./release.md)。

## 修改前的定位順序

1. 在 `interface.json` 確認檔案是否真的被 import。
2. 在對應 `tasks/*.json` 找 task 的 `entry`、選項與 `pipeline_override`。
3. 在 `resource/base/pipeline/` 找 entry root 與所有後續節點。
4. 若有 `action: "Custom"`，一併追到 `agent/main.py`。
5. 查 `maatools.config.mts` 是否已有對應離線截圖案例。
6. 最後才修改文件中的狀態或宣稱已完成。

## 常用檢查

```powershell
pnpm format:check
pnpm check:schema
pnpm check:maa
pnpm check:py
pnpm audit:pipeline
pnpm release:dry-run
```

`pnpm check` 依序包含格式、專案 schema 與 maa-tools 檢查，但**不包含** `check:py`、`audit:pipeline` 或 `release:dry-run`。依修改範圍選擇：

| 修改                     | 最低檢查                                                   |
| ------------------------ | ---------------------------------------------------------- |
| 只改 Markdown            | `pnpm exec prettier <files> --check`、`git diff --check`   |
| Task／interface JSON     | `pnpm format:check`、`pnpm check:schema`、`pnpm check:maa` |
| Pipeline／模板／測試案例 | `pnpm check`、`pnpm audit:pipeline`                        |
| Python Agent             | `pnpm check:py`，再做對應實機 Custom Action 測試           |
| 發布與版本               | `pnpm check`、`pnpm check:py`、`pnpm release:dry-run`      |
| JavaScript／MJS 工具     | 上述相關檢查，加 `node --check <file>`                     |

`pnpm check:maa` 使用固定截圖做辨識回歸；它不能證明 controller、截圖、點擊、等待或完整遊戲流程可用。

## Pipeline 撰寫規則

### Recognition 與 action 要分開理解

- `recognition` 回答「目前畫面符合什麼」。
- `action` 回答「命中後要做什麼」。
- `focus` 只顯示日誌／通知，不會替節點點擊、返回或驗證。
- `DirectHit` 幾乎一定成功，只適合確定不需看畫面的路由或收尾，不能作為到達畫面的證據。

### `next` 與等待

節點完成後，MaaFramework 依序嘗試 `next` 的候選；全部辨識失敗時，父節點也會失敗。合理的「沒有東西可做」狀態要有安全收尾候選。

等待新畫面時，不要把 `DirectHit` fallback 放進同一個 `next`，否則它會立即短路等待。應讓 `next` 只包含真正結果，逾時後再用 `on_error` 進安全復原或結束。

`pnpm audit:pipeline` 會檢查缺少的 `next`／`on_error` 參照，並列出只有一個非 DirectHit 候選的高風險節點。警告需要人工判斷，不代表一律是錯。

### 座標與辨識素材

- ROI 與 target 格式為 `[x, y, width, height]`，基準畫面是 720×1280。
- `Click` target 會在矩形內取點；矩形過大可能點到按鈕外。
- 優先用穩定文字、圖示與狀態模板定位，避免用背景、角色位置或長串固定座標猜畫面。
- 模板應從無損原圖裁切；加入測試前遮蔽玩家名稱與聊天內容。
- 調整 threshold 時要同時用正樣本與容易誤判的負樣本驗證。

### 有副作用的操作

購買、刷新、捐贈、租借、續租、抽取、分解、合成、道具使用、料理治療與組隊都會改變帳號狀態或消耗資源。實機測試前先確認：

- 正確的 BlueStacks 視窗與 `adb devices -l` 裝置。
- 正確遊戲套件與目前畫面。
- 使用者允許的操作、資源上限與停止條件。
- 未辨識狀態時能安全停止，而不是用 DirectHit 假成功。

目前 `FillPartyWithPartners` 只使用遊戲內「夥伴」分頁補 AI 夥伴；若未來改成玩家分頁或配對，必須重新取得邀請／配對授權。

## Custom Action 開發

Pipeline 用以下形式呼叫 Agent：

```json
{
    "action": "Custom",
    "custom_action": "PullByCount",
    "custom_action_param": {}
}
```

維護注意事項：

- decorator 名稱必須與 Pipeline 的 `custom_action` 完全相同。
- `custom_action_param` 要能在選項覆寫後仍保持完整；不要假設巢狀物件一定依期待合併。
- Agent 端點擊要透過 Context 的 action proxy；controller 實體在主程式端。
- 需要出現在 MXU 的訊息應走 MaaFramework 通知路徑，`print` 只保證出現在子行程 stdout。
- 每輪動作後重新讀取可觀察狀態；連續沒有進展時安全停止。

## 新增公開任務的最小清單

1. 在適當的 `tasks/*.json` 加 task、entry、group 與安全預設選項。
2. 在 `resource/base/pipeline/` 加唯一 root 與完整流程。
3. 確認 Pipeline 檔會由 resource 載入，task 檔會由 `interface.json` import。
4. 若加入 preset，確認排序、選項覆寫與消耗型預設都是保守值。
5. 為穩定辨識加入已遮蔽截圖與 `maatools.config.mts` cases。
6. 跑 schema、maa-tools、pipeline audit 與 Python 檢查。
7. 取得授權後做實機驗證，保存畫面證據與失敗狀態。
8. 更新 [任務參考](./task-reference.md)；實機觀察寫入 [實機紀錄](./reward-task-catalog.md)。
