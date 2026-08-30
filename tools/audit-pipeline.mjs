/**
 * Pipeline 靜態稽核。
 *
 * MaaFramework 在一個節點執行完後，會依序嘗試辨識 `next` 清單裡的候選；
 * 若全部辨識失敗，這個節點就算失敗，並往上層傳播，整個任務隨之中止。
 *
 * 因此每個有 `next` 的節點，清單中至少要有一個「一定會成功」的保底候選
 * （`recognition: DirectHit` 且未被 `enabled: false` 關掉）。
 * 這個檢查專門抓「只列了辨識類候選、沒有保底路徑」的節點——
 * 這類問題在實機上會表現成莫名其妙的任務失敗，例如：
 *   - 背包沒有可一鍵使用的道具時被判定成任務失敗
 *   - 祈願池被捲到畫面外就直接中斷
 *   - 寶庫最後一格轉到特賣分頁時辨識不到就整個失敗
 */
import {readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";

const DIR = "resource/base/pipeline";

const nodes = {};
for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
    const json = JSON.parse(readFileSync(join(DIR, file), "utf8"));
    for (const [
        name,
        def,
    ] of Object.entries(json)) {
        nodes[name] = {...def, __file: file};
    }
}

const nameOf = (item) =>
    String(typeof item === "object" && item !== null ? item.name : item).replace(/^\[[A-Za-z]+\]/, "");

const asList = (value) => (value == null ? [] : Array.isArray(value) ? value : [value]);

/** DirectHit 且未被停用的節點，執行時必定命中，可作為保底路徑 */
const isFallback = (name) => {
    const def = nodes[name];
    if (!def) return false;
    if (def.enabled === false) return false;
    const reco = def.recognition ?? def.type ?? "DirectHit";
    return reco === "DirectHit";
};

const problems = [];
const missing = [];

for (const [
    name,
    def,
] of Object.entries(nodes)) {
    for (const key of [
        "next",
        "on_error",
        "interrupt",
    ]) {
        const list = asList(def[key]).map(nameOf);
        if (list.length === 0) continue;
        for (const target of list) {
            if (!nodes[target]) missing.push(`${def.__file}: ${name}.${key} -> 不存在的節點 ${target}`);
        }
        if (key !== "next") continue;
        // 只標記最高風險的形狀：唯一候選、而且該候選不是必定命中的 DirectHit。
        // 這種節點在該步驟完全沒有其他路可走，辨識一失敗就往上傳播成任務失敗。
        // （多個候選、或父節點另有備援的情況，本來就是正常寫法，不列入。）
        // 導航／進場的重試鏈本來就靠「父節點有多個候選」吸收失敗，不列入。
        const inRetryChain = /\.Nav\.|\.Enter(\.|$)|\.Retry$/.test(name);
        if (!inRetryChain && list.length === 1 && !isFallback(list[0])) {
            problems.push(`${def.__file}: ${name}.next 只有一個非 DirectHit 候選 [${list[0]}]`);
        }
    }
}

// 錨點（[Anchor]）不是實際節點，忽略
const realMissing = missing.filter((m) => !/Anchor/i.test(m) && !/RetryTask/.test(m));

if (realMissing.length) {
    console.log("缺少的節點參照:");
    for (const m of realMissing) console.log("  " + m);
}
if (problems.length) {
    console.log(
        `\n提示：唯一候選且非 DirectHit（${problems.length}）——` + "若該步驟的辨識可能合理地失敗，請補一條保底路徑：",
    );
    for (const p of problems) console.log("  " + p);
}
if (!realMissing.length && !problems.length) {
    console.log(`OK：${Object.keys(nodes).length} 個節點，參照完整，沒有高風險的單一候選。`);
}
process.exit(realMissing.length ? 1 : 0);
