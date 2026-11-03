import { createContext, useContext } from 'react';

export interface BookingContextValue {
  openBooking: (presetItemId?: string) => void;
}

export const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within BookingProvider');
  return context;
}
