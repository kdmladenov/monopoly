class SoundManager {
  private static instance: SoundManager;
  private enabled: boolean = true;
  
  private constructor() {}
  
  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }
  
  play(soundName: string) {
    if (!this.enabled) return;
    
    // In a real app, we'd load and play actual audio files here.
    // For now, we'll log the sound trigger for debugging.
    console.log(`[Sound] Playing: ${soundName}`);
    
    // Example implementation:
    // const audio = new Audio(`/sounds/${soundName}.mp3`);
    // audio.play().catch(() => {});
  }
  
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

export const playSound = (soundName: string) => {
  SoundManager.getInstance().play(soundName);
};
