import React, { Component } from 'react';
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../../stores/DefaultStore';
import { Container, Header, Icon } from 'semantic-ui-react';

@connectToStores
class ProfilePage extends Component {

  static getStores() {
    return [DefaultStore];
  }

  static getPropsFromStores() {
    return DefaultStore.getState();
  }

  render() {
    return (
      <Container>
        <Header as='h2'>
          <Icon name='plug' />
          <Header.Content>
            Профиль
          </Header.Content>
        </Header>
      </Container>
    );
  }
}

export default ProfilePage;
