import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../stores/DefaultStore';
import UpvoteStore from '../stores/UpvoteStore';
import SinglePostStore from '../stores/SinglePostStore';
import SinglePostActions from '../actions/SinglePostActions';
import UserStore from '../stores/UserStore';
import UserActions from '../actions/UserActions';
import { Container, Header, Icon, Grid, Loader, Image, Tab, Comment, Form, Button, Segment, Label, Menu, Popup, Divider, Modal, Card, TextArea } from 'semantic-ui-react';
import * as moment from 'moment';
import 'moment/locale/ru';
import { Helmet } from 'react-helmet';
import ScrollToTop from '../components/ScrollToTop';
import ReactGA from 'react-ga';
import { iconForType, randomColor, getRandomItemsFromArray } from '../utils/contentFunctions';
import { allStrings } from './SinglePostPageStrings';
import Loadable from 'react-loadable';
import scrollToComponent from 'react-scroll-to-component';
import ProfileImage from '../components/ProfileImage';

const YMaps = Loadable({
  loader: () => import('react-yandex-maps'),
  loading() {
    return <div>Loading</div>
  },
  render(loaded, props) {
    let Component = loaded.YMaps;
    return <Component {...props} />;
  }
});
const Map = Loadable({
  loader: () => import('react-yandex-maps'),
  loading() {
    return null
  },
  render(loaded, props) {
    let Component = loaded.Map;
    return <Component {...props} />;
  }
});
const Placemark = Loadable({
  loader: () => import('react-yandex-maps'),
  loading() {
    return null
  },
  render(loaded, props) {
    let Component = loaded.Placemark;
    return <Component {...props} />;
  }
});
const UpvoteButton = Loadable({
  loader: () => import('../components/UpvoteButton'),
  loading() {
    return null
  }
});
// const MicrolinkCard = Loadable({
//   loader: () => import('react-microlink'),
//   loading() {
//     return null
//   }
// });
const Interweave = Loadable({
  loader: () => import('interweave'),
  loading() {
    return null
  }
});


@connectToStores
class SinglePostPage extends Component {

  static getStores() {
    return [SinglePostStore, UpvoteStore, DefaultStore, UserStore];
  }

  static getPropsFromStores() {
    return {
      ...SinglePostStore.getState(),
      ...UpvoteStore.getState(),
      ...DefaultStore.getState(),
      ...UserStore.getState()
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      post: null,
      notFound: false,
      comments: null,
      commentFormValue: '',
      commentFormLoading: true,
      commentFormButtonLoading: false,
      upvotes: null,
      showUsersModal: false,
      usersToShowInModal: [],
      usersModalTitle: '',
      width: window.innerWidth,
    }

    // user can come from Homepage
    // there are posts loaded for homepage into cache -> use them
    if (!this.state.post && this.props.location.post) {
      this.state['post'] = this.props.location.post;
      // need to trigger when post is first set
      UserActions.getUsers([this.state.post.hunterID]);
      if (this.state.post.makers) {
        UserActions.getUsers(Object.keys(this.state.post.makers));
      }
      if (this.state.post.editors) {
        UserActions.getUsers(Object.keys(this.state.post.editors));
      }
    }

    // user can come from direct link
    // need to load single post from Firestore and listen for updates in componentWillReceiveProps
    SinglePostActions.getPost(this.props.match.params.id);
    SinglePostActions.getCommentsForPost(this.props.match.params.id);

    // update URL
    this.props.history.replace('/posts/' + this.props.match.params.id);
    ReactGA.pageview(window.location.pathname, 'Post View - ' + this.props.match.params.id);
  }

