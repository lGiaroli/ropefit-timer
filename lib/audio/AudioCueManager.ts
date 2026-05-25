import { Audio, AVPlaybackSource } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const beepSound = require('../../assets/audio/beep.wav') as AVPlaybackSource;
const transitionSound = require('../../assets/audio/beep-strong.wav') as AVPlaybackSource;

let audioModeReady = false;

async function ensureAudioMode() {
  if (audioModeReady) {
    return;
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
  });
  audioModeReady = true;
}

async function play(source: AVPlaybackSource, volume: number) {
  await ensureAudioMode();
  const { sound } = await Audio.Sound.createAsync(source, { volume, shouldPlay: true });
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      sound.unloadAsync();
    }
  });
}

export class AudioCueManager {
  static async playCountdownBeep(enabled: boolean, volume: number) {
    if (!enabled) {
      return;
    }
    try {
      await play(beepSound, volume);
    } catch {
      // Audio cues are helpful, but the timer must keep moving if a device blocks playback.
    }
  }

  static async playTransitionCue(enabled: boolean, volume: number) {
    if (!enabled) {
      return;
    }
    try {
      await play(transitionSound, Math.min(1, volume + 0.1));
    } catch {
      // Keep the workout flow resilient on web simulators or muted devices.
    }
  }

  static async vibrate(enabled: boolean) {
    if (!enabled || Platform.OS === 'web') {
      return;
    }
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics can be unavailable on some devices and should not block the timer.
    }
  }
}
