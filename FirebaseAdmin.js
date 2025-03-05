const admin = require("firebase-admin");
const serviceAccount = require("./otp-project-81db2-firebase-adminsdk-fbsvc-5222ebbbd0.json");

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

module.exports = admin;
