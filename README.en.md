# Maa杖劍傳說助手

An Android ADB automation project for the Taiwan release of _杖劍傳說：坎斯汀之約_, powered by [MaaFramework](https://github.com/MaaXYZ/MaaFramework).

> [!WARNING]
> Connectivity has only been tested with the developer's local BlueStacks 5 instance. Support for other emulators has not been verified, and ADB must be enabled in the emulator before use.
>
> Game updates, display scaling, language, and account progression can affect recognition. Some workflows have not been verified against every account state, so test tasks individually and monitor the execution log on first use.

## Development

The project entry configuration is `interface.json`; tasks live in `tasks/` and Pipeline resources live in `resource/base/`.

Install dependencies and run the complete validation suite:

```bash
pnpm install
pnpm sync:runtime
pnpm build:mxu
pnpm check
```

Two tasks are currently available:

- **Startup and screen recognition test** launches the game and recognizes the exploration, home, or guild-channel screen.
- **Collect home idle rewards** returns to Home, then handles the bed's blue-star reward and the cart's yellow-item reward. The cart reward overlay is closed with Android Back.

The Home workflow recognizes only stable UI prompts and text. It does not use scenery or background colors for positioning, so morning, noon, dusk, and night palettes do not affect its decisions. Missing or already-collected rewards are safely skipped after a short search without swiping the scene or clicking fixed coordinates.

The regression suite currently includes the default nighttime scenery and retained screenshots from earlier scenery variants. Player names and chat content are redacted from test assets.

## Release

This project uses a patched MXU build pinned to `v2.4.5`. When no MirrorChyan RID is configured, it checks, downloads, and installs updates directly from GitHub Releases. See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for the patch and reproducible build instructions.

Pushing a tag such as `v1.0.0` triggers validation, builds the custom MXU, and creates release packages for every supported platform. Keep the generated `*-MXU` assets attached to the GitHub Release so later versions can select the correct operating system and architecture automatically.

Chinese documentation: [README.md](./README.md)