  componentWillReceiveProps(nextProps) {

    // listen for post info
    if (nextProps.post) {
      this.setState({post: nextProps.post});
    }
    // determine if such post doesn't exist in database
    if (nextProps.post && nextProps.post.id === 0) {
      this.setState({notFound: true});
    }

    // listen for comments
    if (nextProps.comments[this.props.match.params.id]) {
      if (nextProps.comments[this.props.match.params.id].length !== this.state.comments) {
        this.setState({commentFormButtonLoading: false});
      }
      this.setState({comments: nextProps.comments[this.props.match.params.id]});
      this.setState({commentFormLoading: false});
    }

    // listen for upvotes and users that upvoted
    if ( (!this.state.upvotes && nextProps.upvotes[this.props.match.params.id]) || ( this.state.upvotes && nextProps.upvotes[this.props.match.params.id] && this.state.upvotes.length !== nextProps.upvotes[this.props.match.params.id].length )) {
      this.setState({upvotes: nextProps.upvotes[this.props.match.params.id]});
      var users = [];
      nextProps.upvotes[this.props.match.params.id].forEach((upvote) => {
        users.push(upvote.userID);
      });
      UserActions.getUsers(users);
    }

    // get once author and editors of post
    if (!this.state.post && nextProps.singlePost) { // need to trigger when post is first set
      UserActions.getUsers([nextProps.singlePost.hunterID]);
      if (nextProps.singlePost.makers) {
        UserActions.getUsers(Object.keys(nextProps.singlePost.makers));
      } if (nextProps.singlePost.editors) {
        UserActions.getUsers(Object.keys(nextProps.singlePost.editors));
      }
    }

    // if user is viewing one post and changes url to another post
    if (this.state.post && this.props.match.params.id !== nextProps.match.params.id) {
      this.setState({
        post: null,
        notFound: false,
        comments: null,
        commentFormValue: '',
        commentFormLoading: true,
        commentFormButtonLoading: false,
        upvotes: null,
        showUsersModal: false,
        usersToShowInModal: [],
        usersModalTitle: '',
        width: window.innerWidth,
      });
      SinglePostActions.getPost(nextProps.match.params.id);
      SinglePostActions.getCommentsForPost(nextProps.match.params.id);
    }
  }

