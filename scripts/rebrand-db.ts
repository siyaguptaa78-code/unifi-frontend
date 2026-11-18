/**
 * One-off data migration: renames the brand "UniCafe" to "Unifi Cafe" inside stored data
 * (cafe names, franchise packages, settings, menu text, notifications…) and moves the demo
 * login emails from @unicafe.demo to @unificafe.demo.
 *
 *   npx tsx scripts/rebrand-db.ts --dry-run   # show what would change
 *   npx tsx scripts/rebrand-db.ts             # apply
 *
 * Uses MONGODB_URI from the environment (or .env). Safe to run more than once.
 * Audit logs are left untouched on purpose: they are a historical record.
 */
import "dotenv/config";
import mongoose from "mongoose";

const DRY = process.argv.includes("--dry-run");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/unicafe";

// Model names → collection names exactly as Mongoose derives them (e.g. "Cafe" becomes "caves").
const MODELS = ["Cafe", "Franchise", "FranchisePackage", "SystemSetting", "MenuItem", "MenuCategory", "Staff", "Book", "Notification", "User"];
const pluralize = mongoose.pluralize() ?? ((s: string) => s.toLowerCase() + "s");
const COLLECTIONS = MODELS.map((m) => pluralize(m));

function rebrand(s: string): string {
  return s
    .replace(/UniCafe/g, "Unifi Cafe")
    .replace(/Unicafe/g, "Unifi Cafe")
    .replace(/UNICAFE/g, "UNIFI CAFE")
    .replace(/@unicafe\.demo/gi, "@unificafe.demo")
    .replace(/@demo\.unicafe/gi, "@demo.unificafe")
    .replace(/@unicafe\.in/gi, "@unificafe.in");
}

/** Returns the changed fields as a $set object (dot paths), walking nested objects and arrays. */
function diff(value: unknown, path: string, out: Record<string, unknown>) {
  if (typeof value === "string") {
    const next = rebrand(value);
    if (next !== value) out[path] = next;
  } else if (Array.isArray(value)) {
    // Arrays are replaced whole if any element changes (keeps the update simple and exact).
    const next = value.map((v) => (typeof v === "string" ? rebrand(v) : v));
    const nested: Record<string, unknown> = {};
    value.forEach((v, i) => {
      if (v && typeof v === "object") diff(v, `${path}.${i}`, nested);
    });
    if (next.some((v, i) => v !== value[i])) out[path] = next;
    Object.assign(out, nested);
  } else if (value && typeof value === "object" && !(value instanceof Date) && !(value instanceof mongoose.Types.ObjectId)) {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "_id" || k === "passwordHash") continue;
      diff(v, path ? `${path}.${k}` : k, out);
    }
  }
}

async function main() {
  console.log(`${DRY ? "[DRY RUN] " : ""}Connecting to ${MONGODB_URI.replace(/:[^:@/]+@/, ":****@")}`);
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;
  let total = 0;
  for (const name of COLLECTIONS) {
    const col = db.collection(name);
    let changed = 0;
    for await (const doc of col.find({})) {
      const set: Record<string, unknown> = {};
      diff(doc, "", set);
      if (!Object.keys(set).length) continue;
      changed++;
      if (changed <= 3) console.log(`  ${name} ${doc._id}:`, JSON.stringify(set).slice(0, 160));
      if (!DRY) await col.updateOne({ _id: doc._id }, { $set: set });
    }
    total += changed;
    console.log(`${name}: ${changed} document(s) ${DRY ? "would change" : "updated"}`);
  }
  console.log(`\nDone. ${total} document(s) ${DRY ? "would be" : "were"} updated.`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
