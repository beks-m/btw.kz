import React, { Component } from 'react';
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../../stores/DefaultStore';
import Actions from '../../actions/Actions';
import { Container, Header, Icon, Grid, Loader, Image, Tab, Embed, Comment, Form, Button, Segment, Label, Menu, Popup } from 'semantic-ui-react';
import Timestamp from '../utils/timestamp';

@connectToStores
class SinglePostPage extends Component {
  constructor(props) {
    super(props);

    // rare ocassion when user opened post, closed it and then opened it again
    if (this.props.post && this.props.post.id === this.props.match.params.id) {
      this.post = this.props.post;
      Actions.getSinglePost(this.props.match.params.id);
      if (!this.props.post.comments) {
        Actions.getCommentsForPost(this.post.id);
      }
    }

    // user can come from Homepage
    // there are posts loaded for homepage -> use them
    if (!this.post) {
      this.post = this.props.location.post;
      Actions.getSinglePost(this.props.match.params.id);
      if (this.post && !this.post.comments) {
        Actions.getCommentsForPost(this.post.id);
      }
    }

    // user can come from direct link
    // need to load single post from Firestore and listen for answer
    if (!this.post) {
      Actions.getSinglePost(this.props.match.params.id);
      Actions.getCommentsForPost(this.props.match.params.id);
    }

    this.state = {comment: ''};
  }

  componentWillUnmount() {
    // detach data update listeners
    Actions.unsubscribeForPost(this.props.match.params.id);
  }

  componentWillReceiveProps(nextProps) {
    // listen for new props from Stores and Actions
    // get post from props.posts and get post from props.post
    this.post = nextProps.post;
    // if such post doesn't exist
    if (nextProps.post && nextProps.post.id === 0) {
      this.notFound = true;
    }
  }

  static getStores() {
    return [DefaultStore];
  }

  static getPropsFromStores() {
    return DefaultStore.getState();
  }

  mediaTabPanes() {
    var pane;
    return(
      this.post.media.map(function(object, idx) {
        if (object.type === 'image') {
          pane = { menuItem: <Menu.Item key={idx}><Image src={object.link} size='mini' /></Menu.Item>,
                     render: () =>
                        <Tab.Pane attached='top'>
                          <Image src={object.link} fluid />
                        </Tab.Pane>
                  };
        } else if (object.type === 'youtube') {
          var thumbnailLink = 'https://img.youtube.com/vi/' + object.id + '/hqdefault.jpg';
          pane = { menuItem: <Menu.Item key={idx}><Image src={thumbnailLink} size='mini' /></Menu.Item>,
                     render: () =>
                        <Tab.Pane attached='top'>
                        <Embed
                          id={object.id}
                          placeholder={thumbnailLink}
                          source='youtube'
                        />
                        </Tab.Pane>
                  };
        }
        return pane;
      })
    )
  }

  renderTags() {
    return (
      this.post.tags.map(function(object, idx) {
        return <Label key={idx} content={object} tag/>;
      })
    )
  }

  renderComments() {
    return (
      <Comment.Group>
        <Header as='h3'><Icon name='comments' />
          <Header.Content>
            Комментарии
          </Header.Content>
        </Header>
        <Segment>

          {
            this.props.comments[this.post.id]
            ?
            this.props.comments[this.post.id].map(function(object, idx) {
              return <Comment key={idx}>
                <Comment.Avatar src={object.user.photoURL} />
                <Comment.Content>
                  <Comment.Author as='a'>{object.user.name}</Comment.Author>
                  <Comment.Metadata>
                    <div><Timestamp time={object.timestamp}/></div>
                  </Comment.Metadata>
                  <Comment.Text>{object.content}</Comment.Text>
                </Comment.Content>
              </Comment>;
            })
            :
            <Header as='h5'>
              <Header.Content>
                Комментариев нет =/
              </Header.Content>
            </Header>
        }

        </Segment>

        <Form reply onSubmit={this.handleCommentFormSubmit}>
          <Form.TextArea name='comment' value={this.state.comment} autoHeight placeholder='Вдохнуть жизнь в обсуждение...' rows={2} onChange={this.handleCommentFormChange}/>
          <Button content='Отправить' labelPosition='left' icon='edit' primary />
        </Form>
      </Comment.Group>
    )
  }

  renderUpvoteButton() {
    return (
      <Popup
        trigger={
          <Button
            floated='right'
            size='mini'
            color={
              this.post.isUpvoted
              ?
              'blue'
              :
              null
            }
            icon='chevron up'
            onClick = {this.handleUpvote}
            label={{ basic: true, pointing: 'left', content: this.post.upvoteCount }}
          />
        }
        content='Поднять выше'
        size='tiny'
        position='left center'
      />
    )
  }

  handleUpvote = () => {
    if (this.post.isUpvoted) {
      Actions.removeUpvote(this.post.id);
    } else {
      Actions.addUpvote(this.post.id);
    }
  }

  handleCommentFormSubmit = () => {
    Actions.addCommentForPost(this.state.comment, this.post.id);
    this.setState({comment: ''});
  }

  handleCommentFormChange = (e, { name, value }) => this.setState({ [name]: value })

  renderPostInfo() {
    if (this.notFound) {
      return (
        <Header as='h2'>
          <Icon name='frown' />
          <Header.Content>
            Post not found =/
          </Header.Content>
        </Header>
      )
    } else {
      return (
        <Grid stackable divided>
          <Grid.Column width={9}>
            <Container>
              <Grid stackable>
                <Grid.Column width={14}>
                  <Header as='h2'>
                    <Icon name={this.post.icon} />
                    <Header.Content>
                      {this.post.name}
                    </Header.Content>
                  </Header>
                </Grid.Column>
                <Grid.Column width={2}>
                  {this.renderUpvoteButton()}
                </Grid.Column>
              </Grid>
              <br />
            </Container>

            <Tab menu={{ attached: 'bottom' }} panes={this.mediaTabPanes()} />
            <br />

            <Grid stackable verticalAlign='middle'>
              <Grid.Column floated='left' width={5}>
                <Header as='h3'>
                  <Icon name='info' />
                  <Header.Content>
                    Описание
                  </Header.Content>
                </Header>
              </Grid.Column>
              <Grid.Column floated='right' width={5}>
                <Button circular color='facebook' icon='facebook' floated='right' />
                <Button circular color='twitter' icon='twitter' floated='right' />
                <Button circular color='linkedin' icon='linkedin' floated='right' />
                <Button circular color='google plus' icon='google plus' floated='right' />
              </Grid.Column>
            </Grid>

            <Segment>
              {this.post.description}
            </Segment>

            <br />

            {this.renderTags()}

            <br />

            {this.renderComments()}

          </Grid.Column>
          <Grid.Column width={6}>
            <Header as='h2'>
              <Icon name='globe' />
              <Header.Content>
                Some extra staff on right sidebar
              </Header.Content>
            </Header>
          </Grid.Column>
        </Grid>

      )
    }
  }

  render() {
    return (
      <Container>
        <br />
        <br />
        <br />
        {
          this.post
          ?
          this.renderPostInfo()
          :
          <Loader active size='big' inline='centered' />
        }
      </Container>
    );
  }
}

export default SinglePostPage;
