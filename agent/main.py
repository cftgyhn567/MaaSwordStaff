"""MaaSwordStaff Agent

MaaFramework 的 pipeline（JSON）沒有變數與算術能力，因此「輸入總次數 → 自動拆成
100/10/1 抽」「扣除今日已抽過的次數」這類需要計算的行為無法用 pipeline 表達。

本 Agent 以子行程形式被 MXU 啟動，透過 socket 提供 Custom Action，
讓 pipeline 可以用 `"action": "Custom", "custom_action": "PullByCount"` 呼叫。

啟動方式（由 interface.json 的 agent 設定驅動）::

    python -u ./agent/main.py <socket_id>
"""

from __future__ import annotations

import json
import re
import sys
import time
from dataclasses import dataclass
from typing import Any, Optional

from maa.agent.agent_server import AgentServer
from maa.context import Context
from maa.custom_action import CustomAction
from maa.pipeline import JOCR, JActionType, JClick, JRecognitionType

# ---------------------------------------------------------------------------
# 抽取設施的預設參數
#
# 三個設施的畫面結構相同：一個「今日已 XX N/10000 次」計數器，加上一排
# 「XX 1 次 / 10 次 / 100 次」按鈕。按鈕數量會隨貨幣餘額變動（例如代幣不足
# 1000 時「扭蛋 100 次」會消失），位置也跟著位移，所以一律用整列寬度的 ROI
# 搭配精確文字辨識，而不是固定座標。
#
# 「結緣1次」不會誤配「結緣10次」或「結緣100次」，反之亦然，故可安全共用 ROI。
# ---------------------------------------------------------------------------

BUTTON_ROW_ROI = [0, 1035, 720, 115]

PROFILES: dict[str, dict[str, Any]] = {
    "sakura": {
        "label": "幻獸結緣",
        "verb": "結緣",
        # 主畫面與結果畫面的計數器位置不同，逐一嘗試。
        "counters": [
            {"roi": [120, 945, 480, 60], "pattern": r"今日已結緣\s*(\d+)"},
            {"roi": [0, 20, 470, 70], "pattern": r"今日已結緣\s*(\d+)"},
        ],
        "buttons": [
            {"n": 100, "expected": "結緣100次", "settle_ms": 9000},
            {"n": 10, "expected": "結緣10次", "settle_ms": 6000},
            {"n": 1, "expected": "結緣1次", "settle_ms": 4800},
        ],
    },
    "prayer": {
        "label": "女神像祈願",
        "verb": "祈願",
        "counters": [
            {"roi": [0, 20, 470, 70], "pattern": r"今日已祈願\s*(\d+)"},
            {"roi": [100, 775, 520, 115], "pattern": r"今日已祈願\s*(\d+)"},
        ],
        "buttons": [
            {"n": 100, "expected": "祈願100次", "settle_ms": 9000},
            {"n": 10, "expected": "祈願10次", "settle_ms": 6000},
            {"n": 1, "expected": "祈願1次", "settle_ms": 4800},
        ],
        # 祈願主畫面按鈕在 y≈979，結果畫面在 y≈1103，ROI 需同時涵蓋。
        "button_roi": [0, 935, 720, 215],
    },
    "gacha": {
        "label": "時光扭蛋機",
        "verb": "扭蛋",
        # 主畫面寫「今日已扭蛋」，結果畫面頂端寫「今日已開啟」，同一個計數。
        "counters": [
            {"roi": [0, 20, 470, 70], "pattern": r"今日已開啟\s*(\d+)"},
            {"roi": [120, 735, 480, 60], "pattern": r"今日已扭蛋\s*(\d+)"},
        ],
        "buttons": [
            {"n": 100, "expected": "扭蛋100次", "settle_ms": 9000},
            {"n": 10, "expected": "扭蛋10次", "settle_ms": 6000},
            {"n": 1, "expected": "扭蛋1次", "settle_ms": 4800},
        ],
    },
}

# 單次任務最多點幾下抽取按鈕，避免任何情況下的無限迴圈。
DEFAULT_MAX_CLICKS = 60


@dataclass
class _Counter:
    value: Optional[int]
    source: str


def _log(context: Context, text: str) -> None:
    """把訊息送進 MaaFramework 的通知管道，讓 MXU 的日誌看得到。"""
    print(text, flush=True)
    try:
        context.run_task(
            "Agent.Log",
            {
                "Agent.Log": {
                    "focus": {
                        "Node.Recognition.Succeeded": {
                            "content": text,
                            "display": "log",
                        }
                    }
                }
            },
        )
    except Exception:  # noqa: BLE001 - 記錄失敗不應影響主流程
        pass


def _screencap(context: Context):
    return context.tasker.controller.post_screencap().wait().get()


def _ocr_all(context: Context, image, roi: list[int], expected: str = "") -> list:
    param = JOCR(expected=[expected] if expected else [], roi=list(roi), threshold=0.3)
    detail = context.run_recognition_direct(JRecognitionType.OCR, param, image)
    if detail is None:
        return []
    return detail.filtered_results or detail.all_results or []


def _read_counter(context: Context, image, counters: list[dict[str, Any]]) -> _Counter:
    """依序嘗試各個計數器位置，回傳第一個讀得到的數字。"""
    for spec in counters:
        for result in _ocr_all(context, image, spec["roi"]):
            text = getattr(result, "text", "") or ""
            match = re.search(spec["pattern"], text.replace(" ", ""))
            if match:
                return _Counter(int(match.group(1)), text)
    return _Counter(None, "")


