import fs from "node:fs";

const ENV_FILES = [".env.local", ".env"];
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, "-");

function cleanFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    console.log(`\nProcessing ${filePath}...`);

    // Backup
    const backupPath = `${filePath}.bak.${TIMESTAMP}`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`[BACKUP] Created: ${backupPath}`);

    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/);
    const removedKeys = [];

    const newLines = lines.filter(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith("NEXT_PUBLIC_")) {
            const key = trimmed.split("=")[0].trim();
            removedKeys.push(key);
            return false;
        }
        return true;
    });

    if (removedKeys.length > 0) {
        fs.writeFileSync(filePath, newLines.join("\n"), "utf8");
        console.log(`[CLEAN] Removed ${removedKeys.length} legacy keys:`);
        removedKeys.forEach(key => console.log(`  - ${key}`));
    } else {
        console.log("[OK] No legacy keys found.");
    }
}

console.log("=== ENV CLEAN (Vite Hardening) ===");
ENV_FILES.forEach(cleanFile);
console.log("\nDone!");
