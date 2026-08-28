# Maa杖劍傳說助手

An Android ADB automation project for the Taiwan release of _杖劍傳說：坎斯汀之約_, powered by [MaaFramework](https://github.com/MaaXYZ/MaaFramework).

> [!WARNING]
> Connectivity has only been tested with the developer's local BlueStacks 5 instance. Support for other emulators has not been verified, and ADB must be enabled in the emulator before use.
>
> Tasks currently exist only as UI entries and definitions. Their execution flows and recognition conditions are all non-functional and must not be considered usable automation.

## Development

The project entry configuration is `interface.json`; tasks live in `tasks/` and Pipeline resources live in `resource/base/`.

Install dependencies and run the complete validation suite:

```bash
pnpm install
pnpm check
```

Two tasks are currently available:

- **Startup and screen recognition test** launches the game and recognizes the exploration, home, or guild-channel screen.
- **Collect home idle rewards** returns to Home, then handles the bed's blue-star reward and the cart's yellow-item reward. The cart reward overlay is closed with Android Back.

The Home workflow recognizes only stable UI prompts and text. It does not use scenery or background colors for positioning, so morning, noon, dusk, and night palettes do not affect its decisions. Missing or already-collected rewards are safely skipped after a short search without swiping the scene or clicking fixed coordinates.

The regression suite currently includes the default nighttime scenery and retained screenshots from earlier scenery variants. Player names and chat content are redacted from test assets.

## Release

Pushing a tag such as `v0.1.0` triggers validation and an MFAAvalonia release build.

Chinese documentation: [README.md](./README.md)
