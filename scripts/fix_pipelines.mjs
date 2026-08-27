import fs from "fs";

// 1. home_rewards.json
const homeRewards = {
    "HomeRewards.Start": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: [
            "HomeRewards.HomeReady",
            "HomeRewards.Nav.FromOtherTab",
            "HomeRewards.Nav.Back",
        ],
    },
    "HomeRewards.HomeReady": {
        recognition: "OCR",
        roi: [
            290,
            1200,
            140,
            70,
        ],
        expected: "家園",
        threshold: 0.2,
        action: "DoNothing",
        next: ["HomeRewards.ResetToFarRight.Swipe1"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【導航】已確認在家園首頁，開始執行家園掛機收益領取。",
                display: "log",
            },
        },
    },
    "HomeRewards.Nav.FromOtherTab": {
        recognition: "OCR",
        roi: [
            0,
            1200,
            720,
            70,
        ],
        expected: "角色|筆記|公會|世界",
        threshold: 0.2,
        action: "Click",
        target: [
            360,
            1200,
            40,
            40,
        ],
        post_delay: 800,
        next: ["HomeRewards.HomeReady"],
    },
    "HomeRewards.Nav.Back": {
        max_hit: 12,
        recognition: "DirectHit",
        action: "ClickKey",
        key: 4,
        post_delay: 700,
        next: [
            "HomeRewards.Nav.ExitDialog",
            "HomeRewards.HomeReady",
            "HomeRewards.Nav.FromOtherTab",
            "HomeRewards.Nav.Back",
        ],
    },
    "HomeRewards.Nav.ExitDialog": {
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
        next: ["HomeRewards.Nav.SelectHome"],
    },
    "HomeRewards.Nav.SelectHome": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            360,
            1200,
            40,
            40,
        ],
        post_delay: 1000,
        next: ["HomeRewards.HomeReady"],
    },
    "HomeRewards.ResetToFarRight.Swipe1": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["HomeRewards.ResetToFarRight.Swipe2"],
    },
    "HomeRewards.ResetToFarRight.Swipe2": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["HomeRewards.ResetToFarRight.Swipe3"],
    },
    "HomeRewards.ResetToFarRight.Swipe3": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["HomeRewards.ResetToFarRight.Swipe4"],
    },
    "HomeRewards.ResetToFarRight.Swipe4": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 300,
        next: ["HomeRewards.ResetToFarRight.VerifyLog"],
    },
    "HomeRewards.ResetToFarRight.VerifyLog": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: ["HomeRewards.ClickBed"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【家園歸零】已連續向右滑動歸位至最右側小屋主畫面！準備領取二樓床鋪收益。",
                display: "log",
            },
        },
    },
    "HomeRewards.ClickBed": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            180,
            400,
            40,
            40,
        ],
        post_delay: 1000,
        next: [
            "HomeRewards.BedOverlay",
            "HomeRewards.MoveToCart.Swipe1",
        ],
    },
    "HomeRewards.BedOverlay": {
        recognition: "OCR",
        roi: [
            0,
            0,
            720,
            1280,
        ],
        expected: "獲得獎勵|點擊任意區域|領取",
        action: "ClickKey",
        key: 4,
        post_delay: 800,
        next: ["HomeRewards.MoveToCart.Swipe1"],
    },
    "HomeRewards.MoveToCart.Swipe1": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            100,
            300,
            10,
            10,
        ],
        end: [
            600,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["HomeRewards.MoveToCart.Swipe2"],
    },
    "HomeRewards.MoveToCart.Swipe2": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            100,
            300,
            10,
            10,
        ],
        end: [
            600,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["HomeRewards.MoveToCart.Swipe3"],
    },
    "HomeRewards.MoveToCart.Swipe3": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            100,
            300,
            10,
            10,
        ],
        end: [
            600,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 400,
        next: ["HomeRewards.Cart.VerifyLog"],
    },
    "HomeRewards.Cart.VerifyLog": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: ["HomeRewards.ClickCart"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【家園收益】已移動至推車位置，準備領取推車放置收益。",
                display: "log",
            },
        },
    },
    "HomeRewards.ClickCart": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            440,
            650,
            80,
            80,
        ],
        post_delay: 1000,
        next: [
            "HomeRewards.CartOverlay",
            "HomeRewards.Done",
        ],
    },
    "HomeRewards.CartOverlay": {
        recognition: "OCR",
        roi: [
            0,
            0,
            720,
            1280,
        ],
        expected: "獲得獎勵|點擊任意區域|領取",
        action: "ClickKey",
        key: 4,
        post_delay: 800,
        next: ["HomeRewards.Done"],
    },
    "HomeRewards.Done": {
        recognition: "DirectHit",
        action: "DoNothing",
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【家園收益】床鋪與推車放置收益領取完成！",
                display: "log",
            },
        },
    },
    "Objectives.SakuraTree.BeastBonding.Start": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: [
            "SakuraTree.BeastBonding.EnsureHome",
            "SakuraTree.BeastBonding.Nav.FromOtherTab",
            "SakuraTree.BeastBonding.Nav.Back",
        ],
    },
    "SakuraTree.BeastBonding.EnsureHome": {
        recognition: "OCR",
        roi: [
            290,
            1200,
            140,
            70,
        ],
        expected: "家園",
        threshold: 0.2,
        action: "DoNothing",
        next: ["SakuraTree.BeastBonding.ResetToFarRight.Swipe1"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【導航】已確認在家園首頁，開始執行幻獸結緣任務。",
                display: "log",
            },
        },
    },
    "SakuraTree.BeastBonding.Nav.FromOtherTab": {
        recognition: "OCR",
        roi: [
            0,
            1200,
            720,
            70,
        ],
        expected: "角色|筆記|公會|世界",
        threshold: 0.2,
        action: "Click",
        target: [
            360,
            1200,
            40,
            40,
        ],
        post_delay: 800,
        next: ["SakuraTree.BeastBonding.EnsureHome"],
    },
    "SakuraTree.BeastBonding.Nav.Back": {
        max_hit: 12,
        recognition: "DirectHit",
        action: "ClickKey",
        key: 4,
        post_delay: 700,
        next: [
            "SakuraTree.BeastBonding.Nav.ExitDialog",
            "SakuraTree.BeastBonding.EnsureHome",
            "SakuraTree.BeastBonding.Nav.FromOtherTab",
            "SakuraTree.BeastBonding.Nav.Back",
        ],
    },
    "SakuraTree.BeastBonding.Nav.ExitDialog": {
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
        next: ["SakuraTree.BeastBonding.Nav.SelectHome"],
    },
    "SakuraTree.BeastBonding.Nav.SelectHome": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            360,
            1200,
            40,
            40,
        ],
        post_delay: 1000,
        next: ["SakuraTree.BeastBonding.EnsureHome"],
    },
    "SakuraTree.BeastBonding.ResetToFarRight.Swipe1": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["SakuraTree.BeastBonding.ResetToFarRight.Swipe2"],
    },
    "SakuraTree.BeastBonding.ResetToFarRight.Swipe2": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["SakuraTree.BeastBonding.ResetToFarRight.Swipe3"],
    },
    "SakuraTree.BeastBonding.ResetToFarRight.Swipe3": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["SakuraTree.BeastBonding.ResetToFarRight.Swipe4"],
    },
    "SakuraTree.BeastBonding.ResetToFarRight.Swipe4": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 300,
        next: ["SakuraTree.BeastBonding.MoveToSakura.Swipe1"],
    },
    "SakuraTree.BeastBonding.MoveToSakura.Swipe1": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            100,
            300,
            10,
            10,
        ],
        end: [
            600,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["SakuraTree.BeastBonding.MoveToSakura.Swipe2"],
    },
    "SakuraTree.BeastBonding.MoveToSakura.Swipe2": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            100,
            300,
            10,
            10,
        ],
        end: [
            600,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["SakuraTree.BeastBonding.MoveToSakura.Swipe3"],
    },
    "SakuraTree.BeastBonding.MoveToSakura.Swipe3": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            100,
            300,
            10,
            10,
        ],
        end: [
            600,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 400,
        next: ["SakuraTree.BeastBonding.VerifyLog"],
    },
    "SakuraTree.BeastBonding.VerifyLog": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: ["SakuraTree.BeastBonding.ClickTree"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【家園歸零】已連續向右滑動歸位，並向左滑動至大櫻花樹位置！",
                display: "log",
            },
        },
    },
    "SakuraTree.BeastBonding.ClickTree": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            330,
            550,
            100,
            100,
        ],
        post_delay: 1200,
        next: [
            "SakuraTree.BeastBonding.Screen",
            "SakuraTree.BeastBonding.Back",
        ],
    },
    "SakuraTree.BeastBonding.Screen": {
        recognition: "OCR",
        roi: [
            0,
            0,
            720,
            350,
        ],
        expected: "結緣|幻獸結緣|今日已結緣",
        action: "DoNothing",
        next: ["SakuraTree.BeastBonding.LogCount"],
    },
    "SakuraTree.BeastBonding.LogCount": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: ["SakuraTree.BeastBonding.LogInitialCount"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【幻獸結緣】本次設定結緣抽取總次數：10 次，開始執行。",
                display: "log",
            },
        },
    },
    "SakuraTree.BeastBonding.LogInitialCount": {
        recognition: "OCR",
        roi: [
            200,
            700,
            320,
            100,
        ],
        expected: "今日已結緣.*",
        action: "DoNothing",
        next: [
            "SakuraTree.BeastBonding.Execute100",
            "SakuraTree.BeastBonding.Execute10",
            "SakuraTree.BeastBonding.Execute1",
        ],
    },
    "SakuraTree.BeastBonding.Execute10": {
        recognition: "OCR",
        roi: [
            0,
            800,
            720,
            200,
        ],
        expected: "結緣10次|結緣 10 次|10次",
        action: "Click",
        post_delay: 1500,
        next: [
            "SakuraTree.BeastBonding.Overlay",
            "SakuraTree.BeastBonding.LogFinalCount",
            "SakuraTree.BeastBonding.Back",
        ],
    },
    "SakuraTree.BeastBonding.Execute100": {
        recognition: "OCR",
        roi: [
            0,
            800,
            720,
            200,
        ],
        expected: "結緣100次|結緣 100 次|100次",
        action: "Click",
        post_delay: 1500,
        next: [
            "SakuraTree.BeastBonding.Overlay",
            "SakuraTree.BeastBonding.LogFinalCount",
            "SakuraTree.BeastBonding.Back",
        ],
    },
    "SakuraTree.BeastBonding.Execute1": {
        recognition: "OCR",
        roi: [
            0,
            800,
            720,
            200,
        ],
        expected: "結緣1次|結緣 1 次|1次",
        action: "Click",
        post_delay: 1500,
        next: [
            "SakuraTree.BeastBonding.Overlay",
            "SakuraTree.BeastBonding.LogFinalCount",
            "SakuraTree.BeastBonding.Back",
        ],
    },
    "SakuraTree.BeastBonding.Overlay": {
        recognition: "OCR",
        roi: [
            0,
            0,
            720,
            1280,
        ],
        expected: "獲得獎勵|點擊任意區域|確定",
        action: "ClickKey",
        key: 4,
        post_delay: 800,
        next: [
            "SakuraTree.BeastBonding.LogFinalCount",
            "SakuraTree.BeastBonding.Back",
        ],
    },
    "SakuraTree.BeastBonding.LogFinalCount": {
        recognition: "OCR",
        roi: [
            200,
            700,
            320,
            100,
        ],
        expected: "今日已結緣.*",
        action: "DoNothing",
        next: ["SakuraTree.BeastBonding.Back"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【幻獸結緣】完成！最終確認今日已結緣次數辨識完成。",
                display: "log",
            },
        },
    },
    "SakuraTree.BeastBonding.Back": {
        recognition: "DirectHit",
        action: "ClickKey",
        key: 4,
        post_delay: 800,
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【幻獸結緣】完成結緣操作並返回家園首頁。",
                display: "log",
            },
        },
    },
    "Objectives.GoddessStatue.Prayer.Start": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: [
            "GoddessStatue.EnsureHome",
            "GoddessStatue.Nav.FromOtherTab",
            "GoddessStatue.Nav.Back",
        ],
    },
    "GoddessStatue.EnsureHome": {
        recognition: "OCR",
        roi: [
            290,
            1200,
            140,
            70,
        ],
        expected: "家園",
        threshold: 0.2,
        action: "DoNothing",
        next: ["GoddessStatue.ResetToFarRight.Swipe1"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【導航】已確認在家園首頁，開始執行女神像祈願任務。",
                display: "log",
            },
        },
    },
    "GoddessStatue.Nav.FromOtherTab": {
        recognition: "OCR",
        roi: [
            0,
            1200,
            720,
            70,
        ],
        expected: "角色|筆記|公會|世界",
        threshold: 0.2,
        action: "Click",
        target: [
            360,
            1200,
            40,
            40,
        ],
        post_delay: 800,
        next: ["GoddessStatue.EnsureHome"],
    },
    "GoddessStatue.Nav.Back": {
        max_hit: 12,
        recognition: "DirectHit",
        action: "ClickKey",
        key: 4,
        post_delay: 700,
        next: [
            "GoddessStatue.Nav.ExitDialog",
            "GoddessStatue.EnsureHome",
            "GoddessStatue.Nav.FromOtherTab",
            "GoddessStatue.Nav.Back",
        ],
    },
    "GoddessStatue.Nav.ExitDialog": {
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
        next: ["GoddessStatue.Nav.SelectHome"],
    },
    "GoddessStatue.Nav.SelectHome": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            360,
            1200,
            40,
            40,
        ],
        post_delay: 1000,
        next: ["GoddessStatue.EnsureHome"],
    },
    "GoddessStatue.ResetToFarRight.Swipe1": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["GoddessStatue.ResetToFarRight.Swipe2"],
    },
    "GoddessStatue.ResetToFarRight.Swipe2": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["GoddessStatue.ResetToFarRight.Swipe3"],
    },
    "GoddessStatue.ResetToFarRight.Swipe3": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["GoddessStatue.ResetToFarRight.Swipe4"],
    },
    "GoddessStatue.ResetToFarRight.Swipe4": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 300,
        next: ["GoddessStatue.MoveToStatue.Swipe1"],
    },
    "GoddessStatue.MoveToStatue.Swipe1": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            100,
            300,
            10,
            10,
        ],
        end: [
            600,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["GoddessStatue.MoveToStatue.Swipe2"],
    },
    "GoddessStatue.MoveToStatue.Swipe2": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            100,
            300,
            10,
            10,
        ],
        end: [
            600,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 400,
        next: ["GoddessStatue.VerifyLog"],
    },
    "GoddessStatue.VerifyLog": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: ["GoddessStatue.ClickStatue"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【家園歸零】已連續向右滑動歸位，並向左滑動至女神像位置！",
                display: "log",
            },
        },
    },
    "GoddessStatue.ClickStatue": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            380,
            570,
            80,
            80,
        ],
        post_delay: 1200,
        next: [
            "GoddessStatue.Screen",
            "GoddessStatue.Back",
        ],
    },
    "GoddessStatue.Screen": {
        recognition: "OCR",
        roi: [
            0,
            0,
            720,
            350,
        ],
        expected: "祈願|女神像|友情祈願",
        action: "DoNothing",
        next: ["GoddessStatue.LogCount"],
    },
    "GoddessStatue.LogCount": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: ["GoddessStatue.ExecutePrayer"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【女神像祈願】本次設定祈願次數：1 次，開始執行。",
                display: "log",
            },
        },
    },
    "GoddessStatue.ExecutePrayer": {
        recognition: "OCR",
        roi: [
            0,
            700,
            720,
            450,
        ],
        expected: "友情祈願|祈願1次|祈願10次|祈願.*",
        action: "Click",
        post_delay: 1500,
        next: [
            "GoddessStatue.Overlay",
            "GoddessStatue.Back",
        ],
    },
    "GoddessStatue.Overlay": {
        recognition: "OCR",
        roi: [
            0,
            0,
            720,
            1280,
        ],
        expected: "獲得獎勵|點擊任意區域|確定",
        action: "ClickKey",
        key: 4,
        post_delay: 800,
        next: ["GoddessStatue.Back"],
    },
    "GoddessStatue.Back": {
        recognition: "DirectHit",
        action: "ClickKey",
        key: 4,
        post_delay: 800,
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【女神像祈願】完成祈願操作並返回家園首頁。",
                display: "log",
            },
        },
    },
    "Objectives.GachaMachine.Start": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: [
            "GachaMachine.EnsureHome",
            "GachaMachine.Nav.FromOtherTab",
            "GachaMachine.Nav.Back",
        ],
    },
    "GachaMachine.EnsureHome": {
        recognition: "OCR",
        roi: [
            290,
            1200,
            140,
            70,
        ],
        expected: "家園",
        threshold: 0.2,
        action: "DoNothing",
        next: ["GachaMachine.ResetToFarRight.Swipe1"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【導航】已確認在家園首頁，開始執行時光扭蛋機任務。",
                display: "log",
            },
        },
    },
    "GachaMachine.Nav.FromOtherTab": {
        recognition: "OCR",
        roi: [
            0,
            1200,
            720,
            70,
        ],
        expected: "角色|筆記|公會|世界",
        threshold: 0.2,
        action: "Click",
        target: [
            360,
            1200,
            40,
            40,
        ],
        post_delay: 800,
        next: ["GachaMachine.EnsureHome"],
    },
    "GachaMachine.Nav.Back": {
        max_hit: 12,
        recognition: "DirectHit",
        action: "ClickKey",
        key: 4,
        post_delay: 700,
        next: [
            "GachaMachine.Nav.ExitDialog",
            "GachaMachine.EnsureHome",
            "GachaMachine.Nav.FromOtherTab",
            "GachaMachine.Nav.Back",
        ],
    },
    "GachaMachine.Nav.ExitDialog": {
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
        next: ["GachaMachine.Nav.SelectHome"],
    },
    "GachaMachine.Nav.SelectHome": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            360,
            1200,
            40,
            40,
        ],
        post_delay: 1000,
        next: ["GachaMachine.EnsureHome"],
    },
    "GachaMachine.ResetToFarRight.Swipe1": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["GachaMachine.ResetToFarRight.Swipe2"],
    },
    "GachaMachine.ResetToFarRight.Swipe2": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["GachaMachine.ResetToFarRight.Swipe3"],
    },
    "GachaMachine.ResetToFarRight.Swipe3": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["GachaMachine.ResetToFarRight.Swipe4"],
    },
    "GachaMachine.ResetToFarRight.Swipe4": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 300,
        next: ["GachaMachine.MoveToGacha.Swipe1"],
    },
    "GachaMachine.MoveToGacha.Swipe1": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            100,
            300,
            10,
            10,
        ],
        end: [
            600,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 400,
        next: ["GachaMachine.VerifyLog"],
    },
    "GachaMachine.VerifyLog": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: ["GachaMachine.ClickGacha"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【家園歸零】已連續向右滑動歸位，並向左滑動至時光扭蛋機位置！",
                display: "log",
            },
        },
    },
    "GachaMachine.ClickGacha": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            100,
            620,
            80,
            80,
        ],
        post_delay: 1200,
        next: [
            "GachaMachine.Screen",
            "GachaMachine.Back",
        ],
    },
    "GachaMachine.Screen": {
        recognition: "OCR",
        roi: [
            0,
            0,
            720,
            350,
        ],
        expected: "扭蛋|國度|時光扭蛋",
        action: "DoNothing",
        next: ["GachaMachine.LogCount"],
    },
    "GachaMachine.LogCount": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: ["GachaMachine.Execute"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【時光扭蛋機】本次設定扭蛋次數：1 次，開始執行。",
                display: "log",
            },
        },
    },
    "GachaMachine.Execute": {
        recognition: "OCR",
        roi: [
            0,
            800,
            720,
            400,
        ],
        expected: "扭蛋1次|扭蛋 1 次|扭蛋10次|扭蛋",
        action: "Click",
        post_delay: 1500,
        next: [
            "GachaMachine.Overlay",
            "GachaMachine.Back",
        ],
    },
    "GachaMachine.Overlay": {
        recognition: "OCR",
        roi: [
            0,
            0,
            720,
            1280,
        ],
        expected: "獲得獎勵|點擊任意區域|確定",
        action: "ClickKey",
        key: 4,
        post_delay: 800,
        next: ["GachaMachine.Back"],
    },
    "GachaMachine.Back": {
        recognition: "DirectHit",
        action: "ClickKey",
        key: 4,
        post_delay: 800,
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【時光扭蛋機】完成扭蛋操作並返回家園首頁。",
                display: "log",
            },
        },
    },
    "Objectives.Bag.UseItems.Start": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: [
            "Bag.EnsureHome",
            "Bag.Nav.FromOtherTab",
            "Bag.Nav.Back",
        ],
    },
    "Bag.EnsureHome": {
        recognition: "OCR",
        roi: [
            290,
            1200,
            140,
            70,
        ],
        expected: "家園",
        threshold: 0.2,
        action: "DoNothing",
        next: ["Bag.ResetToFarRight.Swipe1"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【導航】已確認在家園首頁，開始執行背包道具使用任務。",
                display: "log",
            },
        },
    },
    "Bag.Nav.FromOtherTab": {
        recognition: "OCR",
        roi: [
            0,
            1200,
            720,
            70,
        ],
        expected: "角色|筆記|公會|世界",
        threshold: 0.2,
        action: "Click",
        target: [
            360,
            1200,
            40,
            40,
        ],
        post_delay: 800,
        next: ["Bag.EnsureHome"],
    },
    "Bag.Nav.Back": {
        max_hit: 12,
        recognition: "DirectHit",
        action: "ClickKey",
        key: 4,
        post_delay: 700,
        next: [
            "Bag.Nav.ExitDialog",
            "Bag.EnsureHome",
            "Bag.Nav.FromOtherTab",
            "Bag.Nav.Back",
        ],
    },
    "Bag.Nav.ExitDialog": {
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
        next: ["Bag.Nav.SelectHome"],
    },
    "Bag.Nav.SelectHome": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            360,
            1200,
            40,
            40,
        ],
        post_delay: 1000,
        next: ["Bag.EnsureHome"],
    },
    "Bag.ResetToFarRight.Swipe1": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["Bag.ResetToFarRight.Swipe2"],
    },
    "Bag.ResetToFarRight.Swipe2": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["Bag.ResetToFarRight.Swipe3"],
    },
    "Bag.ResetToFarRight.Swipe3": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["Bag.ResetToFarRight.Swipe4"],
    },
    "Bag.ResetToFarRight.Swipe4": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 300,
        next: ["Bag.VerifyLog"],
    },
    "Bag.VerifyLog": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: ["Bag.ClickChest"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【家園歸零】已完成連滑歸位至最右側小屋畫面！目前定位在古遺物寶箱前。",
                display: "log",
            },
        },
    },
    "Bag.ClickChest": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            100,
            700,
            60,
            60,
        ],
        post_delay: 1200,
        next: [
            "Bag.Screen",
            "Bag.Back",
        ],
    },
    "Bag.Screen": {
        recognition: "OCR",
        roi: [
            0,
            0,
            720,
            350,
        ],
        expected: "古遺物|背包|道具|全部",
        action: "DoNothing",
        next: [
            "Bag.ExecuteUse",
            "Bag.Back",
        ],
    },
    "Bag.ExecuteUse": {
        recognition: "OCR",
        roi: [
            200,
            900,
            500,
            300,
        ],
        expected: "一鍵使用|批量使用|使用|全部使用|培養",
        action: "Click",
        post_delay: 1000,
        next: ["Bag.Back"],
    },
    "Bag.Back": {
        recognition: "DirectHit",
        action: "ClickKey",
        key: 4,
        post_delay: 800,
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【背包道具】完成道具/古遺物操作並返回家園首頁。",
                display: "log",
            },
        },
    },
    "Objectives.AlchemyFurnace.Start": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: [
            "AlchemyFurnace.EnsureHome",
            "AlchemyFurnace.Nav.FromOtherTab",
            "AlchemyFurnace.Nav.Back",
        ],
    },
    "AlchemyFurnace.EnsureHome": {
        recognition: "OCR",
        roi: [
            290,
            1200,
            140,
            70,
        ],
        expected: "家園",
        threshold: 0.2,
        action: "DoNothing",
        next: ["AlchemyFurnace.ResetToFarRight.Swipe1"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【導航】已確認在家園首頁，開始執行煉金爐任務。",
                display: "log",
            },
        },
    },
    "AlchemyFurnace.Nav.FromOtherTab": {
        recognition: "OCR",
        roi: [
            0,
            1200,
            720,
            70,
        ],
        expected: "角色|筆記|公會|世界",
        threshold: 0.2,
        action: "Click",
        target: [
            360,
            1200,
            40,
            40,
        ],
        post_delay: 800,
        next: ["AlchemyFurnace.EnsureHome"],
    },
    "AlchemyFurnace.Nav.Back": {
        max_hit: 12,
        recognition: "DirectHit",
        action: "ClickKey",
        key: 4,
        post_delay: 700,
        next: [
            "AlchemyFurnace.Nav.ExitDialog",
            "AlchemyFurnace.EnsureHome",
            "AlchemyFurnace.Nav.FromOtherTab",
            "AlchemyFurnace.Nav.Back",
        ],
    },
    "AlchemyFurnace.Nav.ExitDialog": {
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
        next: ["AlchemyFurnace.SelectHome"],
    },
    "AlchemyFurnace.SelectHome": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            360,
            1200,
            40,
            40,
        ],
        post_delay: 1000,
        next: ["AlchemyFurnace.EnsureHome"],
    },
    "AlchemyFurnace.ResetToFarRight.Swipe1": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["AlchemyFurnace.ResetToFarRight.Swipe2"],
    },
    "AlchemyFurnace.ResetToFarRight.Swipe2": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["AlchemyFurnace.ResetToFarRight.Swipe3"],
    },
    "AlchemyFurnace.ResetToFarRight.Swipe3": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["AlchemyFurnace.ResetToFarRight.Swipe4"],
    },
    "AlchemyFurnace.ResetToFarRight.Swipe4": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 300,
        next: ["AlchemyFurnace.VerifyLog"],
    },
    "AlchemyFurnace.VerifyLog": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: ["AlchemyFurnace.ClickFurnace"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【家園歸零】已完成連滑歸位至最右側小屋畫面！目前定位在煉金爐前。",
                display: "log",
            },
        },
    },
    "AlchemyFurnace.ClickFurnace": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            580,
            680,
            60,
            60,
        ],
        post_delay: 1200,
        next: [
            "AlchemyFurnace.Screen",
            "AlchemyFurnace.Back",
        ],
    },
    "AlchemyFurnace.Screen": {
        recognition: "OCR",
        roi: [
            0,
            0,
            720,
            350,
        ],
        expected: "煉金|分解|合成|熔煉",
        action: "DoNothing",
        next: [
            "AlchemyFurnace.Execute",
            "AlchemyFurnace.Back",
        ],
    },
    "AlchemyFurnace.Execute": {
        recognition: "OCR",
        roi: [
            0,
            800,
            720,
            400,
        ],
        expected: "一鍵分解|分解|一鍵合成|合成|確定",
        action: "Click",
        post_delay: 1000,
        next: ["AlchemyFurnace.Back"],
    },
    "AlchemyFurnace.Back": {
        recognition: "DirectHit",
        action: "ClickKey",
        key: 4,
        post_delay: 800,
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【煉金爐】完成裝備分解與合成操作並返回家園首頁。",
                display: "log",
            },
        },
    },
};

