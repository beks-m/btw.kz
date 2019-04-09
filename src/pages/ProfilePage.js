import React, { Component } from 'react';
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../stores/DefaultStore';
import ReactGA from 'react-ga';
import UserInfo from '../components/UserInfo';

@connectToStores
class ProfilePage extends Component {

  static getStores() {
    return [DefaultStore];
  }

  static getPropsFromStores() {
    return {
      ...DefaultStore.getState(),
    }
  }

  constructor(props) {
    super(props);
    ReactGA.pageview(window.location.pathname, 'Profile page');
  }

  render() {
    return <UserInfo uid={this.props.user.uid} />
  }
}

export default ProfilePage;
