


This is a boiler plate code that points to local mongo.
This code has LDAP-Authentication in place and it needs to have the user whitelisted before he can successfully login

Instructions:

1. Fork the repo
2. Clone the repo to the desired directory
3. Go to the directory and npm install
4. goto app/model/whiteList.js change the mongo server address and port
5. Start the server by using npm app.js


Known issues:
1. The page doesnt't redirect to login page when the non whitelist user logs in
2. It has code for both mongodb and teradata
3. Teradata connection needs jdbc connections.