fs.writeFileSync("resource/base/pipeline/home_rewards.json", JSON.stringify(homeRewards, null, 4), "utf8");
console.log("home_rewards.json OK");

// 2. home_shop.json
const homeShop = {
    "HomeShop.Start": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: [
            "HomeShop.EnsureHome",
            "HomeShop.Nav.FromOtherTab",
            "HomeShop.Nav.Back",
        ],
    },
    "HomeShop.EnsureHome": {
        recognition: "OCR",
        roi: [
            290,
            1200,
            140,
            70,
        ],
        expected: "家園",
        threshold: 0.2,
        action: "DoNothing",
        next: ["HomeShop.ResetToFarRight.Swipe1"],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【導航】已確認在家園首頁，開始執行商店購物任務。",
                display: "log",
            },
        },
    },
    "HomeShop.Nav.FromOtherTab": {
        recognition: "OCR",
        roi: [
            0,
            1200,
            720,
            70,
        ],
        expected: "角色|筆記|公會|世界",
        threshold: 0.2,
        action: "Click",
        target: [
            360,
            1200,
            40,
            40,
        ],
        post_delay: 800,
        next: ["HomeShop.EnsureHome"],
    },
    "HomeShop.Nav.Back": {
        max_hit: 12,
        recognition: "DirectHit",
        action: "ClickKey",
        key: 4,
        post_delay: 700,
        next: [
            "HomeShop.Nav.ExitDialog",
            "HomeShop.EnsureHome",
            "HomeShop.Nav.FromOtherTab",
            "HomeShop.Nav.Back",
        ],
    },
    "HomeShop.Nav.ExitDialog": {
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
        next: ["HomeShop.Nav.SelectHome"],
    },
    "HomeShop.Nav.SelectHome": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            360,
            1200,
            40,
            40,
        ],
        post_delay: 1000,
        next: ["HomeShop.EnsureHome"],
    },
    "HomeShop.ResetToFarRight.Swipe1": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["HomeShop.ResetToFarRight.Swipe2"],
    },
    "HomeShop.ResetToFarRight.Swipe2": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["HomeShop.ResetToFarRight.Swipe3"],
    },
    "HomeShop.ResetToFarRight.Swipe3": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 150,
        next: ["HomeShop.ResetToFarRight.Swipe4"],
    },
    "HomeShop.ResetToFarRight.Swipe4": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            600,
            300,
            10,
            10,
        ],
        end: [
            100,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 300,
        next: ["HomeShop.MoveToShop.Swipe1"],
    },
    "HomeShop.MoveToShop.Swipe1": {
        recognition: "DirectHit",
        action: "Swipe",
        begin: [
            100,
            300,
            10,
            10,
        ],
        end: [
            600,
            300,
            10,
            10,
        ],
        duration: 200,
        post_delay: 400,
        next: ["HomeShop.VerifyLog"],
    },
    "HomeShop.VerifyLog": {
        recognition: "DirectHit",
        action: "DoNothing",
        next: [
            "HomeShop.FindRedDot",
            "HomeShop.DirectClick",
        ],
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【家園歸零】已連續向右滑動歸位，並向左滑動至家園商店位置！",
                display: "log",
            },
        },
    },
    "HomeShop.FindRedDot": {
        recognition: "TemplateMatch",
        roi: [
            350,
            500,
            200,
            150,
        ],
        template: "common/red-dot.png",
        threshold: 0.7,
        action: "Click",
        target_offset: [
            -50,
            50,
            0,
            0,
        ],
        post_delay: 1200,
        next: [
            "HomeShop.Screen",
            "HomeShop.Back",
        ],
    },
    "HomeShop.DirectClick": {
        recognition: "DirectHit",
        action: "Click",
        target: [
            380,
            580,
            80,
            80,
        ],
        post_delay: 1200,
        next: [
            "HomeShop.Screen",
            "HomeShop.Back",
        ],
    },
    "HomeShop.Screen": {
        recognition: "OCR",
        roi: [
            0,
            0,
            720,
            350,
        ],
        expected: "雜貨|商會|商店",
        action: "DoNothing",
        next: [
            "HomeShop.Grocery.RoughStone",
            "HomeShop.Grocery.OrdinaryFreezeDried",
            "HomeShop.Grocery.RareTimeSand",
            "HomeShop.Grocery.BattleEssence",
            "HomeShop.Back",
        ],
    },
    "HomeShop.Grocery.RoughStone": {
        recognition: "OCR",
        roi: [
            0,
            200,
            720,
            800,
        ],
        expected: "粗糙原石",
        action: "Click",
        post_delay: 600,
        next: [
            "HomeShop.Grocery.OrdinaryFreezeDried",
            "HomeShop.Grocery.RareTimeSand",
            "HomeShop.Grocery.BattleEssence",
            "HomeShop.Back",
        ],
    },
    "HomeShop.Grocery.OrdinaryFreezeDried": {
        recognition: "OCR",
        roi: [
            0,
            200,
            720,
            800,
        ],
        expected: "普通凍乾",
        action: "Click",
        post_delay: 600,
        next: [
            "HomeShop.Grocery.RareTimeSand",
            "HomeShop.Grocery.BattleEssence",
            "HomeShop.Back",
        ],
    },
    "HomeShop.Grocery.RareTimeSand": {
        recognition: "OCR",
        roi: [
            0,
            200,
            720,
            800,
        ],
        expected: "稀有時光沙",
        action: "Click",
        post_delay: 600,
        next: [
            "HomeShop.Grocery.BattleEssence",
            "HomeShop.Back",
        ],
    },
    "HomeShop.Grocery.BattleEssence": {
        recognition: "OCR",
        roi: [
            0,
            200,
            720,
            800,
        ],
        expected: "對決精華",
        action: "Click",
        post_delay: 600,
        next: [
            "HomeShop.Back",
        ],
    },
    "HomeShop.Back": {
        recognition: "DirectHit",
        action: "ClickKey",
        key: 4,
        post_delay: 800,
        focus: {
            "Node.Recognition.Succeeded": {
                content: "【家園商店】完成商店商品購買並返回家園首頁。",
                display: "log",
            },
        },
    },
};

