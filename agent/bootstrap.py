"""Agent 啟動點。

發行套件的建置流程（`tools/build-release.mjs`）預期 `agent/bootstrap.py` 存在，
並在部分 GUI 下以它作為子行程進入點；MXU 則直接執行 `agent/main.py`。
兩條路徑共用同一份實作，這裡只負責把工作交給 `main`。

用法::

    python -u ./agent/bootstrap.py <socket_id>
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from main import main  # noqa: E402  - 需先設定 sys.path 才能匯入

if __name__ == "__main__":
    raise SystemExit(main())
