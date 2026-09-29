'use strict';

const childProcess = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(repositoryRoot, 'app/factory/decompiled');
const manifestPath = path.join(sourceRoot, 'AndroidManifest.xml');
const javaSourceRoot = path.join(repositoryRoot, 'demo/android-src');
const mainActivityPath = path.join(javaSourceRoot, 'com/andro/ethicaldemo/MainActivity.java');
const demoSessionServicePath = path.join(javaSourceRoot, 'com/andro/ethicaldemo/DemoSessionService.java');
const resourcesPath = path.join(sourceRoot, 'res');
const metadataPath = path.join(sourceRoot, 'apktool.yml');
const signingKeyPath = path.join(repositoryRoot, 'app/factory/testkey.pk8');
const signingCertificatePath = path.join(repositoryRoot, 'app/factory/testkey.x509.pem');
const primaryOutput = path.join(repositoryRoot, 'demo/build/ANDRO-Ethical-Demo.apk');
const checksumOutput = `${primaryOutput}.sha256`;
const provenanceOutput = path.join(repositoryRoot, 'demo/build/ANDRO-Ethical-Demo.provenance.json');
const publishedOutputs = [
    primaryOutput,
    path.join(repositoryRoot, 'assets/webpublic/build.apk'),
    path.join(repositoryRoot, 'assets/webpublic/build.s.apk')
];

const expected = Object.freeze({
    packageName: 'com.andro.ethicaldemo',
    classDescriptors: Object.freeze([
        'Lcom/andro/ethicaldemo/DemoSessionService;',
        'Lcom/andro/ethicaldemo/MainActivity;'
    ]),
    serviceName: 'com.andro.ethicaldemo.DemoSessionService',
    label: 'ANDRO Ethical Demo',
    minSdk: '23',
    targetSdk: '36',
    versionCode: '2',
    versionName: '2.0-ethical-demo',
    maxSessionMinutes: 60,
    certificateSha256: 'a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc'
});

const allowedPermissions = Object.freeze([
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_SPECIAL_USE',
    'android.permission.POST_NOTIFICATIONS'
].sort());

const safeResourceFiles = Object.freeze([
    'drawable/demo_scope_background.xml',
    'drawable/ethical_notice_background.xml',
    'drawable/ic_notification.xml',
    'drawable/session_panel_background.xml',
    'layout-v17/activity_main.xml',
    'layout/activity_main.xml',
    'mipmap-hdpi/ic_launcher.png',
    'mipmap-mdpi/ic_launcher.png',
    'mipmap-xhdpi/ic_launcher.png',
    'mipmap-xxhdpi/ic_launcher.png',
    'mipmap-xxxhdpi/ic_launcher.png',
    'values-night/colors.xml',
    'values-night/styles.xml',
    'values-w820dp-v13/dimens.xml',
    'values/colors.xml',
    'values/dimens.xml',
    'values/ids.xml',
    'values/public.xml',
    'values/strings.xml',
    'values/styles.xml'
].sort());

const expectedApkEntries = Object.freeze([
    'AndroidManifest.xml',
    'META-INF/MANIFEST.MF',
    'META-INF/TESTKEY.RSA',
    'META-INF/TESTKEY.SF',
    'classes.dex',
    'res/drawable/demo_scope_background.xml',
    'res/drawable/ethical_notice_background.xml',
    'res/drawable/ic_notification.xml',
    'res/drawable/session_panel_background.xml',
    'res/layout-v17/activity_main.xml',
    'res/mipmap-hdpi/ic_launcher.png',
    'res/mipmap-mdpi/ic_launcher.png',
    'res/mipmap-xhdpi/ic_launcher.png',
    'res/mipmap-xxhdpi/ic_launcher.png',
    'res/mipmap-xxxhdpi/ic_launcher.png',
    'resources.arsc'
].sort());

function fail(message) {
    throw new Error(message);
}

