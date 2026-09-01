# 任務參考

本文件對應目前 checkout 的 `interface.json`、`tasks/*.json` 與 `resource/base/pipeline/*.json`。共 **23 個公開任務**、**3 個 preset**。

「狀態」欄的用語定義：

- **已實機驗證**：在測試帳號上實跑過，並以畫面上的計數、按鈕狀態或結果畫面確認。日期與裝置記在 [實機紀錄](./reward-task-catalog.md)。
- **流程完整、未完整回歸**：Pipeline 有完整分支與停止條件，但沒有跑完所有狀態組合（例如次數用盡、資源不足、活動未開放）。
- **部分串接**：部分子流程存在，但公開 root 尚未把介面描述中的完整流程串起來。
- **骨架**：只做導航與日誌，沒有真正執行遊戲行為，不可視為功能可用。

## 一覽

| 群組  | 任務                          | Label              | Entry                                            | Pipeline                 | 狀態                                          |
| ----- | ----------------------------- | ------------------ | ------------------------------------------------ | ------------------------ | --------------------------------------------- |
| Home  | `SakuraBeastBonding`          | 幻獸結緣           | `Objectives.SakuraTree.BeastBonding.Start`       | `home_facilities.json`   | 已實機驗證                                    |
| Home  | `GoddessStatuePrayer`         | 女神像祈願         | `Objectives.GoddessStatue.Prayer.Start`          | `home_facilities.json`   | 已實機驗證                                    |
| Home  | `TimeGachaMachine`            | 時光扭蛋機         | `Objectives.GachaMachine.Start`                  | `home_facilities.json`   | 已實機驗證                                    |
| Home  | `HomeShopPurchase`            | 商店購物           | `HomeShop.Start`                                 | `home_facilities.json`   | 已實機驗證（刷新次數用盡的反應未驗證）        |
| Home  | `HomeNpcGifts`                | 家園禮物領取       | `Objectives.HomeGifts.Start`                     | `home_facilities.json`   | 已實機驗證                                    |
| Home  | `BagUseItems`                 | 背包道具一鍵使用   | `Objectives.Bag.UseItems.Start`                  | `home_facilities.json`   | 已實機驗證                                    |
| Home  | `AlchemyFurnace`              | 煉金爐             | `Objectives.AlchemyFurnace.Start`                | `home_facilities.json`   | 流程完整、未完整回歸（多輪分解未跑滿）        |
| Guild | `GuildIdleReward`             | 公會放置獎勵       | `Objectives.Guild.IdleReward.Start`              | `guild_facilities.json`  | 已實機驗證                                    |
| Guild | `GuildDonation`               | 公會捐贈           | `Objectives.Guild.Donation.Start`                | `guild_facilities.json`  | 已實機驗證                                    |
| Guild | `GuildRaid`                   | 公會討伐           | `Objectives.Guild.Raid.Start`                    | `guild_facilities.json`  | 已實機驗證                                    |
| Guild | `GuildShopPurchase`           | 公會商店購買       | `Objectives.Guild.Shop.Start`                    | `guild_facilities.json`  | 已實機驗證                                    |
| Guild | `GuildForge`                  | 冶煉工坊熔爐       | `Objectives.Guild.Forge.Start`                   | `guild_facilities.json`  | 已實機驗證                                    |
| Note  | `DailyDungeon`                | 日常副本           | `Objectives.Daily.Dungeon1.Start`                | `daily_dungeon.json`     | 已實機驗證（購買領獎次數未實測）              |
| Note  | `ArenaChallenge`              | 競技場挑戰         | `Objectives.Daily.Arena1.Start`                  | `arena.json`             | 已實機驗證（購買競技券未實測）                |
| Note  | `BeastTrial`                  | 聖獸試煉           | `Objectives.Daily.BeastTrialReward1.Start`       | `beast_trial.json`       | 已實機驗證                                    |
| Note  | `PhantomRealm`                | 雙影幻境           | `Objectives.Daily.PhantomRealmWave3.Start`       | `phantom_realm.json`     | 流程完整、未完整回歸（帳號戰力打不到第 3 波） |
| Note  | `MaterialRealm`               | 素材秘境           | `Objectives.MaterialRealm.Start`                 | `material_realm.json`    | 已實機驗證                                    |
| Note  | `MapExploreClaim`             | 地圖探索領取       | `Objectives.MapExplore.Claim.Start`              | `map_explore.json`       | 已實機驗證                                    |
| Note  | `BondAdventureScenicDispatch` | 羈絆冒險／奇景委派 | `Objectives.BondAdventureScenicDispatch.Start`   | `bond_adventure.json`    | 已實機驗證                                    |
| Map   | `ExploreFate`                 | 探尋／探索命運     | `Objectives.Pilgrimage.Daily.ExploreFate3.Start` | `objective_catalog.json` | **骨架**：只導航到世界主頁並記錄日誌          |
| Map   | `ConsumeStamina`              | 消耗體力           | `Objectives.ConsumeStamina.Start`                | `objective_catalog.json` | **骨架**：`DoNothing` ＋ 日誌                 |
| Other | `Commissions`                 | 委託任務           | `Objectives.Commissions.Start`                   | `commissions.json`       | 流程完整、未完整回歸                          |
| Other | `ClaimAllRewards`             | 領取所有獎勵       | `Rewards.All.Start`                              | `reward_claims.json`     | **部分串接**：目前只執行家園床／推車          |

