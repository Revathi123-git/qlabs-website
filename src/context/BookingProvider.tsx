import { useState, type ReactNode } from 'react';
import { BookingContext } from '@/context/booking-context';
import { BookingModal } from '@/components/booking/BookingModal';

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [presetItemId, setPresetItemId] = useState<string | undefined>();

  const openBooking = (itemId?: string) => {
    setPresetItemId(itemId);
    setIsOpen(true);
  };

  return (
    <BookingContext.Provider value={{ openBooking }}>
      {children}
      {isOpen && <BookingModal initialItemId={presetItemId} onClose={() => setIsOpen(false)} />}
    </BookingContext.Provider>
  );
}