fs.writeFileSync("resource/base/pipeline/home_shop.json", JSON.stringify(homeShop, null, 4), "utf8");
console.log("home_shop.json OK");

// 3. guild.json
const rawGuild = JSON.parse(fs.readFileSync("resource/base/pipeline/guild.json", "utf8"));
delete rawGuild["Objectives.Guild.IdleReward.Start"]["action"];
delete rawGuild["Objectives.Guild.IdleReward.Start"]["package"];
rawGuild["Objectives.Guild.IdleReward.Start"].recognition = "DirectHit";
rawGuild["Objectives.Guild.IdleReward.Start"].action = "DoNothing";
rawGuild["Objectives.Guild.IdleReward.Start"].next = [
    "Guild.IdleReward.EnsureGuild",
    "Guild.IdleReward.Nav.FromOtherTab",
    "Guild.IdleReward.Nav.Back",
];

rawGuild["Guild.IdleReward.EnsureGuild"] = {
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
    next: [
        "Guild.IdleReward.Furnace",
    ],
    focus: {
        "Node.Recognition.Succeeded": {
            content: "【導航】已確認在公會首頁，開始領取放置熔爐收益。",
            display: "log",
        },
    },
};

rawGuild["Guild.IdleReward.Nav.FromOtherTab"] = {
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
    next: ["Guild.IdleReward.EnsureGuild"],
};

