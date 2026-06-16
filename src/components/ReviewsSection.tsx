import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, User, Award, Calendar, RefreshCw } from 'lucide-react';
import { Review, Barber } from '../types';
import { INITIAL_REVIEWS } from '../data';

interface ReviewsSectionProps {
  barbers: Barber[];
}

export default function ReviewsSection({ barbers }: ReviewsSectionProps) {
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [reviewerName, setReviewerName] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [ratingSelection, setRatingSelection] = useState(5);
  const [reviewText, setReviewText] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Load reviews on mount
  useEffect(() => {
    const saved = localStorage.getItem('nine_barber_reviews');
    if (saved) {
      try {
        setReviewsList(JSON.parse(saved));
      } catch (e) {
        setReviewsList(INITIAL_REVIEWS);
      }
    } else {
      setReviewsList(INITIAL_REVIEWS);
    }
  }, []);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewText) {
      alert('Пожалуйста, укажите имя и текст отзыва.');
      return;
    }

    const newReview: Review = {
      id: 'rev_' + Date.now(),
      clientName: reviewerName,
      rating: ratingSelection,
      text: reviewText,
      date: new Date().toLocaleDateString('ru-RU'),
      barberName: selectedBarber || undefined
    };

    const updated = [newReview, ...reviewsList];
    setReviewsList(updated);
    localStorage.setItem('nine_barber_reviews', JSON.stringify(updated));

    // Clear form
    setReviewerName('');
    setSelectedBarber('');
    setRatingSelection(5);
    setReviewText('');
    setShowAddForm(false);
    
    // Success feedback
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  const calculateAverageRating = () => {
    if (reviewsList.length === 0) return 5.0;
    const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviewsList.length).toFixed(2);
  };

  return (
    <div className="space-y-10" id="reviews-section">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-neutral-800 pb-5">
        <div>
          <h3 className="text-2xl font-sans font-bold text-neutral-100 tracking-tight">Репутация и Отзывы</h3>
          <p className="text-neutral-400 text-xs mt-1">Оценки реальных гостей нашего лаунжа на Романовом переулке.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-center shrink-0">
            <div className="text-xl font-bold font-mono text-amber-500">{calculateAverageRating()}</div>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              ))}
            </div>
            <div className="text-[9px] text-neutral-500 font-mono mt-1 uppercase">Средний балл ({reviewsList.length})</div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 text-xs font-mono font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Оставить отзыв
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-amber-950/20 border border-amber-900/30 text-amber-400 text-xs rounded-lg animate-pulse">
          Благодарим вас за отзыв! Ваше мнение формирует престиж нашего клуба. Отзыв добавлен в систему.
        </div>
      )}

      {/* Review Submission Form */}
      {showAddForm && (
        <form onSubmit={handleAddReview} className="p-6 bg-neutral-900 border border-amber-900/10 rounded-xl space-y-4 max-w-2xl mx-auto shadow-xl">
          <h4 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-wider">Ваш отзыв о визите</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-400 font-mono block">Ваше имя</label>
              <input
                type="text"
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Михаил Л."
                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-xs focus:outline-none focus:border-amber-500 text-neutral-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-neutral-400 font-mono block">К какому мастеру записывались?</label>
              <select
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-xs focus:outline-none focus:border-amber-500 text-neutral-300"
              >
                <option value="">Не указано / Администратор</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.name}>{b.name} ({b.rank})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400 font-mono block">Ваша оценка (звезды)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setRatingSelection(lvl)}
                  className="p-1 hover:scale-110 transition-transform duration-100"
                >
                  <Star
                    className={`w-6 h-6 ${
                      ratingSelection >= lvl
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-neutral-700 hover:text-neutral-500'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400 font-mono block">Комментарий</label>
            <textarea
              required
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Расскажите о качестве стрижки, сервисе, парковке или виски..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded p-2.5 text-xs focus:outline-none focus:border-amber-500 text-neutral-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1.5">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-xs font-mono uppercase rounded transition-all duration-300"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-550 text-neutral-950 text-xs font-mono font-bold uppercase rounded transition-all duration-300"
            >
              Подтвердить отзыв
            </button>
          </div>
        </form>
      )}

      {/* Reviews Render Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviewsList.map((review) => (
          <div
            key={review.id}
            className="p-5 bg-neutral-950/20 border border-neutral-900 rounded-xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    <User className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-neutral-200 text-xs">{review.clientName}</h5>
                    <div className="text-[9px] text-neutral-500 font-mono">{review.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        review.rating >= star
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-neutral-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-neutral-400 text-xs leading-relaxed italic">&ldquo;{review.text}&rdquo;</p>
            </div>

            {review.barberName && (
              <div className="border-t border-neutral-900/60 pt-3 flex items-center gap-1.5 text-[10px] text-amber-500/80 font-mono">
                <Award className="w-3.5 h-3.5" />
                <span>Мастер: {review.barberName}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
