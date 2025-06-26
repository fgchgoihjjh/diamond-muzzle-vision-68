
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { chatMessageSchema, validateAndSanitize, sanitizeHtml } from "@/lib/validation";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used?: number;
  created_at: string;
}

interface Conversation {
  id: string;
  session_title: string;
  created_at: string;
  is_active: boolean;
  user_id: string;
}

export function AiChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isAuthenticated, tokens } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    if (!isAuthenticated || !tokens?.user_id) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', tokens.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!isAuthenticated) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const typedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: sanitizeHtml(msg.content), // Sanitize content when displaying
        tokens_used: msg.tokens_used || 0,
        created_at: msg.created_at || new Date().toISOString()
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const createNewConversation = async () => {
    if (!isAuthenticated || !tokens?.user_id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start a conversation",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert([{
          session_title: 'Diamond Consultation',
          is_active: true,
          user_id: tokens.user_id
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        await fetchConversations();
        setActiveConversation(data.id);
        setMessages([]);
        
        toast({
          title: "Success",
          description: "New conversation started",
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConversation || isLoading || !isAuthenticated) return;

    try {
      // Validate and sanitize the message
      const validatedMessage = validateAndSanitize(chatMessageSchema, {
        content: input.trim(),
        role: 'user'
      });

      const userMessage = validatedMessage.content;
      setInput("");
      setIsLoading(true);

      // Add user message to database
      const { data: userMsgData, error: userMsgError } = await supabase
        .from('chat_conversation_messages')
        .insert([{
          conversation_id: activeConversation,
          role: 'user',
          content: userMessage,
          tokens_used: 0
        }])
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      if (userMsgData) {
        const typedUserMessage: Message = {
          id: userMsgData.id,
          role: 'user',
          content: sanitizeHtml(userMsgData.content),
          tokens_used: userMsgData.tokens_used || 0,
          created_at: userMsgData.created_at || new Date().toISOString()
        };
        setMessages(prev => [...prev, typedUserMessage]);

        // Simulate AI response (replace with actual AI service call later)
        const aiResponse = `I understand you're asking about: "${sanitizeHtml(userMessage)}". As a diamond expert, I'd be happy to help with your diamond-related questions. This is a placeholder response that will be replaced with actual AI functionality.`;
        
        const { data: aiMsgData, error: aiMsgError } = await supabase
          .from('chat_conversation_messages')
          .insert([{
            conversation_id: activeConversation,
            role: 'assistant',
            content: aiResponse,
            tokens_used: 50
          }])
          .select()
          .single();

        if (aiMsgError) throw aiMsgError;

        if (aiMsgData) {
          const typedAiMessage: Message = {
            id: aiMsgData.id,
            role: 'assistant',
            content: sanitizeHtml(aiMsgData.content),
            tokens_used: aiMsgData.tokens_used || 0,
            created_at: aiMsgData.created_at || new Date().toISOString()
          };
          setMessages(prev => [...prev, typedAiMessage]);

          // Track API usage
          if (tokens?.user_id) {
            await supabase
              .from('api_usage')
              .insert([{
                api_type: 'openai_chat',
                tokens_used: 50,
                cost: 0.001,
                user_id: tokens.user_id,
                telegram_id: null,
                client_id: tokens.user_id,
                request_data: { message: sanitizeHtml(userMessage) },
                response_data: { response: sanitizeHtml(aiResponse) }
              }]);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please check your input.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diamond AI Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            Please log in to access the AI chat feature
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Conversations</CardTitle>
            <Button size="sm" onClick={createNewConversation}>
              New Chat
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 max-h-[500px] overflow-y-auto p-4">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConversation(conv.id);
                  fetchMessages(conv.id);
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  activeConversation === conv.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <div className="font-medium text-sm">{sanitizeHtml(conv.session_title)}</div>
                <div className="text-xs opacity-70">
                  {new Date(conv.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Diamond AI Assistant</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ask me anything about your diamond inventory, pricing, or recommendations
          </p>
        </CardHeader>
        <CardContent className="flex flex-col h-[500px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {activeConversation ? (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar>
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-sm" dangerouslySetInnerHTML={{ __html: message.content }} />
                      {message.tokens_used && message.tokens_used > 0 && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {message.tokens_used} tokens
                        </Badge>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <Avatar>
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a conversation or start a new one to begin chatting
              </div>
            )}
          </div>

          {/* Input */}
          {activeConversation && (
            <div className="flex space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about diamonds, inventory, pricing..."
                className="flex-1 min-h-[80px] resize-none"
                disabled={isLoading}
                maxLength={4000}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="self-end"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
