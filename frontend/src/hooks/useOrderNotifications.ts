import { useEffect, useRef, useState } from 'react';
import { Order } from '@/types/menu';
import { toast } from '@/hooks/use-toast';

const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export function useOrderNotifications(orders: Order[]) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousOrdersRef = useRef<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.7;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Check for new orders
  useEffect(() => {
    const currentOrderIds = orders
      .filter(o => o.status === 'accepted' || o.status === 'preparing')
      .map(o => o.id);
    
    const previousIds = previousOrdersRef.current;
    
    // Find new orders (in current but not in previous)
    const newOrders = currentOrderIds.filter(id => !previousIds.includes(id));
    
    if (newOrders.length > 0 && previousIds.length > 0) {
      // Play sound for new orders
      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
      
      // Show toast notification
      const newOrderDetails = orders.filter(o => newOrders.includes(o.id));
      newOrderDetails.forEach(order => {
        toast({
          title: `🔔 New Order - Table ${order.tableNumber}`,
          description: `${order.items.length} item${order.items.length !== 1 ? 's' : ''} to prepare`,
          duration: 5000,
        });
      });
    }
    
    previousOrdersRef.current = currentOrderIds;
  }, [orders, soundEnabled]);

  const toggleSound = () => setSoundEnabled(prev => !prev);
  
  // Test sound function
  const testSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  };

  return { soundEnabled, toggleSound, testSound };
}
