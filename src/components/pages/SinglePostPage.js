import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../../stores/DefaultStore';
import Actions from '../../actions/Actions';
import { Container, Header, Icon, Grid, Loader, Image, Tab, Comment, Form, Button, Segment, Label, Menu, Popup, Divider, Modal, Card } from 'semantic-ui-react';
import * as moment from 'moment';
import 'moment/locale/ru';
import MicrolinkCard from 'react-microlink';
import {Helmet} from 'react-helmet';
import ScrollToTop from '../utils/ScrollToTop';
import ReactGA from 'react-ga';
import UpvoteButton from '../upvoteButton/UpvoteButton';
import Interweave from 'interweave';
import { iconForType, randomColor, getRandomItemsFromArray } from '../utils/contentFunctions';
import { YMaps, Map, Placemark } from 'react-yandex-maps';
import { allStrings } from './SinglePostPageStrings';

@connectToStores
class SinglePostPage extends Component {

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

    // rare ocassion when user opened post, closed it and then opened it again
    if (this.props.singlePost && this.props.singlePost.date === this.props.match.params.date && this.props.singlePost.id === this.props.match.params.id) {
      this.state['post'] = this.props.singlePost;
    }

    // user can come from Homepage
    // there are posts loaded for homepage into cache -> use them
    if (!this.state.post) {
      this.state['post'] = this.props.location.post;
      if (this.props.location.post) { // need to trigger when post is first set
        Actions.getUsers([this.state.post.hunterID]);
        if (this.state.post.makers) {
          Actions.getUsers(this.state.post.makers);
        }
        if (this.state.post.editors) {
          Actions.getUsers(this.state.post.editors);
        }
      }
    }

    // user can come from direct link
    // need to load single post from Firestore and listen for updates in componentWillReceiveProps
    Actions.getSinglePost(this.props.match.params.date, this.props.match.params.id);
    Actions.getCommentsForPost(this.props.match.params.date, this.props.match.params.id);

