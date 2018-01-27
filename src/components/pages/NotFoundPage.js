import React, { Component } from 'react';
import { Container, Header, Icon } from 'semantic-ui-react';
import ReactGA from 'react-ga';

class NotFoundPage extends Component {

  constructor(props) {
    super(props);
    ReactGA.pageview('Not found page');
  }

  render() {
    return (
      <Container>
        <Header as='h2'>
          <Icon name='plug' />
          <Header.Content>
            Не найдено
          </Header.Content>
        </Header>
      </Container>
    );
  }
}

export default NotFoundPage;
