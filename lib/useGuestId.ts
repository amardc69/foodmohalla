import { useState, useEffect } from 'react';

export function useCartUserId(session: any) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    } else {
      let guestId = localStorage.getItem('guestCartId');
      if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('guestCartId', guestId);
      }
      setUserId(guestId);
    }
  }, [session]);

  return userId;
}
