import { db } from "@/lib/db";
import { userUpdateLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

export interface ChangelogEntry {
  id: string;
  type: string;
  title: string;
  date: string;
  icon: string;
  category: string;
}

export interface Changelog {
  version: string;
  generatedAt: string;
  entries: ChangelogEntry[];
}

export function getChangelog(): Changelog {
  try {
    const changelogPath = path.join(process.cwd(), "public", "changelog.json");

    if (!fs.existsSync(changelogPath)) {
      return {
        version: "1.0.0",
        generatedAt: new Date().toISOString(),
        entries: [],
      };
    }

    const content = fs.readFileSync(changelogPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading changelog:", error);
    return {
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      entries: [],
    };
  }
}

export async function getUnreadUpdates(userId: string) {
  const changelog = getChangelog();

  if (changelog.entries.length === 0) {
    return {
      unreadCount: 0,
      unreadEntries: [],
      allEntries: [],
    };
  }

  // Get read updates from database
  const readLogs = await db
    .select()
    .from(userUpdateLog)
    .where(eq(userUpdateLog.userId, userId));

  const readUpdateIds = new Set(readLogs.map((log) => log.updateId));

  // Filter unread entries
  const unreadEntries = changelog.entries.filter(
    (entry) => !readUpdateIds.has(entry.id)
  );

  return {
    unreadCount: unreadEntries.length,
    unreadEntries,
    allEntries: changelog.entries,
  };
}