rawGuild["Guild.IdleReward.Nav.Back"] = {
    max_hit: 12,
    recognition: "DirectHit",
    action: "ClickKey",
    key: 4,
    post_delay: 700,
    next: [
        "Guild.IdleReward.Nav.ExitDialog",
        "Guild.IdleReward.EnsureGuild",
        "Guild.IdleReward.Nav.FromOtherTab",
        "Guild.IdleReward.Nav.Back",
    ],
};

rawGuild["Guild.IdleReward.Nav.ExitDialog"] = {
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
    next: ["Guild.IdleReward.Nav.SelectGuild"],
};

rawGuild["Guild.IdleReward.Nav.SelectGuild"] = {
    recognition: "DirectHit",
    action: "Click",
    target: [
        500,
        1220,
        40,
        40,
    ],
    post_delay: 1000,
    next: ["Guild.IdleReward.EnsureGuild"],
};

delete rawGuild["Objectives.Guild.Donation.Start"]["action"];
delete rawGuild["Objectives.Guild.Donation.Start"]["package"];
rawGuild["Objectives.Guild.Donation.Start"].recognition = "DirectHit";
rawGuild["Objectives.Guild.Donation.Start"].action = "DoNothing";
rawGuild["Objectives.Guild.Donation.Start"].next = [
    "Guild.Donation.EnsureGuild",
    "Guild.Donation.Nav.FromOtherTab",
    "Guild.Donation.Nav.Back",
];

