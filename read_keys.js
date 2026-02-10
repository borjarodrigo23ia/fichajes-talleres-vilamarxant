const fs = require('fs');
try {
    // Read VAPID keys file. Try utf16le first as typical for PowerShell redirects.
    // Use path relative to script execution or absolute.
    const content = fs.readFileSync('vapid_keys.txt');
    // Wait, if it's utf16, it has BOM usually. 
    // Let's just try logging buffer string.
    console.log(content.toString('utf16le'));
} catch (e) {
    console.error(e);
}
