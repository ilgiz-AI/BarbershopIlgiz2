import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  User, 
  ArrowRight, 
  Compass, 
  Check, 
  RotateCcw, 
  Sliders, 
  HelpCircle, 
  Activity,
  Heart,
  Video,
  Play,
  Pause,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LOOKS_GALLERY, SPECIALIST_BARBERS } from '../data';
import { Look } from '../types';

interface AIVisualizationProps {
  onApplyPreset: (barberName: string, notes: string) => void;
}

// Model silhouette profiles for instant simulation
const SILHOUETTE_PROFILES = [
  { id: 'p_1', name: 'Александр', shape: 'Овальное лицо', type: 'Тёмные жесткие волосы', desc: 'Универсальные пропорции', seed: 'alex' },
  { id: 'p_2', name: 'Михаил', shape: 'Квадратное лицо', type: 'Густые светлые волосы', desc: 'Мужественная широкая челюсть', seed: 'mike' },
  { id: 'p_3', name: 'Константин', shape: 'Круглое лицо', type: 'Вьющиеся густые волосы', desc: 'Сглаженные симметричные скулы', seed: 'kostya' },
  { id: 'p_4', name: 'Ярослав', shape: 'Треугольное лицо', type: 'Тонкие темные волосы', desc: 'Волевой зауженный подбородок', seed: 'yaro' }
];

