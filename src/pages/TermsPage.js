import React, { Component } from 'react';
import { Container, Header, Icon } from 'semantic-ui-react';
import ReactGA from 'react-ga';
import { Helmet } from 'react-helmet';

class ProfilePage extends Component {

  constructor(props) {
    super(props);
    ReactGA.pageview(window.location.pathname, 'Terms page');
  }

  render() {
    return (
      <Container>

        <Helmet>
          <title>Terms & Conditions | btw.kz</title>
          <meta name='description' content='Краудсорсинговый информационный портал' />
          <meta property='og:image' content='https://firebasestorage.googleapis.com/v0/b/btw-kz.appspot.com/o/logo-square-1024.png?alt=media&token=7c0b442b-ac8f-4779-9da7-2fb1228a2e89' />
        </Helmet>

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