function capture(command, args, options = {}) {
    const result = childProcess.spawnSync(command, args, {
        cwd: repositoryRoot,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
        ...options
    });
    if (result.error) fail(`${command} could not start: ${result.error.message}`);
    if (result.status !== 0) {
        const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
        fail(`${command} failed${detail ? `:\n${detail}` : ''}`);
    }
    return result.stdout.trim();
}

function run(command, args) {
    const result = childProcess.spawnSync(command, args, {
        cwd: repositoryRoot,
        stdio: 'inherit'
    });
    if (result.error) fail(`${command} could not start: ${result.error.message}`);
    if (result.status !== 0) fail(`${command} exited with status ${result.status}`);
}

function compareVersions(left, right) {
    const a = left.split(/[^0-9]+/).filter(Boolean).map(Number);
    const b = right.split(/[^0-9]+/).filter(Boolean).map(Number);
    const length = Math.max(a.length, b.length);
    for (let index = 0; index < length; index += 1) {
        const difference = (a[index] || 0) - (b[index] || 0);
        if (difference) return difference;
    }
    return 0;
}

function findBuildTools() {
    const sdkCandidates = [
        process.env.ANDROID_SDK_ROOT,
        process.env.ANDROID_HOME,
        process.platform === 'darwin' ? path.join(os.homedir(), 'Library/Android/sdk') : null,
        process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA || '', 'Android/Sdk') : null,
        process.platform === 'linux' ? path.join(os.homedir(), 'Android/Sdk') : null
    ].filter(Boolean);
    const executable = (name) => process.platform === 'win32' ? `${name}.exe` : name;

    for (const sdkRoot of sdkCandidates) {
        const buildToolsRoot = path.join(sdkRoot, 'build-tools');
        if (!fs.existsSync(buildToolsRoot)) continue;
        const versions = fs.readdirSync(buildToolsRoot, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort(compareVersions)
            .reverse();
        for (const version of versions) {
            const directory = path.join(buildToolsRoot, version);
            const tools = {
                version,
                aapt2: path.join(directory, executable('aapt2')),
                androidJar: path.join(sdkRoot, 'platforms', 'android-36', 'android.jar'),
                apksigner: path.join(directory, process.platform === 'win32' ? 'apksigner.bat' : 'apksigner'),
                d8: path.join(directory, process.platform === 'win32' ? 'd8.bat' : 'd8'),
                dexdump: path.join(directory, executable('dexdump')),
                zipalign: path.join(directory, executable('zipalign'))
            };
            const toolPaths = [tools.aapt2, tools.androidJar, tools.apksigner, tools.d8, tools.dexdump, tools.zipalign];
            if (!toolPaths.every((toolPath) => fs.existsSync(toolPath))) continue;
            if (Number(version.split('.')[0]) < 36) fail('Android SDK build-tools 36 or newer are required.');
            return tools;
        }
    }
    fail('Android SDK build-tools 36 or newer were not found. Set ANDROID_SDK_ROOT or ANDROID_HOME.');
}

function listRelativeFiles(directory, prefix = '') {
    const files = [];
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
        const fullPath = path.join(directory, entry.name);
        if (entry.isSymbolicLink()) fail(`Symlinks are not allowed in safe Android resources: ${relativePath}`);
        if (entry.isDirectory()) files.push(...listRelativeFiles(fullPath, relativePath));
        else if (entry.isFile()) files.push(relativePath);
        else fail(`Unsupported Android resource entry: ${relativePath}`);
    }
    return files.sort();
}

function validateResourceAllowlist() {
    const actual = listRelativeFiles(resourcesPath);
    if (JSON.stringify(actual) !== JSON.stringify(safeResourceFiles)) {
        const unexpected = actual.filter((file) => !safeResourceFiles.includes(file));
        const missing = safeResourceFiles.filter((file) => !actual.includes(file));
        fail(`Android resource allowlist mismatch. Unexpected: ${unexpected.join(', ') || 'none'}. Missing: ${missing.join(', ') || 'none'}.`);
    }
    for (const relativePath of safeResourceFiles.filter((file) => file.endsWith('.xml'))) {
        const content = fs.readFileSync(path.join(resourcesPath, relativePath), 'utf8');
        if (/etechd|l3mon|Process Manager/i.test(content)) {
            fail(`Historical branding found in safe resource: ${relativePath}`);
        }
    }
}

