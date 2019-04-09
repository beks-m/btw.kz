import React, { Component } from 'react';
import { Container, Header, Image } from 'semantic-ui-react';
import ReactGA from 'react-ga';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

class NotFoundPage extends Component {

  constructor(props) {
    super(props);
    ReactGA.pageview(window.location.pathname, 'Not found page');
  }

  render() {
    return (
      <Container>
        <Helmet>
          <title>Ссылка с параллельной вселенной | btw.kz</title>
          <meta name='description' content='Краудсорсинговый информационный портал' />
          <meta property='og:image' content='https://firebasestorage.googleapis.com/v0/b/btw-kz.appspot.com/o/logo-square-1024.png?alt=media&token=7c0b442b-ac8f-4779-9da7-2fb1228a2e89' />
        </Helmet>
        <br />
        <Header as='h2' textAlign='center'>
          <Header.Content>
            Такой страницы кажись не существует <span role="img" aria-label="sorry">🤷‍</span>
            <Header.Subheader>
              Возможно, вам лучше перейти на <Link to='/'>главную</Link> и начать оттуда?
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Image centered src='https://media.giphy.com/media/jWexOOlYe241y/giphy.gif' />
      </Container>
    );
  }
}

export default NotFoundPage;
