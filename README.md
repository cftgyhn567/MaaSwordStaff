# Maa杖劍傳說助手

以 [MaaFramework](https://github.com/MaaXYZ/MaaFramework) 與 Android ADB 控制《杖劍傳說：坎斯汀之約》台灣版的自動化專案。

主要介面採用 [MXU (MaaFramework Extension UI)](https://github.com/MistEO/MXU)，提供多分頁、任務新增／刪除／排序、多開裝置連結與預設組合一鍵套用功能。

> [!WARNING]
> 目前連線僅在開發者本機的 BlueStacks 5 上測試，尚未確認是否支援其他模擬器；使用前必須在模擬器中開啟 ADB。
>
> 任務目前僅完成介面與定義建立，實際執行流程與辨識條件全部尚未生效，不可視為可用的自動化功能。

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
- **完整日常** (`DailyFull`)：包含啟動遊戲、領取收益獎勵與家園商店購物巡檢。
- **只領獎勵** (`ClaimOnly`)：僅執行家園床與推車等免費掛機收益領取。

## 開發

專案入口為 `interface.json`，任務定義位於 `tasks/`，Pipeline 與辨識資源位於 `resource/base/`。

安裝依賴並同步執行階段與檢查：

```bash
pnpm install
pnpm sync:runtime
pnpm check
```

## 發布

推送 `v0.1.0` 形式的 tag 後，GitHub Actions 會執行檢查並建立 MXU 發行包。

English documentation: [README.en.md](./README.en.md)
