import fs from "fs";

// 6. objective_catalog.json
const rawCatalog = JSON.parse(fs.readFileSync("resource/base/pipeline/objective_catalog.json", "utf8"));

function patchNoteTask(taskName, logName, nextSteps) {
    const startNode = `Objectives.${taskName}.Start`;
    const ensureNode = `Objectives.${taskName}.EnsureNote`;
    const fromOtherNode = `Objectives.${taskName}.Nav.FromOtherTab`;
    const backNode = `Objectives.${taskName}.Nav.Back`;
    const exitDialogNode = `Objectives.${taskName}.Nav.ExitDialog`;
    const selectNode = `Objectives.${taskName}.Nav.SelectNote`;

    rawCatalog[startNode] = {
        recognition: "DirectHit",
        action: "DoNothing",
        next: [
            ensureNode,
            fromOtherNode,
            backNode,
        ],
    };

    rawCatalog[ensureNode] = {
        recognition: "OCR",
        roi: [
            180,
            1200,
            140,
            70,
        ],
        expected: "筆記",
        threshold: 0.2,
        action: "DoNothing",
        next: nextSteps,
        focus: {
            "Node.Recognition.Succeeded": {
                content: `【導航】已確認在筆記主頁，開始執行${logName}任務。`,
                display: "log",
            },
        },
    };

    rawCatalog[fromOtherNode] = {
        recognition: "OCR",
        roi: [
            0,
            1200,
            720,
            70,
        ],
        expected: "角色|家園|公會|世界",
        threshold: 0.2,
        action: "Click",
        target: [
            250,
            1220,
            40,
            40,
        ],
        post_delay: 800,
        next: [ensureNode],
    };

    rawCatalog[backNode] = {
        max_hit: 12,
        recognition: "DirectHit",
        action: "ClickKey",
        key: 4,
        post_delay: 700,
        next: [
            exitDialogNode,
            ensureNode,
            fromOtherNode,
            backNode,
        ],
    };

    rawCatalog[exitDialogNode] = {
        recognition: "OCR",
        roi: [
            160,
            500,
            400,
            210,
        ],
        expected: "要離開遊戲嗎",
        threshold: 0.2,
        action: "Click",
        target: [
            100,
            690,
            260,
            100,
        ],
        post_delay: 800,
        next: [selectNode],
    };

    rawCatalog[selectNode] = {
        recognition: "DirectHit",
        action: "Click",
        target: [
            250,
            1220,
            40,
            40,
        ],
        post_delay: 1000,
        next: [ensureNode],
    };
}

patchNoteTask("Daily.Dungeon1", "日常副本", [
    "Note.DailyDungeon",
    "Note.Screen",
]);
patchNoteTask("Daily.Arena1", "競技場挑戰", [
    "Note.Arena",
    "Note.Screen",
]);
patchNoteTask("Daily.BeastTrialReward1", "聖獸試煉", [
    "Note.DailyActivities",
    "Note.Screen",
]);
patchNoteTask("Daily.PhantomRealmWave3", "雙影幻境", [
    "Note.DailyActivities",
    "Note.Screen",
]);
patchNoteTask("BondAdventureScenicDispatch", "羈絆冒險/奇景委派", [
    "Note.BondAdventure",
    "Note.Screen",
]);

