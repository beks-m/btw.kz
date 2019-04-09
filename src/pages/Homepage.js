import React, { Component } from 'react';
import PostList from '../components/PostList'
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../stores/DefaultStore';
import PostsStore from '../stores/PostsStore';
import PostsActions from '../actions/PostsActions';
import { Container, Image, Grid, Loader, Menu, Button, Visibility, Header, Segment, Icon, Responsive, Divider, Accordion } from 'semantic-ui-react';
import { Helmet } from 'react-helmet';
import ReactGA from 'react-ga';
import * as moment from 'moment';
import 'moment/locale/ru';
import { iconForType, nameForType } from '../utils/contentFunctions';
import { Link } from 'react-router-dom';

@connectToStores
class Homepage extends Component {

  static getStores() {
    return [DefaultStore, PostsStore];
  }

  static getPropsFromStores() {
    return {
      ...DefaultStore.getState(),
      ...PostsStore.getState()
    }
  }

  constructor(props) {
    super(props);
    this.todayDate = moment().utcOffset('+0600').format('DD-MM-YYYY');
    this.state = {
      activeType: 'allPosts',
      nextDayLoaderIsActive: false,
      width: window.innerWidth,
      eventsOpen: window.innerWidth < 500 ? false : true,
      promosOpen: window.innerWidth < 500 ? false : true,
      socialMediaOpen: window.innerWidth < 500 ? false : true,
      filterOpen: window.innerWidth < 500 ? false : true,
      postsOpen: true
    }
    this.postLists = [];
    PostsActions.getPosts(this.todayDate, this.props.city);
    PostsActions.getTimedPostsForDate(this.todayDate, this.props.city);
    ReactGA.pageview(window.location.pathname, 'Homepage');
  }

