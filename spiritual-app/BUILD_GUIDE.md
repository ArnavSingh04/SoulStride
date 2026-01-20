# Building and Distributing Your App

This guide explains how to build your React Native + Expo app so others can install it on their phones.

## Option 1: EAS Build (Recommended) ⭐

EAS Build is Expo's cloud-based build service. It's the easiest way to create installable apps.

### Prerequisites

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure your project:**
   ```bash
   eas build:configure
   ```

### Build for Android (APK)

**For testing/sharing (APK file):**
```bash
eas build --platform android --profile preview
```

This creates an APK file that can be:
- Downloaded directly to Android phones
- Shared via email, Google Drive, etc.
- Installed without Google Play Store

**For production (AAB for Play Store):**
```bash
eas build --platform android --profile production
```

### Build for iOS

**For testing (IPA file):**
```bash
eas build --platform ios --profile preview
```

**For App Store:**
```bash
eas build --platform ios --profile production
```

### After Building

1. **Check build status:**
   ```bash
   eas build:list
   ```

2. **Download the build:**
   - Visit https://expo.dev/accounts/[your-username]/projects/spiritual-app/builds
   - Click on your build
   - Download the APK (Android) or IPA (iOS)

3. **Share with others:**
   - **Android**: Send the APK file directly. Users need to enable "Install from unknown sources" in settings
   - **iOS**: Requires TestFlight or App Store distribution (more complex)

---

## Option 2: Local Build (Advanced)

### For Android (APK)

1. **Install Android Studio** and set up Android SDK

2. **Generate native code:**
   ```bash
   npx expo prebuild
   ```

3. **Build APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

   The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### For iOS

1. **Requires macOS** with Xcode installed

2. **Generate native code:**
   ```bash
   npx expo prebuild
   ```

3. **Open in Xcode:**
   ```bash
   cd ios
   open spiritual-app.xcworkspace
   ```

4. **Build in Xcode** (Product → Archive)

---

## Option 3: Expo Go (Quick Testing)

For quick testing with friends/colleagues:

1. **Start development server:**
   ```bash
   npm start
   ```

2. **Share the QR code:**
   - Scan with Expo Go app (available on App Store/Play Store)
   - Or share the URL: `exp://[your-ip]:8081`

**Note:** Expo Go has limitations and may not support all native features.

---

## Distribution Methods

### Android APK Distribution

1. **Direct Share:**
   - Upload APK to Google Drive/Dropbox
   - Share download link
   - Users enable "Install from unknown sources"

2. **Google Play Store:**
   - Create developer account ($25 one-time fee)
   - Upload AAB file (not APK)
   - Submit for review

3. **Internal Testing:**
   - Use Google Play Console's internal testing track
   - Share with up to 100 testers

### iOS Distribution

1. **TestFlight (Recommended for testing):**
   - Requires Apple Developer account ($99/year)
   - Upload IPA to App Store Connect
   - Invite testers via email

2. **App Store:**
   - Requires Apple Developer account
   - Submit for review
   - Takes 1-7 days for approval

3. **Ad Hoc Distribution:**
   - Limited to 100 devices
   - Requires device UDIDs
   - More complex setup

---

## Quick Start Commands

Add these to your `package.json`:

```json
{
  "scripts": {
    "build:android": "eas build --platform android --profile preview",
    "build:ios": "eas build --platform ios --profile preview",
    "build:all": "eas build --platform all --profile preview"
  }
}
```

Then run:
```bash
npm run build:android  # Build Android APK
npm run build:ios      # Build iOS IPA
```

---

## Important Notes

1. **Android APK** can be installed directly on any Android device
2. **iOS IPA** requires TestFlight or App Store (can't install directly)
3. **EAS Build** is free for limited builds, then paid
4. **Local builds** require full development environment setup
5. **Expo Go** is only for development/testing, not production

---

## Recommended Workflow

1. **For testing with friends:** Use EAS Build preview profile → Share APK
2. **For production Android:** Use EAS Build production → Upload to Play Store
3. **For production iOS:** Use EAS Build production → Upload to App Store Connect

---

## Troubleshooting

- **Build fails?** Check `eas.json` configuration
- **APK won't install?** User needs to enable "Install from unknown sources"
- **iOS build issues?** Ensure you have Apple Developer account set up
- **Need help?** Visit https://docs.expo.dev/build/introduction/
