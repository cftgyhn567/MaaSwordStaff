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
from maa.pipeline import JOCR, JActionType, JClick, JClickKey, JRecognitionType, JTemplateMatch

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
    "guild_donation": {
        "label": "公會捐贈",
        "verb": "捐贈",
        # 第一次是「免費捐贈」，第二次起變成「捐贈 <晨星>」且會跳出確認彈窗。
        # 若玩家勾了「本次登入不再提醒」就不會跳，所以確認視窗是選擇性的。
        "counters": [
            {"roi": [180, 868, 360, 52], "pattern": r"每日捐贈次數[:：]?(\d+)"},
        ],
        "buttons": [
            {"n": 1, "expected": "捐贈", "settle_ms": 2600},
        ],
        "button_roi": [180, 902, 360, 78],
        "confirm": {"roi": [360, 698, 270, 82], "expected": "確定"},
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


def _text_matches(result, expected: str) -> bool:
    """確認 OCR 結果真的符合要找的文字。

    `_ocr_all` 在 `filtered_results` 為空時會退回 `all_results`（`_read_counter`
    需要這個行為），因此凡是指定 expected 的呼叫都必須自己再比對一次，
    否則會把畫面上任何一段文字當成命中。
    """
    if not expected:
        return True
    text = (getattr(result, "text", "") or "").replace(" ", "")
    return bool(re.search(expected, text))


def _find_button(context: Context, image, roi: list[int], expected: str) -> Optional[list[int]]:
    """在按鈕列找出指定文字的按鈕，回傳其辨識框。"""
    for result in _ocr_all(context, image, roi, expected):
        if not _text_matches(result, expected):
            continue
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


def _find_first_button(context: Context, image, roi: list[int], expected: str) -> Optional[list[int]]:
    """在清單裡找出最上面一個指定文字的按鈕（例如夥伴清單的第一個「邀請」）。"""
    rects = []
    for result in _ocr_all(context, image, roi, expected):
        if not _text_matches(result, expected):
            continue
        rect = _as_rect(getattr(result, "box", None))
        if rect:
            rects.append(rect)
    if not rects:
        return None
    return min(rects, key=lambda r: r[1])


def _click_key(context: Context, key: int) -> None:
    """按下實體鍵（4 = Android 返回鍵）。"""
    context.run_action_direct(JActionType.ClickKey, JClickKey(key=[key]))


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
        profile.update(
            {k: v for k, v in cfg.items() if k in ("counters", "buttons", "button_roi", "confirm")}
        )

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

            # 部分設施（例如公會捐贈第二次起）會跳出確認彈窗
            confirm = profile.get("confirm")
            if confirm:
                time.sleep(1.0)
                confirm_rect = _find_button(
                    context, _screencap(context), confirm["roi"], confirm["expected"]
                )
                if confirm_rect:
                    _click(context, confirm_rect)

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


# ---------------------------------------------------------------------------
# 冶煉工坊熔爐：租借／續租
#
# 按鈕組合會隨狀態變動，必須以文字定位而非固定座標：
#   未租借、非使用中 → 「租借 <晨星>」（置中）
#   已租借、非使用中 → 「續租 <晨星>」＋「切換」
#   已租借且使用中   → 「續租 <晨星>」（置中）
#   黑鐵熔爐（預設） → 「使用中」（不可點）
# 租借與續租都會跳出確認彈窗（租借確認／續租確認）。
# 剩餘時間顯示為「還可以使用N天HH小時MM分SS秒」，上限 7 天，每次 24 小時。
# ---------------------------------------------------------------------------

FURNACE_DEFAULTS: dict[str, Any] = {
    "time_roi": [140, 852, 460, 52],
    "time_pattern": r"還可以使用(\d+)天",
    "button_roi": [90, 900, 540, 76],
    "rent_expected": "租借",
    "renew_expected": "續租",
    "confirm": {"roi": [360, 698, 270, 82], "expected": "確定"},
    "max_renew": 7,
}


def _read_days(context: Context, image, cfg: dict[str, Any]) -> Optional[int]:
    """讀「還可以使用N天…」；找不到代表尚未租借。"""
    for result in _ocr_all(context, image, cfg["time_roi"]):
        text = (getattr(result, "text", "") or "").replace(" ", "")
        match = re.search(cfg["time_pattern"], text)
        if match:
            return int(match.group(1))
    return None


@AgentServer.custom_action("RenewFurnace")
class RenewFurnace(CustomAction):
    """把指定熔爐的剩餘天數補到設定值。

    custom_action_param::

        {
            "label": "黃金熔爐",
            "target_days": 7,   # 續租到剩餘天數達到此值；0 代表不租借也不續租
            "max_renew": 7      # 選填，安全上限
        }
    """

    def run(self, context: Context, argv: CustomAction.RunArg):
        try:
            cfg = dict(FURNACE_DEFAULTS)
            cfg.update(json.loads(argv.custom_action_param or "{}"))
        except json.JSONDecodeError:
            _log(context, "【熔爐】custom_action_param 不是合法 JSON，安全停止。")
            return False

        label = cfg.get("label", "熔爐")
        try:
            target_days = int(cfg.get("target_days", 0))
        except (TypeError, ValueError):
            target_days = 0
        max_renew = int(cfg.get("max_renew", 7))

        if target_days <= 0:
            _log(context, f"【{label}】設定為不租借，僅切換熔爐種類。")
            return True

        confirm = cfg["confirm"]
        clicks = 0
        stalls = 0

        while clicks < max_renew:
            image = _screencap(context)
            days = _read_days(context, image, cfg)

            if days is not None and days >= target_days:
                _log(context, f"【{label}】剩餘 {days} 天，已達設定的 {target_days} 天，不再續租。")
                return True

            expected = cfg["rent_expected"] if days is None else cfg["renew_expected"]
            rect = _find_button(context, image, cfg["button_roi"], expected)
            if rect is None:
                _log(
                    context,
                    f"【{label}】找不到「{expected}」按鈕（可能已達租借上限或晨星不足），安全停止。",
                )
                break

            _click(context, rect)
            clicks += 1
            time.sleep(1.0)

            confirm_rect = _find_button(
                context, _screencap(context), confirm["roi"], confirm["expected"]
            )
            if confirm_rect:
                _click(context, confirm_rect)
            time.sleep(2.5)

            after = _read_days(context, _screencap(context), cfg)
            if after is None or (days is not None and after <= days):
                stalls += 1
                if stalls >= 2:
                    _log(
                        context,
                        f"【{label}】連續兩次「{expected}」後剩餘天數沒有增加，"
                        f"判定已達上限或資源不足，安全停止。",
                    )
                    break
            else:
                stalls = 0

        final = _read_days(context, _screencap(context), cfg)
        if final is None:
            _log(context, f"【{label}】結束時讀不到剩餘時間，無法確認結果。")
            return False
        _log(context, f"【{label}】完成：本次租借／續租 {clicks} 次，目前剩餘 {final} 天。")
        return True


# ---------------------------------------------------------------------------
# 限購型購買（副本領獎次數、競技場券、素材祕境的鎬）
#
# 三種購買視窗的共同點：都有「今日限購 a/b」，且 a 是「今日已購買次數」。
# 使用者設定的次數一律視為「今日累計目標」，所以實際要買的是
#   need = min(目標 - 已購買, 上限 - 已購買)
# 這個扣除是必須的，否則每天重跑會超買。
#
# 兩種版面：
#   slider  日常副本：左右各一顆圓鈕的滑桿，數量從 1 開始
#   stepper 素材祕境／競技場：－ 數字 ＋（競技場多一顆「拉到最大」）
# 兩者都用「每點一次 ＋ 就加 1」處理，差別只在座標，由 pipeline 傳入。
# ---------------------------------------------------------------------------

BUY_DEFAULTS: dict[str, Any] = {
    "limit_roi": [380, 640, 260, 160],
    "limit_pattern": r"今日限[購购][:：]?(\d+)/(\d+)",
    "plus_target": [575, 620, 45, 45],
    "buy_roi": [380, 700, 260, 180],
    "buy_expected": "購買",
    "cancel_target": [194, 722, 66, 39],
    "max_plus_clicks": 20,
}


def _read_limit(context: Context, image, cfg: dict[str, Any]) -> Optional[tuple[int, int]]:
    """讀「今日限購 a/b」，回傳 (今日已購買, 每日上限)。"""
    pattern = cfg["limit_pattern"]
    for result in _ocr_all(context, image, cfg["limit_roi"]):
        text = (getattr(result, "text", "") or "").replace(" ", "")
        match = re.search(pattern, text)
        if match:
            return int(match.group(1)), int(match.group(2))
    return None


@AgentServer.custom_action("BuyLimitedCount")
class BuyLimitedCount(CustomAction):
    """在已開啟的購買視窗裡，把今日購買次數補到設定值。

    custom_action_param::

        {
            "label": "競技場券",
            "total": 3,                     # 今日累計目標，0 代表不購買
            "limit_roi": [...],             # 「今日限購 a/b」的位置
            "plus_target": [...],           # 數量 ＋
            "buy_roi": [...],               # 「購買」按鈕搜尋範圍
            "cancel_target": [...]          # 「取消」按鈕
        }
    """

    def run(self, context: Context, argv: CustomAction.RunArg):
        try:
            cfg = dict(BUY_DEFAULTS)
            cfg.update(json.loads(argv.custom_action_param or "{}"))
        except json.JSONDecodeError:
            _log(context, "【購買】custom_action_param 不是合法 JSON，安全停止。")
            return False

        label = cfg.get("label", "購買")
        try:
            total = int(cfg.get("total", 0))
        except (TypeError, ValueError):
            total = 0

        image = _screencap(context)
        limit = _read_limit(context, image, cfg)
        if limit is None:
            _log(context, f"【{label}】讀不到「今日限購」，無法確認已購買次數，安全停止，未購買。")
            _click(context, cfg["cancel_target"])
            return False

        bought, cap = limit
        if total <= 0:
            _log(context, f"【{label}】設定為不購買（今日已購買 {bought}/{cap}），關閉視窗。")
            _click(context, cfg["cancel_target"])
            return True

        need = min(total - bought, cap - bought)
        if need <= 0:
            _log(
                context,
                f"【{label}】今日已購買 {bought}/{cap}，已達設定的 {total} 次或每日上限，不再購買。",
            )
            _click(context, cfg["cancel_target"])
            return True

        _log(
            context,
            f"【{label}】今日已購買 {bought}/{cap}，設定目標 {total} 次，本次購買 {need} 次。",
        )

        # 數量預設為 1，因此只要再按 need - 1 次「＋」。
        clicks = min(need - 1, int(cfg["max_plus_clicks"]))
        for _ in range(clicks):
            _click(context, cfg["plus_target"])
            time.sleep(0.25)

        buy_rect = _find_button(context, _screencap(context), cfg["buy_roi"], cfg["buy_expected"])
        if buy_rect is None:
            _log(context, f"【{label}】找不到「{cfg['buy_expected']}」按鈕，安全停止，未購買。")
            _click(context, cfg["cancel_target"])
            return False

        _click(context, buy_rect)
        time.sleep(2.0)

        after = _read_limit(context, _screencap(context), cfg)
        if after is None:
            _log(
                context,
                f"【{label}】已送出購買 {need} 次，但購買視窗已關閉，無法在同一畫面確認結果。",
            )
            return True

        gained = after[0] - bought
        if gained <= 0:
            _log(context, f"【{label}】點擊購買後「今日限購」仍停在 {after[0]}/{after[1]}，判定未成交，安全停止。")
            _click(context, cfg["cancel_target"])
            return False

        _log(context, f"【{label}】完成：本次購買 {gained} 次，今日累計 {after[0]}/{after[1]}。")
        _click(context, cfg["cancel_target"])
        return True


# ---------------------------------------------------------------------------
# 組隊：用「夥伴」把隊伍補滿
#
# 隊伍視窗的高度會隨隊伍上限改變（副本 4 人、聖獸試煉 6 人、雙影幻境 2 人），
# 因此「人數 a/b」與空位的 y 座標都不固定，一律用辨識而非固定座標：
#   人數  → OCR「人數a/b」（y 介於 232～474）
#   空位  → TemplateMatch party/slot-empty.png（整條淺灰膠囊，隊伍滿時不會命中）
# 邀請「夥伴」不會送邀請給其他玩家，清單也會自動過濾職業不符的夥伴
# （雙影幻境要求特定職業時，夥伴頁只會列出可用的人）。
# ---------------------------------------------------------------------------

PARTY_DEFAULTS: dict[str, Any] = {
    "count_roi": [20, 180, 420, 400],
    "count_pattern": r"人數(\d+)/(\d+)",
    "slot_template": ["party/slot-empty.png"],
    "slot_roi": [40, 180, 640, 920],
    "slot_threshold": 0.8,
    "tab_roi": [540, 1180, 180, 90],
    "tab_expected": "夥伴",
    "invite_roi": [460, 110, 260, 1060],
    "invite_expected": "邀請",
    "full_roi": [0, 250, 720, 760],
    "full_expected": "隊伍人數已滿",
    "max_invites": 8,
}


def _template_match(context: Context, image, cfg: dict[str, Any]) -> Optional[list[int]]:
    param = JTemplateMatch(
        template=list(cfg["slot_template"]),
        roi=list(cfg["slot_roi"]),
        threshold=[float(cfg["slot_threshold"])],
        order_by="Vertical",
        index=0,
    )
    detail = context.run_recognition_direct(JRecognitionType.TemplateMatch, param, image)
    if detail is None:
        return None
    return _as_rect(getattr(detail, "box", None))


def _read_party(context: Context, image, cfg: dict[str, Any]) -> Optional[tuple[int, int]]:
    for result in _ocr_all(context, image, cfg["count_roi"]):
        text = (getattr(result, "text", "") or "").replace(" ", "")
        match = re.search(cfg["count_pattern"], text)
        if match:
            return int(match.group(1)), int(match.group(2))
    return None


@AgentServer.custom_action("FillPartyWithPartners")
class FillPartyWithPartners(CustomAction):
    """在已開啟的「隊伍」視窗裡，用夥伴把隊伍補到上限。

    custom_action_param::

        {
            "label": "聖獸試煉",
            "max_invites": 8        # 選填，安全上限
        }
    """

    def run(self, context: Context, argv: CustomAction.RunArg):
        try:
            cfg = dict(PARTY_DEFAULTS)
            cfg.update(json.loads(argv.custom_action_param or "{}"))
        except json.JSONDecodeError:
            _log(context, "【組隊】custom_action_param 不是合法 JSON，安全停止。")
            return False

        label = cfg.get("label", "組隊")
        max_invites = int(cfg.get("max_invites", 8))

        image = _screencap(context)
        party = _read_party(context, image, cfg)
        if party is None:
            _log(context, f"【{label}】讀不到隊伍「人數」，無法確認隊伍狀態，安全停止，未邀請任何夥伴。")
            return False

        current, capacity = party
        if current >= capacity:
            _log(context, f"【{label}】隊伍已滿（{current}/{capacity}），不需要再邀請夥伴。")
            return True

        need = min(capacity - current, max_invites)
        _log(context, f"【{label}】隊伍目前 {current}/{capacity}，準備邀請 {need} 位夥伴。")

        slot = _template_match(context, image, cfg)
        if slot is None:
            _log(context, f"【{label}】隊伍視窗上找不到空位，安全停止，未邀請任何夥伴。")
            return False
        _click(context, slot)
        time.sleep(1.5)

        tab = _find_button(context, _screencap(context), cfg["tab_roi"], cfg["tab_expected"])
        if tab is None:
            _log(context, f"【{label}】協助清單上找不到「{cfg['tab_expected']}」分頁，安全停止，未邀請任何玩家。")
            _click_key(context, 4)
            return False
        _click(context, tab)
        time.sleep(1.5)

        invited = 0
        for _ in range(need):
            image = _screencap(context)
            rect = _find_first_button(context, image, cfg["invite_roi"], cfg["invite_expected"])
            if rect is None:
                _log(context, f"【{label}】夥伴清單上已沒有可邀請的對象，停止邀請。")
                break
            _click(context, rect)
            invited += 1
            time.sleep(1.4)

            if _find_button(context, _screencap(context), cfg["full_roi"], cfg["full_expected"]):
                _log(context, f"【{label}】畫面提示「{cfg['full_expected']}」，停止邀請。")
                break

        _click_key(context, 4)
        time.sleep(1.5)

        final = _read_party(context, _screencap(context), cfg)
        if final is None:
            _log(context, f"【{label}】邀請 {invited} 位夥伴後讀不到隊伍人數，無法確認結果。")
            return False

        _log(context, f"【{label}】完成：本次加入 {final[0] - current} 位夥伴，目前隊伍 {final[0]}/{final[1]}。")
        return True


# ---------------------------------------------------------------------------
# 羈絆冒險／奇景委派：清點地圖上的奇景數量
#
# 每個奇景是一塊深色面板，右上角固定有一顆「!」徽章：
#   紅色 = 委派已結束，可以收取
#   白色 = 空著，可以派人
# 面板裡的圖示會隨獎勵種類改變（藍／紫／橘／黃底都有），所以辨識徽章而不是圖示，
# 才不會因為圖示換了就漏掉。正常是 4 個，少於 4 個要明確提示。
# ---------------------------------------------------------------------------

SCENIC_DEFAULTS: dict[str, Any] = {
    "roi": [0, 150, 720, 900],
    "ready_template": ["note/bond-spot-ready.png"],
    "empty_template": ["note/bond-spot-empty.png"],
    "threshold": 0.85,
    # 委派進行中的奇景沒有徽章，只有一個 HH:MM:SS 的倒數，必須一起算才湊得滿 4 個
    "busy_pattern": r"[0-9]{2}:[0-9]{2}:[0-9]{2}",
    # 已收取完成的奇景會標「成功／大成功」並停在原地，點不動，要等奇景刷新才會換掉；
    # 它仍然算一個奇景，只計數不點擊。
    "done_pattern": r"成功",
    "expected_total": 4,
}


def _count_template(context: Context, image, templates: list[str], cfg: dict[str, Any]) -> int:
    param = JTemplateMatch(
        template=list(templates),
        roi=list(cfg["roi"]),
        threshold=[float(cfg["threshold"])],
        order_by="Vertical",
    )
    detail = context.run_recognition_direct(JRecognitionType.TemplateMatch, param, image)
    if detail is None:
        return 0
    # 只能看 filtered_results：沒有命中時 all_results 仍會塞一個低於門檻的最佳結果，
    # 拿它來計數會憑空多出奇景。
    return len(getattr(detail, "filtered_results", None) or [])


@AgentServer.custom_action("BondScenicReport")
class BondScenicReport(CustomAction):
    """清點羈絆冒險地圖上的奇景，並在數量不足時提示。"""

    def run(self, context: Context, argv: CustomAction.RunArg):
        try:
            cfg = dict(SCENIC_DEFAULTS)
            cfg.update(json.loads(argv.custom_action_param or "{}"))
        except json.JSONDecodeError:
            _log(context, "【羈絆冒險】custom_action_param 不是合法 JSON，安全停止。")
            return False

        image = _screencap(context)
        ready = _count_template(context, image, cfg["ready_template"], cfg)
        empty = _count_template(context, image, cfg["empty_template"], cfg)
        busy = 0
        done = 0
        for result in _ocr_all(context, image, cfg["roi"]):
            text = (getattr(result, "text", "") or "").replace(" ", "")
            if re.search(cfg["busy_pattern"], text):
                busy += 1
            elif re.search(cfg["done_pattern"], text):
                done += 1
        total = ready + empty + busy + done
        expected = int(cfg["expected_total"])

        _log(
            context,
            f"【羈絆冒險】辨識到 {total} 個奇景：{ready} 個可收取（紅點）、"
            f"{empty} 個空著可委派、{busy} 個委派進行中、{done} 個已結束並顯示結果。",
        )
        if total < expected:
            _log(
                context,
                f"【羈絆冒險】【注意】只辨識到 {total} 個奇景，少於預期的 {expected} 個，"
                f"可能有奇景沒被辨識到（圖示或版面改變），請確認畫面後再執行一次。",
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
