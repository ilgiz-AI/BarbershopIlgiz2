export interface Barber {
  id: string;
  name: string;
  rank: 'Master' | 'Senior' | 'Art Director';
  rating: number;
  reviewsCount: number;
  specialty: string;
  quote: string;
  avatar: string;
  workExamples: string[];
}

export interface Service {
  id: string;
  name: string;
  category: 'hair' | 'beard' | 'complex' | 'spa';
  duration: number; // in minutes
  price: number; // in rubles
  description: string;
  isPopular?: boolean;
}

export interface Look {
  id: string;
  name: string;
  description: string;
  stylingProduct: string;
  difficulty: 'Легкая' | 'Средняя' | 'Сложная';
  maintenance: string;
  image: string;
}

export interface BookingState {
  service: Service | null;
  barber: Barber | null;
  date: string;
  timeSlot: string;
  clientName: string;
  clientPhone: string;
  clientNotes: string;
}

export interface Review {
  id: string;
  clientName: string;
  rating: number;
  text: string;
  date: string;
  barberName?: string;
}
