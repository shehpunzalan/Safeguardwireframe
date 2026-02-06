import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi } from 'lucide-react';

export function PWAStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineNotice(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineNotice(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show offline notice if starting offline
    if (!navigator.onLine) {
      setShowOfflineNotice(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide online notice after 3 seconds
  useEffect(() => {
    if (isOnline && showOfflineNotice === false) {
      const timer = setTimeout(() => {
        setShowOfflineNotice(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOfflineNotice]);

  return (
    <AnimatePresence>
      {showOfflineNotice && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div
            className={`${
              isOnline ? 'bg-green-500' : 'bg-orange-500'
            } text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5" />
                Back online
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5" />
                Offline mode - Emergency features still available
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
