
'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { askSupportAssistant } from '@/ai/flows/support-assistant';
import { LifeBuoy, Send, Bot, User, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { useInvoices } from '@/hooks/use-invoices';
import { format } from 'date-fns';
import { useChatWidget } from '@/context/chat-widget';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function PersistentChat() {
  const { user } = useAuth();
  const { getInvoice } = useInvoices();
  const { isChatOpen, setChatOpen } = useChatWidget();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your AI support assistant. I can answer questions about the app, or even look up invoice details for you. Try asking 'What's the status of invoice INV-1234'?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    let invoiceContext: string | undefined = undefined;

    const invoiceNumberMatch = currentInput.match(/#?([A-Z]{3,4}-?\d+)/i);
    if (invoiceNumberMatch) {
      const invoiceId = invoiceNumberMatch[1];
      const invoice = getInvoice(invoiceId, 'invoiceNumber');
      if (invoice) {
        invoiceContext = JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          total: invoice.total,
          currency: invoice.currency,
          dueDate: format(new Date(invoice.dueDate), 'PPP'),
          clientName: invoice.client.name,
        });
      }
    }

    try {
      const result = await askSupportAssistant({
        query: currentInput,
        invoiceContext,
      });
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error asking support assistant:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isChatOpen} onOpenChange={setChatOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageSquare className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0 w-full sm:max-w-md">
        <SheetHeader className="p-6 pb-2 border-b">
            <div className="flex items-center gap-4">
                <LifeBuoy className="h-8 w-8 text-primary" />
                <div>
                    <SheetTitle>AI Support Assistant</SheetTitle>
                    <SheetDescription>
                        Ask me anything about how to use the app.
                    </SheetDescription>
                </div>
            </div>
        </SheetHeader>
        <div className="flex-grow flex flex-col min-h-0">
          <ScrollArea className="flex-grow p-6">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-9 w-9 border">
                      <AvatarFallback>
                        <Bot className="text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-4 py-3 max-w-[85%] break-words ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && user && (
                    <Avatar className="h-9 w-9 border">
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback>
                      <Bot className="text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-3 bg-muted">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4 bg-background">
            <div className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="e.g., How do I create an invoice?"
                className="pr-12"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute top-1/2 right-2 -translate-y-1/2"
                onClick={handleSend}
                disabled={isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
