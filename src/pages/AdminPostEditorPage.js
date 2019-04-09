import React, { Component } from 'react';
import { Container, Segment, Header } from 'semantic-ui-react';
import NewPostPage from './NewPostPage';

class AdminPostEditorPage extends Component {

  render() {
    return (
      <Container>
        <br />
        {
          // some header that it is moderation
        }
        <Header as='h2'>
          <Header.Content>
            {this.props.location.state.unmoderatedPost ? 'Модерация поста' : 'Редактирование поста'}
          </Header.Content>
        </Header>

        {
          // New post page with some changes (media, description, dates, maps)
        }
        <Segment inverted color='teal'>
          {
            this.props.location.state
              ?
                <NewPostPage unmoderatedPost={this.props.location.state.unmoderatedPost} editedPost={this.props.location.state.editedPost} finished={() => { this.props.history.goBack() }} />
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

export default AdminPostEditorPage;
