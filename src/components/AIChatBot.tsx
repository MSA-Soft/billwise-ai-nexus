import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { aiService } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Loader2, Sparkles, Trash2, Copy, MessageSquareText } from 'lucide-react';

type Role = 'system' | 'user' | 'assistant';

interface Message {
  id: string;
  role: Exclude<Role, 'system'>;
  content: string;
  createdAt: string; // ISO
}

const STORAGE_PREFIX = 'bw_ai_copilot_chat_v1';

const AIChatBot = () => {
  const { user, currentCompany } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  const storageKey = useMemo(() => {
    const uid = user?.id || 'anon';
    const cid = currentCompany?.id || 'no_company';
    return `${STORAGE_PREFIX}:${uid}:${cid}`;
  }, [user?.id, currentCompany?.id]);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((m) => m && typeof m === 'object')
        .map((m: any) => ({
          id: String(m.id ?? crypto.randomUUID()),
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content ?? ''),
          createdAt: String(m.createdAt ?? new Date().toISOString()),
        }))
        .slice(-200);
    } catch {
      return [];
    }
  });

  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiHealth, setAiHealth] = useState<{ status: 'unknown' | 'ok' | 'error'; detail?: string }>({
    status: 'unknown',
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const lastErrorRef = useRef<string | null>(null);

  // Persist chat
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-200)));
    } catch {
      // ignore
    }
  }, [messages, storageKey]);

  // Reload chat when company/user scope changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setMessages([]);
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setMessages([]);
        return;
      }
      setMessages(
        parsed
          .filter((m) => m && typeof m === 'object')
          .map((m: any) => ({
            id: String(m.id ?? crypto.randomUUID()),
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: String(m.content ?? ''),
            createdAt: String(m.createdAt ?? new Date().toISOString()),
          }))
          .slice(-200),
      );
    } catch {
      setMessages([]);
    }
  }, [storageKey]);

  // Auto-scroll
  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sessionContextSystem: { role: Role; content: string } = useMemo(() => {
    const parts = [
      `App route: ${location.pathname}${location.search || ''}`,
      user?.email ? `User: ${user.email}` : undefined,
      currentCompany?.name ? `Company: ${currentCompany.name}` : currentCompany?.id ? `CompanyId: ${currentCompany.id}` : undefined,
    ].filter(Boolean);
    return {
      role: 'system',
      content: `Context (non-sensitive): ${parts.join(' | ')}`,
    };
  }, [location.pathname, location.search, user?.email, currentCompany?.id, currentCompany?.name]);

  const clearChat = () => {
    setMessages([]);
    toast({ title: 'Cleared', description: 'Chat history cleared for this company.' });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied', description: 'Message copied to clipboard.' });
    } catch {
      toast({ title: 'Copy failed', description: 'Could not copy message.', variant: 'destructive' });
    }
  };

  const testAI = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-automation', {
        body: { action: 'self_test', payload: {} },
      });

      if (!error && data?.success && data?.output?.ok === true) {
        setAiHealth({ status: 'ok' });
        toast({ title: 'AI OK', description: 'AI gateway reachable and OpenAI configured.' });
      } else {
        let detail = data?.error || (error as any)?.message || 'AI server not reachable or OpenAI not configured';

        // If this is a non-2xx Edge Function error, `error.context` is usually a Response.
        try {
          const ctx = (error as any)?.context;
          if (ctx && typeof ctx === 'object' && typeof ctx.clone === 'function') {
            const json = await ctx.clone().json();
            if (typeof json?.error === 'string' && json.error) detail = json.error;
          }
        } catch {
          // ignore
        }

        setAiHealth({ status: 'error', detail });
        toast({ title: 'AI failed', description: String(detail), variant: 'destructive' });
      }
    } catch (e: any) {
      const detail = e?.message || 'Unable to reach AI server.';
      setAiHealth({ status: 'error', detail });
      toast({ title: 'AI failed', description: String(detail), variant: 'destructive' });
    }
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setDraft('');
    setIsLoading(true);

    try {
      const history = [
        sessionContextSystem,
        ...nextMessages.slice(-12).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      const aiResponse = await aiService.chatAssistant(text, history as any);
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setAiHealth({ status: 'ok' });
    } catch (error) {
      console.error('Error generating AI response:', error);
      const detail = (error as any)?.message || String(error);
      setAiHealth({ status: 'error', detail });

      // Avoid spamming identical diagnostics.
      const alreadyShown = lastErrorRef.current === detail;
      lastErrorRef.current = detail;

      if (!alreadyShown) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content:
              `AI is not available right now.\n\n` +
              `Error: ${detail}\n\n` +
              `Fix:\n` +
              `- Deploy Supabase Edge Function "ai-automation"\n` +
              `- Set Supabase secret OPENAI_API_KEY\n` +
              `- Ensure you are logged in (JWT required)\n\n` +
              `Click "Test" above to verify configuration.`,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      toast({
        title: "Error",
        description: String(detail).slice(0, 180),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

    return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="hidden lg:inline">AI Copilot</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-3 sm:max-w-md">
        <SheetHeader className="space-y-1 pr-8">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Copilot
            <Badge variant="outline" className="ml-2">Secure</Badge>
          </SheetTitle>
          <div className="text-xs text-muted-foreground">
            Denials • Prior auth • Patient messaging • Ops insights
          </div>
        </SheetHeader>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
      <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDraft('Triage my denials and tell me what to work first.')}
      >
              <MessageSquareText className="h-4 w-4 mr-2" />
              Quick
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={testAI}>
              Test
      </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={clearChat}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {aiHealth.status === 'error' && (
          <Alert className="mt-2">
            <AlertDescription className="text-xs">
              <span className="font-medium">AI error:</span> {aiHealth.detail || 'Unknown error'}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-3 flex flex-col h-[calc(100vh-220px)]">
          <ScrollArea className="flex-1 border rounded-md bg-background">
            <div className="p-2 space-y-2">
              {messages.length === 0 && (
                <div className="text-xs text-muted-foreground p-2">
                  Ask anything. Tip: paste claim/denial/prior-auth details for best answers.
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[92%] rounded-md border px-2 py-1.5 text-sm whitespace-pre-wrap ${
                      m.role === 'assistant'
                        ? 'bg-muted/40 text-foreground'
                        : 'bg-primary text-primary-foreground border-primary/20'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">{m.content}</div>
                      {m.role === 'assistant' && (
        <Button
                          type="button"
          variant="ghost"
          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => copyToClipboard(m.content)}
                          title="Copy"
        >
                          <Copy className="h-4 w-4" />
        </Button>
                    )}
                  </div>
                    <div className={`mt-1 text-[11px] ${m.role === 'assistant' ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                      {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
                  <div className="max-w-[92%] rounded-md border bg-muted/40 px-2 py-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking…
                </div>
              </div>
            </div>
          )}
          
              <div ref={bottomRef} />
        </div>
          </ScrollArea>

          <div className="mt-2 space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
                disabled={isLoading}
              className="min-h-[72px]"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" onClick={sendMessage} disabled={isLoading || !draft.trim()}>
                Send
            </Button>
          </div>
        </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AIChatBot;