function manifestPermissionNames(manifest) {
    return [...manifest.matchAll(/<uses-permission\b[^>]*android:name="([^"]+)"/g)]
        .map((match) => match[1])
        .sort();
}

function validateSourceContent({ manifest, mainActivity, service, strings }) {
    if (![manifest, mainActivity, service, strings].every((value) => typeof value === 'string')) {
        fail('Source validation requires manifest, main activity, service, and strings content.');
    }
    if (!new RegExp(`package="${expected.packageName.replace(/\./g, '\\.')}"`).test(manifest)) fail('The demo manifest must use the ANDRO package ID.');
    if (/etechd|l3mon|Process Manager/i.test(manifest)) fail('The demo manifest contains a historical package reference.');
    if (!new RegExp(`android:minSdkVersion="${expected.minSdk}"`).test(manifest)) fail(`The demo manifest must use minimum API ${expected.minSdk}.`);
    if (!new RegExp(`android:targetSdkVersion="${expected.targetSdk}"`).test(manifest)) fail(`The demo manifest must target API ${expected.targetSdk}.`);
    const permissions = manifestPermissionNames(manifest);
    if (JSON.stringify(permissions) !== JSON.stringify(allowedPermissions)) {
        fail(`Manifest permission allowlist mismatch: ${permissions.join(', ') || 'none'}`);
    }
    if ((manifest.match(/<activity\b/g) || []).length !== 1) fail('The ethical demo must expose exactly one activity.');
    if ((manifest.match(/<service\b/g) || []).length !== 1) fail('The ethical demo must expose exactly one service.');
    if (/<(?:receiver|provider)\b/.test(manifest)) fail('Receivers and providers are forbidden.');
    if (!manifest.includes(`android:name="${expected.packageName}.MainActivity"`)) fail('The launcher activity is missing.');
    for (const required of [
        `android:name="${expected.serviceName}"`,
        'android:exported="false"',
        'android:foregroundServiceType="specialUse"',
        'android:stopWithTask="false"',
        'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
        'User-started, visible, time-limited ethical demo session'
    ]) {
        if (!manifest.includes(required)) fail(`Required foreground-service declaration is missing: ${required}`);
    }
    if (/BOOT_COMPLETED|QUICKBOOT|SECRET_CODE|respawn|restart/i.test(manifest)) fail('Boot, secret-code, and restart paths are forbidden.');
    for (const required of ['android:allowBackup="false"', 'android:debuggable="false"', 'android:fullBackupContent="false"', 'android:usesCleartextTraffic="false"']) {
        if (!manifest.includes(required)) fail(`Required manifest hardening is missing: ${required}`);
    }

    if (!mainActivity.includes(`package ${expected.packageName};`) || !/class MainActivity extends Activity/.test(mainActivity)) {
        fail('The main activity Java package or class is incorrect.');
    }
    for (const required of ['POST_NOTIFICATIONS', 'requestPermissions', 'areNotificationsEnabled', 'getNotificationChannel', 'startForegroundService', 'stopService', 'postDelayed(this, 250L)', 'session_status_active']) {
        if (!mainActivity.includes(required)) fail(`Main activity control is missing: ${required}`);
    }
    if (!service.includes(`package ${expected.packageName};`) || !/class DemoSessionService extends Service implements Runnable/.test(service)) {
        fail('The foreground service Java package or class is incorrect.');
    }
    for (const required of [
        'START_NOT_STICKY',
        'FOREGROUND_SERVICE_TYPE_SPECIAL_USE',
        'Build.VERSION.SDK_INT >= 34',
        'MAX_SESSION_MILLIS = 60L * 60L * 1000L',
        'postDelayed(this, MAX_SESSION_MILLIS)',
        'ACTION_STOP',
        'FLAG_IMMUTABLE',
        'setOngoing(true)',
        'addAction',
        'startForeground'
    ]) {
        if (!service.includes(required)) fail(`Foreground-service safety control is missing: ${required}`);
    }
    const javaSource = `${mainActivity}\n${service}`;
    if (/\bSTART_STICKY\b|onTaskRemoved|BOOT_COMPLETED|RECEIVE_BOOT_COMPLETED|AlarmManager|JobScheduler|WorkManager|WakeLock/i.test(javaSource)) {
        fail('Auto-restart, scheduling, wake-lock, or boot behavior is forbidden.');
    }
    if (/java\.net|okhttp|io\.socket|android\.location|android\.hardware\.Camera|MediaRecorder|ContactsContract|Telephony|SmsManager|ContentResolver|FileInputStream|FileOutputStream|HttpURLConnection/i.test(javaSource)) {
        fail('Network or device-data APIs are forbidden.');
    }
    if (/etechd|l3mon|Process Manager/i.test(`${javaSource}\n${strings}`)) fail('Historical branding found in safe app source.');
    if (!/ethical purposes in an isolated environment only/.test(strings)) fail('The in-app ethical-use notice is missing.');
    if (!/no network or device-data access/.test(strings)) fail('The in-app data-access disclosure is missing.');
    if (!/stops automatically after 60 minutes/.test(strings)) fail('The bounded-session disclosure is missing.');
}

