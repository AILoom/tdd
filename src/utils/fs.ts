import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

export function readText(filePath: string): string {
  return readFileSync(filePath, "utf-8");
}

export function writeText(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  writeFileSync(filePath, content, "utf-8");
}

export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}