`tasks/startup.json` 的 `StartupProbe`（entry `Startup.Start`）**沒有被 `interface.json` import**，因此不是公開任務，preset 也不會靠它啟動遊戲。要啟用必須先加入 `interface.json#import` 並實機驗證。

`reward_claims.json` 雖然已有好友、餽贈、日／周／委託、巡禮、基金、饋禮、月卡與精彩活動等內部節點，但 `Rewards.All.Start` 目前只進入 `HomeRewards.Start`，且 `HomeRewards.Done` 沒有接回 `Rewards.FunctionList.Start`。在修正與實機驗證前，不能把 `ClaimAllRewards` 的完整介面說明當成已實作。

## 消耗資源對照

實機測試前先看這張表。「否」代表照預設值執行不花費貨幣，但仍可能改變帳號狀態（領獎、分解、組隊）。

| 任務                            | 預設是否消耗資源                                                                       | 開啟後會消耗什麼                                     |
| ------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `SakuraBeastBonding`            | **會**（預設 10 次）                                                                   | 結緣所需道具／貨幣                                   |
| `GoddessStatuePrayer`           | **會**（預設友情祈願 2 次）                                                            | 對應祈願池的貨幣                                     |
| `TimeGachaMachine`              | **會**（預設 2 次）                                                                    | 扭蛋代幣                                             |
| `HomeShopPurchase`              | **會**（粗煉石 7 折、時之沙 8 折、歷戰精華 9 折、凍乾 6 折、木材／石塊／其他不限折數） | 金幣；寶庫與特賣預設不買、刷新預設 0 次              |
| `HomeNpcGifts`                  | 否                                                                                     | —                                                    |
| `BagUseItems`                   | **會**（預設最多 6 輪一鍵使用）                                                        | 符合遊戲一鍵使用規則的背包道具                       |
| `AlchemyFurnace`                | 否（不花貨幣，但會銷毀裝備）                                                           | 裝備、幻獸／古遺物碎片                               |
| `GuildIdleReward`               | 否                                                                                     | —                                                    |
| `GuildDonation`                 | **會**（預設 1 次，第 1 次免費）                                                       | 第 2 次起消耗晨星（20 → 50 遞增）                    |
| `GuildRaid`                     | 否（每日 2 次免費）                                                                    | —                                                    |
| `GuildShopPurchase`             | 否（全部不購買）                                                                       | 公會幣                                               |
| `GuildForge`                    | 否（`Days0` 不租借）                                                                   | 黃金 150 晨星／結晶 450 晨星（黑鐵免費）             |
| `DailyDungeon`                  | **會**（預設挑戰 4 次；購買領獎次數 0）                                                | 每日領獎次數／體力；購買次數花晨星；重傷時可能用料理 |
| `ArenaChallenge`                | **會**（預設用完剩餘挑戰次數；購券 0、商店全不買）                                     | 競技挑戰次數；購券花晨星；商店花決鬥幣               |
| `BeastTrial`                    | 否                                                                                     | 戰敗重傷時會用料理一鍵治療                           |
| `PhantomRealm`                  | 否                                                                                     | 同上                                                 |
| `MaterialRealm`                 | 否（四洞購買 0、採集 0）                                                               | 購買每次 60 晨星；採集消耗體力                       |
| `MapExploreClaim`               | 否                                                                                     | —                                                    |
| `BondAdventureScenicDispatch`   | 否（每日 4 次免費）                                                                    | —                                                    |
| `ExploreFate`、`ConsumeStamina` | 否（骨架）                                                                             | —                                                    |
| `Commissions`                   | 否（額外次數預設關閉）                                                                 | 開啟額外次數會扣資源，但缺樣本，仍在免費上限停止     |
| `ClaimAllRewards`               | 否（目前只領家園床／推車）                                                             | 其他領獎子流程尚未接到公開 root                      |

## 選項明細

選項定義在對應 `tasks/*.json#option`，由 MXU 轉成 `pipeline_override`。以下列出名稱、型別與**預設值**。

### 家園商店 `HomeShopPurchase`（`tasks/home_shop.json`）

折數類選項的 12 個 case 一致：`Discount10`～`Discount90`（N 折以下）、`Unlimited`（不限折數，但仍需有折扣標籤）、`Always`（含原價一律購買，改走 `DirectHit` 不看折數）、`Never`（不購買）。

| 選項                                          | 預設               |
| --------------------------------------------- | ------------------ |
| `HomeShopRefreshLimit`（`Limit0`～`Limit10`） | `Limit0`（不刷新） |
| `HomeShopGroceryWood`                         | `Unlimited`        |
| `HomeShopGroceryStoneBlock`                   | `Unlimited`        |
| `HomeShopGroceryRoughStone`                   | `Discount70`       |
| `HomeShopGroceryRareTimeSand`                 | `Discount80`       |
| `HomeShopGroceryBattleEssence`                | `Discount90`       |
| `HomeShopGroceryOrdinaryFreezeDried`          | `Discount60`       |
| `HomeShopGroceryOther`                        | `Unlimited`        |
| `HomeShopVaultSlot1`～`HomeShopVaultSlot9`    | 全部 `Never`       |
| `HomeShopSpecialSale`                         | `Never`            |

雜貨品項靠 `resource/base/image/home_shop/` 的六個圖示模板判定，**門檻必須 ≥ 0.85**（實測木材模板比對石塊會拿到 0.674）；六種都比不中即歸類為「其他」。

### 家園其他任務（`tasks/gameplay_objectives.json`）

| 任務                  | 選項                        | 型別                                    | 預設             |
| --------------------- | --------------------------- | --------------------------------------- | ---------------- |
| `SakuraBeastBonding`  | `SakuraBeastBondCount`      | input 0～9999                           | `10`             |
|                       | `SakuraBeastBondDeduct`     | switch                                  | `Yes`            |
| `GoddessStatuePrayer` | `GoddessStatuePool`         | select `Friendship`/`Normal`/`Advanced` | `Friendship`     |
|                       | `GoddessStatuePrayerCount`  | input 0～9999                           | `2`              |
|                       | `GoddessStatuePrayerDeduct` | switch                                  | `Yes`            |
| `TimeGachaMachine`    | `TimeGachaRealm`            | select `Keep` ＋ 12 個國度              | `Keep`（不切換） |
|                       | `TimeGachaCount`            | input 0～9999                           | `2`              |
|                       | `TimeGachaDeduct`           | switch                                  | `Yes`            |
| `AlchemyFurnace`      | `AlchemyExcludeHighPower`   | select `Enabled`/`Disabled`             | `Enabled`        |
|                       | `AlchemyDecomposeRounds`    | select `Rounds1`～`Rounds12`            | `Rounds8`        |
| `BagUseItems`         | `BagUseAllRounds`           | select `Rounds1`～`Rounds10`            | `Rounds6`        |

`Deduct` 對應 `PullByCount` 的 `deduct_done`：`Yes` 表示輸入值是「今日累計目標」，會先扣掉畫面上已完成的次數；`No` 表示「本次要抽幾次」。

### 筆記與地圖（`tasks/gameplay_objectives.json`）

| 任務             | 選項                                            | 型別                                       | 預設           |
| ---------------- | ----------------------------------------------- | ------------------------------------------ | -------------- |
| `DailyDungeon`   | `DailyDungeonTarget`                            | select `Slot1`～`Slot3`                    | `Slot3`        |
|                  | `DailyDungeonBattleCount`                       | select `Count0`～`Count6`                  | `Count4`       |
|                  | `DailyDungeonPurchaseCount`                     | select `Count0`～`Count2`                  | `Count0`       |
| `ArenaChallenge` | `ArenaTicketPurchaseCount`                      | select `Count0`～`Count8`                  | `Count0`       |
|                  | `ArenaBattleCount`                              | select `All`/`Count0`/`1`/`2`/`3`/`5`/`10` | `All`          |
|                  | `ArenaShopItem1`～`ArenaShopItem9`              | select `Never`/`Once`/`ToLimit`            | 全部 `Never`   |
| `BeastTrial`     | `BeastTrialRunCount`                            | select `Count0`～`Count3`                  | `Count1`       |
|                  | `BeastTrialParty`                               | select `FillPartners`/`KeepCurrent`        | `FillPartners` |
| `PhantomRealm`   | `PhantomRunCount`                               | select `Count0`～`Count3`                  | `Count1`       |
|                  | `PhantomParty`                                  | select `FillPartners`/`KeepCurrent`        | `FillPartners` |
| `MaterialRealm`  | `Material{Iron,Gold,Monster,Sand}PurchaseCount` | select `Buy0`～`Buy20`                     | 全部 `Buy0`    |
|                  | `Material{…}QuickMining`                        | switch                                     | 全部 `Yes`     |
|                  | `Material{…}MiningCount`                        | input 0～999                               | 全部 `0`       |