  componentWillMount() {
    window.addEventListener('resize', this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    // detach data update listeners (post info, comments)
    SinglePostActions.unsubscribeForPost(this.props.match.params.id);
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  handleWindowSizeChange = () => {
    this.setState({ width: window.innerWidth });
  };

  renderUserAvatars(users, count, title) {
    var limitedUsers = [];
    if (users.length > count) {
      limitedUsers = getRandomItemsFromArray(users, count);
    } else {
      limitedUsers = users;
    }
    var userAvatars = [];
    limitedUsers.map((uid, idx) => {
      if (this.props.users[uid]) {
        if (this.state.width < 500) {
          return userAvatars.push(<ProfileImage small as='a' facebookUID={this.props.users[uid]['facebookUID']} facebookSize='small' /> )
            } else {
              return userAvatars.push(
                <Popup key={idx} trigger={
                  <ProfileImage avatar as='a' facebookUID={this.props.users[uid]['facebookUID']} facebookSize='small' />
                }> Открыть полный список </Popup>
          )
        }
      } else {
        return userAvatars.push(<Loader key={idx} active inline/>)
      }
    })
    return (
      <Modal closeIcon trigger={
        <span className='mousePointing'>
          <style>
            {`.mousePointing {cursor: pointer;}`}
          </style>
          {userAvatars}
        </span>
      }>
        <Modal.Header>{title}</Modal.Header>
        <Modal.Content >
          <Card.Group itemsPerRow={5} stackable>
            {
              users.map((uid, idx) => {
                if (this.props.users[uid]) {
                  return <Card key={idx}>
                    <ProfileImage facebookUID={this.props.users[uid]['facebookUID']} size='large' facebookSize='large' />
                    <Card.Content>
                      <Card.Header>
                        {this.props.users[uid]['name']}
                      </Card.Header>
                      <Card.Description>
                        {this.props.users[uid]['description']}
                      </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                      <a as='Link' href={'../../users/' + uid}>
                        <Icon name='user' />
                        Профиль на btw.kz
                      </a>
                      <br />
                      <a target='_blank' href={'https://facebook.com/' + this.props.users[uid]['facebookUID'] }>
                        <Icon name='facebook' />
                        Facebook
                      </a>
                    </Card.Content>
                  </Card>
                } else {
                  return <Loader key={idx} active inline/>
                }
              })
            }
          </Card.Group>
        </Modal.Content>
      </Modal>
    )
  }

  renderMediaTab() {
    var pane;
    var panes = [];
    if (this.state.post.media && this.state.post.media.length) {
      panes = this.state.post.media.map((object, idx) => {
        if (object.type === 'image') {
          pane = { menuItem: <Menu.Item key={idx}><Image src={object.link} size='mini' /></Menu.Item>,
                     render: () =>
                        <Tab.Pane attached='top'>
                          <Image hidden  src='https://firebasestorage.googleapis.com/v0/b/btw.kz/o/main%2FWhite%20line.png?alt=media&token=b640a8b1-dd0b-479b-8db9-a63bc0758f02' fluid/>
                          <Image src={object.link} centered style={this.state.width > 500 ? {maxHeight: '300px'} : null } />
                        </Tab.Pane>
                  };
        } else if (object.type === 'youtube') {
          var thumbnailLink = 'https://img.youtube.com/vi/' + object.videoID + '/hqdefault.jpg';
          pane = { menuItem: <Menu.Item key={idx}><Image src={thumbnailLink} size='mini' /></Menu.Item>,
                     render: () =>
                        <Tab.Pane attached='top'>
                          <Image hidden  src='https://firebasestorage.googleapis.com/v0/b/btw.kz/o/main%2FWhite%20line.png?alt=media&token=b640a8b1-dd0b-479b-8db9-a63bc0758f02' fluid/>
                          <p align="center"><iframe title={object.videoID} width={this.state.width > 500 ? "525" : "100%"} height={this.state.width > 500 ? "296" : "inherit"} src={'https://www.youtube.com/embed/' + object.videoID + '?rel=0'} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe></p>
                          </Tab.Pane>
                  };
        }
        return pane;
      });
    }

    if (this.state.post.locationCoordinates) {
       pane = {
         menuItem: <Menu.Item key='mapLocation'>Карта</Menu.Item>,
         render: () =>
                <Tab.Pane attached='top'>
                  {/* image is needed so that map can be full screen */}
                  <Image hidden  src='https://firebasestorage.googleapis.com/v0/b/btw.kz/o/main%2FWhite%20line.png?alt=media&token=b640a8b1-dd0b-479b-8db9-a63bc0758f02' fluid/>
                  <YMaps>
                    <Map state={{ center: this.state.post.locationCoordinates, zoom: 16 }} width='inherit' height={300} instanceRef={(yandexMap) => {
                      if (yandexMap) {
                        this.yandexMap = yandexMap;
                        this.yandexMap.balloon.open(this.state.post.locationCoordinates, [
                          '<address>',
                          '<strong>Адрес: </strong>',
                          this.state.post.locationAddress,
                          '<br/>',
                          this.state.post.locationComment ? this.state.post.locationComment : null,
                          '</address>'
                          ].join('')
                          , {
                            closeButton: false,
                            panelMaxMapArea: 'Infinity'
                          });
                      }
                    }}>

                      <Placemark
                        geometry={{
                            coordinates: this.state.post.locationCoordinates
                        }}
                      />

                    </Map>
                  </YMaps>
                </Tab.Pane>
                  }
       panes.push(pane);
    }
    if (panes.length > 0) {
      return (
        <Tab menu={{ attached: 'bottom' }} panes={panes} grid={{ paneWidth: 16, stretched: true }} />
      )
    }
    return null;
  }

  renderTags() {
    return (
      Object.keys(this.state.post.tags).map((object, idx) => {
        return <Label key={idx} as='a' content={object} tag color={randomColor()} onClick={() => {this.props.history.push('/tags/' + object)}} />;
      })
    )
  }

  renderLinks() {
    return(
      this.state.post.links.map((object, idx) => {
        return <div key={idx}>
          {this.state.width > 500 ? (
            // <Popup key={idx} flowing hoverable trigger={
              <Button icon labelPosition='left' fluid onClick={() => { window.open(object, '_blank'); }}>
                <Icon name='external' />
                {object}
              </Button>
            // } position='top center'>
            // <MicrolinkCard url={object} target='_blank' rounded style={{width: '400px'}}/>
            // </Popup>
          ) : (
            <Button icon labelPosition='left' fluid onClick={() => { window.open(object, '_blank'); }}>
              <Icon name='external' />
              {object}
            </Button>
          )}
          <Divider hidden fitted/></div>
      })
    )
  }

  // Comments section

  renderComments() {
    return (
      <Comment.Group>
        <Header as='h3'><Icon name='comments' />
          {
              this.state.comments
                ?
                  <Header.Content>
                    Комментарии ({this.state.comments.length})
                  </Header.Content>
                :
                <Header.Content>
                  Комментарии
                </Header.Content>
          }
        </Header>
        <Segment>

          {
            this.state.comments
              ?
                this.state.comments.map(function(object, idx) {
                  return <Comment key={idx}>
                    <Comment.Avatar src={'https://graph.facebook.com/v3.0/' + object.user.facebookUID + '/picture'} />
                    <Comment.Content>
                      <Comment.Author as={Link} to={'/users/' + object.userID} >{object.user.name}</Comment.Author>
                      <Comment.Metadata>
                        <div>{moment(object.timestamp).fromNow()}</div>
                      </Comment.Metadata>
                      <Comment.Text>{object.content}</Comment.Text>
                    </Comment.Content>
                  </Comment>;
                })
              :
              <Header as='h5'>
                <Header.Content>
                  Комментариев нет <span role="img" aria-label="sorry">🤷‍</span>
                </Header.Content>
              </Header>
          }

        </Segment>
        <Form reply onSubmit={this.handleCommentFormSubmit}>
          <Form.Field>
            <TextArea disabled={this.props.user == null} name='commentFormValue' ref={(c) => {
              if (c && this.props.location.comment) {
                this.commentField = c;
                scrollToComponent(this.commentField, {offset: 0, align: 'top', duration: 500});
                c.focus();
              }
            }} value={this.state.commentFormValue} autoHeight placeholder={this.props.user ? 'Вдохнуть жизнь в обсуждение...' : 'Авторизуйтесь, чтобы оставить комментарий 😉'} rows={2} onChange={this.handleCommentFormChange}/>
          </Form.Field>
          <Button loading={this.state.commentFormButtonLoading} disabled={this.props.user == null} content='Отправить' labelPosition='left' icon='edit' primary />
        </Form>

      </Comment.Group>
    )
  }

  handleCommentFormSubmit = () => {
    SinglePostActions.addCommentForPost(this.props.match.params.id, this.state.commentFormValue);
    this.setState({commentFormValue: ''});
    this.setState({commentFormButtonLoading: true});
    ReactGA.event({
      category: 'Commenting',
      action: 'Add comment'
    });
  }

  handleCommentFormChange = (e, { name, value }) => this.setState({ [name]: value })

  // who upvoted post section

  renderWhoUpvoted() {
    if (this.state.upvotes && this.state.upvotes.length) {
      var users = [];
      this.state.upvotes.map((upvote, idx) => {
        return users.push(upvote.userID);
      });
      return(
        <span>
          { this.renderUserAvatars(users, 3, 'Поставили лайк') }
          <Icon name='chevron left' />
          <UpvoteButton post={this.state.post} pageName='Single Post Page' />
        </span>
      )
    }
    return(
      <span>
        <Label size='large' basic pointing='right'>Никого <span role="img" aria-label="sorry">🤷‍</span></Label>
        <UpvoteButton post={this.state.post} pageName='Single Post Page' />
      </span>
    )
  }

  renderShareButtons() {
    var url = 'https://www.facebook.com/dialog/share?app_id=668812386840509&display=popup&href=https%3A%2F%2Fbtw.kz%2Fposts%2F' + this.props.match.params.id +  '%2F&redirect_uri=https%3A%2F%2Fbtw.kz%2Fposts%2F' + this.props.match.params.id + '%2F';
    var link = 'https://btw.kz/posts/' + this.props.match.params.id + '/';
    return([
      <Button key='facebook' circular color='facebook' icon='facebook' href={url} target='_blank'/>,
      <Button key='twitter' circular color='twitter' icon='twitter' href={'https://twitter.com/share?url=' + link + '&hashtags=btw.kz&related=btw.kz'} target='_blank' />,
      <Button key='whatsapp' circular color='green' icon='whatsapp' href={'https://api.whatsapp.com/send?text=' + this.state.post.name + '%20-%20' + link} target='_blank' />,
      <Button key='telegram' circular color='blue' icon='telegram' href={'https://t.me/share/url?url=' + link} target='_blank' />,

    ])
  }

  // hunters and makers section

  renderHunterInfo() {
    return(
      <div>
        {
          this.props.users[this.state.post.hunterID]
            ?
              <Popup trigger={<ProfileImage avatar facebookUID={this.props.users[this.state.post.hunterID]['facebookUID']} facebookSize='small' as={Link} to={'/users/' + this.state.post.hunterID} />}>
                {this.props.users[this.state.post.hunterID]['name']} </Popup>
            :
            <Loader inline active />
        }
        <b> - добавил(а) пост</b>
        <br />

        {
          this.state.post.editors && Object.keys(this.state.post.editors).length
            ?
              <span>
                {
                  this.renderUserAvatars(Object.keys(this.state.post.editors), 5, 'Дополнили пост')
                  }
                  <b> - дополнил(а/и) пост</b>
                </span>
              :
          null
        }


      </div>
    )
  }

  // main render functions

  renderPostInfo() {
    if (this.state.notFound) {
      return (
        <Header as='h2' textAlign='center'>
          <Header.Content>
            Такого поста кажись не существует <span role="img" aria-label="sorry">🤷‍</span>
            <Header.Subheader>
              Возможно, вам лучше перейти на <Link to='/'>главную</Link> и начать оттуда? Или пойти поесть тортика? <span role="img" aria-label="sorry">🧐‍</span>
            </Header.Subheader>
          </Header.Content>
        </Header>
      )
    } else {
      return (
        <Container>
          <Grid stackable>
            <Grid.Row verticalAlign='middle'>
              <Grid.Column width={8}>
                <Header size='large'>
                  <Icon name={iconForType(this.state.post.type)} />
                  <Header.Content>
                    {this.state.post.name}
                    <Header.Subheader>
                      {this.state.post.shortDescription}
                    </Header.Subheader>
                  </Header.Content>
                </Header>
              </Grid.Column>
              <Grid.Column width={4} only='mobile'>
                {this.renderWhoUpvoted()}
                <Modal closeIcon trigger={<Button circular icon='share' floated='right' />}>
                  <Modal.Header>Поделиться через ...</Modal.Header>
                  <Modal.Content>
                    {this.renderShareButtons()}
                  </Modal.Content>
                </Modal>
              </Grid.Column>
              <Grid.Column width={8} only='computer tablet' textAlign='right'>
                {this.renderWhoUpvoted()}
                {this.renderShareButtons()}

              </Grid.Column>
            </Grid.Row>
            {
              this.state.width > 500
                ?
                  this.renderMediaTab()
                :
                <Grid.Row>
                  {this.renderMediaTab()}
                </Grid.Row>
            }
            <Grid.Row>
              <Grid.Column width={9}>
                {
                    this.state.post.description.length > 12
                      ?
                        <div>
                          <Header as='h3'>
                            <Icon name='info' />
                            <Header.Content>
                              Описание
                            </Header.Content>
                          </Header>
                          { this.renderTags() }
                          <Segment>
                            <Interweave tagName="div" content={this.state.post.description}/>
                          </Segment>
                          <Divider />
                        </div>
                      :
                  null
                }
                {
                  this.state.width > 500
                    ?
                      <div>{this.renderComments()}<Divider /></div>
                    :
                  null
                }
              </Grid.Column>
              <Grid.Column width={7}>

                {this.state.post.startDate && (
                  <div>
                    <Header as='h3' >
                      <Icon name='clock' />
                      <Header.Content>
                        Дата и время проведения
                      </Header.Content>
                    </Header>
                    <Segment>
                      <b>Начало: </b>{moment(this.state.post.startDate).format("Do MMMM YYYY, HH:mm (dddd)")}
                      <Divider />
                      <b>Конец: </b>{moment(this.state.post.endDate).format("Do MMMM YYYY, HH:mm (dddd)")}
                    </Segment>
                    <Divider />
                  </div>
                )}

                {this.state.post.locationAddress && (
                  <div>
                    <Header as='h3' >
                      <Icon name='map signs' />
                      <Header.Content>
                        Место проведения
                      </Header.Content>
                    </Header>
                    <Segment>
                      <b>Адрес: </b>{this.state.post.locationAddress}
                      {
                          this.state.post.locationComment
                            ?
                              <p>{this.state.post.locationComment}</p>
                            :
                          null
                      }
                    </Segment>
                    <Divider />
                  </div>
                )}

                {this.state.post.eventIsPaid != null && (
                  <div>
                    <Header as='h3' >
                      <Icon name='money' />
                      <Header.Content>
                        Стоимость мероприятия
                      </Header.Content>
                    </Header>
                    <Segment>
                      {this.state.post.eventIsPaid == 0 ? 'Бесплатно' : this.state.post.eventIsPaid == -1 ? '🤷‍' : this.state.post.price ? this.state.post.price : 'Платно'}
                    </Segment>
                    <Divider />
                  </div>
                )}

                {this.state.post.makerContacts && (
                  <div>
                    <Header as='h3' >
                      <Icon name='address card outline' />
                      <Header.Content>
                        Контакты
                      </Header.Content>
                    </Header>
                    <Segment>
                      {this.state.post.makerContacts}
                    </Segment>
                    <Divider />
                  </div>
                )}

                {
                  this.state.post.makers && Object.keys(this.state.post.makers).length
                    ?
                      <div>
                        <Header as='h3'>
                          <Icon name='users' />
                          <Header.Content>
                            {allStrings[this.state.post.type]['makersFieldHeader']}
                          </Header.Content>
                        </Header>
                        {this.renderUserAvatars(Object.keys(this.state.post.makers), 5, allStrings[this.state.post.type]['makersFieldHeader'])}
                        <Divider />
                      </div>
                    :
                  null
                }

                {
                  this.state.post.description.length <= 12
                    ?
                      <div>
                        <Header as='h3'>
                          <Icon name='tags' />
                          <Header.Content>
                            Тэги
                          </Header.Content>
                        </Header>
                        {this.renderTags()}
                        <Divider />
                      </div>
                    :
                  null
                }

                {
                  this.state.post.links && this.state.post.links.length
                    ?
                      <div>
                        <Header as='h3'>
                          <Icon name='linkify' />
                          <Header.Content>
                            Ссылки
                          </Header.Content>
                        </Header>
                        {this.renderLinks()}
                        <Divider />
                      </div>
                    :
                    null
                }

                <div>
                  <Header as='h3'>
                    <Icon name='history' />
                    <Header.Content>
                      История изменений
                    </Header.Content>
                  </Header>
                  {this.renderHunterInfo()}
                  <Divider />
                </div>

                {
                  this.state.width > 500
                    ?
                      null
                    :
                    <div>{this.renderComments()}<Divider /></div>
                }

                {this.props.user && this.props.user.roles && this.props.user.roles.admin && (
                  <Button onClick={() => {
                    this.props.history.push('/admin/postEditor/' + this.state.post.id, {editedPost: this.state.post});
                  }}>
                    Редактировать пост
                  </Button>
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      )
    }
  }

  render() {
    return (
      <Container>
        {!this.props.location.comment &&
          <ScrollToTop/>
        }

        {this.state.post && !this.state.notFound &&
          <Helmet>
            <title>{this.state.post.name + ' | btw.kz'}</title>
            <meta name='description' content={this.state.post.shortDescription} />
          </Helmet>
        }
        <Divider hidden />
        {this.state.post ?
          this.renderPostInfo()
        : (
          <Loader active size='big' inline='centered' />
        )}
      </Container>
    );
  }
}

export default SinglePostPage;