rawGuild["Guild.Donation.EnsureGuild"] = {
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
    next: [
        "Guild.Screen",
    ],
    focus: {
        "Node.Recognition.Succeeded": {
            content: "【導航】已確認在公會首頁，開始執行公會捐獻任務。",
            display: "log",
        },
    },
};

rawGuild["Guild.Donation.Nav.FromOtherTab"] = {
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
    next: ["Guild.Donation.EnsureGuild"],
};

rawGuild["Guild.Donation.Nav.Back"] = {
    max_hit: 12,
    recognition: "DirectHit",
    action: "ClickKey",
    key: 4,
    post_delay: 700,
    next: [
        "Guild.Donation.Nav.ExitDialog",
        "Guild.Donation.EnsureGuild",
        "Guild.Donation.Nav.FromOtherTab",
        "Guild.Donation.Nav.Back",
    ],
};

rawGuild["Guild.Donation.Nav.ExitDialog"] = {
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
    next: ["Guild.Donation.Nav.SelectGuild"],
};

rawGuild["Guild.Donation.Nav.SelectGuild"] = {
    recognition: "DirectHit",
    action: "Click",
    target: [
        500,
        1220,
        40,
        40,
    ],
    post_delay: 1000,
    next: ["Guild.Donation.EnsureGuild"],
};

