/**
 * One-off migration: recompress existing yum-diary Storage photos.
 *
 * Mirrors browser `compressImage()` specs (max edge 1200px, WebP quality 0.8).
 * Canvas APIs are browser-only, so this script applies the same algorithm via
 * `sharp` (devDependency) while importing shared constants from compressImage.ts.
 *
 * Does NOT touch Database, object paths, file names, or public URLs.
 *
 * Usage (default = dry-run, no writes):
 *   npm run migrate:photo-compression
 *
 * Apply overwrites:
 *   npm run migrate:photo-compression:execute
 *
 * Requires in `.env.local`:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Requires: `sharp` (devDependency) for Node-side decode / WebP encode.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";

import {
  COMPRESS_IMAGE_MAX_EDGE_PX,
  COMPRESS_IMAGE_WEBP_QUALITY,
  fitWithinMaxEdge,
} from "../src/lib/storage/compressImage";
import { WEBP_MIME_TYPE } from "../src/lib/storage/mime";
import { STORAGE_FOLDERS } from "../src/lib/storage/file-name";
import { PHOTO_BUCKET } from "../src/services/storage/types";
import type { Database } from "../src/types/database";

type StorageObjectRow = {
  name: string;
  id: string | null;
  metadata: { size?: number; mimetype?: string } | null;
};

type ListedFile = {
  path: string;
  name: string;
  size: number | null;
};

type Outcome = "success" | "skipped" | "failed";

type FileResult = {
  path: string;
  outcome: Outcome;
  originalBytes: number;
  compressedBytes: number;
  reason?: string;
};

const LIST_PAGE_SIZE = 1000;
const CACHE_CONTROL_ONE_YEAR = "31536000";

/** Top-level prefixes that hold user photos (skip reserved empty folders). */
const PHOTO_ROOT_PREFIXES = [
  STORAGE_FOLDERS.restaurants,
  STORAGE_FOLDERS.records,
  STORAGE_FOLDERS.menus,
] as const;

const IMAGE_EXTENSIONS = new Set([
  "webp",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "heic",
  "heif",
]);

