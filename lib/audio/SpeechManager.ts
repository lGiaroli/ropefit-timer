import * as Speech from 'expo-speech';
import { VoiceType } from '@/lib/types';

export class SpeechManager {
  static speak(message?: string, enabled = true, voiceId?: string, voiceType: VoiceType = 'coach') {
    if (!enabled || !message) {
      return;
    }

    const profile = {
      coach: { pitch: 1.05, rate: 1.02 },
      neutral: { pitch: 1.0, rate: 0.96 },
      calm: { pitch: 0.95, rate: 0.9 },
    }[voiceType];

    Speech.stop();
    Speech.speak(message, {
      language: 'es-AR',
      voice: voiceId,
      pitch: profile.pitch,
      rate: profile.rate,
    });
  }

  static stop() {
    Speech.stop();
  }
}
