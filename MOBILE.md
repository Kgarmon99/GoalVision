# GoalVision – Mobile app (iOS)

**GoalVision is a mobile-only app.** It is built for iOS (Xcode, Simulator, TestFlight) and is not a web app. The client is the native mobile UI; the iOS project wraps it in the native shell.

This project is set up so everything runs properly in **Xcode**, on the **Simulator**, and on **TestFlight**.

---

## 1. Run in Xcode

1. **Build the web app and sync to iOS**
   ```bash
   npm install
   npm run build:mobile
   ```
2. **Open the project in Xcode**
   ```bash
   npm run ios:open
   ```
   Or double-click **`ios/App/App.xcodeproj`** (not a `.xcworkspace`).
3. **Select a run destination**
   - In the Xcode toolbar, open the scheme/destination dropdown (next to the **App** scheme).
   - Choose any **iPhone** or **iPad** simulator (e.g. iPhone 16).
   - For a physical device: connect your iPhone and select it.
4. **Run**
   - Press **Run** (▶) or **⌘R**.

The project has a **shared scheme** (`App.xcscheme`) and **SUPPORTED_PLATFORMS = iphoneos iphonesimulator**, so Simulator and device always appear as valid destinations.

---

## 2. Run on the Simulator

**Option A – From Xcode (recommended)**  
Follow **Run in Xcode** above and pick an iPhone/iPad simulator as the destination, then **⌘R**.

**Option B – From the terminal**
```bash
npm run ios:build
npm run ios:run
```
When prompted, choose a simulator (e.g. iPhone 16).

**If no simulators appear**
- Xcode → **Settings → Platforms** (or **Components**).
- Install the **iOS** simulator runtime you need.
- In Xcode, set the run destination to that simulator and run again.

---

## 3. Run on TestFlight

1. **Apple Developer account**
   - You need an Apple Developer account and the app registered in [App Store Connect](https://appstoreconnect.apple.com) with bundle ID **`com.goalvision.app`**.

2. **Signing in Xcode**
   - Open **`ios/App/App.xcodeproj`** in Xcode.
   - Select the **App** project in the navigator → **Signing & Capabilities**.
   - Check **Automatically manage signing**.
   - Select your **Team** (your Apple Developer account).
   - Xcode will create/use the right provisioning profile.

3. **Build for release**
   - Ensure the **App** scheme is selected.
   - Set run destination to **Any iOS Device** (or a connected device).
   - **Product → Archive**.
   - Wait for the archive to finish; the Organizer window will open.

4. **Distribute to App Store Connect**
   - In Organizer, select the new archive → **Distribute App**.
   - Choose **App Store Connect** → **Upload**.
   - Follow the steps (e.g. automatic signing, upload).
   - In [App Store Connect](https://appstoreconnect.apple.com), open your app → **TestFlight**.
   - The build will appear after processing; add internal/external testers and install via TestFlight.

**Release build settings**
- **Release** uses **`release.xcconfig`** (`CAPACITOR_DEBUG = false`) so production builds are correct.
- **Info.plist** includes **ITSAppUsesNonExemptEncryption = false** so you can submit without extra export compliance docs (unless you add custom encryption later).

---

## After code changes

1. Rebuild and sync:
   ```bash
   npm run build:mobile
   ```
2. In Xcode: run again (or **Product → Clean Build Folder**, then **Run**).

---

## NPM scripts

| Script              | What it does                     |
|---------------------|-----------------------------------|
| `npm run ios`       | Build + sync + run in Simulator   |
| `npm run ios:build` | Build web app + `cap sync ios`   |
| `npm run ios:open`  | Open `ios/App/App.xcodeproj`      |
| `npm run ios:run`   | Run in Simulator (after build)    |
| `npm run build:mobile` | Same as `ios:build`           |

---

## Project layout (iOS)

- **`ios/App/App.xcodeproj`** – Xcode project (open this).
- **`ios/App/App/public`** – Web assets (filled by `cap sync` from `dist/public`).
- **`ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme`** – Shared scheme for App (Simulator + device + Archive).
- **`ios/debug.xcconfig`** – Debug build: `CAPACITOR_DEBUG = true`.
- **`ios/release.xcconfig`** – Release/Archive: `CAPACITOR_DEBUG = false`.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| Simulator not in destination list | Install an iOS simulator: Xcode → Settings → Platforms → iOS. |
| “Supported platforms empty” | Project already has `SUPPORTED_PLATFORMS = iphoneos iphonesimulator`. Re-open the project and clean (Product → Clean Build Folder). |
| Archive or signing errors | Set your **Team** under Signing & Capabilities and ensure the app exists in App Store Connect with bundle ID `com.goalvision.app`. |
| White screen or missing UI on device/simulator | Run `npm run build:mobile` so `ios/App/App/public` is up to date, then run from Xcode again. |
