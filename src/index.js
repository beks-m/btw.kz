import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'font-awesome/css/font-awesome.min.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import firebase from 'firebase'

var config = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
  apiKey: "AIzaSyBDIeGgtUYXcy9e6p5iqWEz17eMqojxXQY",
  authDomain: "btw-kz.firebaseapp.com",
  databaseURL: "https://btw-kz.firebaseio.com",
  projectId: "btw-kz",
  storageBucket: "btw-kz.appspot.com",
  messagingSenderId: "515264071605"
};
firebase.initializeApp(config);

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
