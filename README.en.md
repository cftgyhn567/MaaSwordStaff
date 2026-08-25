# Maa杖劍傳說助手

An Android ADB automation project for the Taiwan release of _杖劍傳說：坎斯汀之約_, powered by [MaaFramework](https://github.com/MaaXYZ/MaaFramework).

The project is in early development and currently targets BlueStacks 5 at a portrait resolution of 720 × 1280. Paid-currency spending, purchases, selling, and dismantling are intentionally unsupported.

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
