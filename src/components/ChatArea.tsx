"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  Bot,
  User,
  Loader2,
  Globe,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "../../convex/_generated/dataModel";

interface ChatAreaProps {
  threadId: Id<"threads"> | null;
}

export function ChatArea({ threadId }: ChatAreaProps) {
  const createMessage = useMutation(api.messages.create);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/chat",
    onFinish: async (message) => {
      if (threadId && message.role === "assistant") {
        await createMessage({
          threadId,
          role: "assistant",
          content: message.content,
        });
      }
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Save user message to Convex
    if (threadId) {
      await createMessage({
        threadId,
        role: "user",
        content: input,
      });
    }

    handleSubmit(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  const isStreaming = status === "streaming";

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* Messages area */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="mx-auto max-w-3xl py-8 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-32 text-center">
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4">
                <Sparkles className="h-10 w-10 text-primary/70" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                AgenticLM
              </h1>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Ask me anything. I can search the web, explore academic papers,
                and reason through complex problems.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {[
                  { icon: Globe, label: "Web Search" },
                  { icon: BookOpen, label: "ArXiv Papers" },
                  { icon: Bot, label: "Reasoning" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 shrink-0 border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {/* Tool invocations */}
                {message.parts?.map((part, i) => {
                  if (part.type === "tool-invocation") {
                    const toolName = part.toolInvocation.toolName;
                    const icon =
                      toolName === "tavilySearch" ? (
                        <Globe className="h-3 w-3" />
                      ) : (
                        <BookOpen className="h-3 w-3" />
                      );
                    return (
                      <div
                        key={i}
                        className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse"
                      >
                        {icon}
                        <span>
                          {part.toolInvocation.state === "result"
                            ? `Used ${toolName}`
                            : `Calling ${toolName}...`}
                        </span>
                      </div>
                    );
                  }
                  if (part.type === "text") {
                    return (
                      <span key={i} className="whitespace-pre-wrap">
                        {part.text}
                      </span>
                    );
                  }
                  return null;
                })}
                {/* Fallback for simple text content */}
                {!message.parts?.length && (
                  <span className="whitespace-pre-wrap">{message.content}</span>
                )}
              </div>

              {message.role === "user" && (
                <Avatar className="h-8 w-8 shrink-0 border">
                  <AvatarFallback className="bg-secondary text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0 border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl bg-muted px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t bg-background p-4">
        <form
          onSubmit={handleFormSubmit}
          className="mx-auto flex max-w-3xl items-end gap-2"
        >
          <Textarea
            id="chat-input"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="min-h-[44px] max-h-[200px] resize-none rounded-xl border-input bg-muted/50 text-sm"
            rows={1}
          />
          <Button
            id="send-btn"
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            className="h-[44px] w-[44px] shrink-0 rounded-xl"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
