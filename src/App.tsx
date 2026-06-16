import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Star,
  Clock,
  Compass,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sliders
} from 'lucide-react';

import AIAssistant from './components/AIAssistant';
import AIVisualization from './components/AIVisualization';
import BookingSystem from './components/BookingSystem';
import AtmosphereSection from './components/AtmosphereSection';
import ReviewsSection from './components/ReviewsSection';
import AIChatBot from './components/AIChatBot';

import { PREMIUM_SERVICES, SPECIALIST_BARBERS, LOOKS_GALLERY, BARBERSHOP_FAQ } from './data';
import { Barber, Service } from './types';

export default function App() {
  // Live Moscow Time (UTC+3)
  const [moscowTime, setMoscowTime] = useState('');
  
  // Custom states for booking synchronization
  const [bookingBarber, setBookingBarber] = useState<Barber | null>(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertText, setAlertText] = useState('');

  // Active FAQ index accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Active AI stylistic tab selector
  const [activeAiTab, setActiveAiTab] = useState<'consult' | 'visualize'>('visualize');

  useEffect(() => {
    const calcMoscowTime = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const moscowOffset = 3;
      const msc = new Date(utc + (3600000 * moscowOffset));
      
      const h = String(msc.getHours()).padStart(2, '0');
      const m = String(msc.getMinutes()).padStart(2, '0');
      const s = String(msc.getSeconds()).padStart(2, '0');
      setMoscowTime(`${h}:${m}:${s}`);
    };

    calcMondayPromoDate();
    calcMoscowTime();
    const timer = setInterval(calcMoscowTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const [promoText, setPromoText] = useState('');
  const calcMondayPromoDate = () => {
    setPromoText('Джентльмен-комплекс по понедельникам — при заказе «Мужская стрижка Премиум» комплиментарная детокс-маска для лица.');
  };

  // Scroll handler utility
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Callback when AI Adviser or Lookbook applies a master selection
  const handleApplyPreset = (barberName: string, notes: string) => {
    const matchedBarber = SPECIALIST_BARBERS.find(b => b.name === barberName) || null;
    setBookingBarber(matchedBarber);
    setBookingNotes(notes);
    
    // Display interactive notification
    setAlertText(`AI-рекомендации успешно применены! Выбран мастер: ${barberName}. Услуга и примечания подготовлены в форме онлайн-записи.`);
    setIsAlertVisible(true);
    
    setTimeout(() => {
      scrollToSection('booking-section');
    }, 450);

    setTimeout(() => {
      setIsAlertVisible(false);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 selection:bg-amber-500/30 selection:text-amber-100 font-sans antialiased">
      
      {/* Dynamic Floating Notification */}
      {isAlertVisible && (
        <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:max-w-md bg-neutral-900 border-2 border-amber-500/60 rounded-xl p-4 shadow-2xl z-50 animate-slide-in-right flex items-start gap-3.5">
          <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Интеллектуальный импорт</h5>
            <p className="text-xs text-neutral-300 leading-relaxed">{alertText}</p>
          </div>
        </div>
      )}

      {/* LUXURY STATUS / PROMO TICKER */}
      <div className="bg-amber-950/20 border-b border-amber-900/10 py-2.5 px-4 text-center">
        <p className="text-[11px] font-mono tracking-wider text-amber-400 flex items-center justify-center gap-1.5 flex-wrap">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>{promoText}</span>
        </p>
      </div>

      {/* NAVIGATION BAR */}
      <header className="sticky top-0 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-700 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-950/30">
              <Scissors className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-sans font-black text-xl tracking-widest text-neutral-100 uppercase block">ДЕВЯТЬ</span>
              <span className="text-[9px] font-mono tracking-widest text-amber-500 uppercase block">Premium Barbershop</span>
            </div>
          </div>

          {/* Nav Hotlinks */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest uppercase">
            <button onClick={() => scrollToSection('services-section')} className="text-neutral-400 hover:text-amber-400 transition-colors">Услуги</button>
            <button onClick={() => scrollToSection('looks-section')} className="text-neutral-400 hover:text-amber-400 transition-colors">Портфолио</button>
            <button onClick={() => scrollToSection('barbers-section')} className="text-neutral-400 hover:text-amber-400 transition-colors">Мастера</button>
            <button onClick={() => scrollToSection('ai-stylist-section')} className="text-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              AI Стилист
            </button>
            <button onClick={() => scrollToSection('philosophy-section')} className="text-neutral-400 hover:text-amber-400 transition-colors">Атмосфера</button>
            <button onClick={() => scrollToSection('reviews-section')} className="text-neutral-400 hover:text-amber-400 transition-colors">Отзывы</button>
            <button onClick={() => scrollToSection('contacts-section')} className="text-neutral-400 hover:text-amber-400 transition-colors">Контакты</button>
          </nav>

          {/* Time & Quick Book Anchor button */}
          <div className="flex items-center gap-4">
            {/* Live Clock */}
            <div className="hidden sm:flex flex-col items-end shrink-0 select-none">
              <span className="text-[9px] font-mono uppercase text-neutral-500 tracking-wider">Часы в Москве (МСК)</span>
              <span className="font-mono text-xs text-amber-400 font-bold">{moscowTime || '--:--:--'}</span>
            </div>

            <button
              onClick={() => scrollToSection('booking-section')}
              className="bg-neutral-900 hover:bg-neutral-850 text-amber-400 border border-amber-900/30 hover:border-amber-500/30 px-5 py-2.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-md"
            >
              Запись онлайн
            </button>
          </div>
        </div>
      </header>

      {/* HERO / ATMOSPHERIC INTRODUCTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-28 border-b border-neutral-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-radial from-amber-600/5 to-transparent blur-3xl" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-radial from-amber-900/10 to-transparent blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/5 border border-amber-500/20 text-text-amber-400 text-[10px] font-mono tracking-widest uppercase">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            Москва • Романов переулок, 9
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-black tracking-tight text-neutral-100 uppercase leading-[0.95]">
              Элитарный клуб <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600">
                груминга & стиля
              </span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Приватное пространство для ценителей безукоризненного качества в самом центре столицы. Традиционные бритвенные ритуалы, авторские стрижки ножницами и персональный AI-ассистент стилизаций.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={() => scrollToSection('booking-section')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-500 text-neutral-950 font-extrabold text-xs font-mono uppercase tracking-widest rounded-lg transition-all duration-300 shadow-xl shadow-amber-950/20 cursor-pointer"
            >
              Записаться в Лаунж
            </button>
            
            <button
              onClick={() => scrollToSection('ai-stylist-section')}
              className="w-full sm:w-auto px-8 py-4 bg-neutral-900 hover:bg-neutral-850 text-neutral-100 border border-neutral-800 hover:border-neutral-700 font-extrabold text-xs font-mono uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              Проверить форму с AI
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-10 text-left">
            <div className="p-4 bg-neutral-950/60 border border-neutral-900 rounded-lg">
              <span className="block text-amber-500 font-mono text-lg font-bold">100%</span>
              <span className="block text-neutral-400 text-[10px] font-mono uppercase mt-0.5">Сухожаровой стерилизатор</span>
            </div>
            <div className="p-4 bg-neutral-950/60 border border-neutral-900 rounded-lg">
              <span className="block text-amber-500 font-mono text-lg font-bold">Compl</span>
              <span className="block text-neutral-400 text-[10px] font-mono uppercase mt-0.5">Односолодовый виски & кофе</span>
            </div>
            <div className="p-4 bg-neutral-950/60 border border-neutral-900 rounded-lg">
              <span className="block text-amber-500 font-mono text-lg font-bold">VIP</span>
              <span className="block text-neutral-400 text-[10px] font-mono uppercase mt-0.5">Охраняемый закрытый паркинг</span>
            </div>
            <div className="p-4 bg-neutral-950/60 border border-neutral-900 rounded-lg">
              <span className="block text-amber-500 font-mono text-lg font-bold">Gemini</span>
              <span className="block text-neutral-400 text-[10px] font-mono uppercase mt-0.5">Умное моделирование овала</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE WRAPPERS AND SECTIONS SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-24">
        
        {/* SERVICES AND PRICING LIST SECTION */}
        <section id="services-section" className="space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block">Прайс-Лист</span>
            <h2 className="text-3xl font-bold text-neutral-100 tracking-tight uppercase">Услуги и Стоимость ухода</h2>
            <p className="text-neutral-500 text-xs max-w-xl mx-auto">Каждая услуга включает в себя предварительное мытьё головы премиальными шампунями, горячий компресс и напиток из карты бара бесплатно.</p>
          </div>

          {/* Simple Grid presentation of pricing lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PREMIUM_SERVICES.map((s) => (
              <div
                key={s.id}
                className="bg-neutral-900/20 border border-neutral-900 p-6 rounded-xl space-y-4 hover:border-amber-900/10 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-bold text-neutral-100 text-base">{s.name}</h4>
                    <span className="text-amber-500 font-mono font-bold text-sm shrink-0">{s.price} ₽</span>
                  </div>
                  <p className="text-neutral-400 text-xs leading-relaxed line-clamp-3">{s.description}</p>
                </div>

                <div className="border-t border-neutral-850 pt-4 flex items-center justify-between">
                  <span className="text-neutral-500 font-mono text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> ~{s.duration} минут
                  </span>

                  <button
                    onClick={() => {
                      scrollToSection('booking-section');
                      // Focus or preset booking state if needed can be adapted
                    }}
                    className="text-amber-400 hover:text-amber-300 font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-1"
                  >
                    Запись <Clock className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LOOKBOOK GALLERY PORTFOLIO */}
        <section id="looks-section" className="space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">Стиль и Силуэты</span>
            <h2 className="text-3xl font-bold text-neutral-100 tracking-tight uppercase">Лукбук Треш-Галереи</h2>
            <p className="text-neutral-500 text-xs max-w-lg mx-auto">Выберите готовый стилизованный силуэт. Вы можете мгновенно применить выбор для заполнения онлайн записи.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {LOOKS_GALLERY.map((look) => (
              <div
                key={look.id}
                className="bg-neutral-900/30 border border-neutral-900 rounded-xl overflow-hidden group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="relative overflow-hidden aspect-square bg-neutral-950">
                    <img
                      src={look.image}
                      alt={look.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale brightness-90 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/75 px-2.5 py-1 rounded text-[9px] font-mono text-amber-400 border border-neutral-800">
                      Сложность укладки: {look.difficulty}
                    </div>
                  </div>

                  <div className="px-5 space-y-2">
                    <h4 className="font-bold text-neutral-100 text-sm group-hover:text-amber-400 transition-colors duration-200">{look.name}</h4>
                    <p className="text-neutral-400 text-xs leading-relaxed line-clamp-3">{look.description}</p>
                    
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-mono text-amber-500/80">Стайлинг-продукт:</div>
                      <div className="text-[11px] text-neutral-300 line-clamp-1 italic">{look.stylingProduct}</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-neutral-900 mt-4">
                  <button
                    onClick={() => {
                      // Apply predefined setup: English Parting defaults to Dmitry, Crop to Maxim, etc.
                      let barberPreset = 'Дмитрий Раевский';
                      if (look.id === 'l_texture_crop') barberPreset = 'Максим Леонов';
                      if (look.id === 'l_buzz_fade') barberPreset = 'Артём Громов';
                      
                      const remarks = `Рекомендация по Лукбуку: желаю стрижку "${look.name}". Предполагаемая укладка с использованием: ${look.stylingProduct}`;
                      handleApplyPreset(barberPreset, remarks);
                    }}
                    className="w-full py-2 bg-neutral-950 hover:bg-neutral-850 text-neutral-300 border border-neutral-850 rounded hover:border-amber-500/20 text-[10px] font-mono uppercase tracking-widest transition-all duration-300"
                  >
                    Выбрать этот стиль
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BARBERS TEAM SECTION */}
        <section id="barbers-section" className="space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">Специалисты</span>
            <h2 className="text-3xl font-bold text-neutral-100 tracking-tight uppercase">Наши Маэстро-Барберы</h2>
            <p className="text-neutral-500 text-xs max-w-lg mx-auto">У нас не работают новички. Только топ-мастера высших категорий с подтвержденным стажем от 6 лет и международным образованием.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {SPECIALIST_BARBERS.map((barber) => (
              <div
                key={barber.id}
                className="bg-neutral-900/30 border border-neutral-900 rounded-xl p-6 hover:border-neutral-800 transition-all duration-300 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Portrait photo */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-950 flex items-center justify-center">
                    <img
                      src={barber.avatar}
                      alt={barber.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter grayscale brightness-95"
                    />
                    <div className="absolute top-3 left-3 bg-neutral-900/95 border border-amber-900/30 text-amber-400 px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider shadow">
                      {barber.rank}
                    </div>
                  </div>

                  {/* Rating & Bio info */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-neutral-100 text-lg">{barber.name}</h4>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-amber-500">★</span>
                        <span className="font-mono text-neutral-200">{barber.rating}</span>
                        <span className="text-neutral-500 font-mono">({barber.reviewsCount})</span>
                      </div>
                    </div>
                    
                    <p className="text-neutral-500 text-xs font-mono">{barber.specialty}</p>
                    
                    <div className="p-3.5 bg-neutral-950/40 border-l border-amber-700/60 rounded text-[11px] text-gray-300 italic leading-relaxed">
                      &ldquo;{barber.quote}&rdquo;
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-neutral-900">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Галерея свежих стрижек:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {barber.workExamples.map((ex, i) => (
                      <div key={i} className="aspect-video rounded overflow-hidden bg-neutral-950">
                        <img
                          src={ex}
                          alt="Specialist crop work"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-300 cursor-zoom-in"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setBookingBarber(barber);
                      setBookingNotes(`Выбран напрямую из портфолио: ${barber.name}`);
                      setAlertText(`Мастер ${barber.name} подготовлен для переноса! Заполните параметры ниже.`);
                      setIsAlertVisible(true);
                      scrollToSection('booking-section');
                      setTimeout(() => setIsAlertVisible(false), 5000);
                    }}
                    className="w-full mt-2 py-3 bg-amber-600 hover:bg-amber-500 text-neutral-950 rounded font-bold text-xs uppercase font-mono tracking-widest transition-all duration-300"
                  >
                    Запись к мастеру
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI STYLIST SECTION CONTAINER */}
        <section id="ai-stylist-section" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2 mb-2">
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">Интеллектуальная лаборатория</span>
            <h2 className="text-3xl font-bold text-neutral-100 tracking-tight uppercase">ИИ Стилистические Системы</h2>
            <div className="flex bg-neutral-950 p-1 border border-neutral-850 rounded-xl mt-3">
              <button
                onClick={() => setActiveAiTab('visualize')}
                className={`py-2 px-5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeAiTab === 'visualize'
                    ? 'bg-neutral-900 border border-amber-950/30 text-amber-400'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                ИИ Фото-Примерочная
              </button>
              <button
                onClick={() => setActiveAiTab('consult')}
                className={`py-2 px-5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeAiTab === 'consult'
                    ? 'bg-neutral-900 border border-amber-950/30 text-amber-400'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                ИИ Имидж-Консультант
              </button>
            </div>
          </div>

          <div className="transition-all duration-300">
            {activeAiTab === 'visualize' ? (
              <AIVisualization onApplyPreset={handleApplyPreset} />
            ) : (
              <AIAssistant
                onApplyPreset={handleApplyPreset}
                barbers={SPECIALIST_BARBERS}
                services={PREMIUM_SERVICES}
              />
            )}
          </div>
        </section>

        {/* BOOKING INTERACTIVE CONCIERGE CONTAINER */}
        <section id="booking-section" className="scroll-mt-24 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">Оформить визит</span>
            <h2 className="text-3xl font-bold text-neutral-100 tracking-tight uppercase">Интерактивный бронировщик</h2>
            <p className="text-neutral-500 text-xs max-w-lg mx-auto">Быстрая бронь даты и времени в 4 шага. Поддержка парковочных мест и AI комментариев.</p>
          </div>
          
          <BookingSystem
            barbers={SPECIALIST_BARBERS}
            services={PREMIUM_SERVICES}
            initialBarber={bookingBarber}
            initialNotes={bookingNotes}
            onSuccess={(data) => {
              console.log('Successfully completed booking in Moscow Club Nine:', data);
            }}
          />
        </section>

        {/* CLUB PHILOSOPHY & ATMOSPHERE */}
        <section>
          <AtmosphereSection />
        </section>

        {/* REVIEWS TESTIMONIALS SECTION */}
        <section>
          <ReviewsSection barbers={SPECIALIST_BARBERS} />
        </section>

        {/* CONTACTS & GMAP IFRAME SECTION */}
        <section id="contacts-section" className="space-y-8 scroll-mt-24">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">Расположение</span>
            <h2 className="text-3xl font-bold text-neutral-100 tracking-tight uppercase">Контакты и Карта</h2>
            <p className="text-neutral-500 text-xs max-w-lg mx-auto">Ждем вас в тихом историческом центре Москвы. Романов переулок, д. 9 (рядом с Кремлем и ул. Воздвиженка).</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
            {/* Address Details Card */}
            <div className="lg:col-span-4 bg-neutral-900/40 border border-neutral-850 rounded-xl p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">Точный адрес:</div>
                  <p className="text-sm text-neutral-200 font-semibold flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>125009, Москва, Романов переулок, дом 9</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">Режим работы:</div>
                  <p className="text-sm text-neutral-200 font-semibold flex items-start gap-2">
                    <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>Ежедневно с 10:00 до 22:00</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">Контакты & Рецепция:</div>
                  <p className="text-sm text-neutral-200 font-semibold flex items-start gap-2">
                    <Phone className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="hover:text-amber-400 transition-colors">+7 (495) 909-09-09</span>
                  </p>
                </div>
              </div>

              <div className="border-t border-neutral-900 pt-6 space-y-3">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">⚠️ Правила Парковки:</div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Въезд на закрытый паркинг Романового двора осуществляется по предварительной заявке. Пожалуйста, сообщите нам марку и госномер вашего автомобиля при бронировании или за 15 минут до приезда.
                </p>
              </div>
            </div>

            {/* Google map iframe wrapper */}
            <div className="lg:col-span-8 bg-neutral-900/20 border border-neutral-850 rounded-xl overflow-hidden min-h-[350px] relative group h-[380px] lg:h-auto">
              <div className="absolute inset-0 bg-amber-500/5 mix-blend-color pointer-events-none group-hover:opacity-0 transition-opacity duration-300 z-10" />
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.289196307998!2d37.60742129999999!3d55.753457199999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54a4f80088b93%3A0xe5a363d5966601ad!2sRomanov%20St%252C%209%2C%20Moskva%2C%20125009!5e0!3m2!1sen!2sru!4v1717900000000!5m2!1sen!2sru"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '350px', filter: 'invert(90%) hue-rotate(180deg) contrast(120%)' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map - Romanov 9, Moscow"
                className="w-full h-full rounded-xl opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        </section>

        {/* FAQ ACCORDIONS */}
        <section className="max-w-3xl mx-auto space-y-8" id="faq-section">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">Важно знать</span>
            <h2 className="text-2xl font-bold text-neutral-100 tracking-tight uppercase">Частые Вопросы джентльменов</h2>
          </div>

          <div className="space-y-4">
            {BARBERSHOP_FAQ.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-neutral-900/10 border border-neutral-900 rounded-lg overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex justify-between items-center gap-4 text-xs font-mono uppercase tracking-wider text-neutral-200 hover:text-amber-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-amber-500" /> : <ChevronDown className="w-4 h-4 text-amber-500" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-1 border-t border-neutral-950 bg-black/10 text-xs text-neutral-400 leading-relaxed font-sans">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-12 text-center text-xs text-neutral-500 font-mono tracking-wide relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <p className="font-sans font-black tracking-widest text-neutral-400">БАРБЕРШОП «ДЕВЯТЬ» МОСКВА</p>
          <p className="max-w-md mx-auto text-[10px] text-neutral-600 leading-relaxed">
            Романов Переулок 9, Москва • Ежедневно с 10:00 до 22:00 <br />
            Закрытый паркинг для гостей. Телефон рецепции: +7 (495) 909-09-09
          </p>
          <p className="text-[9px] text-amber-700">
            © 2026. Premium Club Nine Moscow. Все права резервированы.
          </p>
        </div>
      </footer>

      {/* AI CHATBOT COMPANION WIDGET */}
      <AIChatBot />
    </div>
  );
}
