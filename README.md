# RopeFit Timer

Mobile MVP for jump-rope HIIT blocks plus a bodyweight strength finisher.

## Stack

- React Native + Expo SDK 56
- TypeScript
- Expo Router
- AsyncStorage for config/history
- `expo-speech` for voice cues
- `expo-av` for local pip sounds
- `expo-haptics` for interval vibration
- Spotify Web API with OAuth PKCE, with mock BPM data as the default MVP mode

## Run Locally

```bash
npm install
npm run start
```

Then open the app with Expo Go, an emulator, or:

```bash
npm run web
```

## Spotify Setup

The app works without Spotify credentials by using mock tracks tagged by BPM.

To enable real OAuth PKCE:

1. Create a Spotify app in the Spotify Developer Dashboard.
2. Add these redirect URIs to the app as needed:

   ```text
   https://lgiaroli.github.io/ropefit-timer/spotify-auth
   http://127.0.0.1:8081/spotify-auth
   ropefit://spotify-auth
   ```

   Spotify requires an exact redirect URI match. For local web testing, open Expo with `127.0.0.1` instead of `localhost`.

3. Create a local `.env` file or paste the Client ID directly in the Spotify screen:

   ```bash
   EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
   ```

4. Restart Expo if you changed `.env`.

5. For the published GitHub Pages build, either paste the Client ID in the app's Spotify screen or add a GitHub repository variable named `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` and redeploy.

6. If your Spotify app is in Development Mode, add your Spotify account in Users Management. Spotify requires the app owner to have Premium in Development Mode, and playback control requires a Premium account.

Spotify Web API is used only for user authorization, playlists, top/saved tracks, playlist creation, and playback control. The app does not download music, store audio, modify artwork, or use Spotify content to train models. If Spotify does not provide BPM for a track, the UI falls back to mock/manual BPM messaging.

## Training Defaults

- 20 blocks
- 6 rounds per block
- 20s jump / 10s short rest
- 60s rest between blocks, except after the last block
- 3 min dynamic warmup
- 2 min cooldown
- Automatic progression enabled
- Voice coach tips enabled
- Strength finisher enabled, 12 minutes, intermediate level

The 20-block preset equals 40 minutes of real jump time.

## Training App Features

- Automatic progression: recommends and applies the next session from completion rate, weekly jump time, and recent consistency.
- Warmup/cooldown: guided stages wrap the rope blocks before and after the main work.
- Strength finisher: bodyweight circuit by level with exercise replacement and spoken cues.
- Voice coach: interval calls plus technique, breathing, and effort prompts.
- Progress dashboard: streak, weekly jump minutes, total jump time, finisher rate, recent-session bars, and next-load recommendation.
