import { useState } from 'react';
import { X, Download, Wifi, Zap, Shield, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PWAGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PWAGuide({ isOpen, onClose }: PWAGuideProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      icon: <Download className="w-12 h-12" />,
      title: 'Install SafeGuard',
      description: 'Add SafeGuard to your home screen for quick access during emergencies.',
      features: [
        'One-tap access from home screen',
        'Works like a native app',
        'No app store needed',
        'Takes only seconds to install'
      ]
    },
    {
      icon: <Wifi className="w-12 h-12" />,
      title: 'Works Offline',
      description: 'All essential features work even without internet connection.',
      features: [
        'View emergency contacts',
        'Access medical information',
        'Use voice guidance',
        'Navigate all screens'
      ]
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: 'Lightning Fast',
      description: 'Opens instantly with cached content for emergency situations.',
      features: [
        'Instant loading times',
        'No waiting for emergencies',
        'Efficient data usage',
        'Automatic updates'
      ]
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: 'Safe & Private',
      description: 'Your data stays on your device, secure and private.',
      features: [
        'Local data storage',
        'No cloud uploads',
        'HTTPS encryption',
        'You control your information'
      ]
    }
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Progressive Web App</h2>
              </div>
              <p className="text-blue-100 text-sm">Discover SafeGuard's powerful features</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Icon */}
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                    {pages[currentPage].icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                    {pages[currentPage].title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-center mb-6">
                    {pages[currentPage].description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {pages[currentPage].features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 text-sm">✓</span>
                        </span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mb-6">
                {pages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentPage
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {currentPage > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="flex-1 py-3 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  {currentPage === pages.length - 1 ? 'Get Started' : 'Next'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
