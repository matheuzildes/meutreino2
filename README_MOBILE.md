
# Building Android APK for Gym Tracker App

This guide will help you build an Android APK from your React project using Capacitor.

## Prerequisites

Before you start, make sure you have:

1. **Node.js and npm** installed on your system
2. **Android Studio** installed with the following components:
   - Android SDK
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android Virtual Device (AVD) if you want to test on emulator

## Step-by-Step Instructions

### 1. Export and Clone Project

1. In Lovable, click the GitHub button in the top right
2. Click "Export to GitHub" to create a repository
3. Clone the repository to your local machine:
   ```bash
   git clone [your-github-repo-url]
   cd [your-project-folder]
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Capacitor (if not already done)

```bash
npx cap init
```

### 4. Build the Web App

```bash
npm run build
```

### 5. Add Android Platform

```bash
npx cap add android
```

### 6. Sync the Project

```bash
npx cap sync android
```

### 7. Open in Android Studio

```bash
npx cap open android
```

This will open Android Studio with your project.

### 8. Configure Android Studio

1. **Set up SDK**: Make sure Android SDK is properly configured
2. **Set target SDK**: In `android/app/build.gradle`, ensure `compileSdkVersion` and `targetSdkVersion` are set to a recent version (33 or higher)
3. **Configure signing**: For release builds, you'll need to configure app signing

### 9. Build APK

In Android Studio:

1. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Wait for the build to complete
3. The APK will be generated in `android/app/build/outputs/apk/debug/`

### 10. Alternative: Command Line Build

You can also build from command line:

```bash
# For debug APK
cd android
./gradlew assembleDebug

# For release APK (requires signing configuration)
./gradlew assembleRelease
```

## Testing

### On Physical Device

1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect device via USB
4. Run: `npx cap run android`

### On Emulator

1. Create an AVD in Android Studio
2. Start the emulator
3. Run: `npx cap run android`

## Troubleshooting

### Common Issues

1. **SDK not found**: Make sure Android SDK is installed and ANDROID_HOME environment variable is set
2. **Gradle sync failed**: Try cleaning and rebuilding the project
3. **Build failed**: Check the error logs in Android Studio

### Useful Commands

```bash
# Sync after code changes
npx cap sync android

# Clean and sync
npx cap sync android --deployment

# View logs
npx cap run android --list
```

## App Configuration

The app is configured with:
- **App ID**: `app.lovable.bb614855f1bc4d98b047e40ec9720e37`
- **App Name**: `apptreino`
- **Icon**: Default Capacitor icon (you can customize this)

## Customization

### App Icon
Replace icons in `android/app/src/main/res/` directories with your custom icons.

### Splash Screen
Configure splash screen in `capacitor.config.ts`:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: '#1a1a1a',
    showSpinner: false
  }
}
```

### Permissions
Add required permissions in `android/app/src/main/AndroidManifest.xml`

## Production Build

For production:

1. Configure app signing in Android Studio
2. Update version in `android/app/build.gradle`
3. Build release APK: `./gradlew assembleRelease`
4. Upload to Google Play Store

## Support

For more help, check:
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