function validateSource() {
    const content = {
        manifest: fs.readFileSync(manifestPath, 'utf8'),
        mainActivity: fs.readFileSync(mainActivityPath, 'utf8'),
        service: fs.readFileSync(demoSessionServicePath, 'utf8'),
        strings: fs.readFileSync(path.join(resourcesPath, 'values/strings.xml'), 'utf8')
    };
    validateSourceContent(content);
    validateResourceAllowlist();
    return content;
}

function sourceDigest() {
    const digest = crypto.createHash('sha256');
    const files = [
        ['AndroidManifest.xml', manifestPath],
        ['apktool.yml', metadataPath],
        ['demo/android-src/com/andro/ethicaldemo/MainActivity.java', mainActivityPath],
        ['demo/android-src/com/andro/ethicaldemo/DemoSessionService.java', demoSessionServicePath],
        ...safeResourceFiles.map((relativePath) => [`res/${relativePath}`, path.join(resourcesPath, relativePath)])
    ];
    for (const [relativePath, fullPath] of files) {
        digest.update(relativePath);
        digest.update('\0');
        digest.update(fs.readFileSync(fullPath));
        digest.update('\0');
    }
    return digest.digest('hex');
}

function normalizedFingerprint(value) {
    return value.replace(/:/g, '').toLowerCase();
}

function requireFile(filePath, description) {
    let stats;
    try {
        stats = fs.statSync(filePath);
    } catch {
        fail(`${description} is missing: ${filePath}`);
    }
    if (!stats.isFile() || stats.size === 0) fail(`${description} is empty or not a file: ${filePath}`);
}

function certificateFingerprint() {
    requireFile(signingCertificatePath, 'Signing certificate');
    const certificate = new crypto.X509Certificate(fs.readFileSync(signingCertificatePath));
    const fingerprint = normalizedFingerprint(certificate.fingerprint256);
    if (fingerprint !== expected.certificateSha256) fail(`Unexpected signing certificate SHA-256: ${fingerprint}`);
    const now = Date.now();
    if (now < Date.parse(certificate.validFrom) || now > Date.parse(certificate.validTo)) fail('The demo signing certificate is not currently valid.');
    return fingerprint;
}

