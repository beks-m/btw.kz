import React, { Component } from 'react';
import { Container, Header, Icon } from 'semantic-ui-react';

class AboutPage extends Component {

  render() {
    return (
      <Container>
        <Header as='h2'>
          <Icon name='plug' />
          <Header.Content>
            О нас
          </Header.Content>
        </Header>
      </Container>
    );
  }
}

export default AboutPage;
