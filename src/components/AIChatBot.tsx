import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Loader2,
  Sparkles
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
}

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI billing assistant. I can help you with claim denials, prior authorizations, patient billing questions, and more. What can I help you with today?',
      isAI: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isAI: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Generate AI response using OpenAI API or enhanced mock
      const aiResponse = await generateAIResponse(inputMessage);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isAI: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    try {
      // Try to use real OpenAI API first
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (apiKey && apiKey !== 'demo-key') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: `You are an expert medical billing AI assistant. You help with:
                - Claim denials and appeals
                - Prior authorization requests
                - Patient billing questions
                - Insurance verification
                - Coding issues (ICD-10, CPT, HCPCS)
                - Payer-specific requirements
                - Revenue cycle management
                
                Provide accurate, helpful, and professional responses. If you don't know something, say so and suggest contacting the billing department.`
              },
              {
                role: 'user',
                content: userInput
              }
            ],
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.choices[0].message.content;
        }
      }
    } catch (error) {
      console.log('OpenAI API not available, using enhanced mock responses');
    }

    // Enhanced mock responses for common billing questions
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('denial') || lowerInput.includes('denied')) {
      return `I can help with claim denials!

**Common Denial Codes:**
• CO-11: Diagnosis not covered
• CO-16: Prior auth required
• CO-1: Deductible amount

**Next Steps:**
1. Review denial reason code
2. Gather supporting docs
3. Submit appeal with clinical justification
4. Follow up within 30 days

Need help with a specific denial?`;
    }
    
    if (lowerInput.includes('prior auth') || lowerInput.includes('authorization')) {
      return `Prior authorization help:

**Required:**
• Clinical indication
• CPT procedure codes
• ICD-10 diagnosis codes
• Provider info
• Insurance details

**Timeline:** 5-14 business days

**Success Tips:**
• Include detailed clinical notes
• Submit complete info upfront
• Provide supporting documentation

What procedure do you need authorization for?`;
    }
    
    if (lowerInput.includes('patient') && (lowerInput.includes('bill') || lowerInput.includes('payment'))) {
      return `Patient billing help:

**Common Issues:**
• Outstanding balances
• Payment plan setup
• Insurance questions
• Statement disputes

**Solutions:**
• Payment plans (6-12 months)
• Verify insurance coverage
• Review statements
• Financial assistance programs

**Communication Tips:**
• Be empathetic and professional
• Explain charges clearly
• Offer multiple payment options

Need help with patient communication?`;
    }
    
    if (lowerInput.includes('code') || lowerInput.includes('coding')) {
      return `Medical coding help:

**Code Types:**
• ICD-10: Diagnosis codes
• CPT: Procedure codes  
• HCPCS: Healthcare codes

**Common Issues:**
• Invalid code combinations
• Missing modifiers
• Incorrect place of service
• Outdated codes

**Resources:**
• CMS coding guidelines
• Payer-specific requirements
• Code validation tools

What codes are you working with?`;
    }
    
    if (lowerInput.includes('insurance') || lowerInput.includes('eligibility')) {
      return `Insurance & eligibility help:

**Verification Process:**
• Check patient eligibility (270/271)
• Verify coverage dates
• Confirm benefits and copays
• Identify prior auth requirements

**Common Issues:**
• Coverage terminated
• Benefits exhausted
• Network restrictions
• Pre-existing conditions

**Tools Available:**
• Real-time eligibility checking
• Benefits verification
• Prior auth requirements

What insurance info do you need to verify?`;
    }
    
    // Default response for other questions
    return `I can help with billing questions!

**I can assist with:**
• **Claim denials** - Appeal letters and strategies
• **Prior authorizations** - Requirements and tips  
• **Patient billing** - Payment plans and communications
• **Medical coding** - Code validation and suggestions
• **Insurance verification** - Eligibility and benefits
• **Revenue cycle** - Best practices

What specific billing issue can I help with?`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 z-50 transition-all duration-300 hover:scale-110 hover:shadow-3xl"
        size="icon"
      >
        <Sparkles className="h-8 w-8 text-white animate-pulse" />
      </Button>
    );
  }

  return (
    <>
      <style>{`
        .ai-chat-message {
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
          max-width: 100%;
          white-space: pre-wrap;
          line-height: 1.5;
        }
        .ai-chat-container {
          max-height: 450px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        .ai-chat-container::-webkit-scrollbar {
          width: 6px;
        }
        .ai-chat-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .ai-chat-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .ai-chat-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <Card className="fixed bottom-6 right-6 w-[420px] h-[600px] max-h-[85vh] shadow-2xl z-50 flex flex-col border-0 rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">AI Billing Assistant</CardTitle>
            <p className="text-xs text-white/80">Always here to help</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded-full p-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 ai-chat-container overflow-y-auto overflow-x-hidden p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 overflow-hidden shadow-sm ${
                  message.isAI
                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border border-gray-200'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-1.5 rounded-full flex-shrink-0 ${
                    message.isAI ? 'bg-gray-200' : 'bg-white/20'
                  }`}>
                    {message.isAI ? (
                      <Bot className="h-3.5 w-3.5 text-gray-600" />
                    ) : (
                      <User className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap ai-chat-message">{message.text}</p>
                    <p className={`text-xs mt-2 ${
                      message.isAI ? 'text-gray-500' : 'text-white/70'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 max-w-[85%] min-w-0 overflow-hidden shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-gray-200 rounded-full">
                    <Bot className="h-3.5 w-3.5 text-gray-600" />
                  </div>
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 break-words">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about billing, denials, prior auth..."
                className="w-full pr-12 py-3 rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl px-4 py-3 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default AIChatBot;
