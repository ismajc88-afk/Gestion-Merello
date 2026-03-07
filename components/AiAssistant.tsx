
import React, { useState, useRef, useEffect } from 'react';
import { generateFallasAdvice } from '../services/geminiService';
import { X, Send, Bot, FileSearch, Sparkles, Loader2 } from 'lucide-react';
import { AppData } from '../types';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose, appData }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: '¡Che, qué pasa! Soy tu asesor fallero digital. ¿En qué te ayudo hoy? ¿Revisamos las cuentas o la lista de la compra?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  if (!isOpen) return null;

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Preparar contexto reducido para no exceder tokens o ensuciar
    const context = JSON.stringify({
      presupuesto: appData.budgetLimit,
      gastado: appData.transactions.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0),
      falleros: appData.members.length,
      alertas: appData.incidents.filter(i => i.status === 'OPEN').length,
      stock_critico: appData.stock.filter(s => s.quantity <= s.minStock).map(s => s.name)
    });

    try {
        const response = await generateFallasAdvice(text, context);
        setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (e) {
        setMessages(prev => [...prev, { role: 'ai', text: "Error de comunicación. Inténtalo de nuevo." }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end items-end md:items-center animate-in fade-in duration-200 md:bg-black/60 md:backdrop-blur-sm">
      <div className="bg-white w-full md:w-[500px] h-[100dvh] md:h-[90vh] md:mr-8 md:rounded-[32px] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-right duration-300 md:border-4 md:border-white md:ring-4 md:ring-black/10">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 md:p-6 flex justify-between items-center text-white shadow-lg shrink-0 safe-pt">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 md:p-3 rounded-2xl backdrop-blur-sm border border-white/20">
               <Bot size={24} className="text-white" />
            </div>
            <div>
               <h3 className="font-black text-lg md:text-xl leading-none italic tracking-tight">Chispas AI</h3>
               <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  Online
               </span>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-colors active:scale-90"><X size={24} /></button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-50 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 md:p-5 rounded-3xl text-sm font-medium shadow-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-slate-700 border border-slate-200/60 rounded-bl-sm'}`}>
                {m.text.split('\n').map((line, j) => (
                    <span key={j} className="block min-h-[1em]">{line}</span>
                ))}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="bg-white p-4 rounded-3xl rounded-bl-sm border border-slate-100 shadow-sm flex items-center gap-2">
                  <Loader2 size={18} className="text-indigo-600 animate-spin"/>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pensando...</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Action Buttons */}
        <div className="p-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
           {[
             { label: 'Auditoría', icon: FileSearch, prompt: "Audita mi presupuesto actual y busca desviaciones." },
             { label: 'Idea Menú', icon: Sparkles, prompt: "Dame una idea de menú barato para hoy." },
             { label: 'Consejo', icon: Bot, prompt: "Dame un consejo para organizar mejor la plantà." }
           ].map((btn, idx) => (
               <button 
                 key={idx}
                 onClick={() => handleSend(btn.prompt)}
                 className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wide hover:bg-indigo-50 hover:text-indigo-600 transition-colors whitespace-nowrap border border-slate-200"
               >
                  <btn.icon size={14} /> {btn.label}
               </button>
           ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-white flex gap-2 shrink-0 safe-pb border-t border-slate-50">
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta algo..." 
            className="flex-1 border-2 border-slate-100 rounded-[24px] px-6 py-3 md:py-4 outline-none focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-bold text-slate-700 placeholder:text-slate-300 text-base"
          />
          <button 
            onClick={() => handleSend()} 
            disabled={loading || !input.trim()} 
            className="bg-indigo-600 text-white p-3 md:p-4 rounded-[24px] hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-90 flex items-center justify-center aspect-square"
          >
            <Send size={20} className={loading ? 'opacity-0' : 'opacity-100'} />
            {loading && <Loader2 size={20} className="absolute animate-spin" />}
          </button>
        </div>
      </div>
    </div>
  );
};