`MapExploreClaim`、`ExploreFate`、`ConsumeStamina`、`BondAdventureScenicDispatch` 沒有選項。

`FillPartners` 只邀請遊戲內「夥伴」分頁的 AI 夥伴，**不會邀請其他玩家**。若日後改成玩家分頁或配對，必須重新取得使用者授權。

### 公會（`tasks/guild.json`）

| 任務                | 選項                                | 型別                            | 預設                 |
| ------------------- | ----------------------------------- | ------------------------------- | -------------------- |
| `GuildDonation`     | `GuildDonationCount`                | input 0～5                      | `1`                  |
|                     | `GuildDonationDeduct`               | switch                          | `Yes`                |
| `GuildRaid`         | `GuildRaidCount`                    | select `Count0`～`Count2`       | `Count2`             |
| `GuildShopPurchase` | `GuildShopItem1`～`GuildShopItem11` | select `Never`/`Once`/`ToLimit` | 全部 `Never`         |
| `GuildForge`        | `GuildForgeType`                    | select `Iron`/`Gold`/`Crystal`  | `Iron`（黑鐵，免費） |
|                     | `GuildForgeRentDays`                | select `Days0`～`Days7`         | `Days0`（不租借）    |

`GuildIdleReward` 沒有選項。

### 委託與統一領獎

`Commissions` 與 `ClaimAllRewards` 共用同兩個選項（`ClaimAllRewards` 內部也有委託節點）：

| 選項                         | 型別        | 預設 |
| ---------------------------- | ----------- | ---- |
| `CommissionSubmitCount`      | input 0～99 | `4`  |
| `CommissionUseExtraAttempts` | switch      | `No` |

即使把 `CommissionUseExtraAttempts` 設為 `Yes`，目前仍缺少「今日剩餘 `0/4` 之後的額外次數確認畫面」樣本，Pipeline 應在免費上限安全停止，不可扣資源。

注意：`ClaimAllRewards` 目前不會走到內部委託節點，所以這兩個選項對公開 root 的現行床／推車流程沒有實際影響。

## Preset

Preset 定義在 `tasks/preset/*.json`。**Preset 只是「一次加入哪些任務」的清單，不會把它們串成單一 Pipeline**；每個任務仍各自提交、各自成功或失敗。

| Preset       | Label    | 內容                                                                     |
| ------------ | -------- | ------------------------------------------------------------------------ |
| `QuickDaily` | 快速日常 | 只有 `ClaimAllRewards`                                                   |
| `ClaimOnly`  | 只領獎勵 | 只有 `ClaimAllRewards`（目前與 `QuickDaily` 內容相同，只有說明文字不同） |
| `DailyFull`  | 完整日常 | 全部 23 個任務                                                           |

`QuickDaily` 與 `ClaimOnly` 目前都只會執行 `ClaimAllRewards` 的家園床／推車段落，不會自動啟動遊戲，也不會進入尚未串接的其他領獎子流程。

`DailyFull` 的執行順序為 家園 → 公會 → 筆記 → 地圖 → 其他，`ClaimAllRewards` 排最後：

```text
SakuraBeastBonding → HomeNpcGifts → GoddessStatuePrayer → TimeGachaMachine →
HomeShopPurchase → BagUseItems → AlchemyFurnace(ExcludeHighPower=Enabled) →
GuildIdleReward → GuildDonation → GuildRaid → GuildShopPurchase → GuildForge →
DailyDungeon → ArenaChallenge → BeastTrial → PhantomRealm →
MaterialRealm(四洞購買 0、採集 0、快速開採 Yes) → BondAdventureScenicDispatch →
MapExploreClaim → ExploreFate → ConsumeStamina →
Commissions(最多 4、不用額外次數) → ClaimAllRewards(最多 4、不用額外次數)
```

`DailyFull` 包含兩個骨架任務（`ExploreFate`、`ConsumeStamina`）與數個尚未完整回歸的任務，而且會照各任務預設值消耗資源（祈願、扭蛋、結緣、家園商店雜貨、公會捐贈第 1 次）。「preset 可載入」不等於「整套已驗證可用」。

## 新增或修改任務時

流程見 [開發與驗證](./development.md) 的「新增公開任務的最小清單」。任何會改變本文件表格的變更——新增／移除／改名任務、改 entry、改預設值、改 preset 內容——都必須同步更新這份文件。
