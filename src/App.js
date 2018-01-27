import React, { Component } from 'react';
import Loadable from 'react-loadable';
import './App.css';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import Helmet from 'react-helmet';

const Homepage = Loadable({
  loader: () => import('./components/pages/Homepage'),
  loading() {
    // return <Loader active inline='centered' />
    return null
  }
});
const SinglePostPage = Loadable({
  loader: () => import('./components/pages/SinglePostPage'),
  loading() {
    return null
  }
});
const AboutPage = Loadable({
  loader: () => import('./components/pages/AboutPage'),
  loading() {
    return null
  }
});
const NewPostPage = Loadable({
  loader: () => import('./components/pages/NewPostPage'),
  loading() {
    return null
  }
});
const ProfilePage = Loadable({
  loader: () => import('./components/pages/ProfilePage'),
  loading() {
    return null
  }
});
const SearchPage = Loadable({
  loader: () => import('./components/pages/SearchPage'),
  loading() {
    return null
  }
});
const CollectionPage = Loadable({
  loader: () => import('./components/pages/CollectionPage'),
  loading() {
    return null
  }
});
const TermsPage = Loadable({
  loader: () => import('./components/pages/TermsPage'),
  loading() {
    return null
  }
});
const AdminPage = Loadable({
  loader: () => import('./components/pages/AdminPage'),
  loading() {
    return null
  }
});
const AdminNewPostModerationPage = Loadable({
  loader: () => import('./components/pages/AdminNewPostModerationPage'),
  loading() {
    return null
  }
});
const NotFoundPage = Loadable({
  loader: () => import('./components/pages/NotFoundPage'),
  loading() {
    return null
  }
});
const NavigationBar = Loadable({
  loader: () => import('./components/navigationBar/NavigationBar'),
  loading() {
    return null
  }
});

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Helmet bodyAttributes={{style: 'background-color : #f9f9f9'}}/>
          <br />
          <NavigationBar />
          <br />
          <Switch>
            <Route exact path='/' component={Homepage}/>
            <Route path='/about' component={AboutPage}/>
            <Route path='/profile' component={ProfilePage}/>
            <Route path='/new/:type' component={NewPostPage}/>
            <Route path='/post/:date/:id' component={SinglePostPage}/>
            <Route path='/posts/:date/:id' component={SinglePostPage}/>
            <Route path='/tags/:id' component={CollectionPage}/>
            <Route path='/collections/:id' component={CollectionPage}/>
            <Route path='/search' component={SearchPage}/>
            <Route path='/users/:id' component={ProfilePage}/>
            <Route path='/collections/:id' component={CollectionPage}/>
            <Route path='/terms' component={TermsPage}/>
            <Route exact path='/admin' component={AdminPage}/>
            <Route path='/admin/unmoderatedPost/:id' component={AdminNewPostModerationPage}/>
            <Route path='/' component={NotFoundPage}/>
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