  componentWillReceiveProps(nextProps) {
    this.setState({nextDayLoaderIsActive: false});
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

  loadEarlierPosts = () => {
    var date = moment().subtract(this.postLists.length, 'days').utcOffset('+0600').format('DD-MM-YYYY');
    ReactGA.event({
      category: 'Post List Interaction',
      action: 'Load previous day',
      value: this.postLists.length
    });
    PostsActions.getPosts(date, this.props.city);
    this.setState({nextDayLoaderIsActive: true})
  }

  renderPostLists() {
    this.postLists = [];
    var count = 1;
    for (var date in this.props.posts) {
      this.postLists.push(<PostList key={date} date={date} authorizedUser={this.props.user}  idx={count} city={this.props.city} postList={this.props.posts[date][this.state.activeType]} upvotes={this.props.upvotes} history={this.props.history} loadEarlierPosts={this.loadEarlierPosts}/>);
      count = count + 1;
    }
    if (this.postLists.length) {
      return (
        <Visibility fireOnMount={true} once={false} onBottomVisible={this.loadEarlierPosts}>
          {this.postLists}
          {this.state.nextDayLoaderIsActive ? (
            <Loader size='big' active={this.state.nextDayLoaderIsActive} inline='centered'/>
          ) : (
            <Button fluid basic onClick={this.loadEarlierPosts}>Загрузить более ранние посты...</Button>
          )}
        </Visibility>
      )
    } else {
      return(<Loader active size='big' />)
    }
  }

  filterByType = (e, data) => {
    this.setState({ activeType: data.name });
    var action = 'Show only ' + data.name
    ReactGA.event({
      category: 'Post List Interaction',
      action: action
    });
  }

  renderTypeFilter() {
    return(
      <Accordion fluid>
        <Accordion.Title as='h3' style={{marginBottom: 0, marginTop: 0, paddingTop: 0, paddingBottom: '4px'}} active={this.state.filterOpen} onClick={() => {this.setState({ filterOpen: !this.state.filterOpen })}}>
          <Icon name='dropdown' />
          Фильтр
        </Accordion.Title>
        <Accordion.Content active={this.state.filterOpen} style={this.state.width < 500 ? {marginBottom: '14px'} : null}>
          <Menu fluid vertical>
            {/* <Menu.Item>
              <Header as='h3' textAlign='center'>
              <Header.Content>
              Фильтр
              </Header.Content>
              </Header>
            </Menu.Item> */}
            <Menu.Item name='allPosts' active={this.state.activeType === 'allPosts'} onClick={this.filterByType}>Все посты</Menu.Item>
            <Menu.Item name='productPosts' active={this.state.activeType === 'productPosts'} onClick={this.filterByType}><Icon name={iconForType('product')} />{nameForType('product', true)}</Menu.Item>
            <Menu.Item name='eventPosts' active={this.state.activeType === 'eventPosts'} onClick={this.filterByType}><Icon name={iconForType('event')} />{nameForType('event', true)}</Menu.Item>
            <Menu.Item name='placePosts' active={this.state.activeType === 'placePosts'} onClick={this.filterByType}><Icon name={iconForType('place')} />{nameForType('place', true)}</Menu.Item>
            <Menu.Item name='promoPosts' active={this.state.activeType === 'promoPosts'} onClick={this.filterByType}><Icon name={iconForType('promo')} />{nameForType('promo', true)}</Menu.Item>
            <Menu.Item name='contentPosts' active={this.state.activeType === 'contentPosts'} onClick={this.filterByType}><Icon name={iconForType('content')} />{nameForType('content', true)}</Menu.Item>
          </Menu>
        </Accordion.Content>
      </Accordion>
    )
  }

  renderEvents() {
    return(
      <Accordion fluid>
        <Accordion.Title as='h3' style={{marginBottom: 0, marginTop: 0, paddingTop: 0, paddingBottom: '4px'}} active={this.state.eventsOpen} onClick={() => {this.setState({ eventsOpen: !this.state.eventsOpen })}}>
          <Icon name='dropdown' />
          {nameForType('event', true)} на сегодня
        </Accordion.Title>
        <Accordion.Content active={this.state.eventsOpen} style={this.state.width < 500 ? {marginBottom: '14px'} : null}>
          <Segment.Group>
            {/* <Segment>
              <Header as='h5' textAlign='center'>
                {nameForType('event', true)} на сегодня
              </Header>
            </Segment> */}
            {this.props.eventsForDate[this.todayDate] ? (
              [this.props.eventsForDate[this.todayDate].length ? (
                this.props.eventsForDate[this.todayDate].map((item, idx) => {
                  return <Segment key={idx} clearing>
                    <div style={{color: 'rgb(119, 119, 119)', paddingBottom: '0.1rem', fontSize: '0.8em'}}>
                      <Icon name='clock' style={{marginRight: '0.20rem'}} />
                      {moment(item.startDate).isBefore(moment().startOf('day')) ? moment(item.startDate).calendar(null, {
                          lastDay: 'Вчера',
                          sameElse: 'DD/MM'
                      }) : moment(item.startDate).format('H:mm')} - {moment(item.endDate).isAfter(moment().endOf('day')) ? moment(item.endDate).calendar(null, {
                          nextDay: 'Завтра',
                          sameElse: 'DD/MM'
                      }) : moment(item.endDate).format('H:mm')}
                    </div>
                    <Header size='small' as={Link} to={{ pathname: '/posts/' + item.id, post: item }}>
                      <Header.Content>
                        {item.name}
                      </Header.Content>
                    </Header>
                    <div style={{color: 'rgb(119, 119, 119)', paddingTop: '0.1rem', fontSize: '0.8em'}}>
                      {Object.keys(item.tags) && Object.keys(item.tags).length && (
                        <span><Icon style={{marginRight: '0.15rem'}} name='tag'/>{Object.keys(item.tags)[0] + '  '}</span>
                      )}
                      <Icon style={{marginRight: '0.15rem'}} name='heart' />{item.upvoteCount + ' '}
                    </div>
                  </Segment>
                })
              ) : (
                <Segment key='noEvents'><p align='center'>К сожалению, на сегодня ничего нет <span role="img" aria-label="sorry">🤷‍</span></p></Segment>
              ),
              <Segment key='moreEvents' style={{cursor: 'pointer'}} secondary compact onClick={() => {
                this.props.history.push({pathname: '/events/'});
              }}>
                <span style={{position: 'absolute', top: '0.25rem'}}>
                  Все {nameForType('event', true).toLowerCase()}
                </span>
                <Icon style={{position: 'absolute', right: '0.5rem', top: '0.4rem'}} name='arrow circle right'/>
              </Segment>]
            ) : (
              <Segment loading><Image src='img/paragraph.png' /></Segment>
            )}
          </Segment.Group>
        </Accordion.Content>

      </Accordion>
    )
  }

  renderPromos() {
    return(
      <Accordion fluid>
        <Accordion.Title as='h3' style={{marginBottom: 0, marginTop: 0, paddingTop: 0, paddingBottom: '4px'}} active={this.state.promosOpen} onClick={() => {this.setState({ promosOpen: !this.state.promosOpen })}}>
          <Icon name='dropdown' />
          Активные {nameForType('promo', true).toLowerCase()}
        </Accordion.Title>
        <Accordion.Content active={this.state.promosOpen} style={this.state.width < 500 ? {marginBottom: '14px'} : null}>
          <Segment.Group>
            {/* <Segment>
              <Header as='h5' textAlign='center'>
              Активные {nameForType('promo', true).toLowerCase()}
              </Header>
            </Segment> */}
            {this.props.promosForDate[this.todayDate] ? (
              [this.props.promosForDate[this.todayDate].length ? (
                this.props.promosForDate[this.todayDate].map((item, idx) => {
                  return <Segment key={idx} clearing>
                    <div style={{color: 'rgb(119, 119, 119)', paddingBottom: '0.1rem', fontSize: '0.8em'}}>
                      <Icon name='clock' style={{marginRight: '0.20rem'}} />
                      {moment(item.startDate).isBefore(moment().startOf('day')) ? moment(item.startDate).calendar(null, {
                        lastDay: 'Вчера',
                        sameElse: 'DD/MM'
                      }) : moment(item.startDate).format('H:mm')} - {moment(item.endDate).isAfter(moment().endOf('day')) ? moment(item.endDate).calendar(null, {
                        nextDay: 'Завтра',
                        sameElse: 'DD/MM'
                      }) : moment(item.endDate).format('H:mm')}
                    </div>
                    <Header size='small' as={Link} to={{ pathname: '/posts/' + item.id, post: item }}>
                      <Header.Content>
                        {item.name}
                      </Header.Content>
                    </Header>
                    <div style={{color: 'rgb(119, 119, 119)', paddingTop: '0.1rem', fontSize: '0.8em'}}>
                      {Object.keys(item.tags) && Object.keys(item.tags).length && (
                        <span><Icon style={{marginRight: '0.15rem'}} name='tag'/>{Object.keys(item.tags)[0] + '  '}</span>
                      )}
                      <Icon style={{marginRight: '0.15rem'}} name='heart' />{item.upvoteCount + ' '}
                    </div>
                  </Segment>
                })
              ) : (
                <Segment key='noPromos'><p align='center'>К сожалению, на сегодня ничего нет <span role="img" aria-label="sorry">🤷‍</span></p></Segment>
              ),
              <Segment key='morePromos' style={{cursor: 'pointer'}} secondary compact onClick={() => {
                this.props.history.push({pathname: '/promos/'});
              }}>
                <span style={{position: 'absolute', top: '0.25rem'}}>
                  Все {nameForType('promo', true).toLowerCase()}
                </span>
                <Icon style={{position: 'absolute', right: '0.5rem', top: '0.4rem'}} name='arrow circle right'/>
              </Segment>]
            ) : (
              <Segment loading><Image src='img/paragraph.png' /></Segment>
            )}
          </Segment.Group>
        </Accordion.Content>
      </Accordion>
    )
  }

  renderSocialMedia() {
    return(
      <Accordion fluid>
        <Accordion.Title as='h3' style={{marginBottom: 0, marginTop: 0, paddingTop: 0, paddingBottom: '4px'}} active={this.state.socialMediaOpen} onClick={() => {this.setState({ socialMediaOpen: !this.state.socialMediaOpen })}}>
          <Icon name='dropdown' />
          О btw.kz
        </Accordion.Title>
        <Accordion.Content active={this.state.socialMediaOpen} style={this.state.width < 500 ? {marginBottom: '14px'} : null}>
          <Segment.Group size='tiny'>
            {/* <Segment>
              <Header as='h5' textAlign='center'>
              О btw.kz
              </Header>
            </Segment> */}
            <Segment >
              Посты по запуску интересных продуктов, открытию каких-то новых мест, проведению вдохновляющих мероприятий/воркшопов, в общем по всему тому, за чем стоят труды душевных людей в Казахстане. Любой желающий может добавить пост. <Link to={{ pathname: '/about/'}}>Подробнее...</Link>
            </Segment>
            <Segment textAlign='center'>
              <Icon name='telegram' size='large' link onClick={() => {window.open('https://t.me/btwkz', '_blank')}}/>
              <Icon name='facebook' size='large' link onClick={() => {window.open('https://www.facebook.com/btwkz', '_blank')}}/>
              <Icon name='instagram' size='large' link onClick={() => {window.open('https://www.instagram.com/btwkz/', '_blank')}}/>
            </Segment>
          </Segment.Group>
        </Accordion.Content>
      </Accordion>
    )
  }

  renderMeta() {
    return(
      <Helmet>
        <title>btw.kz</title>
        <meta name='description' content='Краудсорсинговый информационный портал' />
        <meta property='og:title' content='btw.kz' />
        <meta property='og:image' content='https://firebasestorage.googleapis.com/v0/b/btw-kz.appspot.com/o/logo-square-1024.png?alt=media&token=7c0b442b-ac8f-4779-9da7-2fb1228a2e89' />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='btw.kz'/>
        <meta property='og:description' content='Краудсорсинговый информационный портал' />
        <meta property='fb:app_id' content='668812386840509' />
        <meta property='og:url' content='https://btw.kz'/>
        <meta name='twitter:card' content='summary' />
        <meta name='twitter:domain' value='btw.kz' />
        <meta name='twitter:title' value='btw.kz' />
        <meta name='twitter:description' value='Краудсорсинговый информационный портал' />
        <meta name='twitter:image' content='https://firebasestorage.googleapis.com/v0/b/btw-kz.appspot.com/o/logo-square-1024.png?alt=media&token=7c0b442b-ac8f-4779-9da7-2fb1228a2e89' />
      </Helmet>
    )
  }

  render() {
    if (this.state.width < 500) {
      return (
        <Container>
          {this.renderMeta()}
          <br />
          <Image fluid rounded src='img/banner.jpg' alt='btw.kz'/>
          <br />
          {this.renderSocialMedia()}
          {this.renderEvents()}
          {this.renderPromos()}
          <Accordion fluid>
            <Accordion.Title as='h3' style={{marginBottom: 0, marginTop: 0, paddingTop: 0, paddingBottom: '4px'}} active={this.state.postsOpen} onClick={() => {this.setState({ postsOpen: !this.state.postsOpen })}}>
              <Icon name='dropdown' />
              Посты
            </Accordion.Title>
            <Accordion.Content active={this.state.postsOpen}>
              {this.renderPostLists()}
            </Accordion.Content>
          </Accordion>
        </Container>
      )
    } else {
      return(
        <Container>
          {this.renderMeta()}
          <br />
          <Image fluid rounded src='img/banner.jpg' alt='btw.kz'/>
          <br />
          <Grid stackable>
            <Grid.Column computer={3} only='computer'>
              {this.renderTypeFilter()}
              <Divider hidden />
              {this.renderSocialMedia()}
            </Grid.Column>
            <Grid.Column computer={10} tablet={11} mobile={16}>
              {this.renderPostLists()}
            </Grid.Column>
            <Grid.Column computer={3} tablet={5} mobile={16}>
              {this.state.width < 1000 && (
                this.renderSocialMedia()
              )}
              {this.state.width < 1000 && (
                <Divider hidden />
              )}
              {this.renderEvents()}
              <Divider hidden />
              {this.renderPromos()}
            </Grid.Column>
          </Grid>
        </Container>
      )
    }
  }

}

export default Homepage;
