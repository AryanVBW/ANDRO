# ANDRO ethical demo

This application and its source are for testing, demonstrations, and ethical purposes in an isolated environment only. Use only on devices you own or have explicit permission to test. Stop if permission is withdrawn.

## Run the local portal

With Node.js 18 or newer available, run `npm start` (or `npm run demo`) from the repository root. Open <http://127.0.0.1:8081>. No dependency installation is needed for this demo. To select a different port, use `DEMO_PORT=8082 npm run demo`. Press Ctrl+C in the terminal to stop the server.

The new start command serves the standalone demo. The original `index.js` server remains legacy reference source; its previously identified startup and template errors have not been repaired.

## Practice workflow

1. Read the ethical-use notice and prepare the practice checklist.
2. Choose a fictional sample device and start a simulated session.
3. Review the session state and simulated event history.
4. Stop the session. Optionally export the simulation report as a local JSON file.
5. Reset the demo to clear its browser-memory state, or reload/close the page.

The checklist is a training aid, not evidence of real device-owner consent. No device is enrolled or contacted. Exported reports contain sample data and simulated actions only. Reports already downloaded remain on disk after reset; delete them yourself when no longer needed.

## Isolation boundaries

- The demo server binds only to `127.0.0.1` and serves four explicitly allowed URLs.
- It does not import the legacy server, read client databases, serve existing downloads/APKs, accept commands, or build/sign applications.
- The interface uses local assets and in-memory state; it does not use cookies, persistent browser storage, analytics, or remote services.
- Browser policy blocks network connections from scripts and denies camera, microphone, and location access.
- Loopback binding is a local access restriction, not a virtual machine or network sandbox. Use an isolated lab for any broader testing.

## Android app

The Android client is a user-controlled app named **ANDRO Ethical Demo**. It targets Android 16/API 36 with a minimum of API 23. Both layouts show the ethical-use notice, apply system-bar insets, adapt on expanded windows, support light/dark resources, expose 48dp Start/Stop controls, and announce session status accessibly.

A session begins only after the user taps Start on the visible activity. On Android 13+, the app first requests notification permission so controls are not hidden; it also refuses to start if app-level or channel-level notifications are disabled. The private `specialUse` foreground service then posts a low-priority ongoing notification; tapping it returns to the app, and its immutable action stops the session. The service returns `START_NOT_STICKY`, has no boot/restart receiver, and self-stops after 60 minutes. It performs no network or device-data work.

The manifest declares exactly three permissions: `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_SPECIAL_USE`, and `POST_NOTIFICATIONS`. The `specialUse` subtype is documented in the service property as a user-started, visible, time-limited ethical demo. Google Play reviews `specialUse` declarations, so this test-key APK is intended for isolated local demonstrations rather than store distribution.

Build prerequisites are Java 17 or newer, APKTool 3 or newer, `zip`, `unzip`, Android platform 36, and Android SDK build-tools 36 or newer. Build from the repository root:

```bash
npm run android:build
```

The command runs the test suite first. It then fails closed unless the source package, activity, bounded service, ethical notices, exact permission set, manifest hardening, and exact resource allowlist match. The build links resources in an isolated APKTool cache, compiles only these maintained Java files with strict warnings, converts them with D8, injects one DEX, zipaligns, signs with the pinned repository demo certificate, and centrally verifies:

- package, version, label, minimum SDK 23, and target SDK 36;
- exactly the three allowed permissions, one private `specialUse` service, and no receiver or provider;
- exactly two DEX classes: `MainActivity` and `DemoSessionService`;
- no boot, sticky, scheduling, wake-lock, network, location, microphone, contact, SMS, call-log, file, or legacy APIs;
- APK Signature Schemes v1, v2, and v3 and the expected certificate SHA-256;
- alignment, source hash, checksum, provenance, ZIP/resource allowlists, and equality of every published APK copy.

Outputs:

- `demo/build/ANDRO-Ethical-Demo.apk` — primary installable demo;
- `demo/build/ANDRO-Ethical-Demo.apk.sha256` — checksum;
- `demo/build/ANDRO-Ethical-Demo.provenance.json` — source, Java/toolchain, signing, SDK, permission, service, timeout, class, ZIP-entry, and publication record;
- `assets/webpublic/build.apk` and `build.s.apk` — byte-identical safe dashboard copies.

Recheck the existing source and artifacts without rebuilding:

```bash
npm run android:verify
```

On a connected device you own or are explicitly authorized to test, use the first command for a new install and the second for later safe-demo rebuilds:

```bash
adb install demo/build/ANDRO-Ethical-Demo.apk
adb install -r demo/build/ANDRO-Ethical-Demo.apk
```

The application ID is `com.andro.ethicaldemo`. Android installs it separately from the historical `com.etechd.l3mon` package; `adb install -r` cannot migrate across those package IDs. If you choose to remove the historical package, preserve anything you need first and then run `adb uninstall com.etechd.l3mon`—uninstalling deletes that package's app data. The pinned certificate is the public Android test certificate, so do not use this package for production or app-store distribution. No device or emulator was available in this workspace for a runtime launch/notification test.

Legacy smali remains under its historical namespace as reference source, but the safe build neither enumerates nor copies that tree. The original remote-control build pipeline is not used or repaired.

The legacy web templates also contain notices for the dashboard, sign-in, and APK build/signing flow. They still have the previously identified EJS compatibility issues. These notices do not turn the legacy remote-control system into a consent-enforced application.

## Validation

Run `npm test` for local-server restrictions, source allowlists, and negative safety cases. Run `npm run android:build` for the test-gated compile, alignment, signing, atomic publication, and post-publication verification. Run `npm run android:verify` at any time to recheck source integrity, certificate identity, APK metadata, signatures, alignment, ZIP and DEX allowlists, checksums, provenance, and all published copies without rebuilding. These checks do not certify runtime behavior on a specific OEM device or the unused legacy system.
