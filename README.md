# WebexCC API Sampler (101)

This basic 101 app simply completes the OAuth2 mechanism and then helps you visualize users, tasks, queues, agent stats - mainly to showcase the new APIs.

#### Pre-requisite: You will need a Client ID and Client Secret for this App.

Obtain it from : 
https://developer.webex-cx.com/

> Documentation > Authentication > Pre-requisites > Fill the Form.

#### Steps: 

- Clone this Repository / Download it.
- Create a .env file with 
```
PORT=5000
CLIENT_ID=<your-client-id>
CLIENT_SECRET=<your-client-secret>
REDIRECT_URI=<your-redirect uri - ex: http://localhost:5000/auth/webex/callback>
ORG_ID=<your-org-id>
```

- Ensure you have installed NodeJS and NPM

```
$ node -v                                                                                                
v14.16.1
$ npm -v                                                                                                 
6.14.12
```

- Run `$ npm install`

- Run the App

`$ nodemon` OR `$ npm start`

- Go to http://localhost:5000
- Go to http://localhost:5000/tasks or http://localhost:5000/users 

Expand / extend the app as required.
