import { useState } from "react";
import { motion } from "motion/react";

interface IOSToggleProps {
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function IOSToggle({ defaultChecked = false, onChange }: IOSToggleProps) {
  const [isOn, setIsOn] = useState(defaultChecked);

  // Generate snap sound using Web Audio API
  const playSnapSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create a satisfying "snap" sound with quick frequency sweep
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05);

    // Quick volume envelope for snap effect
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  };

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    playSnapSound();
    onChange?.(newState);
  };

  return (
    <button
      role="switch"
      aria-checked={isOn}
      onClick={handleToggle}
      className="relative inline-flex h-[31px] w-[51px] items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      style={{
        backgroundColor: isOn ? "#34C759" : "#E5E5EA",
      }}
    >
      <motion.span
        className="inline-block h-[27px] w-[27px] rounded-full bg-white shadow-lg"
        initial={false}
        animate={{
          x: isOn ? 22 : 2,
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
      />
    </button>
  );
}