fs.writeFileSync("resource/base/pipeline/guild.json", JSON.stringify(rawGuild, null, 4), "utf8");
console.log("guild.json OK");

// 4. material_realm.json
const rawMaterial = JSON.parse(fs.readFileSync("resource/base/pipeline/material_realm.json", "utf8"));
delete rawMaterial["Objectives.MaterialRealm.Start"]["action"];
delete rawMaterial["Objectives.MaterialRealm.Start"]["package"];
rawMaterial["Objectives.MaterialRealm.Start"].recognition = "DirectHit";
rawMaterial["Objectives.MaterialRealm.Start"].action = "DoNothing";
rawMaterial["Objectives.MaterialRealm.Start"].next = [
    "MaterialRealm.EnsureNote",
    "MaterialRealm.Nav.FromOtherTab",
    "MaterialRealm.Nav.Back",
];

rawMaterial["MaterialRealm.EnsureNote"] = {
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
    next: [
        "MaterialRealm.Note.Screen",
        "MaterialRealm.Menu.Iron",
    ],
    focus: {
        "Node.Recognition.Succeeded": {
            content: "【導航】已確認在筆記主頁，開始執行素材秘境任務。",
            display: "log",
        },
    },
};

rawMaterial["MaterialRealm.Nav.FromOtherTab"] = {
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
    next: ["MaterialRealm.EnsureNote"],
};

