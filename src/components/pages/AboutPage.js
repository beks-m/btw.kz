import React, { Component } from 'react';
import { Container, Segment, Header, Icon } from 'semantic-ui-react';
import ReactGA from 'react-ga';

class AboutPage extends Component {

  constructor(props) {
    super(props);
    ReactGA.pageview('About page');
  }


  render() {
    return (
      <Container>
        <Segment padded compact inverted>
          <Header size='huge' textAlign='center'>
            <Icon name='coffee' fitted />
            <Header.Content>
              btw.kz
            </Header.Content>
          </Header>
        </Segment>
      </Container>
    );
  }
}

export default AboutPage;