    // update URL
    this.props.history.replace('/posts/' + this.props.match.params.date + '/' + this.props.match.params.id);
    ReactGA.pageview(window.location.pathname + window.location.search);
  }

  componentWillReceiveProps(nextProps) {

    // listen for post info
    if (nextProps.singlePost) {
      this.setState({post: nextProps.singlePost});
    }
    // determine if such post doesn't exist in database
    if (nextProps.singlePost && nextProps.singlePost.id === 0) {
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
    if ((!this.state.upvotes && nextProps.upvotes[this.props.match.params.id]) || (this.state.upvotes && nextProps.upvotes[this.props.match.params.id] && this.state.upvotes.length !== nextProps.upvotes[this.props.match.params.id].length)) {
      this.setState({upvotes: nextProps.upvotes[this.props.match.params.id]});
      var users = [];
      nextProps.upvotes[this.props.match.params.id].forEach((upvote) => {
        users.push(upvote.user);
      });
      Actions.getUsers(users);
    }

    // get once author and editors of post
    if (!this.state.post && nextProps.singlePost) { // need to trigger when post is first set
      Actions.getUsers([nextProps.singlePost.hunterID]);
      if (nextProps.singlePost.makers) {
        Actions.getUsers(nextProps.singlePost.makers);
      } if (nextProps.singlePost.editors) {
        Actions.getUsers(nextProps.singlePost.editors);
      }
    }
  }

  componentWillMount() {
    window.addEventListener('resize', this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    // detach data update listeners (post info, comments)
    Actions.unsubscribeForPost(this.props.match.params.date, this.props.match.params.id);
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  handleWindowSizeChange = () => {
    this.setState({ width: window.innerWidth });
  };

  static getStores() {
    return [DefaultStore];
  }

  static getPropsFromStores() {
    return DefaultStore.getState();
  }

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
        return userAvatars.push(<Popup key={idx} trigger={
          <Image avatar as='a' src={this.props.users[uid]['photoURL']}  />
        }> {this.props.users[uid]['name']} </Popup>)
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
                    <Image src={this.props.users[uid]['photoURL']} size='large'/>
                    <Card.Content>
                      <Card.Header>
                        {this.props.users[uid]['name']}
                      </Card.Header>
                      <Card.Description>
                        {this.props.users[uid]['description']}
                      </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                      <a target='_blank' as='Link' href={'../../users/' + uid}>
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
    var panes = this.state.post.media.map((object, idx) => {
      if (object.type === 'image') {
        pane = { menuItem: <Menu.Item key={idx}><Image src={object.link} size='mini' /></Menu.Item>,
                   render: () =>
                      <Tab.Pane attached='top'>
                        <Image hidden  src='https://firebasestorage.googleapis.com/v0/b/btw.kz/o/main%2FWhite%20line.png?alt=media&token=b640a8b1-dd0b-479b-8db9-a63bc0758f02' fluid/>
                        <style>
                          {`.limitedHeight {max-height: 300px;}`}
                        </style>
                        <Image src={object.link} centered className={this.state.width > 500 ? 'limitedHeight' : null } />
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
    return (
      <Tab menu={{ attached: 'bottom' }} panes={panes} grid={{ paneWidth: 16, stretched: true }} />
    )
  }

  renderTags() {
    return (
      this.state.post.tags.map(function(object, idx) {
        return <Label key={idx} content={object} tag color={randomColor()} onClick={() => {this.props.history.push('/tags/' + object)}} />;
      })
    )
  }

  renderLinks() {
    var microlinkWidth = this.state.width > 500 ? '400px' : (this.state.width*0.9) + 'px'
    return(
      this.state.post.links.map((object, idx) => {
        return <div key={idx}>
          <Popup key={idx} flowing hoverable trigger={
            <Button icon labelPosition='left' fluid>
              <Icon name='external' />
              {object}
            </Button>
          } position='top center'>
            <MicrolinkCard url={object} target='_blank' rounded style={{width: microlinkWidth}}/>
          </Popup><Divider hidden fitted/></div>
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
                    <Comment.Avatar src={object.user.photoURL} />
                    <Comment.Content>
                      <Comment.Author as='a'>{object.user.name}</Comment.Author>
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
                  Комментариев нет =/
                </Header.Content>
              </Header>
          }

        </Segment>
        <Form reply onSubmit={this.handleCommentFormSubmit}>
          <Form.TextArea disabled={this.props.user == null} name='commentFormValue' value={this.state.comment} autoHeight placeholder={this.props.user ? 'Вдохнуть жизнь в обсуждение...' : 'Авторизуйтесь, чтобы оставить комментарий 😉'} rows={2} onChange={this.handleCommentFormChange}/>
          <Button loading={this.state.commentFormButtonLoading} disabled={this.props.user == null} content='Отправить' labelPosition='left' icon='edit' primary />
        </Form>

      </Comment.Group>
    )
  }

  handleCommentFormSubmit = () => {
    Actions.addCommentForPost(this.props.match.params.date, this.props.match.params.id, this.state.commentFormValue);
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
        return users.push(upvote.user);
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
    var url = 'https://www.facebook.com/dialog/share?app_id=668812386840509&display=popup&href=https%3A%2F%2Fbtw.kz%2Fposts%2F' + this.props.match.params.date + '%2F' + this.props.match.params.id +  '%2F&redirect_uri=https%3A%2F%2Fbtw.kz%2Fposts%2F' + this.props.match.params.date + '%2F' + this.props.match.params.id + '%2F';
    var link = 'https://btw.kz/posts/' + this.props.match.params.date + '/' + this.props.match.params.id + '/';
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
              <Popup trigger={<Image avatar src={this.props.users[this.state.post.hunterID]['photoURL']} as={Link} to={'/users/' + this.state.post.hunterID} />}>
                {this.props.users[this.state.post.hunterID]['name']} </Popup>
            :
            <Loader inline active />
        }
        <b> - добавил(а) пост</b>
        <br />

        {
            this.state.post.editors && this.state.post.editors.length
              ?
                <span>
                  {
                    this.renderUserAvatars(this.state.post.editors, 5, 'Дополнили пост')
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
        <Header as='h2'>
          <Icon name='frown' />
          <Header.Content>
            Post not found =/
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
                <Popup hoverable trigger={<Button circular icon='share' floated='right' />}>
                  {this.renderShareButtons()}
                </Popup>
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
                {
                  this.state.post.startDate
                    ?
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
                    :
                    null
                }

                {
                  this.state.post.locationAddress
                    ?
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
                    :
                    null
                }

                {
                    this.state.post.makers && this.state.post.makers.length
                      ?
                        <div>
                          <Header as='h3'>
                            <Icon name='users' />
                            <Header.Content>
                              {allStrings[this.state.post.type]['makersFieldHeader']}
                            </Header.Content>
                          </Header>
                          {this.renderUserAvatars(this.state.post.makers, 5, allStrings[this.state.post.type]['makersFieldHeader'])}
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
        <ScrollToTop/>
        {
          this.state.post && !this.state.notFound
            ?
              <Helmet>
                <title>{this.state.post.name + ' | btw.kz'}</title>
                <meta name='description' content={this.state.post.description} />
                <meta property='og:title' content={this.state.post.name + ' | btw.kz'} />
                <meta property='og:image' content={this.state.post.media[0].link} />
                <meta property='og:type' content='website' />
                <meta property='og:site_name' content='btw.kz'/>
                <meta property='og:description' content={this.state.post.description} />
                <meta property='fb:app_id' content='668812386840509' />
                <meta property='og:url' content={'https://btw.kz/posts/' + this.props.match.params.date + '/' +  this.props.match.params.id}/>
                <meta name='twitter:card' content='summary_large_image' />
                <meta name='twitter:domain' value='btw.kz' />
                <meta name='twitter:title' value={this.state.post.name + ' | btw.kz'} />
                <meta name='twitter:description' value={this.state.post.description} />
                <meta name='twitter:image' content={this.state.post.media[0].link} />
                <meta name='twitter:label1' value={'🔝 ' + this.state.post.upvoteCount} />
              </Helmet>
            :
          null
        }
        <Divider hidden />
        {
          this.state.post
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
