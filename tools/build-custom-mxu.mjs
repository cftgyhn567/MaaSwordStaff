import {spawnSync} from "node:child_process";
import {
    chmodSync,
    copyFileSync,
    cpSync,
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import {homedir, tmpdir} from "node:os";
import {delimiter, join, resolve} from "node:path";

const MXU_REPOSITORY = "https://github.com/MistEO/MXU.git";
const MXU_TAG = "v2.4.5";
const MXU_COMMIT = "115fcb39d75718f8bd53e76511322660b8af00ec";
const MXU_CUSTOM_VERSION = "2.4.5-github-only.2";
const MXU_PATCH = resolve("patches/mxu/github-only-v2.4.5.patch");
const auditOnly = process.argv.includes("--audit-only");
const skipAudit = process.env.SKIP_MXU_AUDIT === "1";

const runtimePlatform = detectRuntimePlatform();
const targetTriple = targetTripleFor(runtimePlatform);
const workRoot = mkdtempSync(join(tmpdir(), "maa-sword-staff-mxu-"));
const sourceRoot = join(workRoot, "MXU");
const cargoTargetRoot = resolve(".create-maa-project/cache/mxu-target", targetTriple);
const runtimeRoot = resolve(".create-maa-project/runtime/mxu", runtimePlatform);
const cargoBin = join(process.env.CARGO_HOME?.trim() || join(homedir(), ".cargo"), "bin");
const commandEnvironment = {
    ...process.env,
    PATH: existsSync(cargoBin) ? `${cargoBin}${delimiter}${process.env.PATH || ""}` : process.env.PATH || "",
};

console.log(`Building GitHub-only MXU ${MXU_TAG} for ${runtimePlatform}...`);
console.log(`Pinned upstream commit: ${MXU_COMMIT}`);

let succeeded = false;
try {
    run("git", [
        "clone",
        "--branch",
        MXU_TAG,
        "--depth",
        "1",
        MXU_REPOSITORY,
        sourceRoot,
    ]);
    const actualCommit = capture(
        "git",
        [
            "rev-parse",
            "HEAD",
        ],
        sourceRoot,
    );
    if (actualCommit !== MXU_COMMIT) {
        throw new Error(`MXU ${MXU_TAG} resolved to ${actualCommit}, expected ${MXU_COMMIT}`);
    }

    run(
        "git",
        [
            "apply",
            "--check",
            "--unidiff-zero",
            MXU_PATCH,
        ],
        sourceRoot,
    );
    run(
        "git",
        [
            "apply",
            "--unidiff-zero",
            MXU_PATCH,
        ],
        sourceRoot,
    );
    updateMxuVersion(sourceRoot);

    run(
        "rustup",
        [
            "target",
            "add",
            targetTriple,
        ],
        sourceRoot,
    );
    run(
        "pnpm",
        [
            "install",
            "--no-frozen-lockfile",
        ],
        sourceRoot,
    );
    if (!skipAudit) {
        for (const dependencySet of [
            "--prod",
            "--dev",
        ]) {
            run(
                "pnpm",
                [
                    "audit",
                    dependencySet,
                    "--audit-level",
                    "moderate",
                    "--registry",
                    "https://registry.npmjs.com",
                ],
                sourceRoot,
            );
        }
    }
    if (auditOnly) {
        succeeded = true;
        console.log(`GitHub-only MXU dependency audit completed for ${MXU_TAG}`);
    } else {
        run(
            "pnpm",
            [
                "tauri",
                "build",
                "--no-bundle",
                "--target",
                targetTriple,
            ],
            sourceRoot,
            {
                CARGO_TARGET_DIR: cargoTargetRoot,
            },
        );

        const executableName = runtimePlatform.startsWith("win-") ? "mxu.exe" : "mxu";
        let builtExecutable = join(cargoTargetRoot, targetTriple, "release", executableName);
        if (!existsSync(builtExecutable)) {
            builtExecutable = join(cargoTargetRoot, "release", executableName);
        }
        if (!existsSync(builtExecutable)) {
            throw new Error(`Custom MXU executable was not produced. Looked for: ${builtExecutable}`);
        }

        const stagedRuntime = join(workRoot, `runtime-${runtimePlatform}`);
        mkdirSync(stagedRuntime, {recursive: true});
        copyFileSync(builtExecutable, join(stagedRuntime, executableName));
        if (!runtimePlatform.startsWith("win-")) {
            chmodSync(join(stagedRuntime, executableName), 0o755);
        }

        const pdb = join(cargoTargetRoot, "release", "mxu.pdb");
        if (existsSync(pdb)) copyFileSync(pdb, join(stagedRuntime, "mxu.pdb"));
        copyFileSync(join(sourceRoot, "LICENSE"), join(stagedRuntime, "LICENSE-MXU-AGPL-3.0.txt"));
        copyFileSync(join(sourceRoot, "README.md"), join(stagedRuntime, "README-MXU.md"));
        writeJson(join(stagedRuntime, "mxu-github-only.json"), {
            custom_version: MXU_CUSTOM_VERSION,
            upstream_repository: MXU_REPOSITORY.replace(/\.git$/, ""),
            upstream_tag: MXU_TAG,
            upstream_commit: MXU_COMMIT,
            patch: "patches/mxu/github-only-v2.4.5.patch",
        });

        rmSync(runtimeRoot, {recursive: true, force: true});
        mkdirSync(runtimeRoot, {recursive: true});
        cpSync(stagedRuntime, runtimeRoot, {recursive: true, force: true});
        succeeded = true;
        console.log(`GitHub-only MXU runtime installed at ${runtimeRoot}`);
    }
} finally {
    if (succeeded || process.env.KEEP_MXU_BUILD_DIR !== "1") {
        rmSync(workRoot, {recursive: true, force: true});
    } else {
        console.warn(`Custom MXU build directory kept for inspection: ${workRoot}`);
    }
}

function updateMxuVersion(root) {
    for (const path of [
        join(root, "package.json"),
        join(root, "src-tauri", "tauri.conf.json"),
    ]) {
        const json = JSON.parse(readFileSync(path, "utf8"));
        json.version = MXU_CUSTOM_VERSION;
        if (path.endsWith("package.json")) {
            json.packageManager = "pnpm@11.5.1";
            json.dependencies.dompurify = "3.4.14";
            json.devDependencies.vite = "7.3.6";
        }
        writeJson(path, json);
    }

    writeFileSync(
        join(root, "pnpm-workspace.yaml"),
        [
            "packages:",
            '  - "."',
            "overrides:",
            '  "@babel/core": "7.29.7"',
            '  rollup: "4.63.1"',
            '  postcss: "8.5.26"',
            '  browserslist: "4.28.8"',
            '  yaml: "2.9.0"',
            '  "nanoid@<4": "3.3.18"',
            '  "picomatch@<3": "2.3.2"',
            '  "picomatch@>=4 <5": "4.0.7"',
            "allowBuilds:",
            "  esbuild: true",
            "",
        ].join("\n"),
        "utf8",
    );

    const cargoTomlPath = join(root, "src-tauri", "Cargo.toml");
    const cargoToml = readFileSync(cargoTomlPath, "utf8");
    const updated = cargoToml.replace(/^version = "[^"]+"/m, `version = "${MXU_CUSTOM_VERSION}"`);
    if (updated === cargoToml) {
        throw new Error("Could not update the MXU package version in Cargo.toml");
    }
    writeFileSync(cargoTomlPath, updated, "utf8");
}

function run(command, args, cwd = process.cwd(), extraEnv = {}) {
    const child = spawnSync(command, args, {
        cwd,
        env: {
            ...commandEnvironment,
            ...extraEnv,
        },
        shell: process.platform === "win32",
        stdio: "inherit",
    });
    if (child.error) throw child.error;
    if (child.status !== 0) {
        throw new Error(
            `Command failed: ${command} ${args.map(quoteArgument).join(" ")} (exit code ${child.status ?? 1})`,
        );
    }
}

function capture(command, args, cwd = process.cwd()) {
    const child = spawnSync(command, args, {
        cwd,
        encoding: "utf8",
        env: commandEnvironment,
        shell: process.platform === "win32",
    });
    if (child.error) throw child.error;
    if (child.status !== 0) {
        throw new Error(`Command failed: ${command} ${args.map(quoteArgument).join(" ")}`);
    }
    return child.stdout.trim();
}

function quoteArgument(value) {
    return /\s/.test(value) ? JSON.stringify(value) : value;
}

function writeJson(path, value) {
    writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function detectRuntimePlatform() {
    const explicit =
        process.env.CREATE_MAA_PROJECT_RUNTIME_PLATFORM?.trim() || process.env.CREATE_MAA_PROJECT_PLATFORM?.trim();
    if (explicit) {
        const normalized = normalizeRuntimePlatform(explicit);
        if (!normalized || normalized === "all") {
            throw new Error(`Unsupported custom MXU runtime platform: ${explicit}`);
        }
        return normalized;
    }

    const os = process.platform === "win32" ? "win" : process.platform === "darwin" ? "osx" : "linux";
    const arch = process.arch === "arm64" ? "arm64" : process.arch === "x64" ? "x64" : "";
    if (!arch) throw new Error(`Unsupported custom MXU runtime architecture: ${process.arch}`);
    return `${os}-${arch}`;
}

function normalizeRuntimePlatform(value) {
    const normalized = String(value)
        .trim()
        .toLowerCase()
        .replace(/^windows/, "win")
        .replace(/^win32/, "win")
        .replace(/^darwin/, "osx")
        .replace(/^macos/, "osx")
        .replace(/x86_64/g, "x64")
        .replace(/amd64/g, "x64")
        .replace(/aarch64/g, "arm64")
        .replace(/_/g, "-");
    return /^(win|linux|osx)-(x64|arm64)$/.test(normalized) ? normalized : "";
}

function targetTripleFor(platform) {
    const triples = {
        "win-x64": "x86_64-pc-windows-msvc",
        "win-arm64": "aarch64-pc-windows-msvc",
        "linux-x64": "x86_64-unknown-linux-gnu",
        "linux-arm64": "aarch64-unknown-linux-gnu",
        "osx-x64": "x86_64-apple-darwin",
        "osx-arm64": "aarch64-apple-darwin",
    };
    const target = triples[platform];
    if (!target) throw new Error(`Unsupported custom MXU runtime platform: ${platform}`);
    return target;
}
