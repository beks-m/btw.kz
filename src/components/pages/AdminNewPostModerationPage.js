import React, { Component } from 'react';
import { Container, Segment, Header } from 'semantic-ui-react';
import NewPostPage from './NewPostPage';

class AdminNewPostModerationPage extends Component {

  render() {
    return (
      <Container>
        {
          // some header that it is moderation
        }
        <Header as='h2'>
          <Header.Content>
            Модерация поста
          </Header.Content>
        </Header>

        {
          // New post page with some changes (media, description, dates, maps)
        }
        <Segment inverted color='teal'>
          {
            this.props.location.state
            ?
            <NewPostPage unmoderatedPost={this.props.location.state.unmoderatedPost} finished={() => { this.props.history.goBack() }} />
            :
            <p>Что-то не так, нужно зайти заново с админки на модерацию поста</p>
          }
        </Segment>

        {
          // some footer with approve buttons
        }

      </Container>
    );
  }
}

export default AdminNewPostModerationPage;
