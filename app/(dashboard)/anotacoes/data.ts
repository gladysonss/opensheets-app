import { anotacoes, type Anotacao } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export type Task = {
  id: string;
  text: string;
  completed: boolean;
};

export type NoteData = {
  id: string;
  title: string;
  description: string;
  type: "nota" | "tarefa";
  tasks?: Task[];
  createdAt: string;
};

export async function fetchNotesForUser(userId: string): Promise<NoteData[]> {
  const noteRows = await db.query.anotacoes.findMany({
    where: eq(anotacoes.userId, userId),
    orderBy: (note: typeof anotacoes.$inferSelect, { desc }: { desc: (field: unknown) => unknown }) => [desc(note.createdAt)],
  });

  return noteRows.map((note: Anotacao) => {
    let tasks: Task[] | undefined;

    // Parse tasks if they exist
    if (note.tasks) {
      try {
        tasks = JSON.parse(note.tasks);
      } catch (error) {
        console.error("Failed to parse tasks for note", note.id, error);
        tasks = undefined;
      }
    }

    return {
      id: note.id,
      title: (note.title ?? "").trim(),
      description: (note.description ?? "").trim(),
      type: (note.type ?? "nota") as "nota" | "tarefa",
      tasks,
      createdAt: note.createdAt.toISOString(),
    };
  });
}