function requireEnv(name: string): string {
  const value = process.env[name]?.trim() ?? "";
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function parseArgs(argv: string[]): { execute: boolean } {
  const execute = argv.includes("--execute");
  if (argv.includes("--help") || argv.includes("-h")) {
    printHelp();
    process.exit(0);
  }
  return { execute };
}

function printHelp(): void {
  console.log(`
migratePhotoCompression — recompress yum-diary Storage photos

  npm run migrate:photo-compression              # dry-run (default)
  npm run migrate:photo-compression:execute      # upsert compressed files

Flags:
  --execute   Write compressed files back (upsert, same path)
  --help      Show this help

Env (.env.local):
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
`);
}

function isProbablyFolder(item: StorageObjectRow): boolean {
  // Supabase marks folders with null id / null metadata.
  return item.id == null || item.metadata == null;
}

function hasImageExtension(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.has(ext);
}

function joinPath(prefix: string, name: string): string {
  return prefix ? `${prefix}/${name}` : name;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "—";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${kb >= 100 ? kb.toFixed(0) : kb.toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function savedPercent(original: number, compressed: number): number {
  if (original <= 0) {
    return 0;
  }
  return Math.round(((original - compressed) / original) * 100);
}

function fileNameOnly(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

/**
 * Same pipeline as browser compressImage(): decode → fit max edge → WebP 0.8.
 * Implemented with sharp because Canvas / createImageBitmap are not in Node.
 */
async function compressImageNode(input: Buffer): Promise<Buffer> {
  const meta = await sharp(input, { failOn: "none" }).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (width < 1 || height < 1) {
    throw new Error("Unable to read image dimensions");
  }

  const target = fitWithinMaxEdge(
    width,
    height,
    COMPRESS_IMAGE_MAX_EDGE_PX,
  );

  // quality 0–100; browser Canvas uses 0–1 (COMPRESS_IMAGE_WEBP_QUALITY).
  const quality = Math.round(COMPRESS_IMAGE_WEBP_QUALITY * 100);

  return sharp(input, { failOn: "none" })
    .rotate() // honour EXIF orientation before resize
    .resize({
      width: target.width,
      height: target.height,
      fit: "fill",
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();
}

async function listPrefixRecursive(
  supabase: SupabaseClient<Database>,
  prefix: string,
): Promise<ListedFile[]> {
  const files: ListedFile[] = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .list(prefix, {
        limit: LIST_PAGE_SIZE,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      throw error;
    }

    const page = (data ?? []) as StorageObjectRow[];
    if (page.length === 0) {
      break;
    }

    for (const item of page) {
      const path = joinPath(prefix, item.name);
      if (isProbablyFolder(item)) {
        const nested = await listPrefixRecursive(supabase, path);
        files.push(...nested);
        continue;
      }

      if (!hasImageExtension(item.name)) {
        continue;
      }

      files.push({
        path,
        name: item.name,
        size:
          typeof item.metadata?.size === "number" ? item.metadata.size : null,
      });
    }

    if (page.length < LIST_PAGE_SIZE) {
      break;
    }
    offset += page.length;
  }

  return files;
}

async function listAllPhotoFiles(
  supabase: SupabaseClient<Database>,
): Promise<ListedFile[]> {
  const all: ListedFile[] = [];
  for (const prefix of PHOTO_ROOT_PREFIXES) {
    const files = await listPrefixRecursive(supabase, prefix);
    all.push(...files);
  }
  return all;
}

function printFileReport(result: FileResult, dryRun: boolean): void {
  const label = dryRun ? "estimate" : result.outcome;
  console.log("");
  console.log(fileNameOnly(result.path));
  console.log(`  ${result.path}`);
  console.log(formatBytes(result.originalBytes));
  console.log("↓");
  console.log(formatBytes(result.compressedBytes));
  if (result.outcome === "skipped") {
    console.log(
      `SKIPPED (${result.reason ?? "no savings"})${dryRun ? " [dry-run]" : ""}`,
    );
  } else if (result.outcome === "failed") {
    console.log(`FAILED: ${result.reason ?? "unknown error"}`);
  } else {
    console.log(
      `Saved ${savedPercent(result.originalBytes, result.compressedBytes)}%${
        dryRun ? " (dry-run estimate)" : ""
      } [${label}]`,
    );
  }
}

function printSummary(
  results: FileResult[],
  dryRun: boolean,
): void {
  const success = results.filter((r) => r.outcome === "success");
  const skipped = results.filter((r) => r.outcome === "skipped");
  const failed = results.filter((r) => r.outcome === "failed");

  const originalTotal = results.reduce((sum, r) => sum + r.originalBytes, 0);
  // For skipped/failed, "compressed" may be 0 or original — use compressed when
  // we have a valid estimate/success, otherwise keep original for capacity math.
  const afterTotal = results.reduce((sum, r) => {
    if (r.outcome === "failed" || r.compressedBytes <= 0) {
      return sum + r.originalBytes;
    }
    if (r.outcome === "skipped") {
      return sum + r.originalBytes;
    }
    return sum + r.compressedBytes;
  }, 0);
  const saved = Math.max(0, originalTotal - afterTotal);

  console.log("");
  console.log("═".repeat(48));
  console.log(dryRun ? "DRY RUN SUMMARY (no files written)" : "EXECUTE SUMMARY");
  console.log("═".repeat(48));
  console.log(`總圖片數：${results.length}`);
  console.log(`成功：${success.length}${dryRun ? "（預估可壓縮）" : ""}`);
  console.log(`略過：${skipped.length}`);
  console.log(`失敗：${failed.length}`);
  console.log(`原始總容量：${formatBytes(originalTotal)}`);
  console.log(`壓縮後總容量：${formatBytes(afterTotal)}`);
  console.log(`共節省：${formatBytes(saved)}`);
  console.log(`節省百分比：${savedPercent(originalTotal, afterTotal)}%`);

  if (failed.length > 0) {
    console.log("");
    console.log("失敗清單：");
    for (const item of failed) {
      console.log(`  - ${item.path}: ${item.reason}`);
    }
  }
}

async function processFile(
  supabase: SupabaseClient<Database>,
  file: ListedFile,
  execute: boolean,
): Promise<FileResult> {
  try {
    const { data, error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .download(file.path);

    if (error || !data) {
      return {
        path: file.path,
        outcome: "failed",
        originalBytes: file.size ?? 0,
        compressedBytes: 0,
        reason: error?.message ?? "download returned empty",
      };
    }

    const originalBuffer = Buffer.from(await data.arrayBuffer());
    const originalBytes = originalBuffer.byteLength;

    let compressedBuffer: Buffer;
    try {
      compressedBuffer = await compressImageNode(originalBuffer);
    } catch (compressError) {
      return {
        path: file.path,
        outcome: "failed",
        originalBytes,
        compressedBytes: 0,
        reason:
          compressError instanceof Error
            ? compressError.message
            : "compress failed",
      };
    }

    const compressedBytes = compressedBuffer.byteLength;

    if (compressedBytes >= originalBytes) {
      return {
        path: file.path,
        outcome: "skipped",
        originalBytes,
        compressedBytes,
        reason: "compressed file not smaller than original",
      };
    }

    if (!execute) {
      return {
        path: file.path,
        outcome: "success",
        originalBytes,
        compressedBytes,
      };
    }

    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(file.path, compressedBuffer, {
        contentType: WEBP_MIME_TYPE,
        upsert: true,
        cacheControl: CACHE_CONTROL_ONE_YEAR,
      });

    if (uploadError) {
      return {
        path: file.path,
        outcome: "failed",
        originalBytes,
        compressedBytes,
        reason: uploadError.message,
      };
    }

    return {
      path: file.path,
      outcome: "success",
      originalBytes,
      compressedBytes,
    };
  } catch (error) {
    return {
      path: file.path,
      outcome: "failed",
      originalBytes: file.size ?? 0,
      compressedBytes: 0,
      reason: error instanceof Error ? error.message : "unknown error",
    };
  }
}

async function main(): Promise<void> {
  const { execute } = parseArgs(process.argv.slice(2));
  const dryRun = !execute;

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  console.log(`Bucket: ${PHOTO_BUCKET}`);
  console.log(
    `Mode: ${dryRun ? "DRY RUN (no writes)" : "EXECUTE (upsert overwrite)"}`,
  );
  console.log(
    `Spec: max edge ${COMPRESS_IMAGE_MAX_EDGE_PX}px, WebP quality ${COMPRESS_IMAGE_WEBP_QUALITY}`,
  );
  console.log(`Prefixes: ${PHOTO_ROOT_PREFIXES.join(", ")}`);

  const files = await listAllPhotoFiles(supabase);
  console.log(`Found ${files.length} image object(s).`);

  const results: FileResult[] = [];
  for (const file of files) {
    const result = await processFile(supabase, file, execute);
    results.push(result);
    printFileReport(result, dryRun);
  }

  printSummary(results, dryRun);

  if (dryRun) {
    console.log("");
    console.log(
      "Dry run complete. Re-run with --execute (or npm run migrate:photo-compression:execute) to apply.",
    );
  }
}

main().catch((error) => {
  console.error("");
  console.error("Migration aborted:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