function preflight({ building = false } = {}) {
    validateSource();
    capture('unzip', ['-v']);
    const tools = findBuildTools();
    const certificateSha256 = certificateFingerprint();
    let apktoolVersion = null;
    let javaCompilerVersion = null;
    if (building) {
        requireFile(signingKeyPath, 'Signing key');
        capture('java', ['-version']);
        javaCompilerVersion = capture('javac', ['-version']);
        capture('zip', ['-v']);
        apktoolVersion = capture('apktool', ['--version']);
        if (Number(apktoolVersion.split('.')[0]) < 3) fail('APKTool 3 or newer is required.');
    }
    return { apktoolVersion, certificateSha256, javaCompilerVersion, sourceSha256: sourceDigest(), tools };
}

function stageSafeSource(stageRoot) {
    fs.mkdirSync(stageRoot, { recursive: true });
    fs.copyFileSync(manifestPath, path.join(stageRoot, 'AndroidManifest.xml'));
    fs.copyFileSync(metadataPath, path.join(stageRoot, 'apktool.yml'));
    for (const relativePath of safeResourceFiles) {
        const destination = path.join(stageRoot, 'res', relativePath);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(path.join(resourcesPath, relativePath), destination);
    }
}

function compileJavaAndAddDex(unsignedApk, context, temporaryRoot) {
    const classesRoot = path.join(temporaryRoot, 'java-classes');
    const dexRoot = path.join(temporaryRoot, 'dex');
    fs.mkdirSync(classesRoot, { recursive: true });
    fs.mkdirSync(dexRoot, { recursive: true });
    run('javac', [
        '--release', '8',
        '-Xlint:all',
        '-Werror',
        '-classpath', context.tools.androidJar,
        '-d', classesRoot,
        mainActivityPath,
        demoSessionServicePath
    ]);
    const classFiles = listRelativeFiles(classesRoot).filter((file) => file.endsWith('.class'));
    const expectedClassFiles = [
        'com/andro/ethicaldemo/DemoSessionService.class',
        'com/andro/ethicaldemo/MainActivity.class'
    ];
    if (JSON.stringify(classFiles) !== JSON.stringify(expectedClassFiles)) {
        fail(`Unexpected Java class output: ${classFiles.join(', ') || 'none'}`);
    }
    run(context.tools.d8, [
        '--min-api', expected.minSdk,
        '--lib', context.tools.androidJar,
        '--output', dexRoot,
        ...classFiles.map((relativePath) => path.join(classesRoot, relativePath))
    ]);
    const dexPath = path.join(dexRoot, 'classes.dex');
    requireFile(dexPath, 'Compiled classes.dex');
    const unsignedEntries = capture('unzip', ['-Z1', unsignedApk]).split(/\r?\n/);
    if (unsignedEntries.includes('classes.dex')) fail('Resource APK unexpectedly contains a prebuilt classes.dex.');
    run('zip', ['-q', '-j', unsignedApk, dexPath]);
}

function extractDex(apkPath, destination) {
    const extraction = childProcess.spawnSync('unzip', ['-p', apkPath, 'classes.dex'], {
        cwd: repositoryRoot,
        maxBuffer: 64 * 1024 * 1024
    });
    if (extraction.error || extraction.status !== 0) fail('Unable to extract classes.dex for safety inspection.');
    fs.writeFileSync(destination, extraction.stdout);
}

function inspectDex(apkPath, dexdumpPath, temporaryRoot) {
    const dexPath = path.join(temporaryRoot, 'classes.dex');
    extractDex(apkPath, dexPath);
    const dump = capture(dexdumpPath, [dexPath]);
    const classes = [...dump.matchAll(/Class descriptor\s+: '([^']+)'/g)]
        .map((match) => match[1])
        .sort();
    if (JSON.stringify(classes) !== JSON.stringify(expected.classDescriptors)) {
        fail(`Unexpected classes in demo APK: ${classes.join(', ') || 'none'}`);
    }
    if (/Ljava\/net|Lokhttp|Lio\/socket|Landroid\/location|SmsManager|ContactsContract|MediaRecorder|Camera|BOOT_COMPLETED|START_STICKY/.test(dump)) {
        fail('Forbidden network, device-data, boot, or sticky API found in classes.dex.');
    }
    return classes;
}

