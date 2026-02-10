const webpush = require('web-push');
const fs = require('fs');

const vapidKeys = webpush.generateVAPIDKeys();

const output = {
    publicKey: vapidKeys.publicKey,
    privateKey: vapidKeys.privateKey
};

fs.writeFileSync('vapid_keys_final.json', JSON.stringify(output, null, 2));
console.log('Keys written to vapid_keys_final.json');
