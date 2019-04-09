import alt from '../utils/Alt';
import firebase from '@firebase/app';
import '@firebase/firestore';
import '@firebase/auth';
import ReactGA from 'react-ga';

class Actions {

  initSession() {
    return (dispatch) => {
      this.db = firebase.firestore();
      var city = localStorage.getItem('city');
      if (!city) {
        city = 'Almaty'
        localStorage.setItem('city', 'Almaty');
      }
      ReactGA.set({ dimension1: city });
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          ReactGA.set({ userId: user.uid });
          dispatch(user);
          this.db.collection('users').doc(user.uid).get().then((snapshot) => {
            user['roles'] = snapshot.data().roles;
            dispatch(user);
          });
        }
      });
    }
  }

  loginWithEmail(email, password) {
    return (dispatch) => {
      firebase.auth().signInWithEmailAndPassword(email, password).then((result) => {
        // The signed-in user info.
        var user = result;
        // user.updateProfile({
        //   name: user.providerData[0].displayName,
        //   photoURL: user.providerData[0].photoURL,
        // });
        // this.db.collection('users').doc(user.uid).get().then((snapshot) => {
        //   if (snapshot.exists) {
        //     // user is registered before and is logging in
        //     ReactGA.event({
        //       category: 'Login',
        //       action: 'Login success',
        //       label: 'Facebook'
        //     });
        //     this.db.collection('users').doc(user.uid).update({
        //       name: user.providerData[0].displayName,
        //       photoURL: user.providerData[0].photoURL,
        //       email: user.providerData[0].email,
        //       facebookUID: user.providerData[0].uid,
        //       lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        //     });
        //     user['roles'] = snapshot.data().roles;
        //     dispatch(user);
        //   }
        //   else {
        //     // user is newly registered
        //     ReactGA.event({
        //       category: 'Login',
        //       action: 'Registration success',
        //       label: 'Facebook'
        //     });
        //     this.db.collection('users').doc(user.uid).set({
        //       name: user.providerData[0].displayName,
        //       photoURL: user.providerData[0].photoURL,
        //       email: user.providerData[0].email,
        //       facebookUID: user.providerData[0].uid,
        //       registeredOn: firebase.firestore.FieldValue.serverTimestamp(),
        //       lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        //       upvoteCount: 0,
        //       commentCount: 0,
        //       hunterPostsCount: 0,
        //       makerPostsCount: 0,
        //       editorPostsCount: 0
        //     });
        //   }
        // });
        ReactGA.set({ userId: user.uid });
        // broadcast to the App
        dispatch(user);
      }, (error) => {
        dispatch(error);
      });
    }
  }

  login() {
    return (dispatch) => {
      var provider = new firebase.auth.FacebookAuthProvider();
      firebase.auth().languageCode = 'ru_RU';
      firebase.auth().signInWithPopup(provider).then((result) => {
        // The signed-in user info.
        var user = result.user;
        user.updateProfile({
          name: user.providerData[0].displayName,
        });
        this.db.collection('users').doc(user.uid).get().then((snapshot) => {
          if (snapshot.exists) {
            // user is registered before and is logging in
            ReactGA.event({
              category: 'Login',
              action: 'Login success',
              label: 'Facebook'
            });
            this.db.collection('users').doc(user.uid).update({
              name: user.providerData[0].displayName,
              email: user.providerData[0].email,
              facebookUID: user.providerData[0].uid,
              lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            user['roles'] = snapshot.data().roles;
            dispatch(user);
          }
          else {
            // user is newly registered
            ReactGA.event({
              category: 'Login',
              action: 'Registration success',
              label: 'Facebook'
            });
            this.db.collection('users').doc(user.uid).set({
              name: user.providerData[0].displayName,
              email: user.providerData[0].email,
              facebookUID: user.providerData[0].uid,
              registeredOn: firebase.firestore.FieldValue.serverTimestamp(),
              lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
              upvoteCount: 0,
              commentCount: 0,
              hunterPostsCount: 0,
              makerPostsCount: 0,
              editorPostsCount: 0
            });
          }
        });
        ReactGA.set({ userId: user.uid });
        // broadcast to the App
        dispatch(user);
      }, (error) => {
        if (error.code === 'auth/popup-closed-by-user') {
          ReactGA.event({
            category: 'Login',
            action: 'User refused Facebook access',
            label: 'Facebook'
          });
        } else {
          console.log(error.description)
        }
      });
    }
  }

  logout() {
    return (dispatch) => {
      firebase.auth().signOut().then(() => {
        // Sign-out successful.
        ReactGA.event({
          category: 'Login',
          action: 'Logout success',
        });
        ReactGA.set({ userId: null });
        dispatch(null);
      }).catch((error) => {
        // An error happened.
        console.log('Sign out error', error);
      });
    }
  }

  changeCity(city) {
    return (dispatch) => {
      localStorage.setItem('city', city);
      ReactGA.set({ dimension1: city });
      dispatch(city);
    }
  }

}

export default alt.createActions(Actions);