function inspectZip(apkPath) {
    const entries = capture('unzip', ['-Z1', apkPath]).split(/\r?\n/).filter(Boolean).sort();
    if (JSON.stringify(entries) !== JSON.stringify(expectedApkEntries)) {
        const unexpected = entries.filter((entry) => !expectedApkEntries.includes(entry));
        const missing = expectedApkEntries.filter((entry) => !entries.includes(entry));
        fail(`APK ZIP allowlist mismatch. Unexpected: ${unexpected.join(', ') || 'none'}. Missing: ${missing.join(', ') || 'none'}.`);
    }
    return entries;
}

function sha256File(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function inspectArtifact(apkPath, context, temporaryRoot) {
    requireFile(apkPath, 'APK artifact');
    capture(context.tools.zipalign, ['-c', '-v', '4', apkPath]);
    const signature = capture(context.tools.apksigner, ['verify', '--verbose', '--print-certs', apkPath]);
    for (const scheme of ['1', '2', '3']) {
        if (!new RegExp(`Verified using v${scheme} scheme .*: true`).test(signature)) fail(`APK signature scheme v${scheme} is missing.`);
    }
    const certificateMatch = signature.match(/Signer #1 certificate SHA-256 digest: ([0-9a-f]+)/i);
    const certificateSha256 = certificateMatch ? certificateMatch[1].toLowerCase() : '';
    if (certificateSha256 !== expected.certificateSha256 || certificateSha256 !== context.certificateSha256) {
        fail(`APK signer certificate SHA-256 is incorrect: ${certificateSha256 || 'missing'}`);
    }

    const badging = capture(context.tools.aapt2, ['dump', 'badging', apkPath]);
    const requiredBadging = [
        `package: name='${expected.packageName}'`,
        `versionCode='${expected.versionCode}'`,
        `versionName='${expected.versionName}'`,
        `minSdkVersion:'${expected.minSdk}'`,
        `targetSdkVersion:'${expected.targetSdk}'`,
        `application-label:'${expected.label}'`,
        `launchable-activity: name='${expected.packageName}.MainActivity'`
    ];
    for (const value of requiredBadging) {
        if (!badging.includes(value)) fail(`Built APK metadata is missing: ${value}`);
    }
    const permissions = [...badging.matchAll(/^uses-permission(?:-sdk-\d+)?: name='([^']+)'/gm)]
        .map((match) => match[1])
        .sort();
    if (JSON.stringify(permissions) !== JSON.stringify(allowedPermissions)) {
        fail(`Built APK permission allowlist mismatch: ${permissions.join(', ') || 'none'}`);
    }
    if (!/^other-services$/m.test(badging)) fail('Built APK is missing its foreground service declaration.');
    if (/^other-(?:receivers|providers)$/m.test(badging)) fail('Built APK unexpectedly exposes a receiver or provider.');
    const manifestDump = capture(context.tools.aapt2, ['dump', 'xmltree', apkPath, '--file', 'AndroidManifest.xml']);
    if ((manifestDump.match(/^\s*E: service\b/gm) || []).length !== 1) fail('Built APK must contain exactly one service.');
    if (!manifestDump.includes(expected.serviceName) || !manifestDump.includes('android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE')) {
        fail('Built APK foreground-service metadata is incomplete.');
    }
    if (/^\s*E: (?:receiver|provider)\b/gm.test(manifestDump) || /BOOT_COMPLETED|QUICKBOOT|SECRET_CODE|respawn/i.test(manifestDump)) {
        fail('Built APK contains a forbidden receiver, provider, boot, or restart path.');
    }

    const classes = inspectDex(apkPath, context.tools.dexdump, temporaryRoot);
    const entries = inspectZip(apkPath);
    return {
        certificateSha256,
        classes,
        entries,
        sha256: sha256File(apkPath),
        sizeBytes: fs.statSync(apkPath).size
    };
}

function temporarySibling(targetPath) {
    return `${targetPath}.tmp-${process.pid}-${crypto.randomBytes(6).toString('hex')}`;
}

function publish(signedApkPath, artifact, context) {
    const staged = [];
    const provenance = {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        ethicalPurpose: 'Testing and demonstrations in an isolated environment only',
        packageName: expected.packageName,
        versionCode: Number(expected.versionCode),
        versionName: expected.versionName,
        minSdk: Number(expected.minSdk),
        targetSdk: Number(expected.targetSdk),
        appLabel: expected.label,
        artifact: { file: path.basename(primaryOutput), sha256: artifact.sha256, sizeBytes: artifact.sizeBytes },
        sourceSha256: context.sourceSha256,
        certificateSha256: artifact.certificateSha256,
        apkSignatureSchemes: ['v1', 'v2', 'v3'],
        apktoolVersion: context.apktoolVersion,
        javaCompilerVersion: context.javaCompilerVersion,
        androidBuildToolsVersion: context.tools.version,
        permissions: allowedPermissions,
        foregroundService: expected.serviceName,
        maxSessionMinutes: expected.maxSessionMinutes,
        autoStartAtBoot: false,
        restartPolicy: 'START_NOT_STICKY',
        classes: artifact.classes,
        zipEntries: artifact.entries,
        publishedCopies: publishedOutputs.map((outputPath) => path.relative(repositoryRoot, outputPath)),
        productionReady: false,
        signingNotice: 'Signed with the public Android test certificate; not for production or app-store distribution.'
    };

    try {
        for (const outputPath of publishedOutputs) {
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            const temporaryPath = temporarySibling(outputPath);
            fs.copyFileSync(signedApkPath, temporaryPath);
            if (sha256File(temporaryPath) !== artifact.sha256) fail(`Staged APK copy hash mismatch: ${outputPath}`);
            staged.push([temporaryPath, outputPath]);
        }
        const checksumTemporary = temporarySibling(checksumOutput);
        fs.writeFileSync(checksumTemporary, `${artifact.sha256}  ${path.basename(primaryOutput)}\n`);
        staged.push([checksumTemporary, checksumOutput]);
        const provenanceTemporary = temporarySibling(provenanceOutput);
        fs.writeFileSync(provenanceTemporary, `${JSON.stringify(provenance, null, 2)}\n`);
        staged.push([provenanceTemporary, provenanceOutput]);

        for (const [temporaryPath, outputPath] of staged) fs.renameSync(temporaryPath, outputPath);
    } finally {
        for (const [temporaryPath] of staged) fs.rmSync(temporaryPath, { force: true });
    }

    for (const outputPath of publishedOutputs) {
        if (sha256File(outputPath) !== artifact.sha256) fail(`Published APK copy hash mismatch: ${outputPath}`);
    }
    return provenance;
}

function verifyPublishedArtifacts(context = preflight()) {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'andro-ethical-verify-'));
    try {
        const artifact = inspectArtifact(primaryOutput, context, temporaryRoot);
        for (const outputPath of publishedOutputs) {
            requireFile(outputPath, 'Published APK copy');
            if (sha256File(outputPath) !== artifact.sha256) fail(`Published APK copies differ: ${outputPath}`);
        }

        requireFile(checksumOutput, 'APK checksum');
        const checksum = fs.readFileSync(checksumOutput, 'utf8').trim();
        if (checksum !== `${artifact.sha256}  ${path.basename(primaryOutput)}`) fail('APK checksum file is incorrect.');

        requireFile(provenanceOutput, 'APK provenance report');
        let provenance;
        try {
            provenance = JSON.parse(fs.readFileSync(provenanceOutput, 'utf8'));
        } catch {
            fail('APK provenance report is not valid JSON.');
        }
        const provenanceChecks = [
            [provenance.schemaVersion === 1, 'schema version'],
            [provenance.packageName === expected.packageName, 'package name'],
            [provenance.targetSdk === Number(expected.targetSdk), 'target SDK'],
            [provenance.artifact?.sha256 === artifact.sha256, 'artifact hash'],
            [provenance.artifact?.sizeBytes === artifact.sizeBytes, 'artifact size'],
            [provenance.sourceSha256 === context.sourceSha256, 'source hash'],
            [provenance.certificateSha256 === expected.certificateSha256, 'certificate hash'],
            [JSON.stringify(provenance.permissions) === JSON.stringify(allowedPermissions), 'permission allowlist'],
            [provenance.foregroundService === expected.serviceName, 'foreground service'],
            [provenance.maxSessionMinutes === expected.maxSessionMinutes, 'session timeout'],
            [provenance.autoStartAtBoot === false, 'boot-start policy'],
            [provenance.restartPolicy === 'START_NOT_STICKY', 'restart policy'],
            [provenance.productionReady === false, 'test-only status']
        ];
        const failed = provenanceChecks.find(([passes]) => !passes);
        if (failed) fail(`APK provenance report has an incorrect ${failed[1]}.`);

        return { artifact, provenance };
    } finally {
        fs.rmSync(temporaryRoot, { recursive: true, force: true });
    }
}

