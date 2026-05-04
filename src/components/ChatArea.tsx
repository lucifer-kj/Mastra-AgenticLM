"use client";

import { useChat, Message } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
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
  Search,
  Brain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "../../convex/_generated/dataModel";

interface ChatAreaProps {
  threadId: Id<"threads"> | null;
}

function ThoughtProcess({ content, state }: { content: string; state?: string }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!content && state !== "streaming") return null;

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 transition-all max-w-2xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold text-primary/80 hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className={cn("h-4 w-4", state === "streaming" && "animate-pulse")} />
          <span>THOUGHT PROCESS</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 text-sm text-foreground/70 leading-relaxed border-t border-primary/10">
          <div className="whitespace-pre-wrap italic font-serif">
            {content}
            {state === "streaming" && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-primary/30 animate-pulse align-middle" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatArea({ threadId }: ChatAreaProps) {
  const createMessage = useMutation((api as any).messages.create);
  const historicalMessages = useQuery((api as any).messages.list, threadId ? { threadId } : "skip") as any[];

  const initialMessages = useMemo(() => {
    if (!historicalMessages) return [];
    return historicalMessages.map((msg) => ({
      id: msg._id,
      role: msg.role as Message["role"],
      content: msg.content,
      createdAt: new Date(msg.createdAt),
    })) as Message[];
  }, [historicalMessages]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const { messages, setMessages, sendMessage, status, error: chatError } = useChat({
    initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onFinish: async ({ message }) => {
      console.log("Chat finished:", message.id);
      if (threadId && message.role === "assistant") {
        const textContent = (message as any).parts
          ? (message as any).parts
              .filter((p: any) => p.type === "text")
              .map((p: any) => p.text)
              .join("")
          : (message as any).content;

        try {
          await createMessage({
            threadId,
            role: "assistant",
            content: textContent || "",
          });
          console.log("Assistant message saved to Convex");
        } catch (err) {
          console.error("Failed to save assistant message:", err);
        }
      }
    },
    onError: (err) => {
      console.error("useChat Error:", err);
    }
  });

  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (initialMessages.length > 0 && messages.length === 0) {
       setMessages(initialMessages);
    }
  }, [initialMessages, setMessages, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollArea = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages, isStreaming]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const currentInput = input;
    setInput("");

    if (threadId) {
      try {
        await createMessage({
          threadId,
          role: "user",
          content: currentInput,
        });
      } catch (err) {
        console.error("Failed to save user message:", err);
      }
    }

    try {
      sendMessage({ text: currentInput });
    } catch (err) {
      console.error("Failed to call sendMessage:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  return (
    <div className="flex flex-1 h-full flex-col bg-background relative overflow-hidden">
      {/* Mobile Header Spacer */}
      <div className="h-16 md:hidden flex items-center px-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <span className="ml-10 text-sm font-semibold truncate">
          {threadId ? "Conversation" : "New Chat"}
        </span>
      </div>

      {/* Messages Viewport */}
      <ScrollArea ref={scrollRef} className="flex-1 w-full">
        <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center pt-20 text-center space-y-4 opacity-40">
              <Bot className="h-12 w-12" />
              <div className="space-y-1">
                <h3 className="text-xl font-semibold tracking-tight">How can I help you today?</h3>
                <p className="text-sm">AgenticLM can search the web, research papers, and reason deeply.</p>
              </div>
            </div>
          )}

          {chatError && (
            <div className="mx-auto max-w-2xl p-4 mb-8 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm flex items-center gap-3">
              <div className="flex-1">
                <p className="font-bold uppercase tracking-widest text-[10px] mb-1">Error Occurred</p>
                <p>I&apos;m having trouble connecting to the brain right now. Please try again or check your connection.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-destructive/20 hover:bg-destructive/10 text-destructive"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "flex max-w-[85%] gap-4",
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className={cn(
                  "h-8 w-8 shrink-0 border mt-1 shadow-sm transition-colors",
                  message.role === "user" 
                    ? "bg-muted border-primary/10" 
                    : "bg-primary/5 border-primary/20"
                )}>
                  <AvatarFallback className="text-[10px] font-bold">
                    {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex flex-col gap-3">
                    {/* Tool & Reasoning Parts */}
                    {((message as any).parts || []).map((part: any, idx: number) => {
                      if (part.type === "reasoning") {
                        return (
                          <ThoughtProcess 
                            key={idx} 
                            content={part.text} 
                            state={message.role === "assistant" && isStreaming && idx === (message as any).parts.length - 1 ? "streaming" : "done"} 
                          />
                        );
                      }

                      if (part.type.startsWith("tool-")) {
                        const toolName = part.type.replace("tool-", "");
                        const state = part.state;
                        const toolCallId = part.toolCallId;
                        
                        return (
                          <div
                            key={toolCallId || idx}
                            className="flex items-center gap-3 rounded-xl border bg-card/50 px-4 py-3 shadow-sm max-w-sm animate-in zoom-in-95"
                          >
                            <div className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg bg-background border shadow-inner",
                              state !== "done" && "animate-pulse"
                            )}>
                              {toolName === "tavilySearch" ? <Globe className="h-4 w-4 text-blue-500" /> : 
                               toolName === "reasoningAgent" ? <Sparkles className="h-4 w-4 text-purple-500" /> : 
                               <BookOpen className="h-4 w-4 text-green-500" />}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">
                                {state === "done" ? "COMPLETED" : "EXECUTING"}
                              </span>
                              <span className="text-xs font-semibold truncate">
                                {toolName === "tavilySearch" ? "Web Search" : 
                                 toolName === "reasoningAgent" ? "Deep Reasoning" : 
                                 "Paper Analysis"}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {/* Message Text Content */}
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
                    {((message as any).parts || [])
                      .filter((p: any) => p.type === "text")
                      .map((p: any, i: number) => (
                        <div key={i} className="whitespace-pre-wrap">{p.text}</div>
                      ))}
                    {(!(message as any).parts || (message as any).parts.length === 0) && (message as any).content && (
                       <div className="whitespace-pre-wrap">{(message as any).content}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isStreaming && messages.length > 0 && messages[messages.length - 1].role === "user" && (
            <div className="flex gap-4 animate-pulse pt-2">
              <div className="h-8 w-8 rounded-full bg-muted/20 border border-primary/5 flex items-center justify-center">
                <Bot className="h-4 w-4 opacity-20" />
              </div>
              <div className="space-y-2 w-full max-w-md">
                <div className="h-3 w-32 rounded bg-muted/30" />
                <div className="h-3 w-full rounded bg-muted/20" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="w-full bg-gradient-to-t from-background via-background to-transparent pt-10 pb-8 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative group bg-card border rounded-2xl shadow-xl transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30">
            <Textarea
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can AgenticLM help?"
              className="min-h-[64px] max-h-[300px] w-full resize-none bg-transparent border-none px-4 py-5 pr-14 text-base focus-visible:ring-0 placeholder:text-muted-foreground/50"
              rows={1}
            />
            <div className="absolute right-3 bottom-3">
              <Button
                id="send-btn"
                type="submit"
                size="icon"
                onClick={handleFormSubmit}
                disabled={!input.trim() || isStreaming}
                className={cn(
                  "h-10 w-10 rounded-xl shadow-lg transition-all active:scale-95",
                  input.trim() ? "bg-primary hover:bg-primary/90" : "bg-muted cursor-not-allowed"
                )}
              >
                {isStreaming ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className={cn("h-5 w-5 transition-transform", input.trim() && "group-focus-within:translate-x-0.5 group-focus-within:-translate-y-0.5")} />
                )}
              </Button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 opacity-30">
            <Sparkles className="h-3 w-3" />
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]">
              Powered by Gemini & Mastra Agentic Engine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
