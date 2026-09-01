# Maa杖劍傳說助手

以 [MaaFramework](https://github.com/MaaXYZ/MaaFramework) 與 Android ADB 控制《杖劍傳說：坎斯汀之約》台灣版的自動化專案。

主要介面採用 [MXU (MaaFramework Extension UI)](https://github.com/MistEO/MXU)，提供多分頁、任務新增／刪除／排序、多開裝置連結與預設組合一鍵套用功能。

> [!WARNING]
> 目前連線僅在開發者本機的 BlueStacks 5 上測試，尚未確認是否支援其他模擬器；使用前必須在模擬器中開啟 ADB。
>
> 遊戲更新、畫面縮放、語言或帳號進度差異都可能影響辨識結果；部分流程尚未涵蓋所有帳號狀態，首次使用請逐項測試並留意執行日誌。

## Agent

部分任務（幻獸結緣、女神像祈願、時光扭蛋機的次數計算）需要 pipeline 無法表達的算術，改由 `agent/main.py` 這個 Python 子行程提供 Custom Action，MXU 會依 `interface.json` 的 `agent` 設定自行啟動它。發行套件會內嵌 Python runtime，相依套件列在 `requirements.txt`。

## 開發環境與模擬器設定

- Windows 及 BlueStacks 5
- **BlueStacks 5 自動連線與 ADB 設定指南**：
    1. 請開啟 BlueStacks 5 ->「設定 (Settings)」->「進階 (Advanced)」。
    2. 勾選啟用「**Android 偵測橋樑 (ADB)**」（常見預設埠號為 `127.0.0.1:5555`，實際依偵測結果為準）。
    3. 若 MXU 自動搜尋不到 BS5，請在 PowerShell 執行一次 `./setup-bluestacks-adb.ps1`。腳本會將 BS5 隨附的 `HD-Adb.exe` 建立為目前使用者專用的 `adb.exe` 相容入口，並加入使用者 PATH；不需要系統管理員權限。
    4. 完整退出並重新開啟 MXU，接著在「連接設定」按重新整理並選擇偵測到的裝置（例如 `emulator-5554`）。請勿固定填寫 `127.0.0.1:5555`，實際位址以偵測結果為準。

移除相容入口時執行 `./setup-bluestacks-adb.ps1 -Remove`。

- 模擬器解析度：直式 720 × 1280
- 模擬器 DPI：160
- 遊戲套件：`com.m88.idleXX`
- Node.js 24 與 pnpm 11

## 預設任務組合 (Presets)

專案內建三種常用預設組合，可於 MXU 介面一鍵載入套用：

- **快速日常** (`QuickDaily`)：啟動遊戲並領取免費掛機與收益獎勵。
- **完整日常** (`DailyFull`)：包含家園六項設施流程（幻獸結緣、女神像祈願、時光扭蛋機、商店購物、道具一鍵使用、煉金爐分解與寶石合成）、公會、筆記、地圖與領取所有獎勵。家園以外的項目多數仍為待驗證骨架。
- **只領獎勵** (`ClaimOnly`)：僅執行家園床與推車等免費掛機收益領取。

## Agent

部分任務（幻獸結緣、女神像祈願、時光扭蛋機的次數計算）需要 pipeline 無法表達的算術，改由 `agent/main.py` 這個 Python 子行程提供 Custom Action，MXU 會依 `interface.json` 的 `agent` 設定自行啟動它。發行套件會內嵌 Python runtime，相依套件列在 `requirements.txt`。

## 開發

專案入口為 `interface.json`，任務定義位於 `tasks/`，Pipeline 與辨識資源位於 `resource/base/`。

安裝依賴並同步執行階段與檢查：

```bash
pnpm install
pnpm sync:runtime
pnpm build:mxu
pnpm check
```

## 發布

本專案使用固定在 MXU `v2.4.5` 的客製修補版，在沒有 MirrorChyan RID 時直接以 GitHub Releases 檢查、下載及安裝更新。修補檔與重現建置方式記錄於 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。

推送 `v1.0.0` 形式的 tag 後，GitHub Actions 會執行檢查、編譯客製 MXU，並建立各平台發行包。GitHub Release 必須保留 Actions 產生的 `*-MXU` 資產，後續版本才能由介面自動選取正確的作業系統與架構。

English documentation: [README.en.md](./README.en.md)
