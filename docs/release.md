# 發布流程

本專案目前只發布 MXU 套件。GitHub Actions 為 Windows、Linux、macOS 的 x86_64／aarch64 建置 6 種平台資產；Windows 使用 ZIP，Linux 與 macOS 使用 `tar.gz`。

## 版本來源

正式發布前，以下版本應一致：

| 檔案                               | 格式範例 |
| ---------------------------------- | -------- |
| `interface.json#version`           | `v1.0.1` |
| `package.json#version`             | `1.0.1`  |
| `maa-project.json#project.version` | `1.0.1`  |
| `pyproject.toml#project.version`   | `1.0.1`  |
| Git tag                            | `v1.0.1` |

`tools/build-release.mjs` 會驗證 interface 版本與正式建置 tag 的 SemVer 格式。自動更新應使用 `v1.0.0` 以上的正式或受支援 prerelease 版本；不要把低於 1.0.0 的 debug 版本當成可更新正式版。

## GitHub-only MXU

上游 MXU `v2.4.5` 的目前更新入口原本依賴 MirrorChyan。本專案：

1. 固定上游 commit `115fcb39d75718f8bd53e76511322660b8af00ec`。
2. 由 `tools/build-custom-mxu.mjs` 套用 `patches/mxu/github-only-v2.4.5.patch`。
3. 在沒有 `mirrorchyan_rid`、但 `interface.json` 有 `github` 時，直接查 GitHub Releases。
4. 依目前 OS／架構選擇名稱相符的 `*-MXU` 資產，下載、安裝並重啟。
5. 在 runtime 放入 `mxu-github-only.json`；正式打包會驗證該 marker 的上游 commit。

修補版版本為 `2.4.5-github-only.2`。來源、patch、AGPL-3.0 與打包授權檔說明見 [THIRD_PARTY_NOTICES](../THIRD_PARTY_NOTICES.md)。

## 發布前檢查

```powershell
pnpm install --frozen-lockfile
pnpm audit --audit-level high
pnpm check
pnpm check:py
pnpm audit:pipeline
pnpm release:dry-run
git diff --check
```

`release:dry-run` 只檢查版本、路徑與預期 asset 名稱，不會建立完整可執行套件，也不是實機驗證。

## 本機建置

先完全關閉已從 `dist/package-mxu` 執行的 MXU，避免輸出檔被鎖定：

```powershell
$env:CREATE_MAA_PROJECT_RUNTIME_PLATFORM = 'win-x64'
$env:GITHUB_REF_NAME = 'v1.0.1'
pnpm sync:runtime
pnpm build:mxu
node .\tools\build-release.mjs
```

預期至少產生 `dist/package-mxu/` 與平台 MXU executable。`build:mxu` 會 clone 上游、安裝前端相依、執行 Moderate 以上風險 audit、編譯 Tauri/Rust，時間與磁碟需求都明顯高於一般檢查。

如果本機缺少 Visual C++ linker、Rust target 或 Tauri 系統相依，可讓 GitHub Actions 做正式跨平台建置；不能把只有 `release:dry-run` 的結果稱為成功建置。

## GitHub Actions 發布

推送 `v*` tag 後，`.github/workflows/release.yml` 會：

1. 先以單一工作執行專案相依與客製 MXU 相依安全稽核，通過後才啟動跨平台建置。
2. 安裝 Node 24、pnpm、Python 3.13、uv 與 Rust。
3. 執行 `pnpm check` 與 `pnpm check:py`。
4. 同步指定平台 Maa runtime。
5. 原生編譯已通過相依稽核的客製 MXU。
6. 組裝發行目錄，檢查 entrypoint、Agent 與內嵌 Python。
7. 建立平台 archive，保留 Unix executable metadata。
8. 建立 GitHub Release；帶 `-` 的版本標為 prerelease。

資產名稱格式：

```text
Maa杖劍傳說助手-<win|linux|macos>-<x86_64|aarch64>-vX.Y.Z-MXU.<zip|tar.gz>
```

不要重新命名、刪除或只上傳部分 `*-MXU` 資產；自動更新靠這個命名選擇平台。

## 發布後驗證

- GitHub Release tag、`interface.json` 版本與 archive 名稱一致。
- 六個平台／架構資產都存在，失敗的 matrix job 沒被忽略。
- ZIP／tar 可解開，必要檔案位於預期根層級。
- 套件含 MXU 授權、`interface.json`、`tasks`、`resource`、Agent 與所需 Python runtime。
- 套件不含本機 `config`、`cache`、`debug`、帳號資料或未遮蔽截圖。
- 用舊正式版本實際檢查更新、下載、安裝、重啟與新版本顯示。

最後一項才是自動更新端到端證據。Release 存在或 build 成功本身不足以證明更新流程可用。
