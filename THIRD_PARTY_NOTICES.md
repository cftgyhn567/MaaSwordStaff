# Third-party notices

## MXU

Release packages include a modified build of [MXU](https://github.com/MistEO/MXU), licensed under the GNU Affero General Public License v3.0.

- Upstream version: `v2.4.5`
- Upstream commit: `115fcb39d75718f8bd53e76511322660b8af00ec`
- Corresponding source: [MaaSwordStaff on GitHub](https://github.com/cftgyhn567/MaaSwordStaff)
- Local changes: [`patches/mxu/github-only-v2.4.5.patch`](https://github.com/cftgyhn567/MaaSwordStaff/blob/master/patches/mxu/github-only-v2.4.5.patch)
- Reproducible builder: [`tools/build-custom-mxu.mjs`](https://github.com/cftgyhn567/MaaSwordStaff/blob/master/tools/build-custom-mxu.mjs), invoked with `pnpm build:mxu`

The reproducible builder also pins security-fixed, semver-compatible frontend build dependencies and rejects high-severity audit findings before compiling MXU.

The packaged MXU license is provided as `LICENSE-MXU-AGPL-3.0.txt`. MaaSwordStaff project files remain licensed under the repository's MIT license.
