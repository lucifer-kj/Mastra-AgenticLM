"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import type { Id } from "../../convex/_generated/dataModel";

export default function Home() {
  const [activeThreadId, setActiveThreadId] = useState<Id<"threads"> | null>(
    null
  );
  const createThread = useMutation(api.threads.create);

  const handleNewThread = async () => {
    const id = await createThread({});
    setActiveThreadId(id);
  };

  const handleSelectThread = (id: Id<"threads">) => {
    setActiveThreadId(id);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewThread={handleNewThread}
      />
      <ChatArea threadId={activeThreadId} />
    </div>
  );
}
