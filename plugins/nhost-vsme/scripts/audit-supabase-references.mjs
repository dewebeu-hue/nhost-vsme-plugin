import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.argv[2] || process.cwd();
const needles = ["supabase", "@supabase", "SUPABASE", "createClient"];
const ignoredDirs = new Set([".git", ".next", "node_modules", "plugins", "supplier-passport-temp"]);
const allowedExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".env",
  ".example",
]);

function hasAllowedExtension(path) {
  if (path.includes(".env")) return true;
  const dot = path.lastIndexOf(".");
  return dot === -1 ? false : allowedExtensions.has(path.slice(dot));
}

async function walk(dir, results = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        await walk(join(dir, entry.name), results);
      }
      continue;
    }

    const file = join(dir, entry.name);
    if (entry.isFile() && hasAllowedExtension(file) && (await stat(file)).size < 1_000_000) {
      results.push(file);
    }
  }
  return results;
}

const files = await walk(root);
const hits = [];

for (const file of files) {
  const text = await readFile(file, "utf8");
  text.split(/\r?\n/).forEach((line, index) => {
    if (needles.some((needle) => line.toLowerCase().includes(needle.toLowerCase()))) {
      hits.push(`${relative(root, file)}:${index + 1}: ${line.trim()}`);
    }
  });
}

if (hits.length === 0) {
  console.log("No Supabase references found.");
} else {
  console.log(hits.join("\n"));
  process.exitCode = 1;
}
