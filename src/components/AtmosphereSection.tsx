import { Compass, Sparkles, MapPin, ShieldAlert, Award, Star } from 'lucide-react';

export default function AtmosphereSection() {
  const USP_CARDS = [
    {
      icon: <Award className="w-6 h-6 text-amber-500" />,
      title: 'Престижная локация',
      desc: 'Премиальный закрытый клуб в Романовом переулке, в шаговой доступности от Кремля и Большого театра. Безупречная тишина и приватность.'
    },
    {
      icon: <Compass className="w-6 h-6 text-amber-500" />,
      title: 'Элитный баргостинг',
      desc: 'Для каждого гостя бесплатно предлагается коллекционный сингл-молт виски шотландского высокогорья, авторский эспрессо или свежезаваренная матча.'
    },
    {
      icon: <Star className="w-6 h-6 text-amber-500" />,
      title: 'Премиум Косметика',
      desc: 'Работаем исключительно с культовыми селективными брендами: американские Shear Revival и O&apos;Douds, британские реликвии Morgan&apos;s Pomade.'
    }
  ];

  return (
    <div className="space-y-16" id="philosophy-section">
      {/* Intro section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-text-amber-400 text-xs font-mono tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Философия Клуба «Девять»
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-sans font-bold text-neutral-100 tracking-tight leading-tight">
            Больше чем стрижка. <br />
            <span className="text-amber-500">Ваше мужское убежище</span> в суете Москвы.
          </h2>

          <p className="text-gray-400 text-sm leading-relaxed">
            Барбершоп «Девять» задумывался не просто как парикмахерская, а как скрытая от посторонних глаз закрытая резиденция для джентльменов. Здесь время замедляется. Мы объединили вековые британские ритуалы влажного бритья, строгие классические формы парикмахерского искусства и передовые интеллектуальные решения.
          </p>

          <p className="text-gray-400 text-sm leading-relaxed">
            В интерьере преобладают благородный дуб, полированная латунь, ароматы дорогой кожи и сандалового дерева. Звук винилового проигрывателя наполняет пространство мягким акустическим джазом и блюзом, пока наши мастера доводят геометрию вашего образа до абсолюта.
          </p>

          <div className="flex items-center gap-3 pt-2 text-xs font-mono text-neutral-400">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>Сеть «Девять»: Москва, Романов пер., 9</span>
          </div>
        </div>

        {/* Sensory images grid */}
        <div className="relative group">
          {/* Overlay glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent z-10 rounded-xl" />
          <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-900/10 to-amber-600/10 rounded-xl blur-xl group-hover:opacity-100 transition duration-1000 opacity-60 pointer-events-none" />
          
          <img
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&h=750&q=80"
            alt="Moscow Premium Barbershop Design Interior"
            referrerPolicy="no-referrer"
            className="w-full h-[400px] object-cover rounded-xl grayscale filter hover:grayscale-0 transition-all duration-700 shadow-2xl"
          />
          
          <div className="absolute bottom-6 left-6 right-6 z-20 space-y-1">
            <h4 className="font-semibold text-neutral-100 text-lg">Кабинет на Романовом</h4>
            <p className="text-neutral-400 text-xs">Закрытое резиденциальное пространство для переговоров и индивидуального груминга во время сеанса.</p>
          </div>
        </div>
      </div>

      {/* USP Bento Grid style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {USP_CARDS.map((card, idx) => (
          <div
            key={idx}
            className="p-6 bg-neutral-900/40 border border-neutral-850 rounded-xl hover:border-amber-900/20 transition-all duration-300 space-y-4"
          >
            <div className="p-3 bg-amber-500/10 rounded-lg w-fit">
              {card.icon}
            </div>
            <h4 className="font-bold text-neutral-100 text-base">{card.title}</h4>
            <p className="text-neutral-400 text-xs leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