function buildAndroidDemo() {
    const context = preflight({ building: true });
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'andro-ethical-build-'));

    try {
        const stageRoot = path.join(temporaryRoot, 'source');
        const frameworkPath = path.join(temporaryRoot, 'framework');
        const unsignedApk = path.join(temporaryRoot, 'unsigned.apk');
        const alignedApk = path.join(temporaryRoot, 'aligned.apk');
        const signedApk = path.join(temporaryRoot, 'ANDRO-Ethical-Demo.apk');
        fs.mkdirSync(frameworkPath, { recursive: true });
        stageSafeSource(stageRoot);

        console.log(`Building bounded foreground demo with APKTool ${context.apktoolVersion}...`);
        run('apktool', ['b', stageRoot, '--frame-path', frameworkPath, '-o', unsignedApk, '-f']);
        compileJavaAndAddDex(unsignedApk, context, temporaryRoot);
        run(context.tools.zipalign, ['-f', '-p', '4', unsignedApk, alignedApk]);
        console.log('Signing the user-controlled ethical demo with the pinned repository demo certificate...');
        run(context.tools.apksigner, [
            'sign', '--key', signingKeyPath, '--cert', signingCertificatePath,
            '--v4-signing-enabled', 'false', '--out', signedApk, alignedApk
        ]);

        const artifact = inspectArtifact(signedApk, context, temporaryRoot);
        publish(signedApk, artifact, context);
        verifyPublishedArtifacts(context);

        console.log(`\nBuilt and verified: ${path.relative(repositoryRoot, primaryOutput)}`);
        console.log(`SHA-256: ${artifact.sha256}`);
        console.log(`Provenance: ${path.relative(repositoryRoot, provenanceOutput)}`);
        console.log(`Android build-tools: ${context.tools.version}`);
        console.log('This test-key APK contains only the user-controlled activity, bounded service, and allowlisted resources.');
    } finally {
        fs.rmSync(temporaryRoot, { recursive: true, force: true });
    }
}

function verifyCommand() {
    const context = preflight();
    const { artifact } = verifyPublishedArtifacts(context);
    console.log(`Verified: ${path.relative(repositoryRoot, primaryOutput)}`);
    console.log(`SHA-256: ${artifact.sha256}`);
    console.log(`Package: ${expected.packageName} (target API ${expected.targetSdk})`);
    console.log('Signature, alignment, provenance, copies, ZIP entries, DEX, permissions, and components: valid');
}

if (require.main === module) {
    try {
        const args = process.argv.slice(2);
        if (args.length === 0) buildAndroidDemo();
        else if (args.length === 1 && args[0] === '--verify') verifyCommand();
        else fail('Usage: node demo/build-android.js [--verify]');
    } catch (error) {
        console.error(`Android demo pipeline failed: ${error.message}`);
        process.exitCode = 1;
    }
}

module.exports = {
    buildAndroidDemo,
    findBuildTools,
    validateResourceAllowlist,
    validateSource,
    validateSourceContent,
    verifyPublishedArtifacts
};
