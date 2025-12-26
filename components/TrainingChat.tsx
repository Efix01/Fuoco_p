import React, { useState, useRef, useEffect } from 'react';
import { chatWithMentor, checkApiKey } from '../services/gemini';
import { ChatMessage } from '../types';
import { Send, User, Bot, Sparkles, AlertCircle } from 'lucide-react';

const TrainingChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Ciao! Sono il tuo assistente GAUF per il training. Possiamo simulare uno scenario di fuoco prescritto o analizzare una tecnica specifica. Di cosa vuoi parlare oggi?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, error]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setError(null);
    const userText = input;
    const userMsg: ChatMessage = { role: 'user', text: userText, timestamp: new Date() };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      await checkApiKey();
      
      // Pass the entire history (excluding the msg we just added locally, as state updates are async)
      // Actually, standard practice is to pass current history + new message to service if service is stateless
      // But our service now takes history.
      const responseText = await chatWithMentor([...messages, userMsg], userText);

      const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (e: any) {
      console.error(e);
      setError("Impossibile connettersi al mentore AI. Verifica la chiave API.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
      <div className="bg-slate-900 p-4 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-emerald-400" />
        <h2 className="text-white font-bold">Training Simulator AI</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-emerald-600' : 'bg-orange-500'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
              }`}>
                {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex gap-1">
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
             </div>
           </div>
        )}

        {error && (
            <div className="flex justify-center my-2">
                <div className="bg-red-100 text-red-700 text-xs px-4 py-2 rounded-full flex items-center gap-2 border border-red-200">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Chiedi spiegazioni su una tecnica o simula un cambio vento..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingChat;