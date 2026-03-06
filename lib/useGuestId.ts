import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useCartUserId(session: any) {
  const [userId, setUserId] = useState<string | null>(null);
  const migrateCart = useMutation(api.cart.migrateCart);

  useEffect(() => {
    let guestId = localStorage.getItem('guestCartId');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('guestCartId', guestId);
    }

    if (session?.user?.id) {
      const currentUserId = session.user.id;
      setUserId(currentUserId);
      
      if (guestId && guestId !== currentUserId) {
        migrateCart({ guestId, userId: currentUserId }).catch(console.error);
      }
    } else {
      setUserId(guestId);
    }
  }, [session, migrateCart]);

  return userId;
}
