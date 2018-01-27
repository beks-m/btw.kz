import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import firebase from '@firebase/app';
import ReactGA from 'react-ga';

var config = { /* COPY THE ACTUAL CONFIG FROM FIREBASE CONSOLE */
  apiKey: "AIzaSyBDIeGgtUYXcy9e6p5iqWEz17eMqojxXQY",
  authDomain: "btw-kz.firebaseapp.com",
  databaseURL: "https://btw-kz.firebaseio.com",
  projectId: "btw-kz",
  storageBucket: "btw.kz",
  messagingSenderId: "515264071605"
};
firebase.initializeApp(config);

// Add your tracking ID created from https://analytics.google.com/analytics/web/#home/
ReactGA.initialize('UA-110404917-1');

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
