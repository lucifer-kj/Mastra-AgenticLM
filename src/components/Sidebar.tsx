"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "../../convex/_generated/dataModel";

interface SidebarProps {
  activeThreadId: Id<"threads"> | null;
  onSelectThread: (id: Id<"threads">) => void;
  onNewThread: () => void;
}

export function Sidebar({
  activeThreadId,
  onSelectThread,
  onNewThread,
}: SidebarProps) {
  const threads = useQuery(api.threads.list) ?? [];

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-sm font-semibold tracking-tight">AgenticLM</h2>
        <Button
          id="new-thread-btn"
          variant="ghost"
          size="icon"
          onClick={onNewThread}
          className="h-8 w-8 hover:bg-sidebar-accent"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Thread list */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-1">
          {threads.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No conversations yet
            </p>
          )}
          {threads.map((thread) => (
            <button
              key={thread._id}
              id={`thread-${thread._id}`}
              onClick={() => onSelectThread(thread._id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                activeThreadId === thread._id &&
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              )}
            >
              <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
              <span className="truncate">
                {thread.title || "New conversation"}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