rawMaterial["MaterialRealm.Nav.Back"] = {
    max_hit: 12,
    recognition: "DirectHit",
    action: "ClickKey",
    key: 4,
    post_delay: 700,
    next: [
        "MaterialRealm.Nav.ExitDialog",
        "MaterialRealm.EnsureNote",
        "MaterialRealm.Nav.FromOtherTab",
        "MaterialRealm.Nav.Back",
    ],
};

rawMaterial["MaterialRealm.Nav.ExitDialog"] = {
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
    next: ["MaterialRealm.Nav.SelectNote"],
};

rawMaterial["MaterialRealm.Nav.SelectNote"] = {
    recognition: "DirectHit",
    action: "Click",
    target: [
        250,
        1220,
        40,
        40,
    ],
    post_delay: 1000,
    next: ["MaterialRealm.EnsureNote"],
};

fs.writeFileSync("resource/base/pipeline/material_realm.json", JSON.stringify(rawMaterial, null, 4), "utf8");
console.log("material_realm.json OK");

// 5. commissions.json
const rawComm = JSON.parse(fs.readFileSync("resource/base/pipeline/commissions.json", "utf8"));
delete rawComm["Objectives.Commissions.Start"]["action"];
delete rawComm["Objectives.Commissions.Start"]["package"];
rawComm["Objectives.Commissions.Start"].recognition = "DirectHit";
rawComm["Objectives.Commissions.Start"].action = "DoNothing";
rawComm["Objectives.Commissions.Start"].next = [
    "Commissions.EnsureHome",
    "Commissions.Nav.FromOtherTab",
    "Commissions.Nav.Back",
];

