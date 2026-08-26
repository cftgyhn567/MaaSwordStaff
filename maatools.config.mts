const homeBottomNavigationHits = [
  'Navigation.Bottom.Note',
  'Navigation.Bottom.Home',
  'Navigation.Bottom.Guild',
  'Guild.IdleReward.FromHome',
]

const contextualRewardClaimHits = [
  'Rewards.Gifts.Claim',
  'Rewards.Daily.Claim',
  'Rewards.Weekly.Claim',
  'Rewards.Featured.Event.Claim',
]

export default {
  cwd: import.meta.dirname,
  maaVersion: 'latest',
  maaLogDir: 'debug/logs',
  interfacePath: 'interface.json',
  check: {},
  test: {
    casesCwd: 'tests/screenshots',
    cases: [
      {
        configs: {
          name: 'BlueStacks 5 直式遊戲畫面',
          resource: 'base',
          controller: 'Android',
        },
        cases: [
          {
            image: 'exploration-screen.png',
            hits: [
              'ExplorationScreen.Ready',
              'HomeRewards.ExplorationToHome',
              'Guild.IdleReward.FromExploration',
              'Rewards.Featured.List.RedDot',
            ],
          },
          {
            image: 'guild-channel.png',
            hits: [
              'GuildChannel.BackToGame',
              'HomeRewards.GuildToHome',
              'Guild.IdleReward.FromChannel',
            ],
          },
          {
            image: 'home-screen.png',
            hits: [
              'HomeScreen.Ready',
              'Home.NavigateCart',
              'Home.IdleBedReady',
              'HomeRewards.HomeReady',
              'Rewards.Featured.List.RedDot',
              ...homeBottomNavigationHits,
            ],
          },
          {
            image: 'home-bed-ready-middle.png',
            hits: [
              'HomeScreen.Ready',
              'Home.NavigateCart',
              'Home.IdleBedReady',
              'HomeRewards.HomeReady',
              'Rewards.Featured.List.RedDot',
              ...homeBottomNavigationHits,
            ],
          },
          {
            image: 'home-bed-ready-rightmost.png',
            hits: [
              'HomeScreen.Ready',
              'Home.NavigateCart',
              'Home.IdleBedReady',
              'HomeRewards.HomeReady',
              'Rewards.Featured.List.RedDot',
              ...homeBottomNavigationHits,
            ],
          },
          {
            image: 'home-center-navigators-night.png',
            hits: [
              'HomeScreen.Ready',
              'Home.NavigateBed',
              'Home.NavigateCart',
              'HomeRewards.HomeReady',
              'Rewards.Featured.List.RedDot',
              ...homeBottomNavigationHits,
            ],
          },
          {
            image: 'home-bed-claimed-default-night.png',
            hits: [
              'HomeScreen.Ready',
              'Home.NavigateCart',
              'HomeRewards.HomeReady',
              ...homeBottomNavigationHits,
            ],
          },
          {
            image: 'home-cart-ready-default-night.png',
            hits: [
              'HomeScreen.Ready',
              'Home.IdleCartReady',
              'HomeRewards.HomeReady',
              ...homeBottomNavigationHits,
            ],
          },
          {
            image: 'cart-reward-overlay-default-night.png',
            hits: [
              'HomeScreen.Ready',
              'Home.RewardOverlayClose',
              'HomeRewards.HomeReady',
              ...homeBottomNavigationHits,
            ],
          },
          {
            image: 'home-cart-claimed-default-night.png',
            hits: [
              'HomeScreen.Ready',
              'HomeRewards.HomeReady',
              ...homeBottomNavigationHits,
            ],
          },
          {
            image: 'home-shop-grocery-top-refreshed.png',
            hits: [
              'HomeShop.Screen',
              'HomeShop.Grocery.RoughStone',
              'HomeShop.Grocery.RareTimeSand',
              'HomeShop.Grocery.BattleEssence',
              'HomeShop.Grocery.OrdinaryFreezeDried',
            ],
          },
          {
            image: 'home-navigation-night.png',
            hits: [
              'HomeScreen.Ready',
              'Home.NavigateBed',
              'HomeRewards.HomeReady',
              'Rewards.Featured.List.RedDot',
              ...homeBottomNavigationHits,
            ],
          },
          {
            image: 'note-menu.png',
            hits: [
              'Note.Screen',
              'Note.DailyDungeon',
              'Note.BondAdventure',
              'Note.MapExplore',
              'Note.Arena',
              'Note.DailyActivities',
              'Note.MaterialRealm',
              'Note.WeeklyActivities',
              'Navigation.Bottom.Guild',
            ],
          },
          {
            image: 'guild-screen-night.png',
            hits: [
              'GuildScreen.Ready',
              'Guild.Screen',
              'Guild.IdleReward.Furnace',
              'Navigation.Bottom.Note',
            ],
          },
          {
            image: 'guild-screen-morning.png',
            hits: [
              'GuildScreen.Ready',
              'Guild.Screen',
              'Guild.IdleReward.Furnace',
              'Navigation.Bottom.Note',
            ],
          },
          {
            image: 'guild-lobby.png',
            hits: [
              'Guild.Lobby.Screen',
              'Guild.Donation.Enter',
              'Guild.IdleReward.FromLobby',
            ],
          },
          {
            image: 'guild-donation.png',
            hits: [
              'Guild.Donation.Screen',
              'Guild.Donation.NeedMore',
              'Rewards.Featured.Event.RedDot',
            ],
          },
          {
            image: 'exit-game-dialog.png',
            hits: ['Navigation.Root.Recovery.ExitDialog'],
          },
          {
            image: 'phantom-realm-entry.png',
            hits: [
              'PhantomRealm.EntryScreen',
              'PhantomRealm.TodayWaveCount',
              'PhantomRealm.GoToMap',
              'PhantomRealm.Match',
            ],
          },
          {
            image: 'material-realm-menu.png',
            hits: [
              'MaterialRealm.Menu.Iron',
              'MaterialRealm.Menu.Gold',
              'MaterialRealm.Menu.Monster',
              'MaterialRealm.Menu.Sand',
              'MaterialRealm.Iron.Enter',
              'MaterialRealm.Gold.Enter',
              'MaterialRealm.Monster.Enter',
              'MaterialRealm.Sand.Enter',
              'HomeShop.Grocery.RoughStone',
            ],
          },
          {
            image: 'material-realm-iron.png',
            hits: [
              'MaterialRealm.Iron.Detail',
              'MaterialRealm.Iron.DetailAfterPurchase',
              'MaterialRealm.Iron.DetailAfterMine',
              'MaterialRealm.Iron.Quick.On',
            ],
          },
          {
            image: 'material-realm-buy-dialog.png',
            hits: [
              'MaterialRealm.Iron.Purchase.Dialog',
              'MaterialRealm.Iron.Purchase.Available',
              'MaterialRealm.Iron.Purchase.DialogAfter',
              'MaterialRealm.Iron.Purchase.Confirm',
              'MaterialRealm.Gold.Purchase.Dialog',
              'MaterialRealm.Gold.Purchase.Available',
              'MaterialRealm.Gold.Purchase.DialogAfter',
              'MaterialRealm.Gold.Purchase.Confirm',
              'MaterialRealm.Monster.Purchase.Dialog',
              'MaterialRealm.Monster.Purchase.Available',
              'MaterialRealm.Monster.Purchase.DialogAfter',
              'MaterialRealm.Monster.Purchase.Confirm',
              'MaterialRealm.Sand.Purchase.Dialog',
              'MaterialRealm.Sand.Purchase.Available',
              'MaterialRealm.Sand.Purchase.DialogAfter',
              'MaterialRealm.Sand.Purchase.Confirm',
            ],
          },
          {
            image: 'material-realm-gold-buy-dialog-current.png',
            hits: [
              'MaterialRealm.Iron.Purchase.Available',
              'MaterialRealm.Iron.Purchase.Confirm',
              'MaterialRealm.Gold.Purchase.Dialog',
              'MaterialRealm.Gold.Purchase.Available',
              'MaterialRealm.Gold.Purchase.DialogAfter',
              'MaterialRealm.Gold.Purchase.Confirm',
              'MaterialRealm.Monster.Purchase.Dialog',
              'MaterialRealm.Monster.Purchase.Available',
              'MaterialRealm.Monster.Purchase.DialogAfter',
              'MaterialRealm.Monster.Purchase.Confirm',
              'MaterialRealm.Sand.Purchase.Dialog',
              'MaterialRealm.Sand.Purchase.Available',
              'MaterialRealm.Sand.Purchase.DialogAfter',
              'MaterialRealm.Sand.Purchase.Confirm',
            ],
          },
          {
            image: 'task-commission.png',
            hits: [
              'Rewards.Commissions.Screen',
              'Rewards.Commissions.Count.0',
              'Commissions.Screen',
              'Commissions.Count.0',
            ],
          },
          {
            image: 'function-list.png',
            hits: [
              'Rewards.FunctionList.Screen',
              'Rewards.FunctionList.ForGift',
              'Rewards.FunctionList.ForTasks',
              'Rewards.FunctionList.ForShop',
              'Rewards.FunctionList.BackHome',
              'Rewards.Featured.List.RedDot',
              'Rewards.Featured.Event.RedDot',
            ],
          },
          {
            image: 'gift-overview.png',
            hits: [
              'Rewards.Gifts.Screen',
              ...contextualRewardClaimHits,
              'Rewards.Featured.Event.RedDot',
            ],
          },
          {
            image: 'daily-tasks.png',
            hits: [
              'Rewards.Daily.Screen',
              ...contextualRewardClaimHits,
              'Rewards.Featured.Event.RedDot',
              'Note.Arena',
            ],
          },
          {
            image: 'weekly-tasks.png',
            hits: [
              'Rewards.Weekly.Screen',
              ...contextualRewardClaimHits,
              'Rewards.Featured.Event.RedDot',
              'HomeShop.Screen',
            ],
          },
          {
            image: 'fund-rewards.png',
            hits: [
              'Rewards.Funds.RedDot',
              'Rewards.Featured.Season.Pass.RedDot',
            ],
          },
          {
            image: 'daily-offer.png',
            hits: ['Rewards.DailyOffer.Screen', 'Rewards.DailyOffer.Gift'],
          },
          {
            image: 'weekly-offer.png',
            hits: [
              'Rewards.WeeklySelection.Screen',
              'Rewards.WeeklySelection.Gift',
            ],
          },
          {
            image: 'monthly-card.png',
            hits: ['Rewards.Monthly.Screen'],
          },
          {
            image: 'featured-activities.png',
            hits: [
              'Rewards.Featured.List',
              'Rewards.Featured.List.RedDot',
              'Rewards.Featured.Event.RedDot',
            ],
          },
          {
            image: 'lucky-scratch.png',
            hits: [
              'Rewards.Featured.Event.RedDot',
              'Rewards.Featured.Event.Back',
            ],
          },
          {
            image: 'lucky-scratch-tasks.png',
            hits: [
              'Rewards.Featured.Event.AllClaim',
              ...contextualRewardClaimHits,
              'Rewards.Featured.Event.RedDot',
            ],
          },
          {
            image: 'treasure-battle.png',
            hits: [
              ...contextualRewardClaimHits,
              'Rewards.Featured.Event.RedDot',
            ],
          },
          {
            image: 'season-pass.png',
            hits: [
              'Rewards.Featured.Season.Goals.Open',
              'Rewards.Featured.Season.Pass.RedDot',
              'Rewards.Featured.Season.Pass.Back',
              'Rewards.Funds.RedDot',
            ],
          },
          {
            image: 'season-goals.png',
            hits: ['Rewards.Featured.Season.Pass.Open'],
          },
          {
            image: 'season-pass-claimed.png',
            hits: [
              'Rewards.Featured.Season.Goals.Open',
              'Rewards.Featured.Season.Pass.Back',
            ],
          },
          {
            image: 'login-announcement-screen.png',
            hits: ['Startup.AnnouncementOverlay'],
          },
          {
            image: 'login-after-announcement.png',
            hits: [
              'Startup.LoginScreenByServerMenu',
              'Startup.LoginScreenByClickText',
              'MaterialRealm.Iron.Quick.On',
            ],
          },
        ],
      },
    ],
  },
}
