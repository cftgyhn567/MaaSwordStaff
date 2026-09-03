# MaaSwordStaff 專案接手提示詞

以下內容可整段交給另一個 AI。它是接手工作的查證清單，不是「所有任務都已完成」的聲明。

---

你正在接手 Windows 專案 `C:\Web\MAA\MaaSwordStaff`。這是以 MaaFramework、客製 MXU 與 Android ADB 自動操作台灣版《杖劍傳說：坎斯汀之約》的專案。請使用繁體中文，先讀目前檔案與裝置狀態，再修改或宣稱完成。

## 先讀文件

1. `docs/README.md`：知識庫入口與事實來源順序。
2. `docs/architecture.md`：interface、task、Pipeline、Agent、controller 與發行邊界。
3. `docs/task-reference.md`：23 個公開任務、3 個 preset、已知缺口與有日期的實機證據。
4. `docs/development.md`：修改與驗證規則。
5. `docs/troubleshooting.md`：ADB、假成功、辨識、Agent 與建置排錯。
6. `docs/reward-task-catalog.md`：畫面座標、遊戲規則與歷史實機觀察；日期證據可能隨遊戲更新失效。
7. `docs/release.md`：客製 MXU、GitHub Releases 更新與跨平台發行。

## 目前程式基準

- `interface.json` 是唯一入口，版本目前為 `v1.0.6`。
- 公開任務 23 個，分成 Home 7、Guild 5、Note 7、Map 2、Other 2；preset 3 個。
- `tasks/startup.json` 存在但沒有被 `interface.json` import，因此不是公開任務，preset 也不會靠它自動啟動遊戲。
- Pipeline 位於 `resource/base/pipeline/`；圖片與 OCR 模型位於 `resource/base/image/`、`resource/base/model/ocr/`。
- `agent/main.py` 以 `maafw==5.12.3` 提供 `PullByCount`、`RenewFurnace`、`BuyLimitedCount`、`FillPartyWithPartners`、`BondScenicReport` 五個 Custom Action。
- 目前只啟用 MXU 發行；客製版固定上游 MXU v2.4.5，沒有 MirrorChyan RID 時直接使用 GitHub Releases 更新。
- 實機基準曾是 BlueStacks 5、直式 720×1280、DPI 160、套件 `com.m88.idleXX`。裝置序號與測試帳號每次都要重查，禁止沿用歷史 `emulator-5554`／`emulator-5564` 假設。

## 必須先查證的事

1. 執行 `git status --short --branch`，保存使用者既有修改；不要依本文件記憶 HEAD 或 worktree。
2. 從 `interface.json#import` 確認要改的 task 檔真的已載入。
3. 從 task 的 `entry` 與 `pipeline_override` 追到實際 Pipeline。
4. 若有 `action: "Custom"`，一併檢查 Agent decorator 與參數。
5. 實機測試前核對 BlueStacks 視窗、`adb devices -l`、遊戲套件與目前畫面。
6. 先做唯讀截圖／辨識；會花資源或改變帳號狀態的動作要取得本次明確授權。

## 已知重要缺口

- `ClaimAllRewards` 已於 2026-09-03 串接完整（`HomeRewards.Done → Rewards.FunctionList.Start`），但床／推車之後的好友、餽贈、任務、商城與活動段落還沒有端到端實機證據。
- `QuickDaily` 與 `ClaimOnly` 都只有 `ClaimAllRewards`，目前行為相同，也不會啟動遊戲。
- `ExploreFate`、`ConsumeStamina` 仍是安全骨架；免費條件、消耗方式與停止規則未完成。
- `Commissions` 有 Pipeline，但額外次數與目前帳號狀態需重新做端到端驗證。
- `PhantomRealm` 的流程曾實機走完失敗／重傷／離場，但測試帳號沒有擊破第 3 波；不能宣稱目標已達成。
- 日常副本領獎次數購買、競技券購買、素材秘境購買等花晨星分支仍缺完整實機證據。
- `maatools.config.mts` 的離線截圖案例沒有被任何 script 或 CI 執行，且 105 個節點引用中有 33 個已不存在。不要把「檢查通過」誤認為辨識有回歸保障。

## 實作原則

1. `recognition` 判斷畫面，`action` 執行動作；`focus` 只記錄訊息。
2. `DirectHit` 幾乎一定成功，不能用它證明到達畫面，也不能讓它短路應等待的 `next`。
3. `next` 候選全部辨識失敗會讓父節點失敗；合理的 no-op 狀態要有明確 Done／Skip 或 `on_error` 安全復原。
4. 切頁或點設施後先辨識新頁，再做下一步；不要用連續固定座標假設畫面一定同步。
5. ROI／target 為 `[x,y,width,height]`，基準 720×1280。Click 會在矩形內取點，框太大可能點空。
6. 新模板使用無損截圖，threshold 同時測正／負樣本；原始圖的玩家名稱與聊天內容提交前必須遮蔽。
7. Custom Action 每輪動作後要重讀可觀察狀態，沒有進展時安全停止。
8. `pipeline_override` 是暫時 overlay，不是資料夾或資料庫；不要把 OCR 結果誤認為已持久化設定。

## 帳號安全邊界

購買、刷新、祈願、扭蛋、結緣、捐贈、租借／續租、道具使用、分解、合成、料理治療、玩家邀請或配對都需要明確授權、上限與停止條件。授權不跨裝置、帳號或日期自動延續。

目前 `FillPartyWithPartners` 使用「夥伴」分頁補 AI 夥伴。若修改為玩家分頁、配對或邀請真人，必須先詢問使用者。

## 驗證與證據

依修改範圍執行：

```powershell
pnpm format:check
pnpm check:schema
pnpm check:maa
pnpm check:py
pnpm audit:pipeline
pnpm release:dry-run
git diff --check
```

`pnpm check` 只包含 format、schema、maa-tools，不包含 Python、pipeline audit 或 release dry-run。

下列都不能單獨證明遊戲任務成功：controller connected、截圖成功、recognition 命中、`DirectHit`、focus 日誌、`tasks-completed`。實機成功要看到進場後新畫面、計數／資源變化、按鈕狀態或結果畫面，並記錄未覆蓋分支。

## Git 與發布

- 沒有明確要求就不要 commit；「commit 上去」視為本機 commit，不代表 push。
- Commit 的標題前面必須加上日期，例如 `2026.09.01 fix(build): ...`。
- 只 stage 本次已審查檔案；先查看完整 status 與 diff，保留使用者無關修改。
- 正式版本需同步 `interface.json`、`package.json`、`maa-project.json`、`pyproject.toml` 與 `vX.Y.Z` tag。
- 發布前跑完整檢查；`pnpm release:dry-run` 不是可執行包證據。
- 正式 build 需先 `pnpm sync:runtime`、`pnpm build:mxu`，再以相同 tag 執行 `tools/build-release.mjs`。
- 發行包不可帶入本機 `config`、`cache`、`debug`、帳號資料或未遮蔽截圖。
- GitHub Release 必須保留命名正確的六平台 `*-MXU` 資產；端到端更新還要驗證下載、安裝、重啟與新版本顯示。

完成後請回報：修改檔案、實際檢查結果、實機證據、仍未驗證的狀態、是否 commit／push。不要用「應該可以」取代證據。
