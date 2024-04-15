const admin = require('firebase-admin')
const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,'\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://borgosity-gallery.firebaseio.com"
});

const db = admin.firestore();

exports.handler = (event, context, callback) => {
    const { auth } = JSON.parse(event.body);
    const errors = [];

    if (auth.uid) {
        generateToken(auth.uid)
            .then(token => {
                callback(null, {
                    statusCode: 200,
                    body: JSON.stringify({ customToken: token, error: errors })
                });
            });
    }
    else {
        callback(new Error("Auth id was not vaild ${auth}"));
    }

    async function generateToken(userId) {
        const userDoc = admin.firestore().collection('users').doc(userId);
        const useRoles = await userDoc.get()
            .then(user => {
                if (user.exists) {
                    const userData = user.data();
                    if (userData) {
                        return { roles: userData.roles };
                    }
                    else {
                        const msg = 'No user date: ';
                        errors.push(msg);
                        return { roles: ['guest'] };
                    }
                }
                else {
                    return { roles: ['guest'] };
                }
            })
            .catch(error => {
                const msg = 'Error getting user: ' + error;
                errors.push(msg);
                return { roles: ['guest'] };
            });

        return admin.auth().createCustomToken(userId, useRoles)
            .then(token => {
                return token;
            })
            .catch(error => {
                const msg = 'Error creating custom token: ' + error;
                errors.push(msg);
                return '';
            });
    }
}
