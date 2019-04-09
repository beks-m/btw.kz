import React, { Component } from 'react';
import { Loader, Button, Divider, Visibility, Tab, Feed, Header, Container } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../stores/DefaultStore';
import UserStore from '../stores/UserStore';
import UserActions from '../actions/UserActions';
import PostGrid from './PostGrid';
import * as moment from 'moment';
import 'moment/locale/ru';
import { Helmet } from 'react-helmet';
import ProfileImage from './ProfileImage';

@connectToStores
class UserInfo extends Component {

  static getStores() {
    return [DefaultStore, UserStore];
  }

  static getPropsFromStores() {
    return {
      ...DefaultStore.getState(),
      ...UserStore.getState()
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      moreLoaderIsActive: false,
      width: window.innerWidth
    }
    !this.props.users[this.props.uid] && UserActions.getUsers([this.props.uid]);
    !this.props.activityForUser[this.props.uid] && UserActions.getActivityForUser(this.props.uid, null);
    !this.props.hunterPostsForUser[this.props.uid] && UserActions.getHunterPostsForUser(this.props.uid, null);
    !this.props.makerPostsForUser[this.props.uid] && UserActions.getMakerPostsForUser(this.props.uid, null);
    !this.props.editorPostsForUser[this.props.uid] && UserActions.getEditorPostsForUser(this.props.uid, null);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({moreLoaderIsActive: false});
  }

  componentWillMount() {
    window.addEventListener('resize', this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  handleWindowSizeChange = () => {
    this.setState({ width: window.innerWidth });
  };

  renderTabs() {
    var panes = [
      {
        menuItem: 'Добавленные посты',
        render: () => (
          <Tab.Pane key='hunterdPosts'>
            {this.props.hunterPostsForUser[this.props.uid] ? (
              <PostGrid posts={this.props.hunterPostsForUser[this.props.uid]} loadMorePosts={() => {
                if (!this.props.hunterPostsEnded[this.props.uid]) {
                  UserActions.getHunterPostsForUser(this.props.uid, this.props.hunterPostsForUser[this.props.uid][this.props.hunterPostsForUser[this.props.uid].length-1].snapshot);
                  this.setState({moreLoaderIsActive: true})
                }
              }} ended={this.props.hunterPostsEnded[this.props.uid]} morePostsLoaderIsActive={this.state.moreLoaderIsActive} />
            ) : (
              <Loader active />
            )}
          </Tab.Pane>
      )}, {
        menuItem: 'Представитель в постах',
        render: () => (
          <Tab.Pane key='makerPosts'>
            {this.props.makerPostsForUser[this.props.uid] ? (
              <PostGrid posts={this.props.makerPostsForUser[this.props.uid]} loadMorePosts={() => {
                if (!this.props.makerPostsEnded[this.props.uid]) {
                  UserActions.getMakerPostsForUser(this.props.uid, this.props.makerPostsForUser[this.props.uid][this.props.makerPostsForUser[this.props.uid].length-1].snapshot);
                  this.setState({moreLoaderIsActive: true})
                }
              }} ended={this.props.makerPostsEnded[this.props.uid]} morePostsLoaderIsActive={this.state.moreLoaderIsActive} />
            ) : (
              <Loader active />
            )}
          </Tab.Pane>
      )}, {
        menuItem: 'Дополненные посты',
        render: () => (
          <Tab.Pane key='editorPosts'>
            {this.props.editorPostsForUser[this.props.uid] ? (
              <PostGrid posts={this.props.editorPostsForUser[this.props.uid]} loadMorePosts={() => {
                if (!this.props.editorPostsEnded[this.props.uid]) {
                  UserActions.getEditorPostsForUser(this.props.uid, this.props.editorPostsForUser[this.props.uid][this.props.editorPostsForUser[this.props.uid].length-1].snapshot);
                  this.setState({moreLoaderIsActive: true})
                }
              }} ended={this.props.editorPostsEnded[this.props.uid]} morePostsLoaderIsActive={this.state.moreLoaderIsActive} />
            ) : (
              <Loader active />
            )}
          </Tab.Pane>
      )}, {
        menuItem: 'Лайки и комментарии',
        render: () => (
          <Tab.Pane key='userActivity'>
            <Visibility fireOnMount={true} once={false} onBottomVisible={() => {
              if (!this.props.activityEnded[this.props.uid]) {
                UserActions.getActivityForUser(this.props.uid, this.props.activityForUser[this.props.uid][this.props.activityForUser[this.props.uid].length-1].snapshot);
                this.setState({moreLoaderIsActive: true})
              }
            }}>
              <Feed>
                {this.props.activityForUser[this.props.uid] ? (
                  this.props.activityForUser[this.props.uid].map((item, idx) => {
                    return (
                      <Feed.Event key={idx}>
                        <Feed.Label icon={item.type === 'upvote' ? 'heart' : 'comments'} />
                        <Feed.Content>
                          <Feed.Date>{moment(item.timestamp).fromNow()}</Feed.Date>
                          <Feed.Summary>
                            {item.type === 'upvote' ? 'Поставил(а) лайк посту ' : 'Прокомментировал(а) пост '}
                            <Link to={{ pathname: '/post/' + item.postID }}>{item.postID}</Link>
                          </Feed.Summary>
                        </Feed.Content>
                      </Feed.Event>
                    )
                  })
                ) : (
                  <Loader active />
                )}
              </Feed>
            </Visibility>
            <Divider hidden />
            {this.props.activityForUser[this.props.uid] && !this.props.activityEnded[this.props.uid] && !this.state.moreLoaderIsActive ? (
              <Button fluid onClick={() => {
                if (!this.props.activityEnded[this.props.uid]) {
                  UserActions.getActivityForUser(this.props.uid, this.props.activityForUser[this.props.uid][this.props.activityForUser[this.props.uid].length-1].snapshot);
                  this.setState({moreLoaderIsActive: true})
                }
              }}>...</Button>
            ) : (
              <Loader size='big' active={this.state.moreLoaderIsActive} inline='centered'/>
            )}
          </Tab.Pane>
      )},
    ];
    return(
      <Tab menu={{ fluid: true, vertical: this.state.width  < 768 ? false : true, stackable: true, attached: false, tabular: false, secondary: true }} panes={panes} />
    )
  }

  render() {
    return(
      this.props.users && this.props.users[this.props.uid] ? (
        <Container>
          <Helmet>
            <title>{this.props.users[this.props.uid].name} | btw.kz</title>
            <meta name='description' content='Краудсорсинговый информационный портал' />
            <meta property='og:image' content='https://firebasestorage.googleapis.com/v0/b/btw-kz.appspot.com/o/logo-square-1024.png?alt=media&token=7c0b442b-ac8f-4779-9da7-2fb1228a2e89' />
          </Helmet>
          <Header style={{ marginTop: '20px' }} dividing icon size='large' textAlign='center' >
            <ProfileImage circular facebookUID={this.props.users[this.props.uid]['facebookUID']} facebookSize='large' />
            <Header.Content>
              {this.props.users[this.props.uid].name}
              <Header.Subheader>
                {this.props.users[this.props.uid].description}
              </Header.Subheader>
            </Header.Content>
          </Header>
          {this.renderTabs()}
        </Container>
      ) : (
        <Loader active />
      )
    )
  }
}

export default UserInfo;
