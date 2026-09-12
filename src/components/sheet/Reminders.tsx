import { useState } from "react";
import { BellRing, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { useStore } from "@/lib/store";
import { remindersFor, type ReminderTone } from "@/lib/reminders";

const TONE: Record<ReminderTone, string> = {
  good: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
  bad: "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
  info: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300",
};

const PREVIEW = 6;

/** Lembretes: o que o personagem tem de permanente e todo mundo esquece na mesa. */
export function Reminders({ id }: { id: string }) {
  const character = useStore((s) => s.characters[id]);
  const [open, setOpen] = useState(false);
  if (!character) return null;

  const reminders = remindersFor(character);
  if (reminders.length === 0) return null;
  const visible = open ? reminders : reminders.slice(0, PREVIEW);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>
            <BellRing className="mr-1 inline h-3.5 w-3.5" />
            Lembretes
          </CardTitle>
          <span className="text-[10px] text-zinc-500">{reminders.length}</span>
        </div>
      </CardHeader>
      <CardBody className="space-y-1.5">
        {visible.map((reminder) => (
          <div key={reminder.text} className={`rounded-md border px-2 py-1 text-xs ${TONE[reminder.tone]}`}>
            {reminder.text}
            {reminder.source && <span className="ml-1 opacity-60">— {reminder.source}</span>}
          </div>
        ))}
        {reminders.length > PREVIEW && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-center gap-1 rounded py-1 text-[11px] text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {open ? (
              <>
                <ChevronUp className="h-3 w-3" /> mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> mais {reminders.length - PREVIEW}
              </>
            )}
          </button>
        )}
      </CardBody>
    </Card>
  );
}
