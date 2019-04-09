import React, { Component } from 'react';
import { Container, Message, Button, Icon } from 'semantic-ui-react';
import ReactGA from 'react-ga';
import { Helmet } from 'react-helmet';
import Actions from '../actions/Actions';

class LoginPage extends Component {

  constructor(props) {
    super(props);
    ReactGA.pageview(window.location.pathname, 'Login page');
  }

  render() {
    return (
      <Container>
        <Helmet>
          <title>Авторизация | btw.kz</title>
          <meta name='description' content='Краудсорсинговый информационный портал' />
          <meta property='og:image' content='https://firebasestorage.googleapis.com/v0/b/btw-kz.appspot.com/o/logo-square-1024.png?alt=media&token=7c0b442b-ac8f-4779-9da7-2fb1228a2e89' />
        </Helmet>
        <br />
        <Message negative attached='top'>
          <Message.Header>Возникла ошибка</Message.Header>
          <p>Вам нужно быть авторизованным для просмотра данной страницы</p>
        </Message>
        <Button attached='bottom' color='facebook' onClick={function(){
          ReactGA.event({
              category: 'Login',
              action: 'Clicked login button',
              label: 'Facebook'
          });
          Actions.login();
        }}>
          <Icon name='facebook' /> Авторизоваться через Facebook
        </Button>
      </Container>
    );
  }
}

export default LoginPage;
