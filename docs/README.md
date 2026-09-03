# MaaSwordStaff 知識庫

本目錄是專案的維護與接手入口。文件以目前 checkout 的設定與程式為準；有日期的實機紀錄只代表當時的裝置、帳號與遊戲版本，不是永久保證。

## 從這裡開始

| 需求                                  | 文件                                           |
| ------------------------------------- | ---------------------------------------------- |
| 了解程式如何串起來                    | [專案架構](./architecture.md)                  |
| 查看 23 個公開任務、preset 與目前狀態 | [任務參考](./task-reference.md)                |
| 修改 Pipeline、選項、Agent 或辨識素材 | [開發與驗證](./development.md)                 |
| 建置發行包與維護自動更新              | [發布流程](./release.md)                       |
| 排查 ADB、假成功、辨識與建置問題      | [疑難排解](./troubleshooting.md)               |
| 查閱遊戲畫面、座標與實機觀察          | [獎勵與任務實機紀錄](./reward-task-catalog.md) |
| 將專案交給另一個 AI 繼續              | [AI 接手提示詞](./AI_HANDOFF_PROMPT.md)        |

使用者只想安裝或快速認識專案時，先看根目錄的 [README](../README.md)。第三方 MXU 修補與授權資訊在 [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md)。

## 目前基準

- 專案版本：`v1.0.5`，由 `interface.json` 宣告。
- 介面：客製 MXU `v2.4.5-github-only.1`；沒有 MirrorChyan RID 時直接使用 GitHub Releases 更新。
- 控制器：Android ADB，基準短邊 720；已知實機基準為 BlueStacks 5、直式 720×1280、DPI 160。
- 遊戲套件：`com.m88.idleXX`（台灣版）。
- 公開任務：23 個；preset：3 個。
- Python Agent：`maafw==5.12.3`，提供 5 個 Custom Action。
- 離線辨識案例：`maatools.config.mts` 搭配 `tests/screenshots/` 的已遮蔽截圖，**但目前沒有任何 script 或 CI 會執行它**，內容也已落後於 Pipeline。詳見 [開發與驗證](./development.md#離線辨識案例的目前狀態)。

## 事實來源優先順序

文件與程式不一致時，依下列順序判定：

1. `interface.json` 的 controller、resource、agent、group 與 import。
2. 被 import 的 `tasks/*.json` 與 `tasks/preset/*.json`。
3. `resource/base/pipeline/*.json` 的實際辨識、動作、分支與停止條件。
4. `agent/main.py` 的 Custom Action 行為。
5. `maatools.config.mts`、`tools/*.mjs` 與 `.github/workflows/release.yml` 的檢查／發布流程。
6. 本知識庫的說明與有日期的實機紀錄。

`tasks/startup.json` 與 `resource/base/pipeline/startup.json` 雖然存在，但前者沒有被 `interface.json` import，因此不是目前公開任務，也不會由 preset 自動啟動。

## 文件維護規則

- 新增、移除或改名公開任務時，同步更新 [任務參考](./task-reference.md) 與受影響的 preset 說明。
- 修改資料流、Agent 或目錄責任時，同步更新 [專案架構](./architecture.md)。
- 修改 Node、Python、MXU、MaaFramework、版本或 release asset 規則時，同步更新 [開發與驗證](./development.md) 與 [發布流程](./release.md)。
- 實機測試只把「畫面可證明的結果」寫入 [實機紀錄](./reward-task-catalog.md)，並附日期、裝置、解析度、允許的帳號操作與未覆蓋狀態。
- 不把 `tasks-completed`、`DirectHit`、focus 日誌或 controller connected 單獨當成遊戲成功證據。
- 原始截圖可能含玩家名稱與聊天內容；提交前必須遮蔽個資。
