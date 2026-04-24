import React, { useEffect, useRef } from 'react';

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize manifestation only once
    if (!audioRef.current) {
      audioRef.current = new Audio('/ambient.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.01; // Barely audible ritual haunt
    }

    const startRitualMusic = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // If browser silences the ritual, wait for the first click of a soul
          const onSoulInteraction = () => {
            audioRef.current?.play();
            window.removeEventListener('click', onSoulInteraction);
          };
          window.addEventListener('click', onSoulInteraction);
        });
      }
    };

    startRitualMusic();

    // Random Jumpscare Manifestations
    let jumpTimeout: NodeJS.Timeout;

    const triggerJumpScare = () => {
      // Pick one of the 8 ritual manifestations
      const randomJump = Math.floor(Math.random() * 8) + 1;
      const jumpAudio = new Audio(`/jump${randomJump}.mp3`);
      jumpAudio.volume = 0.1; // Subdued and eerie ritual manifestations
      jumpAudio.play().catch(() => {
        // Silenced by the web of reality
      });

      // Schedule the next horror (between 20 seconds and 60 seconds)
      const nextInterval = Math.random() * (60000 - 20000) + 20000;
      jumpTimeout = setTimeout(triggerJumpScare, nextInterval);
    };

    // First manifestation after 10-30 seconds of ritual
    const initialInterval = Math.random() * (30000 - 10000) + 10000;
    jumpTimeout = setTimeout(triggerJumpScare, initialInterval);

    return () => {
      // Ambience persists as long as the page is alive
      clearTimeout(jumpTimeout);
    };
  }, []);

  return null; // The sound is felt, not seen
}
