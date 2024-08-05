This project is a authetication application built with Node.js, express and mogoose. It allows users to basic login with creds, google login, and register.

1) Install node packages
    npm i 
2) Create .env file for folloing parameters
MONGODB=
EMAIL_USER=
EMAIL_PASS=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
3) Create google console account for google client Id and secret
   Ref link https://console.cloud.google.com/
   i) Go to the Google Developer Console, create a new project, and enable the Google+ API (or other relevant API). Then create OAuth 2.0 credentials.
   ii) Authorized JavaScript Origins: http://localhost:3000
   iii) Authorized Redirect URIs: http://localhost:3000/auth/google/callback