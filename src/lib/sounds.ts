// Web Audio APIを使用したサウンド管理

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('puyoSoundEnabled', enabled ? 'true' : 'false');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  loadSetting(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('puyoSoundEnabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    }
  }

  // オシレーターで音を生成
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3): void {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Audio API not available
    }
  }

  // ぷよ着地音
  playDrop(): void {
    this.playTone(200, 0.1, 'sine', 0.2);
  }

  // ぷよ消去音（連鎖数に応じて音階を上げる）
  playClear(chainCount: number): void {
    // ド→レ→ミ→ファ→ソ→ラ→シ→ド（オクターブ上）
    const notes = [262, 294, 330, 349, 392, 440, 494, 523, 587, 659];
    const noteIndex = Math.min(chainCount - 1, notes.length - 1);
    const frequency = notes[noteIndex];

    // 和音で豪華に
    this.playTone(frequency, 0.3, 'sine', 0.25);
    setTimeout(() => {
      this.playTone(frequency * 1.25, 0.25, 'sine', 0.2);
    }, 50);
    setTimeout(() => {
      this.playTone(frequency * 1.5, 0.2, 'sine', 0.15);
    }, 100);
  }

  // 移動音
  playMove(): void {
    this.playTone(400, 0.05, 'square', 0.1);
  }

  // 回転音
  playRotate(): void {
    this.playTone(500, 0.08, 'triangle', 0.15);
  }

  // ゲームオーバー音
  playGameOver(): void {
    const notes = [330, 294, 262, 196];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'sawtooth', 0.2);
      }, i * 200);
    });
  }
}

// シングルトンインスタンス
export const soundManager = new SoundManager();
