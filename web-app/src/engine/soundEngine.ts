/**
 * Sound Design & Micro-Haptics Engine for MarkSecure Studio
 * Pure Web Audio API synthesis - zero external audio assets, zero latency, 100% offline.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private activeAlarmNodes: { stop: () => void }[] = [];

  constructor() {
    try {
      const stored = localStorage.getItem('marksecure_sound_enabled');
      this.isEnabled = stored !== null ? stored === 'true' : true;
    } catch {
      this.isEnabled = true;
    }

    // Auto-unlock audio on the very first user interaction
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.warmUp();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('click', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('click', unlockAudio, { passive: true });

      // Universal micro-click sound feedback for all buttons, tabs, and interactive controls
      window.addEventListener(
        'click',
        (e: MouseEvent) => {
          if (!this.isEnabled) return;
          const target = e.target as HTMLElement | null;
          if (!target) return;
          const clickable = target.closest(
            'button, [role="button"], a, input[type="radio"], input[type="checkbox"], select, summary, [data-clickable]'
          );
          if (clickable) {
            this.playMicroClick();
          }
        },
        { capture: true, passive: true }
      );
    }
  }

  private lastClickTime: number = 0;

  /**
   * Universal subtle tactile micro-click for UI buttons and tabs
   */
  public playMicroClick(): void {
    if (!this.isEnabled) return;
    const nowMs = Date.now();
    if (nowMs - this.lastClickTime < 50) return; // Debounce rapid click bursts
    this.lastClickTime = nowMs;

    const ctx = this.initContext();
    if (!ctx) return;

    this.triggerHaptic(6);
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1750, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.012);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.018);
  }

  public getSoundEnabled(): boolean {
    return this.isEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('marksecure_sound_enabled', String(enabled));
    } catch {
      // ignore
    }
    if (enabled) {
      this.playLockClick();
    } else {
      this.stopAlarm();
    }
  }

  public toggleSound(): boolean {
    const next = !this.isEnabled;
    this.setSoundEnabled(next);
    return next;
  }

  public warmUp(): void {
    this.initContext();
  }

  public initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private triggerHaptic(pattern: number | number[] = 15) {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Crisp mechanical camera shutter click (image upload & export snapshot)
   */
  public playShutterClick(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.triggerHaptic([12, 30, 20]);
    const now = ctx.currentTime;

    // Stage 1: Quick mechanical blade snap
    const bufferSize = Math.floor(ctx.sampleRate * 0.04);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3200, now);
    noiseFilter.Q.setValueAtTime(2.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start(now);

    // Stage 2: Crisp metallic return click at +45ms
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now + 0.045);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.08);

    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.setValueAtTime(0.2, now + 0.045);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now + 0.045);
    osc.stop(now + 0.095);
  }

  /**
   * Solid tactile watermark stamp impact
   */
  public playStampSound(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.triggerHaptic(18);
    const now = ctx.currentTime;

    // Solid body thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.07);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.075);

    // High transient snap
    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.type = 'triangle';
    snap.frequency.setValueAtTime(2200, now);
    snap.frequency.exponentialRampToValueAtTime(800, now + 0.02);

    snapGain.gain.setValueAtTime(0.18, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    snap.connect(snapGain);
    snapGain.connect(ctx.destination);
    snap.start(now);
    snap.stop(now + 0.025);
  }

  /**
   * Precision tumblers metallic lock click
   */
  public playLockClick(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.triggerHaptic(10);
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1850, now);
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.015);

    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.02);

    // Second micro-tick
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2600, now + 0.018);
    osc2.frequency.exponentialRampToValueAtTime(1900, now + 0.035);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.18, now + 0.018);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.018);
    osc2.stop(now + 0.045);
  }

  /**
   * Stop any active alarm or looping warning tone
   */
  public stopAlarm(): void {
    this.activeAlarmNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // ignore
      }
    });
    this.activeAlarmNodes = [];
  }

  /**
   * Peaceful small melodic tune (~2.0 seconds) for authentic verified assets.
   * Elegant, serene 5-note crystalline chime progression (Eb5 -> G5 -> Bb5 -> C6 -> Eb6)
   * with warm analog reverb decay.
   */
  public playAuthenticTune2s(): void {
    if (!this.isEnabled) return;
    this.stopAlarm();
    const ctx = this.initContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => this.executeAuthenticTune(ctx)).catch(() => {});
    } else {
      this.executeAuthenticTune(ctx);
    }
  }

  private executeAuthenticTune(ctx: AudioContext): void {
    this.triggerHaptic([20, 60, 30, 80]);

    const now = ctx.currentTime;
    // 5-note peaceful ascending chime: Eb5 (622.25Hz), G5 (783.99Hz), Bb5 (932.33Hz), C6 (1046.5Hz), Eb6 (1244.5Hz)
    const notes = [
      { freq: 622.25, time: 0.0, dur: 0.8 },
      { freq: 783.99, time: 0.22, dur: 0.8 },
      { freq: 932.33, time: 0.44, dur: 0.9 },
      { freq: 1046.5, time: 0.68, dur: 1.0 },
      { freq: 1244.5, time: 0.92, dur: 1.2 },
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Warm pure sine + bell overtone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3600, now + n.time);

      gain.gain.setValueAtTime(0, now + n.time);
      gain.gain.linearRampToValueAtTime(0.18, now + n.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur + 0.05);

      // Add gentle octave shimmer
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'triangle';
      shimmer.frequency.setValueAtTime(n.freq * 2, now + n.time);

      shimmerGain.gain.setValueAtTime(0, now + n.time);
      shimmerGain.gain.linearRampToValueAtTime(0.04, now + n.time + 0.02);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + 0.4);

      shimmer.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);
      shimmer.start(now + n.time);
      shimmer.stop(now + n.time + 0.45);
    });
  }

  /**
   * Alarming cybersecurity alert sound (~5.0 seconds) for forgery, tampering, or compromised honeytokens.
   * Synthesizes a pulsing, authoritative dual-frequency alert siren (440Hz / 352Hz alternating pulses)
   * with lowpass resonance filter sweeps across 5 seconds.
   */
  public playForgeryAlarm5s(): void {
    if (!this.isEnabled) return;
    this.stopAlarm();
    const ctx = this.initContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => this.executeForgeryAlarm(ctx)).catch(() => {});
    } else {
      this.executeForgeryAlarm(ctx);
    }
  }

  private executeForgeryAlarm(ctx: AudioContext): void {
    // Repeated urgent haptic alert pulses
    this.triggerHaptic([80, 50, 80, 50, 120, 80, 150]);

    const now = ctx.currentTime;
    const totalDuration = 5.0; // exactly 5 seconds

    // Master gain for the alarm sequence with fade out at 4.8s
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.24, now);
    masterGain.gain.setValueAtTime(0.24, now + 4.6);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + totalDuration);
    masterGain.connect(ctx.destination);

    // Pulse cycles: 10 pulses over 5 seconds (2 pulses per second)
    const pulseCount = 10;
    const pulseDuration = totalDuration / pulseCount; // 0.5s per pulse cycle

    for (let i = 0; i < pulseCount; i++) {
      const pulseStart = now + i * pulseDuration;

      // Primary dissonant alarm oscillator
      const osc1 = ctx.createOscillator();
      const oscGain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      // Alternate between high alarm tone (620Hz) and lower warning tone (460Hz)
      const baseFreq = i % 2 === 0 ? 640 : 480;
      osc1.frequency.setValueAtTime(baseFreq, pulseStart);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.82, pulseStart + 0.38);

      const filter1 = ctx.createBiquadFilter();
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(baseFreq, pulseStart);
      filter1.Q.setValueAtTime(3.5, pulseStart);

      oscGain1.gain.setValueAtTime(0, pulseStart);
      oscGain1.gain.linearRampToValueAtTime(0.22, pulseStart + 0.03);
      oscGain1.gain.setValueAtTime(0.2, pulseStart + 0.28);
      oscGain1.gain.exponentialRampToValueAtTime(0.001, pulseStart + 0.42);

      osc1.connect(filter1);
      filter1.connect(oscGain1);
      oscGain1.connect(masterGain);

      osc1.start(pulseStart);
      osc1.stop(pulseStart + 0.45);

      this.activeAlarmNodes.push({
        stop: () => {
          try {
            osc1.stop();
          } catch {
            // ignore
          }
        },
      });

      // Secondary tritone dissonant oscillator for cyber-breach alarm feel
      const osc2 = ctx.createOscillator();
      const oscGain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(baseFreq * 1.414, pulseStart); // Tritone interval!

      oscGain2.gain.setValueAtTime(0, pulseStart);
      oscGain2.gain.linearRampToValueAtTime(0.08, pulseStart + 0.03);
      oscGain2.gain.exponentialRampToValueAtTime(0.001, pulseStart + 0.35);

      osc2.connect(oscGain2);
      oscGain2.connect(masterGain);

      osc2.start(pulseStart);
      osc2.stop(pulseStart + 0.4);

      this.activeAlarmNodes.push({
        stop: () => {
          try {
            osc2.stop();
          } catch {
            // ignore
          }
        },
      });
    }
  }

  /**
   * Compatibility alias for authentic pass sound
   */
  public playPassSound(): void {
    this.playAuthenticTune2s();
  }

  /**
   * Compatibility alias for tamper/forgery fail sound
   */
  public playFailSound(): void {
    this.playForgeryAlarm5s();
  }

  /**
   * Micro-haptic soft tick for magnifier / before-after split slider engagement
   */
  public playLoupeTick(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.01);
  }

  /**
   * Delicate celestial acoustic sheen when toggling or inspecting metallic foil
   */
  public playFoilSheen(): void {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.triggerHaptic(12);

    const now = ctx.currentTime;
    const freqs = [1760, 2217.46, 2637.02];

    freqs.forEach((freq, idx) => {
      const delay = idx * 0.03;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.setValueAtTime(0.08, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.25);
    });
  }
}

export const soundEngine = new SoundEngine();