// World Task: ExploreFate3
rawCatalog["Objectives.Pilgrimage.Daily.ExploreFate3.Start"] = {
    recognition: "DirectHit",
    action: "DoNothing",
    next: [
        "Objectives.Pilgrimage.Daily.ExploreFate3.EnsureWorld",
        "Objectives.Pilgrimage.Daily.ExploreFate3.Nav.FromOtherTab",
        "Objectives.Pilgrimage.Daily.ExploreFate3.Nav.Back",
    ],
};
rawCatalog["Objectives.Pilgrimage.Daily.ExploreFate3.EnsureWorld"] = {
    recognition: "OCR",
    roi: [
        570,
        1200,
        140,
        70,
    ],
    expected: "世界",
    threshold: 0.2,
    action: "DoNothing",
    focus: {
        "Node.Recognition.Succeeded": {
            content: "【導航】已確認在世界主頁，開始執行探尋/探索命運任務。",
            display: "log",
        },
    },
};
rawCatalog["Objectives.Pilgrimage.Daily.ExploreFate3.Nav.FromOtherTab"] = {
    recognition: "OCR",
    roi: [
        0,
        1200,
        720,
        70,
    ],
    expected: "角色|筆記|家園|公會",
    threshold: 0.2,
    action: "Click",
    target: [
        640,
        1220,
        40,
        40,
    ],
    post_delay: 800,
    next: ["Objectives.Pilgrimage.Daily.ExploreFate3.EnsureWorld"],
};
rawCatalog["Objectives.Pilgrimage.Daily.ExploreFate3.Nav.Back"] = {
    max_hit: 12,
    recognition: "DirectHit",
    action: "ClickKey",
    key: 4,
    post_delay: 700,
    next: [
        "Objectives.Pilgrimage.Daily.ExploreFate3.Nav.ExitDialog",
        "Objectives.Pilgrimage.Daily.ExploreFate3.EnsureWorld",
        "Objectives.Pilgrimage.Daily.ExploreFate3.Nav.FromOtherTab",
        "Objectives.Pilgrimage.Daily.ExploreFate3.Nav.Back",
    ],
};
rawCatalog["Objectives.Pilgrimage.Daily.ExploreFate3.Nav.ExitDialog"] = {
    recognition: "OCR",
    roi: [
        160,
        500,
        400,
        210,
    ],
    expected: "要離開遊戲嗎",
    threshold: 0.2,
    action: "Click",
    target: [
        100,
        690,
        260,
        100,
    ],
    post_delay: 800,
    next: ["Objectives.Pilgrimage.Daily.ExploreFate3.Nav.SelectWorld"],
};
rawCatalog["Objectives.Pilgrimage.Daily.ExploreFate3.Nav.SelectWorld"] = {
    recognition: "DirectHit",
    action: "Click",
    target: [
        640,
        1220,
        40,
        40,
    ],
    post_delay: 1000,
    next: ["Objectives.Pilgrimage.Daily.ExploreFate3.EnsureWorld"],
};

// Guild Raid Task
rawCatalog["Objectives.Pilgrimage.Weekly.GuildRaid7.Start"] = {
    recognition: "DirectHit",
    action: "DoNothing",
    next: [
        "Objectives.Pilgrimage.Weekly.GuildRaid7.EnsureGuild",
        "Objectives.Pilgrimage.Weekly.GuildRaid7.Nav.FromOtherTab",
        "Objectives.Pilgrimage.Weekly.GuildRaid7.Nav.Back",
    ],
};
rawCatalog["Objectives.Pilgrimage.Weekly.GuildRaid7.EnsureGuild"] = {
    recognition: "OCR",
    roi: [
        430,
        1200,
        140,
        70,
    ],
    expected: "公會",
    threshold: 0.2,
    action: "DoNothing",
    focus: {
        "Node.Recognition.Succeeded": {
            content: "【導航】已確認在公會主頁，開始執行公會討伐任務。",
            display: "log",
        },
    },
};
rawCatalog["Objectives.Pilgrimage.Weekly.GuildRaid7.Nav.FromOtherTab"] = {
    recognition: "OCR",
    roi: [
        0,
        1200,
        720,
        70,
    ],
    expected: "角色|筆記|家園|世界",
    threshold: 0.2,
    action: "Click",
    target: [
        500,
        1220,
        40,
        40,
    ],
    post_delay: 800,
    next: ["Objectives.Pilgrimage.Weekly.GuildRaid7.EnsureGuild"],
};
rawCatalog["Objectives.Pilgrimage.Weekly.GuildRaid7.Nav.Back"] = {
    max_hit: 12,
    recognition: "DirectHit",
    action: "ClickKey",
    key: 4,
    post_delay: 700,
    next: [
        "Objectives.Pilgrimage.Weekly.GuildRaid7.Nav.ExitDialog",
        "Objectives.Pilgrimage.Weekly.GuildRaid7.EnsureGuild",
        "Objectives.Pilgrimage.Weekly.GuildRaid7.Nav.FromOtherTab",
        "Objectives.Pilgrimage.Weekly.GuildRaid7.Nav.Back",
    ],
};
rawCatalog["Objectives.Pilgrimage.Weekly.GuildRaid7.Nav.ExitDialog"] = {
    recognition: "OCR",
    roi: [
        160,
        500,
        400,
        210,
    ],
    expected: "要離開遊戲嗎",
    threshold: 0.2,
    action: "Click",
    target: [
        100,
        690,
        260,
        100,
    ],
    post_delay: 800,
    next: ["Objectives.Pilgrimage.Weekly.GuildRaid7.Nav.SelectGuild"],
};
rawCatalog["Objectives.Pilgrimage.Weekly.GuildRaid7.Nav.SelectGuild"] = {
    recognition: "DirectHit",
    action: "Click",
    target: [
        500,
        1220,
        40,
        40,
    ],
    post_delay: 1000,
    next: ["Objectives.Pilgrimage.Weekly.GuildRaid7.EnsureGuild"],
};

fs.writeFileSync("resource/base/pipeline/objective_catalog.json", JSON.stringify(rawCatalog, null, 4), "utf8");
console.log("objective_catalog.json OK");