rawComm["Commissions.EnsureHome"] = {
    recognition: "OCR",
    roi: [
        290,
        1200,
        140,
        70,
    ],
    expected: "家園",
    threshold: 0.2,
    action: "Click",
    target: [
        665,
        1005,
    ],
    post_delay: 600,
    next: ["Commissions.FunctionList.Screen"],
    focus: {
        "Node.Recognition.Succeeded": {
            content: "【導航】已確認在家園首頁，點擊右下角功能列表展開選單…",
            display: "log",
        },
    },
};

rawComm["Commissions.Nav.FromOtherTab"] = {
    recognition: "OCR",
    roi: [
        0,
        1200,
        720,
        70,
    ],
    expected: "角色|筆記|公會|世界",
    threshold: 0.2,
    action: "Click",
    target: [
        360,
        1200,
        40,
        40,
    ],
    post_delay: 800,
    next: ["Commissions.EnsureHome"],
};

rawComm["Commissions.Nav.Back"] = {
    max_hit: 12,
    recognition: "DirectHit",
    action: "ClickKey",
    key: 4,
    post_delay: 700,
    next: [
        "Commissions.Nav.ExitDialog",
        "Commissions.EnsureHome",
        "Commissions.Nav.FromOtherTab",
        "Commissions.Nav.Back",
    ],
};

rawComm["Commissions.Nav.ExitDialog"] = {
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
    next: ["Commissions.Nav.SelectHome"],
};

rawComm["Commissions.Nav.SelectHome"] = {
    recognition: "DirectHit",
    action: "Click",
    target: [
        360,
        1200,
        40,
        40,
    ],
    post_delay: 1000,
    next: ["Commissions.EnsureHome"],
};

fs.writeFileSync("resource/base/pipeline/commissions.json", JSON.stringify(rawComm, null, 4), "utf8");
console.log("commissions.json OK");

console.log("ALL PIPELINES UPDATED SUCCESSFULLY!");
