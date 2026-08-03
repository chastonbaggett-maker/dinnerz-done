import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { MotionSpecDocument } from "@/lib/motion/types";
import { emptyMotionDocument } from "@/lib/motion/css";

const DATA_DIR = path.join(process.cwd(), "data");
const SPECS_PATH = path.join(DATA_DIR, "motion-specs.json");

let memoryPublished: MotionSpecDocument | null = null;

export async function readPublishedMotionSpecs(): Promise<MotionSpecDocument> {
  if (memoryPublished) return memoryPublished;

  try {
    const raw = await readFile(SPECS_PATH, "utf8");
    memoryPublished = JSON.parse(raw) as MotionSpecDocument;
    return memoryPublished;
  } catch {
    return emptyMotionDocument();
  }
}

export async function writePublishedMotionSpecs(doc: MotionSpecDocument) {
  const payload: MotionSpecDocument = {
    ...doc,
    version: 1,
    updatedAt: new Date().toISOString(),
  };

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(SPECS_PATH, JSON.stringify(payload, null, 2), "utf8");
  memoryPublished = payload;
  return payload;
}
