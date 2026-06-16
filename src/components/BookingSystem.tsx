import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Check, Sparkles, Phone, FileText, ArrowLeft, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { Barber, Service, BookingState } from '../types';

interface BookingSystemProps {
  barbers: Barber[];
  services: Service[];
  initialBarber: Barber | null;
  initialNotes: string;
  onSuccess: (booking: any) => void;
}

export default function BookingSystem({
  barbers,
  services,
  initialBarber,
  initialNotes,
  onSuccess,
}: BookingSystemProps) {
  // Booking state steps (1: service, 2: barber, 3: date & time, 4: details, 5: ticket)
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hair' | 'beard' | 'complex' | 'spa'>('all');
  
  // Date and time slots
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  
  // Contact details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState(initialNotes || '');

  // Ticket or success record
  const [finalTicket, setFinalTicket] = useState<any | null>(null);

  // Sync initialBarber and initialNotes when AI advice is loaded
  useEffect(() => {
    if (initialBarber) {
      setSelectedBarber(initialBarber);
      // Automatically advance step if appropriate, or keep consistent
    }
  }, [initialBarber]);

  useEffect(() => {
    if (initialNotes) {
      setClientNotes(initialNotes);
    }
  }, [initialNotes]);

  // Generate next 7 days in Moscow starting June 10, 2026
  const getNext7Days = () => {
    const days = [];
    const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = [
      'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
      'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'
    ];

    const currentBase = new Date('2026-06-10T08:31:20Z');
    
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(currentBase);
      nextDate.setDate(currentBase.getUTCDate() + i);
      
      const dayName = weekdays[nextDate.getUTCDay()];
      const dayOfMonth = nextDate.getUTCDate();
      const monthName = months[nextDate.getUTCMonth()];
      const formattedDateString = `${dayOfMonth} ${monthName}`;
      
      days.push({
        raw: nextDate.toISOString().split('T')[0],
        dayOfWeek: dayName,
        dayOfMonth: dayOfMonth,
        month: monthName,
        label: formattedDateString
      });
    }
    return days;
  };

  const dates = getNext7Days();

  // Moscow premium available hours slots
  const TIME_SLOTS = [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:20', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  // Filter services by category
  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2); // Auto advance to barber selection
  };

  const handleBarberSelect = (barber: Barber) => {
    setSelectedBarber(barber);
    setStep(3); // Auto advance to calendar details
  };

  const handleDateTimeConfirm = () => {
    if (bookingDate && bookingTime) {
      setStep(4);
    }
  };

  const handleCompleteBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('Пожалуйста, заполните обязательные поля (Имя и Телефон).');
      return;
    }

    const confirmedBooking = {
      id: 'NINE-' + Math.floor(100000 + Math.random() * 900000),
      service: selectedService,
      barber: selectedBarber,
      date: dates.find(d => d.raw === bookingDate)?.label || bookingDate,
      timeSlot: bookingTime,
      clientName,
      clientPhone,
      clientNotes,
      status: 'confirmed',
      createdAt: new Date().toLocaleDateString('ru-RU')
    };

    setFinalTicket(confirmedBooking);
    setStep(5);
    onSuccess(confirmedBooking);
  };

  const currentCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'hair': return 'Стрижки';
      case 'beard': return 'Борода и Бритье';
      case 'complex': return 'Комплексы';
      case 'spa': return 'SPA-Уход';
      default: return 'Все услуги';
    }
  };

  return (
    <div className="bg-neutral-900/90 border border-amber-900/20 rounded-xl max-w-4xl mx-auto shadow-2xl relative overflow-hidden" id="booking-system-wrapper">
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-neutral-950 to-neutral-900 p-6 md:p-8 border-b border-amber-950/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold font-sans tracking-wide text-neutral-100 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-500" />
            Интерактивный консьерж-записи
          </h3>
          <p className="text-xs text-neutral-400 font-mono tracking-tight mt-1">Охраняемая парковка • Романов переулок, 9</p>
        </div>
        
        {/* Breadcrumb Steps indicator */}
        {step < 5 && (
          <div className="flex items-center gap-2 text-xs font-mono">
            {[1, 2, 3, 4].map((num) => (
              <React.Fragment key={num}>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center border font-bold ${
                    step === num
                      ? 'bg-amber-600 border-amber-500 text-neutral-955'
                      : step > num
                      ? 'bg-amber-950/40 border-amber-900/50 text-amber-400'
                      : 'border-neutral-800 text-neutral-600'
                  }`}
                >
                  {num}
                </span>
                {num < 4 && <div className={`w-3 h-0.5 ${step > num ? 'bg-amber-900/60' : 'bg-neutral-800'}`} />}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Progress or active status items */}
      {step > 1 && step < 5 && (
        <div className="bg-black/40 border-b border-neutral-900 px-6 py-3 flex flex-wrap gap-4 text-xs font-mono text-neutral-400">
          {selectedService && (
            <div className="flex items-center gap-2 bg-neutral-900/80 px-2.5 py-1 rounded border border-neutral-800">
              <span className="text-amber-500">Услуга:</span> {selectedService.name} ({selectedService.price} ₽)
            </div>
          )}
          {selectedBarber && (
            <div className="flex items-center gap-2 bg-neutral-900/80 px-2.5 py-1 rounded border border-neutral-800">
              <span className="text-amber-500">Мастер:</span> {selectedBarber.name}
            </div>
          )}
          {bookingDate && bookingTime && (
            <div className="flex items-center gap-2 bg-neutral-900/80 px-2.5 py-1 rounded border border-neutral-800">
              <span className="text-amber-500">Сеанс:</span> {dates.find(d => d.raw === bookingDate)?.label}, {bookingTime}
            </div>
          )}
        </div>
      )}

      {/* STEP 1: SERVICE CHOICE */}
      {step === 1 && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap gap-1.5 border-b border-neutral-800 pb-4">
            {(['all', 'hair', 'beard', 'complex', 'spa'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-neutral-950 font-bold'
                    : 'bg-neutral-950/40 border border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                {currentCategoryLabel(cat)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className={`p-5 rounded-xl border text-left cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                  selectedService?.id === service.id
                    ? 'bg-amber-950/20 border-amber-500/50'
                    : 'bg-neutral-950/20 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {service.isPopular && (
                  <div className="absolute top-0 right-0 bg-amber-600 text-neutral-950 text-[9px] font-mono font-bold uppercase py-0.5 px-3 rounded-bl-lg">
                    Рекомендуем
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="font-semibold text-neutral-100 group-hover:text-amber-400 transition-colors duration-200">{service.name}</h4>
                    <span className="text-amber-400 font-mono font-bold text-sm whitespace-nowrap">{service.price} ₽</span>
                  </div>
                  
                  <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2">{service.description}</p>
                  
                  <div className="flex items-center gap-1.5 pt-2 text-neutral-500 text-xs font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{service.duration} минут</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: SELECT BARBER */}
      {step === 2 && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h4 className="text-sm font-mono text-amber-500 uppercase tracking-widest">Выберите специалиста</h4>
            <button
              onClick={() => setStep(1)}
              className="text-neutral-400 text-xs font-mono flex items-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Назад к услугам
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                onClick={() => handleBarberSelect(barber)}
                className={`p-5 rounded-xl border text-left cursor-pointer transition-all duration-300 relative group flex flex-col justify-between h-full ${
                  selectedBarber?.id === barber.id
                    ? 'bg-amber-950/20 border-amber-500/50'
                    : 'bg-neutral-900/30 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850/30'
                }`}
              >
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-lg aspect-square bg-neutral-950">
                    <img
                      src={barber.avatar}
                      alt={barber.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-black/75 px-2 py-1 rounded text-[10px] font-mono text-amber-400 border border-amber-500/20">
                      {barber.rank}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-neutral-100">{barber.name}</h4>
                    <p className="text-neutral-500 text-xs line-clamp-2">{barber.specialty}</p>
                  </div>
                </div>

                <div className="border-t border-neutral-800/60 mt-4 pt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-amber-500★ font-bold">★</span>
                    <span className="font-mono text-neutral-300">{barber.rating}</span>
                    <span className="text-neutral-500 font-mono">({barber.reviewsCount})</span>
                  </div>
                  <span className="text-amber-500 text-[10px] font-mono uppercase group-hover:underline flex items-center gap-0.5">
                    Выбрать <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: SELECT SEANCE - DATE & TIME */}
      {step === 3 && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h4 className="text-sm font-mono text-amber-500 uppercase tracking-widest">Выберите дату и время сеанса</h4>
            <button
              onClick={() => setStep(2)}
              className="text-neutral-400 text-xs font-mono flex items-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Назад к мастерам
            </button>
          </div>

          {/* Date Picker Horizontal Row */}
          <div className="space-y-3">
            <label className="text-xs font-mono text-neutral-400 block">1. Доступные дни (Москва, июнь 2026)</label>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {dates.map((dateObj) => (
                <button
                  key={dateObj.raw}
                  onClick={() => setBookingDate(dateObj.raw)}
                  className={`p-3 rounded-lg border text-center transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                    bookingDate === dateObj.raw
                      ? 'bg-amber-600 border-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-950/40 border-neutral-850 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-[10px] uppercase font-mono tracking-wider opacity-80">{dateObj.dayOfWeek}</span>
                  <span className="text-lg font-bold my-0.5">{dateObj.dayOfMonth}</span>
                  <span className="text-[9px] truncate w-full">{dateObj.month}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Picker Grid */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-mono text-neutral-400 block">2. Свободное время в салоне</label>
            {bookingDate ? (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setBookingTime(slot)}
                    className={`py-3 rounded-lg border text-center transition-all duration-300 font-mono text-xs cursor-pointer ${
                      bookingTime === slot
                        ? 'bg-amber-600 border-amber-500 text-neutral-950 font-bold'
                        : 'bg-neutral-955/20 border-neutral-850 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600 text-xs font-mono">Сначала выберите желаемую дату выше.</p>
            )}
          </div>

          <div className="border-t border-neutral-800 pt-5 flex justify-end">
            <button
              disabled={!bookingDate || !bookingTime}
              onClick={handleDateTimeConfirm}
              className={`px-6 py-3.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                bookingDate && bookingTime
                  ? 'bg-amber-500 text-neutral-900 font-bold hover:bg-amber-400 cursor-pointer'
                  : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
              }`}
            >
              Далее к оформлению <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: GUEST DETAILS */}
      {step === 4 && (
        <form onSubmit={handleCompleteBooking} className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h4 className="text-sm font-mono text-amber-500 uppercase tracking-widest">Контактная информация гостя</h4>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-neutral-400 text-xs font-mono flex items-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Назад к сеансу
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" /> Имя и Фамилия <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Константин Романов"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-neutral-200 text-sm placeholder-neutral-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 active:border-amber-500"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-500" /> Мобильный телефон <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-neutral-200 text-sm placeholder-neutral-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 active:border-amber-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" /> Пожелания и комментарии к визиту
            </label>
            <textarea
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              placeholder="Нужна парковка / Пожелания по напиткам / Обсудить стрижку с AI Стилистом на месте..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-neutral-200 text-sm placeholder-neutral-700 focus:outline-none focus:border-amber-500/50 min-h-[100px]"
            />
          </div>

          {/* Luxury assurance tagline */}
          <div className="p-4 bg-amber-950/10 border border-amber-950/30 rounded-lg flex items-start gap-3.5 text-xs text-amber-400 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-neutral-200">Гарантия премиум-сервиса</p>
              <p className="text-neutral-400">
                Запись бронируется персонально под вас. Мы свяжемся с вами для подтверждения пропуска на закрытый паркинг Романова переулка. Нам доверяют лучшие.
              </p>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-5 flex justify-end">
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-500 text-neutral-950 font-extrabold rounded-lg text-xs font-mono uppercase tracking-widest cursor-pointer shadow-lg shadow-amber-950/20"
            >
              Подтвердить роскошную запись
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: SUCCESS CHECK / LUXURY BARCODE TICKET */}
      {step === 5 && finalTicket && (
        <div className="p-6 md:p-8 space-y-6 text-center max-w-lg mx-auto py-12">
          {/* Animated checks */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/30 animate-bounce">
            <Check className="w-8 h-8 text-neutral-900 stroke-[3]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-neutral-100 tracking-normal flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              Ваш визит забронирован!
            </h3>
            <p className="text-xs text-neutral-500 font-mono">
              ЖЕЛАЕМ ВАМ ПРЕКРАСНОГО ВРЕМЯПРОВОЖДЕНИЯ В СЕТИ «ДЕВЯТЬ»
            </p>
          </div>

          {/* Traditional Luxury Ticket Card design */}
          <div className="bg-black/80 border border-amber-900/30 rounded-xl p-5 text-left font-mono relative overflow-hidden shadow-2xl">
            {/* Cutouts on the ticket sides */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-neutral-900 border-r border-amber-900/30" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-neutral-900 border-l border-amber-900/30" />

            <div className="border-b border-dashed border-amber-900/30 pb-4 mb-4 flex justify-between items-center">
              <div>
                <div className="text-[9px] text-amber-500/80 uppercase">Джентльмен-Пропуск</div>
                <div className="text-sm font-bold text-neutral-200">{finalTicket.id}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-amber-500/80 uppercase">Тип сервиса</div>
                <div className="text-xs font-bold text-neutral-300">PREMIUM GUEST</div>
              </div>
            </div>

            <div className="space-y-3 pb-4 mb-4 border-b border-dashed border-amber-900/30 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase text-[10px]">Услуга:</span>
                <span className="text-neutral-200 font-sans font-semibold text-xs ml-4 text-right">{finalTicket.service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase text-[10px]">Мастер:</span>
                <span className="text-neutral-200 font-sans font-semibold text-xs">{finalTicket.barber?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase text-[10px]">Сеанс:</span>
                <span className="text-amber-400 font-semibold">{finalTicket.date}, {finalTicket.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 uppercase text-[10px]">Стоимость:</span>
                <span className="text-amber-400 font-bold">{finalTicket.service?.price} ₽</span>
              </div>
            </div>

            {/* Custom Barcode to trigger premium aesthetics */}
            <div className="space-y-1.5 flex flex-col items-center pt-2">
              <div className="h-10 w-full bg-gradient-to-r from-neutral-800 via-neutral-200 to-neutral-800 flex items-center justify-center opacity-85 rounded">
                <div className="h-full w-4/5 flex justify-around items-center" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 5px, #000 5px, #000 8px)' }} />
              </div>
              <div className="text-[9px] text-neutral-400 text-center tracking-widest uppercase">
                * MOW-ROMANOV-NINE-2026 *
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setStep(1);
                setSelectedService(null);
                setSelectedBarber(null);
                setBookingDate('');
                setBookingTime('');
                setClientNotes('');
              }}
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-300"
            >
              Забронировать еще одну услугу
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