export default function AIVisualization({ onApplyPreset }: AIVisualizationProps) {
  // Styles
  const [selectedLook, setSelectedLook] = useState<Look>(LOOKS_GALLERY[0]);
  
  // Custom uploaded photo
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedSilhouette, setSelectedSilhouette] = useState<string>('p_1');
  const [sourceType, setSourceType] = useState<'upload' | 'silhouette'>('silhouette');
  
  // Custom style requests
  const [modifiers, setModifiers] = useState('');
  
  // Status hooks
  const [processing, setProcessing] = useState(false);
  const [visualizedResult, setVisualizedResult] = useState<any | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  // Tab selector for successful visual results and sliding split-selector
  const [resultTab, setResultTab] = useState<'slider' | 'orig_look' | 'face_only' | 'video_3d'>('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  
  // High-Tech AI Video Player parameters
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoAngle, setVideoAngle] = useState<'front' | 'left' | 'back' | 'zoom'>('front');
  const [videoProgress, setVideoProgress] = useState(24);
  const [renderingVideo, setRenderingVideo] = useState(false);
  const [videoRenderPercent, setVideoRenderPercent] = useState(0);
  const [videoRendered, setVideoRendered] = useState(false);

  // Transition handler with futuristic progressive render simulation
  const handleSwitchToVideo = () => {
    setResultTab('video_3d');
    if (!videoRendered) {
      setRenderingVideo(true);
      setVideoRenderPercent(0);
      const interval = setInterval(() => {
        setVideoRenderPercent(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setRenderingVideo(false);
            setVideoRendered(true);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
    }
  };

  // Automated frames progression looping simulation for the AI player
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (resultTab === 'video_3d' && isVideoPlaying && !renderingVideo) {
      interval = setInterval(() => {
        setVideoProgress(prev => (prev >= 100 ? 0 : prev + 1));
      }, 70);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resultTab, isVideoPlaying, renderingVideo]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, загрузите действительное изображение (JPEG/PNG)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('Пожалуйста, загрузите изображение объемом менее 8 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoBase64(event.target.result as string);
        setPhotoName(file.name);
        setSourceType('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleResetPhoto = () => {
    setPhotoBase64(null);
    setPhotoName(null);
    if (sourceType === 'upload') {
      setSourceType('silhouette');
    }
  };

  // Run style visualization
  const handleRunVisualization = async () => {
    setProcessing(true);
    setVisualizedResult(null);
    setErrorText(null);

    // Get current face shape description
    const faceShape = sourceType === 'upload' 
      ? 'Индивидуальная форма по фото гостя' 
      : SILHOUETTE_PROFILES.find(p => p.id === selectedSilhouette)?.shape || 'Овальное лицо';

    try {
      const response = await fetch('/api/gemini/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faceShape,
          styleName: selectedLook.name,
          hasUserPhoto: sourceType === 'upload',
          additionalPrompt: modifiers
        })
      });

      const data = await response.json();
      if (data.success) {
        setVisualizedResult(data);
      } else {
        throw new Error(data.error || 'Произошла ошибка при виртуальном моделировании.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Связь с сервером моделирования прервана. Пожалуйста, попробуйте еще раз.');
    } finally {
      setProcessing(false);
    }
  };

  // Apply visual settings to main booking form
  const handleApplyToBooking = () => {
    if (!visualizedResult) return;
    
    // Find the correct master in local list
    const recommendedBarber = visualizedResult.barber;
    let targetId = 'Дмитрий Раевский'; // fallback
    
    if (recommendedBarber.includes('Артём') || recommendedBarber.includes('Артем') || recommendedBarber.includes('Громов')) {
      targetId = 'Артём Громов';
    } else if (recommendedBarber.includes('Максим') || recommendedBarber.includes('Леонов')) {
      targetId = 'Максим Леонов';
    } else if (recommendedBarber.includes('Дмитрий') || recommendedBarber.includes('Раевский')) {
      targetId = 'Дмитрий Раевский';
    }

    const desc = `Заявка с ИИ-Примерочной.\nСтиль: ${selectedLook.name}\nАнализ лица: ${visualizedResult.analysis.substring(0, 100)}...`;
    onApplyPreset(targetId, desc);

    // Smooth scroll back to form
    const bookingForm = document.getElementById('booking-section');
    if (bookingForm) {
      bookingForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-neutral-900 border border-amber-900/30 rounded-xl p-6 md:p-8 max-w-5xl mx-auto shadow-2xl relative overflow-hidden font-sans" id="ai-photo-fitting-room">
      {/* Background visual graphics */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-radial from-amber-600/5 to-transparent pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-radial from-amber-900/5 to-transparent pointer-events-none rounded-full" />

      {/* Header section with badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-950/60 pb-5 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-blue-400 text-xs font-semibold tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            Виртуальный Конструктор «ДЕВЯТЬ»
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-100 tracking-tight">ИИ Фото-Примерочная Стрижек</h2>
          <p className="text-neutral-400 text-xs md:text-sm mt-1">
            Загрузите свой портрет или используйте 3D-манекен для мгновенной примерки премиальных укладок нашего клуба.
          </p>
        </div>
        <div className="self-start md:self-auto bg-black/40 border border-neutral-800 rounded-xl px-4 py-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
          <div className="text-[11px] font-mono tracking-wider text-neutral-400 uppercase">Скан-анализатор: <span className="text-emerald-500 font-bold">ОНЛАЙН</span></div>
        </div>
      </div>

      {!visualizedResult && !processing && (
        <div className="space-y-8">
          {/* Step 1: Hairstyle selection */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-[10px] text-amber-400 font-bold font-mono">1</span>
              Выберите желаемую стрижку из клубной карты:
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {LOOKS_GALLERY.map((look) => {
                const isSelected = selectedLook.id === look.id;
                return (
                  <button
                    key={look.id}
                    onClick={() => setSelectedLook(look)}
                    className={`text-left rounded-xl overflow-hidden border transition-all duration-300 flex flex-col h-full bg-neutral-950/50 ${
                      isSelected 
                        ? 'border-amber-500 ring-1 ring-amber-500/20 shadow-lg scale-[1.01]' 
                        : 'border-neutral-850 hover:border-neutral-700'
                    }`}
                  >
                    <div className="relative aspect-square w-full bg-neutral-900 border-b border-neutral-900 overflow-hidden">
                      <img 
                        src={look.image} 
                        alt={look.name} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-amber-500 border border-neutral-950 flex items-center justify-center text-neutral-950">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h5 className="font-bold text-neutral-100 text-xs tracking-wide leading-tight">{look.name}</h5>
                        <p className="text-[10px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">{look.description}</p>
                      </div>
                      <div className="mt-2.5 pt-2.5 border-t border-neutral-905/40 flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-amber-500">Уход: {look.difficulty}</span>
                        <span className="text-[9px] font-mono text-neutral-500">Поддержание: {look.difficulty === 'Легкая' ? '2-3 нед' : '3-4 нед'}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-neutral-850/40 my-2" />

          {/* Step 2: Upload or Prototype selection */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Source Input selectors */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-xs font-mono text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-[10px] text-amber-400 font-bold font-mono">2</span>
                Выберите основу для примерки:
              </h4>

              {/* Toggle Selector */}
              <div className="grid grid-cols-2 gap-2 bg-neutral-950/80 p-1 border border-neutral-850 rounded-xl">
                <button
                  onClick={() => setSourceType('silhouette')}
                  className={`py-2 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                    sourceType === 'silhouette'
                      ? 'bg-neutral-900 border border-amber-950/30 text-amber-400'
                      : 'text-neutral-550 hover:text-neutral-300'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Мужской 3D Пресет
                </button>
                <button
                  onClick={() => setSourceType('upload')}
                  className={`py-2 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                    sourceType === 'upload'
                      ? 'bg-neutral-900 border border-amber-950/30 text-amber-400'
                      : 'text-neutral-550 hover:text-neutral-300'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Загрузить своё фото
                </button>
              </div>

              {/* Sub-view switcher */}
              {sourceType === 'silhouette' ? (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {SILHOUETTE_PROFILES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedSilhouette(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedSilhouette === p.id && sourceType === 'silhouette'
                          ? 'bg-amber-950/20 border-amber-500/50 text-neutral-100 ring-1 ring-amber-500/10'
                          : 'bg-neutral-955/20 border-neutral-850 hover:border-neutral-750 text-neutral-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{p.name}</span>
                        <div className={`w-2.5 h-2.5 rounded-full border ${
                          selectedSilhouette === p.id ? 'bg-amber-500 border-neutral-900' : 'border-neutral-700'
                        }`} />
                      </div>
                      <div className="text-[10px] font-mono text-amber-500/70 mt-1">{p.shape}</div>
                      <div className="text-[9px] text-neutral-500 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    dragActive 
                      ? 'border-amber-500 bg-amber-950/10' 
                      : 'border-neutral-800 hover:border-neutral-700 bg-neutral-955/5'
                  }`}
                  onClick={triggerUpload}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  {photoBase64 ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-amber-950">
                        <img 
                          src={photoBase64} 
                          alt="Uploaded avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-[11px] font-mono text-emerald-500 font-bold mb-0.5">Фотография успешно подготовлена</p>
                        <p className="text-[9px] text-neutral-500 truncate max-w-[200px]">{photoName}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetPhoto();
                        }}
                        className="mt-2 text-[9px] font-mono text-red-500 hover:text-red-400 hover:underline cursor-pointer uppercase tracking-wider"
                      >
                        Заменить изображение
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-neutral-950/60 border border-neutral-850 flex items-center justify-center text-neutral-400">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-300">Перетащите сюда фото или нажмите для поиска</p>
                        <p className="text-[10px] text-neutral-500 mt-1 italic">Поддерживаются форматы JPEG, PNG, WEBP объемом до 8 МБ</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Col: Custom request modifier */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-xs font-mono text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-[10px] text-amber-400 font-bold font-mono">3</span>
                Особые пожелания к ИИ:
              </h4>
              
              <div className="space-y-2">
                <textarea
                  value={modifiers}
                  onChange={(e) => setModifiers(e.target.value)}
                  placeholder="Добавить бороду чуть гуще? Оформить виски короче? Сделать ретро-пробор? Укажите ваши пожелания для корректировки ИИ-модели..."
                  className="w-full h-[105px] bg-neutral-950/70 border border-neutral-850 rounded-xl p-3 text-neutral-200 text-xs placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 active:border-amber-500"
                />
                <div className="flex flex-wrap gap-1">
                  {['гуще бороду', 'короткие виски', 'с косым пробором', 'матовый эффект'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setModifiers(prev => prev ? `${prev}, ${tag}` : tag)}
                      className="text-[9px] font-mono text-neutral-500 hover:text-amber-500 bg-neutral-955 p-1 px-2 border border-neutral-900 rounded hover:border-amber-950/50"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunVisualization}
            className="w-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-600 text-neutral-950 font-extrabold py-4 px-6 rounded-xl transition-all duration-300 shadow-xl shadow-amber-950/20 flex items-center justify-center gap-3 cursor-pointer uppercase text-xs tracking-widest border border-amber-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Смоделировать образ с ИИ-стилистом
          </button>
        </div>
      )}

      {/* Processing Animation Screen */}
      {processing && (
        <div className="py-20 flex flex-col items-center justify-center relative">
          
          <div className="relative w-40 h-40 mb-8">
            {/* Hologram loading loop */}
            <div className="absolute inset-0 rounded-full border-[3px] border-amber-950" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-amber-500 border-l-amber-500 animate-spin" />
            
            {/* Holographic grid matrix line scanning */}
            <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse" />
            
            {/* Inner portrait avatar */}
            <div className="absolute inset-4 rounded-full overflow-hidden bg-neutral-950 border border-amber-900/40 flex items-center justify-center">
              {sourceType === 'upload' && photoBase64 ? (
                <img 
                  src={photoBase64} 
                  alt="Avatar processing" 
                  className="w-full h-full object-cover opacity-60 filter saturate-50 blur-[1px]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <img 
                  src={selectedLook.image} 
                  alt="Haircut processing" 
                  className="w-full h-full object-cover opacity-60 filter saturate-50 blur-[1px]"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
            </span>
          </div>

          <div className="text-center space-y-3 max-w-md">
            <h4 className="text-amber-500 text-sm font-mono uppercase tracking-widest animate-pulse font-bold">Выполняется биометрическая раскладка...</h4>
            <div className="text-[10px] font-mono text-neutral-500 space-y-1.5 leading-relaxed bg-black/30 p-4 border border-neutral-950 rounded-xl">
              <p>● Трассировка костных ориентиров черепа гостя...</p>
              <p>● Проекция углов укладки: {selectedLook.name}</p>
              <p className="text-amber-400/80">● Сопоставление с эталоном: {modifiers ? `[+ Модификатор: ${modifiers}]` : 'Стандарт'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {errorText && (
        <div className="p-5 bg-red-950/20 border border-red-900/40 rounded-xl text-rose-300 text-sm flex items-start gap-4 my-4">
          <div className="space-y-2">
            <p className="font-bold text-neutral-200">Ошибка обработки данных</p>
            <p className="text-neutral-400 text-xs">{errorText}</p>
            <button
              onClick={() => handleRunVisualization()}
              className="mt-2 text-xs font-bold text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Попробовать снова
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS INTERACTIVE RESULTS VIEW */}
      {visualizedResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Visual AI Output Screen */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* High-Tech Tab Selector to easily see the original haircut choice or the AI projection layout */}
              <div className="flex bg-neutral-950/80 p-1 border border-neutral-850 rounded-xl">
                <button
                  onClick={() => setResultTab('slider')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    resultTab === 'slider'
                      ? 'bg-neutral-900 border border-amber-950/30 text-amber-400 font-bold'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  🧬 Слайдер ИИ
                </button>
                <button
                  onClick={handleSwitchToVideo}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    resultTab === 'video_3d'
                      ? 'bg-neutral-900 border border-amber-950/30 text-amber-400 font-bold'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  🎬 ИИ Видео 360°
                </button>
                <button
                  onClick={() => setResultTab('orig_look')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    resultTab === 'orig_look'
                      ? 'bg-neutral-900 border border-amber-950/30 text-amber-400 font-bold'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  ✂️ Стрижка
                </button>
                <button
                  onClick={() => setResultTab('face_only')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    resultTab === 'face_only'
                      ? 'bg-neutral-900 border border-amber-950/30 text-amber-400 font-bold'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  📷 Лицо/Основа
                </button>
              </div>

              <div className="relative aspect-square w-full rounded-xl overflow-hidden border-2 border-amber-950 bg-neutral-950 flex flex-col justify-end shadow-inner group">
                
                {/* 1. SLIDER VIEW: Drag to see face on left and EXACT selected haircut on right */}
                {resultTab === 'slider' && (
                  <>
                    {/* Base image: Guest's portrait or selected silhouette base */}
                    <img 
                      src={sourceType === 'upload' && photoBase64 
                        ? photoBase64 
                        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=600&q=80'
                      } 
                      alt="Guest Face" 
                      className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] saturate-[0.8]"
                      referrerPolicy="no-referrer"
                    />

                    {/* Overlay image: Exact selected haircut look, clipped using modern clipPath */}
                    <img 
                      src={selectedLook.image} 
                      alt="Exact Hair Style overlay" 
                      className="absolute inset-0 w-full h-full object-cover filter brightness-[0.85] saturate-[0.95]"
                      style={{ 
                        clipPath: `inset(0 0 0 ${sliderPosition}%)`
                      }}
                      referrerPolicy="no-referrer"
                    />

                    {/* Sliding Split Divider Line */}
                    <div 
                      className="absolute inset-y-0 w-[2px] bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.6)] pointer-events-none"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      {/* Interactive physical handle thumb */}
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 text-neutral-950 border-2 border-neutral-950 shadow-2xl flex items-center justify-center pointer-events-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </div>

                    {/* Invisible full-card draggable range input layer */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 z-20 w-full h-full opacity-0 cursor-ew-resize pointer-events-auto"
                    />
                  </>
                )}

                {/* 2. DYNAMIC AI VIDEO 360° VIDEO SIMULATION */}
                {resultTab === 'video_3d' && renderingVideo && (
                  <div className="absolute inset-0 z-15 bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative w-24 h-24 mb-4">
                      {/* Rotating glow ring */}
                      <div className="absolute inset-0 rounded-full border border-neutral-800" />
                      <div className="absolute inset-0 rounded-full border-t border-amber-500 animate-spin" />
                      <div className="absolute inset-2 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-mono font-bold text-amber-500">{videoRenderPercent}%</span>
                      </div>
                    </div>
                    <div className="space-y-1 z-20">
                      <h6 className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest animate-pulse">Компиляция ИИ Видеоклипа...</h6>
                      <p className="text-[8px] text-neutral-500 uppercase font-mono tracking-wider max-w-[240px] truncate mx-auto">
                        {videoRenderPercent < 30 ? 'Трассировка костных векторов...' :
                         videoRenderPercent < 70 ? 'Проектирование укладки по орбите...' :
                         'Композиция кадров вращения 360°...'}
                      </p>
                    </div>
                  </div>
                )}

                {resultTab === 'video_3d' && !renderingVideo && (
                  <div className="absolute inset-0 z-15 bg-neutral-950 flex flex-col justify-end">
                    {/* Animated Cinematic Video Frame with Filters representation */}
                    <div className="absolute inset-0 overflow-hidden bg-neutral-950">
                      <img 
                        src={selectedLook.image} 
                        alt="3D Hair Cut Video Loop" 
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 filter saturate-[0.95] ${
                          videoAngle === 'front' ? 'scale-100 brightness-95 translate-y-0' :
                          videoAngle === 'left' ? 'scale-[1.12] translate-x-12 translate-y-2 rotate-[1.5deg] brightness-[0.88]' :
                          videoAngle === 'back' ? 'scale-[1.25] -translate-y-12 brightness-[0.78] saturate-[0.8]' :
                          'scale-[1.35] -translate-y-4 brightness-105 contrast-[1.1]'
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Grid scanning overlay */}
                      {isVideoPlaying && (
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_49%,rgba(245,158,11,0.08)_50%,rgba(18,18,18,0)_51%)] bg-[length:100%_12px] animate-[pulse_1.5s_infinite] pointer-events-none" />
                      )}

                      {/* Video Player Header Overlay HUD */}
                      <div className="absolute top-12 left-4 z-20 space-y-1 bg-black/75 p-2 rounded-lg border border-neutral-850/60 font-mono text-[8px] text-neutral-300">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          КАДР: <span className="text-amber-400 font-bold">#00{Math.floor(videoProgress * 1.5)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          РЕЖИМ: <span className="text-emerald-400 font-bold">ИИ ОРБИТА 360°</span>
                        </div>
                        <div className="text-neutral-500 mt-0.5 uppercase tracking-wider text-[7px]">УГОЛ: {
                          videoAngle === 'front' ? 'Анфас' :
                          videoAngle === 'left' ? 'Левый висок' :
                          videoAngle === 'back' ? 'Затылок (Fade)' :
                          'Макро'
                        }</div>
                      </div>

                      {/* Media Player Controls Overlay Bar */}
                      <div className="absolute inset-x-0 bottom-12 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent p-3.5 flex items-center justify-between pointer-events-auto z-20">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                            className="w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                          >
                            {isVideoPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                          </button>
                          
                          <div className="text-[10px] font-mono text-neutral-300">
                            00:{(videoProgress / 10).toFixed(1)} / 10.0s
                          </div>
                        </div>

                        {/* Angle Select Toggles */}
                        <div className="flex bg-neutral-900/95 rounded-lg p-0.5 border border-neutral-850">
                          {(['front', 'left', 'back', 'zoom'] as const).map((angle) => (
                            <button
                              key={angle}
                              onClick={() => setVideoAngle(angle)}
                              className={`px-2 py-1 rounded text-[8px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                                videoAngle === angle
                                  ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/15'
                                  : 'text-neutral-500 hover:text-neutral-300'
                              }`}
                            >
                              {angle === 'front' ? 'Анфас' :
                               angle === 'left' ? 'Висок' :
                               angle === 'back' ? 'Fade' :
                               'Макро'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Scrubber tracker bar */}
                      <div className="absolute inset-x-3.5 bottom-11 h-1 bg-neutral-800/80 rounded-full overflow-hidden pointer-events-auto z-20">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-150" 
                          style={{ width: `${videoProgress}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. CHOSEN HAIRCUT CARD VIEW (Show exact model result in high res) */}
                {resultTab === 'orig_look' && (
                  <img 
                    src={selectedLook.image} 
                    alt="Exact Selected Haircut Style" 
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* 4. COLD UNMODIFIED GUEST FACE PORTRAIT VIEW */}
                {resultTab === 'face_only' && (
                  <img 
                    src={sourceType === 'upload' && photoBase64 
                      ? photoBase64 
                      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=600&q=80'
                    } 
                    alt="Guest Original Portrait" 
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 filter brightness-[0.75] saturate-[0.8]"
                    referrerPolicy="no-referrer"
                  />
                )}

                {/* BIO-METRIC SCANNER ARTISTIC GRID OVERLAY (Overlaid on all tabs for tech styling) */}
                <div className="absolute inset-0 pointer-events-none border border-emerald-500/15 m-3 rounded-lg overflow-hidden z-10">
                  
                  {/* Glowing Landmark Points */}
                  <div className="absolute top-[35%] left-[28%] w-1.5 h-1.5 rounded-full bg-emerald-500 border border-neutral-950 shadow-lg shadow-emerald-500 animate-ping" />
                  <div className="absolute top-[35%] left-[28%] w-1 h-1 rounded-full bg-emerald-500 border border-neutral-950" />
                  
                  <div className="absolute top-[35%] right-[28%] w-1.5 h-1.5 rounded-full bg-emerald-500 border border-neutral-950 shadow-lg shadow-emerald-500 animate-ping" />
                  <div className="absolute top-[35%] right-[28%] w-1 h-1 rounded-full bg-emerald-500 border border-neutral-950" />
                  
                  <div className="absolute top-[52%] left-[49%] w-1.5 h-1.5 rounded-full bg-amber-500 border border-neutral-950 shadow-lg shadow-amber-500 animate-ping" />
                  <div className="absolute top-[52%] left-[49%] w-1 h-1 rounded-full bg-amber-500 border border-neutral-950" />
                  
                  <div className="absolute bottom-[28%] left-[30%] w-1 h-1 rounded-full bg-emerald-500 border border-neutral-950" />
                  <div className="absolute bottom-[28%] right-[30%] w-1 h-1 rounded-full bg-emerald-500 border border-neutral-950" />
                  
                  {/* Drawing connecting matrix vector lines */}
                  <svg className="absolute inset-0 w-full h-full text-emerald-500/25 stroke-[1] stroke-dasharray-[2]" viewBox="0 0 100 100">
                    {/* Horizontal scanner bar lines */}
                    <line x1="0" y1="35" x2="100" y2="35" stroke="currentColor" strokeDasharray="1,2" />
                    <line x1="0" y1="52" x2="100" y2="52" stroke="currentColor" strokeDasharray="1,2" />
                    <line x1="0" y1="72" x2="100" y2="72" stroke="currentColor" strokeDasharray="1,2" />
                    
                    {/* Landmark connecting diagonals */}
                    <line x1="28" y1="35" x2="72" y2="35" stroke="currentColor" />
                    <line x1="28" y1="35" x2="49" y2="52" stroke="currentColor" />
                    <line x1="72" y1="35" x2="49" y2="52" stroke="currentColor" />
                    <line x1="28" y1="35" x2="30" y2="72" stroke="currentColor" />
                    <line x1="72" y1="35" x2="70" y2="72" stroke="currentColor" />
                    <line x1="49" y1="52" x2="30" y2="72" stroke="currentColor" />
                    <line x1="49" y1="52" x2="70" y2="72" stroke="currentColor" />
                  </svg>

                  {/* High tech HUD labels */}
                  <div className="absolute top-3 left-3 bg-black/70 px-2 py-0.5 rounded text-[7px] font-mono text-emerald-400 border border-emerald-550/20">FITTING ZONE</div>
                  <div className="absolute bottom-3 left-3 bg-black/70 px-2 py-0.5 rounded text-[7px] font-mono text-amber-400 border border-amber-550/20">GRID_LOCK: HIGH</div>
                </div>

                {/* Scanning overlay bar animation */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-md shadow-amber-500 opacity-60 animate-bounce pointer-events-none z-10" style={{ animationDuration: '3.5s' }} />

                {/* Subtitle bottom banner */}
                <div className="p-4 bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-transparent relative z-10 border-t border-neutral-900/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest">Проекция стиля</span>
                      <h5 className="font-bold text-sm text-neutral-100">{selectedLook.name}</h5>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-neutral-500 block">Основа</span>
                      <span className="text-[10px] text-neutral-300 font-medium">{sourceType === 'upload' ? 'Пользовательское фото' : '3D Модель-Пресет'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Anatomy Metrics Graph bars */}
              <div className="bg-black/40 border border-neutral-850 rounded-xl p-4 space-y-3.5">
                <h5 className="text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-900 pb-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  Пропорциональный анализ лица
                </h5>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {/* Forehead */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                      <span>Линия лба:</span>
                      <span className="text-amber-400 font-semibold">{visualizedResult.faceMetrics.forehead}</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: visualizedResult.faceMetrics.forehead }} />
                    </div>
                  </div>

                  {/* Cheekbones */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                      <span>Ширина скул:</span>
                      <span className="text-amber-400 font-semibold">{visualizedResult.faceMetrics.cheekbones}</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: visualizedResult.faceMetrics.cheekbones }} />
                    </div>
                  </div>

                  {/* Jawline */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                      <span>Линия челюсти:</span>
                      <span className="text-amber-400 font-semibold">{visualizedResult.faceMetrics.jawline}</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: visualizedResult.faceMetrics.jawline }} />
                    </div>
                  </div>

                  {/* Symmetry */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                      <span>Симметрия лица:</span>
                      <span className="text-emerald-500 font-bold">{visualizedResult.faceMetrics.symmetry}</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: visualizedResult.faceMetrics.symmetry }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: AI Compatibility Report card */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="bg-black/30 border border-amber-950/30 rounded-xl p-5 md:p-6 space-y-5 relative">
                
                {/* Circular Gauge Score */}
                <div className="flex items-center gap-4 border-b border-amber-950/40 pb-4">
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="w-16 h-16 -rotate-90">
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="28" 
                        className="stroke-neutral-900 stroke-[5]" 
                        fill="transparent" 
                      />
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="28" 
                        className="stroke-amber-500 stroke-[5] transition-all duration-1000" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - visualizedResult.scoreValue / 100)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-extrabold text-neutral-100">{visualizedResult.scoreValue}%</span>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-mono text-amber-500 uppercase tracking-widest">Анализ соответствия</h5>
                    <h3 className="text-base font-bold text-neutral-100 tracking-tight">Персональный Индекс Совместимости</h3>
                    <p className="text-[10px] text-neutral-500 mt-0.5">Судя по геометрии черт лица, выбранный стиль превосходно гармонирует с образом.</p>
                  </div>
                </div>

                {/* Detailed Analysis Segment */}
                <div className="space-y-1">
                  <h5 className="text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
                    Оценка Имидж-Консультанта «Девять»:
                  </h5>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">{visualizedResult.analysis}</p>
                </div>

                {/* Practical Daily Tips Section */}
                <div className="space-y-1">
                  <h5 className="text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
                    Ежедневная укладка и поддержание:
                  </h5>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">{visualizedResult.grooming}</p>
                </div>

                {/* Recommended Product & Specialist Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-900/60">
                  <div className="bg-neutral-950/40 border border-neutral-850 rounded-xl p-3.5">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase block tracking-wider mb-1">Рекомендуемый Стайлинг:</span>
                    <p className="text-xs font-bold text-amber-400">{visualizedResult.product}</p>
                  </div>
                  <div className="bg-neutral-950/40 border border-neutral-850 rounded-xl p-3.5">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase block tracking-wider mb-1">Профильный Топ-Специалист:</span>
                    <p className="text-xs font-bold text-neutral-200">{visualizedResult.barber}</p>
                  </div>
                </div>

              </div>

              {/* Functional Button row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleApplyToBooking}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold py-4 px-6 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 text-center flex items-center justify-center gap-2 cursor-pointer border border-amber-500/20"
                >
                  Записаться к рекомендованному мастеру под этот образ
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setVisualizedResult(null);
                    setErrorText(null);
                  }}
                  className="px-6 py-4 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer text-center uppercase font-mono"
                >
                  Попробовать другой стиль
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
