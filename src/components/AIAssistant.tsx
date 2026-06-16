import React, { useState } from 'react';
import { Sparkles, ArrowRight, User, CircleAlert, HelpCircle, RefreshCw, Scissors, Compass } from 'lucide-react';
import { Service, Barber } from '../types';

interface AIAssistantProps {
  onApplyPreset: (barberName: string, notes: string) => void;
  barbers: Barber[];
  services: Service[];
}

export default function AIAssistant({ onApplyPreset, barbers, services }: AIAssistantProps) {
  // Input parameters
  const [faceShape, setFaceShape] = useState('Овальное');
  const [hairType, setHairType] = useState('Густые и жесткие');
  const [stylePref, setStylePref] = useState('Классическая элегантность');
  const [beardState, setBeardState] = useState('Ухоженная борода');
  const [customText, setCustomText] = useState('');
  
  // App state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errorStr, setErrorStr] = useState<string | null>(null);

  // Lists of parameter values for luxury user selection
  const FACE_SHAPES = [
    { name: 'Овальное', desc: 'Универсальная форма с пропорциональными чертами' },
    { name: 'Квадратное', desc: 'Мужественные резкие скулы и выраженная челюсть' },
    { name: 'Круглое', desc: 'Мягкие округлые контуры, равные длина и ширина' },
    { name: 'Треугольное / Сердце', desc: 'Широкий лоб и зауженный волевой подбородок' }
  ];

  const HAIR_TYPES = [
    { name: 'Густые и жесткие', desc: 'Отлично держат объемные классические стрижки' },
    { name: 'Тонкие / Редкие', desc: 'Требуют текстурирования и матового стайлинга' },
    { name: 'Волнистые / Кудрявые', desc: 'Идеальны для удлиненных текстурных образов' },
    { name: 'Прямые и непослушные', desc: 'Требуют четкой помады и жесткой фиксации' }
  ];

  const STYLE_PREFERENCES = [
    { name: 'Классическая элегантность', desc: 'Бизнес, классические проборы, костюмная эстетика' },
    { name: 'Современный мегаполис', desc: 'Текстурные кропы, гранж, легкая небрежность' },
    { name: 'Спортивный минимализм', desc: 'Ультракороткие стрижки, милитари, максимальное удобство' },
    { name: 'Авангард / Креатив', desc: 'Неординарное сведение, акценты, индивидуальность' }
  ];

  const BEARD_STATES = [
    { name: 'Гладко выбрит', desc: 'Требует безупречной гладкости кожи без раздражения' },
    { name: 'Легкая щетина', desc: 'Аккуратная 3-дневная щетина с четкими контурами' },
    { name: 'Ухоженная борода', desc: 'Средняя плотность, требует моделирования формы' },
    { name: 'Длинная / Густая борода', desc: 'Требует глубокого питания маслом и фиксации воском' }
  ];

  const handleGenerateConsultation = async () => {
    setLoading(true);
    setResult(null);
    setErrorStr(null);
    
    try {
      const response = await fetch('/api/gemini/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faceShape,
          hairStructure: hairType,
          stylePreference: stylePref,
          beardIntensity: beardState,
          additionalNotes: customText
        })
      });
      
      const data = await response.json();
      if (data.success && data.consultation) {
        setResult(data.consultation);
      } else {
        throw new Error(data.error || 'Произошла непредвиденная ошибка при запросе к стилисту');
      }
    } catch (err: any) {
      console.error(err);
      setErrorStr(err.message || 'Связь со стилистом временно прервана. Пожалуйста, убедитесь в наличии интернет-соединения.');
    } finally {
      setLoading(false);
    }
  };

  // Safe markdown-to-html custom parser to avoid third-party dependencies breaking types
  const renderFormattedResult = (markdown: string) => {
    const lines = markdown.split('\n');
    return lines.map((line, idx) => {
      // Remove trailing and leading blanks
      const trimmed = line.trim();
      
      // Horizontal rule
      if (trimmed === '---') {
        return <hr key={idx} className="border-amber-900/40 my-4" />;
      }
      
      // Headers
      if (trimmed.startsWith('####')) {
        return <h5 key={idx} className="text-amber-300 font-semibold text-base mt-4 mb-2 tracking-tight flex items-center gap-2"> <Compass className="w-4 h-4 text-amber-500/80" /> {trimmed.replace(/^####\s*/, '')}</h5>;
      }
      if (trimmed.startsWith('###')) {
        return <h4 key={idx} className="text-amber-400 font-bold text-lg mt-5 mb-3 tracking-wider border-b border-amber-950/40 pb-1">{trimmed.replace(/^###\s*/, '')}</h4>;
      }
      if (trimmed.startsWith('##')) {
        return <h3 key={idx} className="text-amber-400 font-bold text-xl mt-6 mb-4 tracking-widest">{trimmed.replace(/^##\s*/, '')}</h3>;
      }

      // Check bold phrases
      let content = trimmed;
      // Basic regex replacement for **text** -> <strong>text</strong>
      const boldRegex = /\*\*(.*?)\*\*/g;
      
      // Bullet points
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const rawText = trimmed.substring(1).trim();
        const cleanElements: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;
        let pKey = 0;
        
        while ((match = boldRegex.exec(rawText)) !== null) {
          if (match.index > lastIndex) {
            cleanElements.push(<span key={pKey++}>{rawText.substring(lastIndex, match.index)}</span>);
          }
          cleanElements.push(<strong key={pKey++} className="text-amber-200 font-semibold">{match[1]}</strong>);
          lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < rawText.length) {
          cleanElements.push(<span key={pKey++}>{rawText.substring(lastIndex)}</span>);
        }

        return (
          <li key={idx} className="ml-4 list-disc pl-1 py-1 text-gray-300 text-sm leading-relaxed">
            {cleanElements.length > 0 ? cleanElements : rawText}
          </li>
        );
      }

      // Regular line with bold formatting
      if (trimmed === '') return <div key={idx} className="h-2" />;
      
      const cleanElements: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      let pKey = 0;
      
      while ((match = boldRegex.exec(trimmed)) !== null) {
        if (match.index > lastIndex) {
          cleanElements.push(<span key={pKey++}>{trimmed.substring(lastIndex, match.index)}</span>);
        }
        cleanElements.push(<strong key={pKey++} className="text-amber-200 font-semibold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < trimmed.length) {
        cleanElements.push(<span key={pKey++}>{trimmed.substring(lastIndex)}</span>);
      }

      return (
        <p key={idx} className="text-gray-300 text-sm leading-relaxed mb-3">
          {cleanElements.length > 0 ? cleanElements : trimmed}
        </p>
      );
    });
  };

  // Tries to auto-extract the suggested master names from generated text to apply instantly
  const handleAutoApply = () => {
    if (!result) return;
    let recommendedBarber = 'Дмитрий Раевский'; // fallback
    let desc = `Автоматически настроено AI-стилистом.\nПожелания: ${faceShape} лицо, ${hairType} волосы, стиль ${stylePref}, борода: ${beardState}`;
    
    if (result.includes('Артём') || result.includes('Артем') || result.includes('Громов')) {
      recommendedBarber = 'Артём Громов';
    } else if (result.includes('Максим') || result.includes('Леонов')) {
      recommendedBarber = 'Максим Леонов';
    } else if (result.includes('Дмитрий') || result.includes('Раевский')) {
      recommendedBarber = 'Дмитрий Раевский';
    }
    
    onApplyPreset(recommendedBarber, desc);
  };

  return (
    <div className="bg-neutral-900 border border-amber-900/30 rounded-xl p-6 md:p-8 max-w-4xl mx-auto shadow-2xl relative overflow-hidden" id="ai-stylist-panel">
      {/* Decorative radial gradients for luxury atmosphere */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-amber-500/10 to-transparent pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-radial from-amber-900/10 to-transparent pointer-events-none rounded-full" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-950/60 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            Интеллектуальная система
          </div>
          <h3 className="text-2xl font-bold text-neutral-100 tracking-tight">AI Иммидж-Консультант «Девять»</h3>
          <p className="text-neutral-400 text-sm mt-1">
            Нейросетевой симулятор маэстро-стилиста подберет стрижку и стайлинг за несколько мгновений.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-mono self-start md:self-auto bg-black/30 px-3 py-1.5 rounded-lg border border-neutral-800">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
          ВКЛЮЧЕН СЕРВЕРНЫЙ GEMINI-3.5
        </div>
      </div>

      {!result && !loading && (
        <div className="space-y-6">
          {/* Parameter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Face Shape */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-amber-500 uppercase tracking-widest">1. Форма вашего лица</label>
              <div className="grid grid-cols-1 gap-2">
                {FACE_SHAPES.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => setFaceShape(option.name)}
                    className={`text-left p-3 rounded-lg border transition-all duration-300 ${
                      faceShape === option.name
                        ? 'bg-amber-950/30 border-amber-500/50 text-neutral-100'
                        : 'bg-neutral-955/20 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-semibold text-sm">{option.name}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Type */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-amber-500 uppercase tracking-widest">2. Структура волос</label>
              <div className="grid grid-cols-1 gap-2">
                {HAIR_TYPES.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => setHairType(option.name)}
                    className={`text-left p-3 rounded-lg border transition-all duration-300 ${
                      hairType === option.name
                        ? 'bg-amber-950/30 border-amber-500/50 text-neutral-100'
                        : 'bg-neutral-955/20 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-semibold text-sm">{option.name}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Preference */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-amber-500 uppercase tracking-widest">3. Желаемый стиль</label>
              <div className="grid grid-cols-1 gap-2">
                {STYLE_PREFERENCES.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => setStylePref(option.name)}
                    className={`text-left p-3 rounded-lg border transition-all duration-300 ${
                      stylePref === option.name
                        ? 'bg-amber-950/30 border-amber-500/50 text-neutral-100'
                        : 'bg-neutral-955/20 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-semibold text-sm">{option.name}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Beard State */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-amber-500 uppercase tracking-widest">4. Борода и усы</label>
              <div className="grid grid-cols-1 gap-2">
                {BEARD_STATES.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => setBeardState(option.name)}
                    className={`text-left p-3 rounded-lg border transition-all duration-300 ${
                      beardState === option.name
                        ? 'bg-amber-950/30 border-amber-500/50 text-neutral-100'
                        : 'bg-neutral-955/20 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-semibold text-sm">{option.name}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom notes */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-mono text-amber-400/80 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              Особые комментарии для мастера (необязательно)
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Например: Хочу спрятать вихры на макушке, предпочитаю не использовать гель, волосы растут асимметрично..."
              className="w-full bg-neutral-950/60 border border-neutral-800 rounded-lg p-3 text-neutral-200 text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 active:border-amber-500 min-h-[80px]"
            />
          </div>

          <button
            onClick={handleGenerateConsultation}
            className="w-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-600 text-neutral-900 font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-amber-950/30 flex items-center justify-center gap-2.5 cursor-pointer uppercase text-xs tracking-widest border border-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Получить премиум имидж-карту
          </button>
        </div>
      )}

      {/* Loading state with beautiful sensory text animations */}
      {loading && (
        <div className="py-16 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-amber-500 animate-spin" />
            <Scissors className="w-6 h-6 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
          </div>
          
          <div className="mt-8 text-center space-y-2">
            <h4 className="text-amber-500 text-sm font-mono uppercase tracking-widest animate-pulse">Анализ геометрии черепа и плотности фолликулов...</h4>
            <p className="text-xs text-neutral-500 max-w-md mx-auto italic">
              «Девять» моделирует пропорции. Нейросеть сопоставляет плотность ваших волос с лучшими уходовыми формулами O&apos;Douds, Shear Revival и Reuzel.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {errorStr && (
        <div className="p-5 bg-red-950/20 border border-red-900/40 rounded-lg text-rose-300 text-sm flex items-start gap-4 my-4">
          <CircleAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-semibold text-neutral-200">Ошибка связи</p>
            <p className="text-neutral-400 text-xs">{errorStr}</p>
            <button
              onClick={() => handleGenerateConsultation()}
              className="mt-2 text-xs font-bold text-amber-400 hover:underline flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Попробовать снова
            </button>
          </div>
        </div>
      )}

      {/* Structured markdown result */}
      {result && (
        <div className="space-y-6">
          <div className="bg-black/40 border border-amber-950/40 rounded-lg p-5 md:p-6 prose prose-invert max-w-none shadow-inner overflow-y-auto max-h-[480px]">
            {renderFormattedResult(result)}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleAutoApply}
              className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-5 py-3.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300"
            >
              <User className="w-4 h-4 text-amber-400" />
              Применить выбор мастера и заново заполнить форму записи
            </button>
            <button
              onClick={() => {
                setResult(null);
                setCustomText('');
              }}
              className="px-5 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300"
            >
              Новая консультация
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
