'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
    validateResourceAllowlist,
    validateSource,
    validateSourceContent
} = require('../build-android');

const sourceRoot = path.resolve(__dirname, '../../app/factory/decompiled');
const javaRoot = path.resolve(__dirname, '../android-src/com/andro/ethicaldemo');
const read = (...parts) => fs.readFileSync(path.join(sourceRoot, ...parts), 'utf8');
const currentSource = () => ({
    manifest: read('AndroidManifest.xml'),
    mainActivity: fs.readFileSync(path.join(javaRoot, 'MainActivity.java'), 'utf8'),
    service: fs.readFileSync(path.join(javaRoot, 'DemoSessionService.java'), 'utf8'),
    strings: read('res', 'values', 'strings.xml')
});

const allowedPermissions = [
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_SPECIAL_USE',
    'android.permission.POST_NOTIFICATIONS'
];

test('Android demo declares only the visible foreground-session permissions and components', () => {
    const { manifest } = currentSource();
    const apktool = read('apktool.yml');
    const permissions = [...manifest.matchAll(/<uses-permission\b[^>]*android:name="([^"]+)"/g)]
        .map((match) => match[1])
        .sort();

    assert.match(manifest, /package="com\.andro\.ethicaldemo"/);
    assert.match(manifest, /android:name="com\.andro\.ethicaldemo\.MainActivity"/);
    assert.match(manifest, /android:name="com\.andro\.ethicaldemo\.DemoSessionService"/);
    assert.deepEqual(permissions, allowedPermissions);
    assert.equal((manifest.match(/<activity\b/g) || []).length, 1);
    assert.equal((manifest.match(/<service\b/g) || []).length, 1);
    assert.doesNotMatch(manifest, /<(?:receiver|provider)\b|BOOT_COMPLETED|QUICKBOOT|SECRET_CODE|respawn/i);
    assert.match(manifest, /android:exported="false"/);
    assert.match(manifest, /android:foregroundServiceType="specialUse"/);
    assert.match(manifest, /android\.app\.PROPERTY_SPECIAL_USE_FGS_SUBTYPE/);
    assert.match(manifest, /android:stopWithTask="false"/);
    assert.match(manifest, /android:minSdkVersion="23"/);
    assert.match(manifest, /android:targetSdkVersion="36"/);
    assert.match(apktool, /minSdkVersion: '23'/);
    assert.match(apktool, /targetSdkVersion: '36'/);
});

test('activity and service expose visible controls with bounded non-sticky execution', () => {
    const { mainActivity, service } = currentSource();

    assert.match(mainActivity, /POST_NOTIFICATIONS/);
    assert.match(mainActivity, /requestPermissions/);
    assert.match(mainActivity, /areNotificationsEnabled/);
    assert.match(mainActivity, /getNotificationChannel/);
    assert.match(mainActivity, /startForegroundService/);
    assert.match(mainActivity, /postDelayed\(this, 250L\)/);
    assert.match(mainActivity, /stopService/);
    assert.match(service, /START_NOT_STICKY/);
    assert.match(service, /FOREGROUND_SERVICE_TYPE_SPECIAL_USE/);
    assert.match(service, /Build\.VERSION\.SDK_INT >= 34/);
    assert.match(service, /MAX_SESSION_MILLIS = 60L \* 60L \* 1000L/);
    assert.match(service, /postDelayed\(this, MAX_SESSION_MILLIS\)/);
    assert.match(service, /FLAG_IMMUTABLE/);
    assert.match(service, /setOngoing\(true\)/);
    assert.match(service, /addAction/);
    assert.doesNotMatch(`${mainActivity}\n${service}`, /\bSTART_STICKY\b|onTaskRemoved|BOOT_COMPLETED|AlarmManager|JobScheduler|WorkManager|WakeLock/);
    assert.doesNotMatch(`${mainActivity}\n${service}`, /java\.net|okhttp|io\.socket|android\.location|MediaRecorder|ContactsContract|Telephony|SmsManager/);
    assert.doesNotThrow(validateResourceAllowlist);
    assert.doesNotThrow(validateSource);
});

test('source validation rejects persistence, extra permissions, hidden components, and data APIs', () => {
    const source = currentSource();
    const withInternet = source.manifest.replace('<application', '<uses-permission android:name="android.permission.INTERNET" />\n\n    <application');
    const withReceiver = source.manifest.replace('</application>', '<receiver android:name=".BootReceiver" />\n</application>');
    const stickyService = source.service.replaceAll('START_NOT_STICKY', 'START_STICKY');
    const networkService = `${source.service}\n// java.net.Socket is forbidden`;
    const hiddenNotification = source.service.replace('addAction', 'setOnlyAlertOnce');
    const unboundedCopy = source.strings.replaceAll('stops automatically after 60 minutes', 'continues indefinitely');

    assert.throws(() => validateSourceContent({ ...source, manifest: withInternet }), /permission allowlist mismatch/);
    assert.throws(() => validateSourceContent({ ...source, manifest: withReceiver }), /Receivers and providers are forbidden/);
    assert.throws(() => validateSourceContent({ ...source, service: stickyService }), /START_NOT_STICKY|Auto-restart/);
    assert.throws(() => validateSourceContent({ ...source, service: networkService }), /Network or device-data APIs are forbidden/);
    assert.throws(() => validateSourceContent({ ...source, service: hiddenNotification }), /addAction/);
    assert.throws(() => validateSourceContent({ ...source, strings: unboundedCopy }), /bounded-session disclosure/);
});

test('both Android layouts expose accessible session controls and accurate disclosures', () => {
    const standard = read('res', 'layout', 'activity_main.xml');
    const v17 = read('res', 'layout-v17', 'activity_main.xml');
    const strings = read('res', 'values', 'strings.xml');

    assert.equal(v17, standard, 'qualified and default layouts must not drift');
    assert.match(standard, /android:fitsSystemWindows="true"/);
    assert.match(standard, /android:accessibilityHeading="true"/);
    assert.match(standard, /android:accessibilityLiveRegion="polite"/);
    assert.match(standard, /android:id="@\+id\/start_session"/);
    assert.match(standard, /android:id="@\+id\/stop_session"/);
    assert.equal((standard.match(/<Button\b/g) || []).length, 2);
    assert.equal((standard.match(/android:minHeight="48dp"/g) || []).length, 2);
    assert.match(strings, /ethical purposes in an isolated environment only/);
    assert.match(strings, /notification permission/);
    assert.match(strings, /stops automatically after 60 minutes/);
    assert.match(strings, /never starts at boot or restarts itself/);
    assert.ok(fs.existsSync(path.join(sourceRoot, 'res', 'drawable', 'ic_notification.xml')));
    assert.ok(fs.existsSync(path.join(sourceRoot, 'res', 'values-night', 'colors.xml')));
});