def _as_rect(box) -> Optional[list[int]]:
    """辨識結果的 box 依版本可能是 Rect 物件或 [x, y, w, h] 陣列，統一成陣列。"""
    if box is None:
        return None
    if isinstance(box, (list, tuple)):
        if len(box) < 4:
            return None
        return [int(box[0]), int(box[1]), int(box[2]), int(box[3])]
    return [int(box.x), int(box.y), int(box.w), int(box.h)]


def _find_button(context: Context, image, roi: list[int], expected: str) -> Optional[list[int]]:
    """在按鈕列找出指定文字的按鈕，回傳其辨識框。"""
    for result in _ocr_all(context, image, roi, expected):
        rect = _as_rect(getattr(result, "box", None))
        if rect:
            return rect
    return None


def _click(context: Context, rect: list[int]) -> None:
    """透過 Context 執行點擊。

    Agent 子行程不可直接呼叫 controller.post_click（控制器在主程式端），
    必須用 Context 的 run_action_direct 代理過去。
    """
    context.run_action_direct(JActionType.Click, JClick(target=list(rect)), box=tuple(rect))


@AgentServer.custom_action("PullByCount")
class PullByCount(CustomAction):
    """依設定次數執行抽取，自動選用 100 / 10 / 1 抽按鈕。

    custom_action_param::

        {
            "profile": "sakura" | "prayer" | "gacha",
            "total": 10,               # 次數
            "deduct_done": true,       # true = total 視為「今日累計目標」，扣除已抽過的次數
            "max_clicks": 60           # 選填，安全上限
        }

    也可覆寫 profile 內的 counters / buttons / button_roi 以便日後調整 ROI。
    """

    def run(self, context: Context, argv: CustomAction.RunArg):
        try:
            cfg = json.loads(argv.custom_action_param or "{}")
        except json.JSONDecodeError:
            _log(context, "【Agent】custom_action_param 不是合法 JSON，安全停止。")
            return False

        profile_name = cfg.get("profile", "")
        profile = dict(PROFILES.get(profile_name, {}))
        if not profile:
            _log(context, f"【Agent】未知的 profile「{profile_name}」，安全停止。")
            return False
        profile.update({k: v for k, v in cfg.items() if k in ("counters", "buttons", "button_roi")})

        label = profile["label"]
        verb = profile["verb"]
        counters = profile["counters"]
        buttons = sorted(profile["buttons"], key=lambda b: -b["n"])
        button_roi = profile.get("button_roi", BUTTON_ROW_ROI)
        max_clicks = int(cfg.get("max_clicks", DEFAULT_MAX_CLICKS))

        try:
            total = int(cfg.get("total", 0))
        except (TypeError, ValueError):
            total = 0
        deduct = bool(cfg.get("deduct_done", False))

        if total <= 0:
            _log(context, f"【{label}】設定次數為 0，不執行{verb}。")
            return True

        image = _screencap(context)
        start = _read_counter(context, image, counters)
        if start.value is None:
            _log(
                context,
                f"【{label}】讀不到「今日已{verb}」計數，無法確認進度，安全停止，未執行{verb}。",
            )
            return False

        if deduct:
            target = total
            _log(
                context,
                f"【{label}】目標為今日累計 {total} 次；今日已{verb} {start.value} 次，"
                f"本次需再{verb} {max(0, total - start.value)} 次。",
            )
        else:
            target = start.value + total
            _log(
                context,
                f"【{label}】本次要{verb} {total} 次（不扣除已{verb}的 {start.value} 次），"
                f"完成後累計應為 {target} 次。",
            )

        clicks = 0
        stalls = 0
        current = start.value

        while current < target and clicks < max_clicks:
            remaining = target - current
            image = _screencap(context)

            chosen = None
            for button in buttons:
                if button["n"] > remaining:
                    continue
                rect = _find_button(context, image, button_roi, button["expected"])
                if rect:
                    chosen = (button, rect)
                    break

            if chosen is None:
                _log(
                    context,
                    f"【{label}】還需{verb} {remaining} 次，但畫面上找不到不會超抽的按鈕"
                    f"（可能是次數不足以使用 10/100 抽，或按鈕因資源不足而隱藏），安全停止。",
                )
                break

            button, rect = chosen
            _click(context, rect)
            clicks += 1
            time.sleep(button.get("settle_ms", 5000) / 1000.0)

            image = _screencap(context)
            after = _read_counter(context, image, counters)
            if after.value is None or after.value <= current:
                stalls += 1
                if stalls >= 2:
                    _log(
                        context,
                        f"【{label}】連續兩次點擊「{button['expected']}」後計數沒有增加"
                        f"（停在 {current}），判定資源不足或按鈕無效，安全停止。",
                    )
                    break
                continue

            stalls = 0
            current = after.value

        image = _screencap(context)
        final = _read_counter(context, image, counters)
        done_now = (final.value - start.value) if final.value is not None else None

        if done_now is None:
            _log(context, f"【{label}】結束時讀不到計數，無法確認結果。")
            return False

        _log(
            context,
            f"【{label}】完成：本次實際{verb} {done_now} 次，"
            f"今日累計 {final.value} 次（點擊 {clicks} 下）。",
        )
        return True


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: main.py <socket_id>", file=sys.stderr)
        return 1

    socket_id = sys.argv[-1]
    AgentServer.start_up(socket_id)
    AgentServer.join()
    AgentServer.shut_down()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
