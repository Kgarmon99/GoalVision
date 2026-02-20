# iDash – Mobile (iOS / TestFlight)

iDash is a mobile-first personal dashboard app: create a dashboard, set metrics and a roadmap, and track progress. This project is set up for **Capacitor**, so you can open it in Xcode and ship to TestFlight.

## Quick start (Mac + Xcode)

1. **Build the web app and sync to iOS**
   ```bash
   npm run build:mobile
   ```
   This runs `vite build` and `cap sync ios`.

2. **Open the iOS project in Xcode**
   ```bash
   npm run cap:open:ios
   ```
   Or open `ios/App/App.xcworkspace` in Xcode (use the `.xcworkspace`, not the `.xcodeproj`).

3. **Run on simulator or device**
   - Select a simulator or a connected iPhone.
   - Press Run (▶️) or `Cmd + R`.

4. **Send to TestFlight**
   - In Xcode: **Product → Archive**.
   - After archive: **Distribute App** → **App Store Connect** → **Upload**.
   - In App Store Connect, use the build for TestFlight and add testers.

## After code changes

1. Rebuild and sync:
   ```bash
   npm run build:mobile
   ```
2. In Xcode, run again (or use **Product → Clean Build Folder** then Run if needed).

## App flow

- **First launch:** User sees “Create your dashboard” (name + Start from template / Start empty).
- **After creating:** Bottom nav: **Dashboard** (metrics + today’s focus), **Roadmap** (phases and checkable items), **New** (create another dashboard, replacing the current one).
- All data is stored locally on the device (no backend required for the personal dashboard).

## Requirements

- **iOS:** Xcode 15+ and iOS 17+ (Capacitor 8).
- **Node:** Run `npm run build:mobile` (or `npm run build` then `npm run cap:sync`) before opening in Xcode so `dist/public` is up to date.
