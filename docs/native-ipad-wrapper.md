# The Director — native iPad wrapper (Capacitor)

The app ships as an offline-first PWA; this wraps that same build in a thin native
iOS shell (a WKWebView) so it can be installed from Xcode / TestFlight and get a
real home-screen app, splash screen, and App Store path. **No app logic changes** —
Capacitor serves the `dist/` build locally on the device.

The Capacitor **config, scripts, and integration are committed**. Generating and
building the actual iOS project must be done on a Mac with the toolchain below —
it cannot be produced without Xcode + CocoaPods.

## Prerequisites (on the Mac)

- **Full Xcode** (not just Command Line Tools). Then point the toolchain at it:
  `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` and accept the
  licence (`sudo xcodebuild -license accept`).
- **CocoaPods**: `brew install cocoapods` (or `sudo gem install cocoapods`).
- Node ≥ 20 (Capacitor 8) — already required to build the web app.

Check: `xcodebuild -version` and `pod --version` should both print a version.

## One-time: generate the iOS project

```bash
npm install          # pulls @capacitor/core, cli, ios (devDependencies)
npm run ios:add      # = vite build → npx cap add ios   (runs pod install)
```

This creates `ios/` (an Xcode project under `ios/App`). Commit it — it is the native
project source. Generated/derived paths inside it are git-ignored (see `.gitignore`).

App icons + splash (once): placeholder sources are provided at `resources/icon.png`
(1024²) and `resources/splash.png` (2732²) — regenerate with `npm run gen:icons`, or
replace them with real art. Then `npx @capacitor/assets generate --ios`.

## Every build after a web change

```bash
npm run ios:sync     # = vite build → npx cap sync ios   (copies fresh web assets + plugins)
npm run ios:open     # opens ios/App/App.xcworkspace in Xcode
# or in one step:
npm run ios
```

In Xcode: pick your Team (Signing & Capabilities), choose an iPad simulator or a
connected iPad, and Run (⌘R). For a device/TestFlight build you need an Apple
Developer account and a signing profile.

## Config

[`capacitor.config.json`](../capacitor.config.json):

- `appId` — **`uk.timevans.thedirector`**. Change this *before* the first `ios:add`
  (changing the bundle id after generation means regenerating or editing Xcode).
- `webDir: dist` — the vite output the shell serves.
- `ios.contentInset: always` + `viewport-fit=cover` in `index.html` handle the safe
  areas (notch / home indicator) so the Director Rail sits correctly.
- `backgroundColor` matches the app theme so there is no white flash on launch.

## iOS-specific notes

- **Offline**: fully native — the web assets are bundled in the app, so it works with
  no network regardless of the service worker. The browser PWA still uses `sw.js`; the
  wrapper **skips SW registration** (`window.Capacitor.isNativePlatform()` in `main.js`)
  to avoid a redundant SW under the `capacitor://` scheme.
- **Keep-awake (💡)**: `navigator.wakeLock` is unreliable inside WKWebView. For a solid
  screen-on toggle in the native build, add
  [`@capacitor-community/keep-awake`](https://github.com/capacitor-community/keep-awake)
  and call `KeepAwake.keepAwake()` / `.allowSleep()` from the shell's wake toggle when
  `window.Capacitor` is present. The current toggle degrades gracefully until then.
- **Online art "Generate"**: works the same — it calls the GM-configured endpoint over
  the network when connected.
- **Orientation**: the manifest requests landscape; set the same in Xcode
  (Deployment Info → iPad → Landscape only) so it matches at the table.
