import React, { Component } from 'react';
import ReactGA from 'react-ga';
import UserInfo from '../components/UserInfo';

class UserPage extends Component {

  constructor(props) {
    super(props);
    ReactGA.pageview(window.location.pathname, 'User page - ', this.props.match.params.id);
  }

  render() {
    return <UserInfo uid={this.props.match.params.id} />
  }
}

export default UserPage;
