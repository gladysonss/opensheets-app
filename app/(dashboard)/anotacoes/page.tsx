import { NotesPage } from "@/components/anotacoes/notes-page";
import { getUserId } from "@/lib/auth/server";
import { fetchNotesForUser } from "./data";

export default async function Page() {
  const userId = await getUserId();
  const notes = await fetchNotesForUser(userId);

  return (
    <main className="flex flex-col items-start gap-6">
      <NotesPage notes={notes} />
    </main>
  );
}
