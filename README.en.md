# Maa杖劍傳說助手

An Android ADB automation project for the Taiwan release of _杖劍傳說：坎斯汀之約_, powered by [MaaFramework](https://github.com/MaaXYZ/MaaFramework).

> [!WARNING]
> Connectivity has only been tested with the developer's local BlueStacks 5 instance. Support for other emulators has not been verified, and ADB must be enabled in the emulator before use.
>
> Game updates, display scaling, language, and account progression can affect recognition. Some workflows have not been verified against every account state, so test tasks individually and monitor the execution log on first use.

## Development

The project entry configuration is `interface.json`; tasks live in `tasks/` and Pipeline resources live in `resource/base/`.

The current interface imports 23 public tasks and three presets. See the [project knowledge base](./docs/README.md) for the architecture, task status, validation workflow, release process, and troubleshooting notes.

Install dependencies and run the regular development checks:

```bash
pnpm install
pnpm check
pnpm check:py
pnpm audit:pipeline
```

`pnpm sync:runtime` and `pnpm build:mxu` are release preparation steps; follow the [release guide](./docs/release.md) when packaging.

`QuickDaily` and `ClaimOnly` currently both contain only `ClaimAllRewards`; that root presently ends after collecting the Home bed and cart rewards and does not launch the game. `DailyFull` adds all 23 tasks and can perform purchases, pulls, item use, dismantling, and healing, so review every option before running it.

The offline regression suite uses redacted screenshots. A passing recognition test does not prove ADB connectivity, input, or an end-to-end game result.

## Release

This project uses a patched MXU build pinned to `v2.4.5`. When no MirrorChyan RID is configured, it checks, downloads, and installs updates directly from GitHub Releases. See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for the patch and reproducible build instructions.

Pushing a tag such as `v1.0.0` triggers validation, builds the custom MXU, and creates release packages for every supported platform. Keep the generated `*-MXU` assets attached to the GitHub Release so later versions can select the correct operating system and architecture automatically.

Chinese documentation: [README.md](./README.md)
