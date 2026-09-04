import {existsSync, readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";

function readJson(path) {
    return JSON.parse(readFileSync(path, "utf8"));
}

const interfaceJson = readJson("interface.json");
const languageFiles = interfaceJson.languages ?? {};
const expectedLanguages = [
    "zh_tw",
    "zh_cn",
    "en_us",
    "ja_jp",
    "ko_kr",
];

for (const language of expectedLanguages) {
    if (typeof languageFiles[language] !== "string") {
        throw new Error(`interface.json is missing language: ${language}`);
    }
}

const translations = new Map();
for (const [
    language,
    path,
] of Object.entries(languageFiles)) {
    const file = path.replace(/^\.\//, "");
    if (!existsSync(file)) {
        throw new Error(`translation file is missing: ${path}`);
    }
    const entries = readJson(file);
    if (!entries || Array.isArray(entries) || typeof entries !== "object") {
        throw new Error(`translation file must be an object: ${path}`);
    }
    translations.set(language, entries);
}

const requiredKeys = new Set();
function collectKeys(value) {
    if (typeof value === "string" && value.startsWith("$")) {
        requiredKeys.add(value.slice(1));
    } else if (Array.isArray(value)) {
        value.forEach(collectKeys);
    } else if (value && typeof value === "object") {
        Object.values(value).forEach(collectKeys);
    }
}

collectKeys(interfaceJson);
function* jsonFiles(directory) {
    for (const entry of readdirSync(directory, {withFileTypes: true})) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
            yield* jsonFiles(path);
        } else if (entry.name.endsWith(".json")) {
            yield path;
        }
    }
}
for (const path of jsonFiles("tasks")) {
    collectKeys(readJson(path));
}

for (const [
    language,
    entries,
] of translations) {
    const missing = [...requiredKeys].filter((key) => typeof entries[key] !== "string" || !entries[key].trim());
    const extra = Object.keys(entries).filter((key) => !requiredKeys.has(key));
    if (missing.length || extra.length) {
        throw new Error(
            `${language}: ${missing.length} missing and ${extra.length} unused translation keys` +
                (missing.length ? `; first missing: ${missing[0]}` : "") +
                (extra.length ? `; first unused: ${extra[0]}` : ""),
        );
    }
    console.log(`[OK] ${language}: ${requiredKeys.size} translation keys`);
}
