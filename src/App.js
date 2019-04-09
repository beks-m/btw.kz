import React, { Component } from 'react';
import Loadable from 'react-loadable';
import './App.css';
import { Route, Switch, BrowserRouter, Redirect } from 'react-router-dom';
import Helmet from 'react-helmet';
import firebase from '@firebase/app';
import ReactGA from 'react-ga';
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from './stores/DefaultStore';
import Actions from './actions/Actions';
import NavigationBar from './components/NavigationBar';

const Homepage = Loadable({
  loader: () => import('./pages/Homepage'),
  loading() {
    return null
  }
});
const SinglePostPage = Loadable({
  loader: () => import('./pages/SinglePostPage'),
  loading() {
    return null
  }
});
const AboutPage = Loadable({
  loader: () => import('./pages/AboutPage'),
  loading() {
    return null
  }
});
const NewPostPage = Loadable({
  loader: () => import('./pages/NewPostPage'),
  loading() {
    return null
  }
});
const ProfilePage = Loadable({
  loader: () => import('./pages/ProfilePage'),
  loading() {
    return null
  }
});
const UserPage = Loadable({
  loader: () => import('./pages/UserPage'),
  loading() {
    return null
  }
});
const SearchPage = Loadable({
  loader: () => import('./pages/SearchPage'),
  loading() {
    return null
  }
});
const CollectionPage = Loadable({
  loader: () => import('./pages/CollectionPage'),
  loading() {
    return null
  }
});
const TagPage = Loadable({
  loader: () => import('./pages/TagPage'),
  loading() {
    return null
  }
});
const TimedPostsPage = Loadable({
  loader: () => import('./pages/TimedPostsPage'),
  loading() {
    return null
  }
});
const EventsPage = Loadable({
  loader: () => import('./pages/EventsPage'),
  loading() {
    return null
  }
});
const PromosPage = Loadable({
  loader: () => import('./pages/PromosPage'),
  loading() {
    return null
  }
});
const TermsPage = Loadable({
  loader: () => import('./pages/TermsPage'),
  loading() {
    return null
  }
});
const AdminPage = Loadable({
  loader: () => import('./pages/AdminPage'),
  loading() {
    return null
  }
});
const AdminPostEditorPage = Loadable({
  loader: () => import('./pages/AdminPostEditorPage'),
  loading() {
    return null
  }
});
const LoginPage = Loadable({
  loader: () => import('./pages/LoginPage'),
  loading() {
    return null
  }
});
const NotFoundPage = Loadable({
  loader: () => import('./pages/NotFoundPage'),
  loading() {
    return null
  }
});

@connectToStores
class App extends Component {

  static getStores(props) {
    return [DefaultStore];
  }

  static getPropsFromStores(props) {
    return DefaultStore.getState();
  }

  constructor(props) {
    super(props);
    var config = {
      apiKey: "AIzaSyBDIeGgtUYXcy9e6p5iqWEz17eMqojxXQY",
      authDomain: "btw-kz.firebaseapp.com",
      databaseURL: "https://btw-kz.firebaseio.com",
      projectId: "btw-kz",
      storageBucket: "btw.kz",
      messagingSenderId: "515264071605"
    };
    firebase.initializeApp(config);
    ReactGA.initialize('UA-110404917-1');
    Actions.initSession();
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <Helmet bodyAttributes={{style: 'background-color : #f9f9f9'}}/>
          <br />
          <NavigationBar />
          <Switch>
            <Route exact path='/' component={Homepage}/>
            <Route path='/about' component={AboutPage}/>
            <Route path='/profile' render={(props) => (
              this.props.user
                ? <ProfilePage {...props} />
                : <Redirect
                  to={{
                    pathname: '/login',
                    state: { from: props.location.pathname }
                  }}
                  />
            )}/>
            <Route path='/new/:type' render={(props) => (
              this.props.user
                ? <NewPostPage {...props} />
                : <Redirect
                  to={{
                    pathname: '/login',
                    state: { from: props.location.pathname }
                  }}
                  />
            )}/>
            <Route path='/post/:id' component={SinglePostPage}/>
            <Route path='/posts/:id' component={SinglePostPage}/>
            <Route exact path='/timedPosts' component={TimedPostsPage}/>
            <Route path='/timedPosts/:date' component={TimedPostsPage}/>
            <Route exact path='/events' component={EventsPage}/>
            <Route path='/events/:date' component={EventsPage}/>
            <Route exact path='/promos' component={PromosPage}/>
            <Route path='/promos/:date' component={PromosPage}/>
            <Route path='/tags/:id' component={TagPage}/>
            <Route path='/collections/:id' component={CollectionPage}/>
            <Route path='/search' component={SearchPage}/>
            <Route path='/users/:id' component={UserPage}/>
            <Route path='/terms' component={TermsPage}/>
            <Route exact path='/admin' render={(props) => (
              this.props.user && this.props.user.roles && this.props.user.roles.admin
                ? <AdminPage {...props} />
                : <NotFoundPage {...props} />
            )}/>
            <Route path='/admin/postEditor/:id' component={AdminPostEditorPage}/>
            <Route path='/login' render={(props) => (
              !this.props.user
                ? <LoginPage {...props} />
                : <Redirect
                  to={{
                    pathname: props.location.state ? props.location.state.from : '/',
                  }}
                  />
            )}/>
            <Route path='/' component={NotFoundPage}/>
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
