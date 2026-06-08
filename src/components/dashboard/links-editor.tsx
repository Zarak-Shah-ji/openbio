"use client";

import { useActionState, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarClock,
  ChevronDown,
  GripVertical,
  ImagePlus,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import {
  createLink,
  deleteLink,
  reorderLinks,
  setLinkFlag,
  updateLink,
  type FormState,
} from "@/app/dashboard/actions";
import { uploadMedia } from "@/lib/upload";
import type { LinkRow } from "@/lib/links";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function localInputToIso(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

export function LinksEditor({
  userId,
  initialLinks,
}: {
  userId: string;
  initialLinks: LinkRow[];
}) {
  const router = useRouter();
  const handleAdded = useCallback(() => router.refresh(), [router]);
  const handleChange = useCallback(() => router.refresh(), [router]);
  const [items, setItems] = useState(initialLinks);

  // Re-sync local order with fresh server data after a router.refresh().
  // Using the "adjust state during render" pattern instead of an effect:
  // `initialLinks` only changes identity when the server re-renders, so this
  // won't fire during local optimistic updates (e.g. drag reordering).
  const [syncedFrom, setSyncedFrom] = useState(initialLinks);
  if (initialLinks !== syncedFrom) {
    setSyncedFrom(initialLinks);
    setItems(initialLinks);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((l) => l.id === active.id);
      const newIndex = prev.findIndex((l) => l.id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      void reorderLinks(next.map((l) => l.id));
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <AddLink onAdded={handleAdded} />

      {items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          No links yet. Add your first one above.
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={items.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {items.map((link) => (
                <LinkItem
                  key={link.id}
                  link={link}
                  userId={userId}
                  onChange={handleChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function AddLink({ onAdded }: { onAdded: () => void }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createLink,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      onAdded();
    }
  }, [state, onAdded]);

  return (
    <Card className="p-4">
      <form ref={formRef} action={formAction} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="My website" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" placeholder="example.com" required />
          </div>
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <Button type="submit" disabled={pending}>
          <Plus className="size-4" />
          {pending ? "Adding…" : "Add link"}
        </Button>
      </form>
    </Card>
  );
}

function LinkItem({
  link,
  userId,
  onChange,
}: {
  link: LinkRow;
  userId: string;
  onChange: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: link.id });
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  function run(fn: () => Promise<FormState>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
      onChange();
    });
  }

  async function onThumbnail(file: File) {
    setError(null);
    setUploading(true);
    try {
      const publicUrl = await uploadMedia(userId, file, `link-${link.id}`);
      await updateLink(link.id, { thumbnail_url: publicUrl });
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card ref={setNodeRef} style={style} className={cn(isDragging && "shadow-lg")}>
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          aria-label="Drag to reorder"
          className="cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {link.is_featured && (
              <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
            )}
            <p className="truncate font-medium">{link.title}</p>
          </div>
          <p className="truncate text-xs text-muted-foreground">{link.url}</p>
        </div>

        <Switch
          checked={link.is_active}
          aria-label="Link active"
          onCheckedChange={(v) =>
            run(() => setLinkFlag(link.id, "is_active", v))
          }
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setOpen((o) => !o)}
          aria-label="Edit link"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </Button>
      </div>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Star className="size-4 text-amber-500" />
              Feature this link
            </div>
            <Switch
              checked={link.is_featured}
              aria-label="Feature link"
              onCheckedChange={(v) =>
                run(() => setLinkFlag(link.id, "is_featured", v))
              }
            />
          </div>

          <div className="space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarClock className="size-4 text-primary" />
              Schedule (optional)
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`visible-from-${link.id}`} className="text-xs font-medium text-muted-foreground">
                  Start date &amp; time
                </Label>
                <input
                  id={`visible-from-${link.id}`}
                  type="datetime-local"
                  defaultValue={isoToLocalInput(link.visible_from)}
                  onChange={(e) =>
                    run(() =>
                      updateLink(link.id, {
                        visible_from: localInputToIso(e.target.value),
                      }),
                    )
                  }
                  className="flex h-10 w-full rounded-lg border-2 border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`visible-until-${link.id}`} className="text-xs font-medium text-muted-foreground">
                  End date &amp; time
                </Label>
                <input
                  id={`visible-until-${link.id}`}
                  type="datetime-local"
                  defaultValue={isoToLocalInput(link.visible_until)}
                  onChange={(e) =>
                    run(() =>
                      updateLink(link.id, {
                        visible_until: localInputToIso(e.target.value),
                      }),
                    )
                  }
                  className="flex h-10 w-full rounded-lg border-2 border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {link.thumbnail_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={link.thumbnail_url}
                alt=""
                className="size-10 rounded-md object-cover"
              />
            )}
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
              <ImagePlus className="size-4" />
              {uploading
                ? "Uploading…"
                : link.thumbnail_url
                  ? "Change thumbnail"
                  : "Add thumbnail"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onThumbnail(file);
                }}
              />
            </label>
            {link.thumbnail_url && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  run(() => updateLink(link.id, { thumbnail_url: null }))
                }
              >
                Remove
              </Button>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={() => run(() => deleteLink(link.id))}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() => run(() => updateLink(link.id, { title, url }))}
            >
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
