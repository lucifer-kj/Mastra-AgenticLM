"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

export default function Home() {
  const [activeThreadId, setActiveThreadId] = useState<Id<"threads"> | null>(
    null
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const createThread = useMutation((api as any).threads.create);

  const handleNewThread = async () => {
    const id = await createThread({});
    setActiveThreadId(id);
    setIsMobileMenuOpen(false);
  };

  const handleSelectThread = (id: Id<"threads">) => {
    setActiveThreadId(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewThread={handleNewThread}
        className="hidden md:flex"
      />

      {/* Mobile Sidebar (Sheet) */}
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-3 z-40 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-none">
            <Sidebar
              activeThreadId={activeThreadId}
              onSelectThread={handleSelectThread}
              onNewThread={handleNewThread}
              className="w-full border-none"
            />
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 flex flex-col h-full relative">
        <ChatArea key={activeThreadId} threadId={activeThreadId} />
      </main>
    </div>
  );
}
