import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Minimize2, 
  User, 
  Laptop, 
  Compass, 
  ArrowRight 
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Приветствую вас, джентльмен. Я Роман — ваш персональный ИИ-консьерж клуба «ДЕВЯТЬ». С удовольствием помогу сориентироваться в мире элитарного груминга, подобрать топ-мастера, рассказать о бесплатном паркинге или забронировать визит. О чем пожелаете узнать?',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const listRef = useRef<HTMLDivElement>(null);

  // Auto scroll to message bottom
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const quickPrompts = [
    { label: 'Топ-Мастера ✂️', query: 'Какие у вас есть топ-мастера и какая у них специализация?' },
    { label: 'Прайс-лист & Стоимость 💎', query: 'Какая стоимость ваших основных услуг ухода?' },
    { label: 'Подземный паркинг 🚗', query: 'Как заехать на ваш бесплатный паркинг?' },
    { label: 'Где вы находитесь? 📍', query: 'Какой точный адрес и как к вам добраться в Москве?' }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setShowQuickReplies(false);

    try {
      // Map history to the key format expected by server.ts
      const payloadMessages = [...messages, userMsg].map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        text: msg.text
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: payloadMessages })
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            role: 'assistant',
            text: data.reply,
            time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error(data.error || 'Server returns failed response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'assistant',
          text: 'Джентльмен, прошу прощения. Из-за временного отсутствия сигнала в лаунже я не смог связаться с базой знаний. Вы можете задать этот же вопрос нашему администратору рецепции по телефону: +7 (495) 909-09-09.',
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="ai-companion-chatbot">
      <AnimatePresence>
        {/* Chat window panel */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.45 }}
            className="w-[360px] sm:w-[410px] h-[580px] bg-neutral-950 border-2 border-amber-950 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 mr-0 sm:mr-2"
          >
            {/* Elegant Header with Brand Theme */}
            <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 px-5 py-4 border-b border-amber-950/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 flex items-center justify-center border border-amber-400/20">
                    <Sparkles className="w-4 h-4 text-neutral-950" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-neutral-950 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-100 flex items-center gap-1.5">
                    Роман <span className="text-[10px] text-amber-500">Concierge AI</span>
                  </h4>
                  <p className="text-[9px] font-mono tracking-wide text-neutral-500">Онлайн сопровождение Club Nine</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900 transition-colors"
                  title="Свернуть чат"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-neutral-500 hover:text-amber-500 hover:bg-neutral-900 transition-colors"
                  title="Закрыть чат"
                >
                  <X className="w-4" />
                </button>
              </div>
            </div>

            {/* Message window scroller area */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
              ref={listRef}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d97706 transparent' 
              }}
            >
              {messages.map((msg) => {
                const isAI = msg.role === 'assistant';
                return (
                  <div 
                    key={msg.id}
                    className={`flex items-start gap-2.5 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                  >
                    {isAI ? (
                      <div className="w-7 h-7 rounded-lg bg-amber-950/30 border border-amber-500/10 flex items-center justify-center shrink-0 self-start text-amber-500">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 self-start text-neutral-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className={`p-3.5 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                        isAI 
                          ? 'bg-neutral-900/40 text-neutral-200 border border-neutral-900 rounded-tl-none font-sans' 
                          : 'bg-amber-600 text-neutral-950 font-semibold rounded-tr-none'
                        }`}
                      >
                        {/* Preserve layout newlines beautifully */}
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                      <span className={`block text-[9px] font-mono text-neutral-600 ${!isAI && 'text-right'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Bot thinking placeholder */}
              {isLoading && (
                <div className="flex items-start gap-2.5 mr-auto max-w-[85%]">
                  <div className="w-7 h-7 rounded-lg bg-amber-950/30 border border-amber-500/10 flex items-center justify-center shrink-0 text-amber-500">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="p-3 bg-neutral-900/20 border border-neutral-900 rounded-2xl rounded-tl-none flex items-center gap-1.5 self-center">
                    <span className="text-[11px] font-mono text-neutral-400">Роман формулирует мысль</span>
                    <span className="flex gap-0.5 mt-1.5">
                      <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" />
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Prompt Recommendations */}
              {showQuickReplies && !isLoading && (
                <div className="pt-2.5 space-y-2 border-t border-neutral-900/60 mt-4">
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest pl-1">Быстрые вопросы:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q.query)}
                        className="text-[10px] text-neutral-400 hover:text-amber-400 bg-neutral-900/60 hover:bg-neutral-900/95 px-3 py-1.5 rounded-lg border border-neutral-850 hover:border-amber-500/30 transition-all font-mono"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-4 bg-neutral-900/40 border-t border-amber-950/40 flex gap-2.5 items-center shrink-0"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Спросите Романа о подборе ухода, мастере..."
                disabled={isLoading}
                className="flex-1 bg-neutral-950 border border-neutral-850 focus:border-amber-500/40 rounded-xl px-4 py-3 text-xs text-neutral-200 outline-none transition-all placeholder:text-neutral-600 disabled:opacity-50 font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="w-10 h-10 rounded-xl bg-amber-600 disabled:bg-neutral-900 text-neutral-950 disabled:text-neutral-700 font-bold flex items-center justify-center transition-all cursor-pointer hover:bg-amber-500 shrink-0"
                title="Отправить сообщение"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher trigger button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 shadow-2xl flex items-center justify-center cursor-pointer border border-amber-400/20"
        title="Ваш ИИ Консьерж Роман"
      >
        {/* Animated accent halo */}
        <span className="absolute -inset-1 rounded-full bg-amber-600/25 blur-sm opacity-40 group-hover:opacity-75 transition-opacity animate-pulse pointer-events-none" />
        
        {isOpen ? (
          <X className="w-6 h-6 text-neutral-950 stroke-[2.5]" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 text-neutral-950 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-600 border border-neutral-950" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
