import React, { Component } from 'react';
import { Container, Header, Icon } from 'semantic-ui-react';
import ReactGA from 'react-ga';

class ProfilePage extends Component {

  constructor(props) {
    super(props);
    ReactGA.pageview('Terms page');
  }

  render() {
    return (
      <Container>
        <Header as='h2'>
          <Icon name='plug' />
          <Header.Content>
            Terms
          </Header.Content>
        </Header>
      </Container>
    );
  }
}

export default ProfilePage;
