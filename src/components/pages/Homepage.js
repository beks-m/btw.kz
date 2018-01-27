import React, { Component } from 'react';
import PostList from '../postlist/PostList'
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../../stores/DefaultStore';
import Actions from '../../actions/Actions';
import { Container, Image, Grid, Loader, Menu, Button, Visibility, Header, Segment, Icon } from 'semantic-ui-react';
import {Helmet} from 'react-helmet';
import ReactGA from 'react-ga';
import * as moment from 'moment';
import 'moment/locale/ru';
import { iconForType, nameForType } from '../utils/contentFunctions';

@connectToStores
class Homepage extends Component {
  constructor(props) {
    super(props);
    this.todayDate = moment().utcOffset('+0600').format('L');
    this.state = {
      activeType: 'allPosts',
      nextDayLoaderIsActive: false
    }
    this.postLists = [];
    Actions.getPosts(this.todayDate, this.props.city);
    Actions.getEvents(this.todayDate, this.props.city);
    ReactGA.pageview('Homepage');
  }

  componentWillReceiveProps(nextProps) {
    this.setState({nextDayLoaderIsActive: false});
  }

  static getStores() {
    return [DefaultStore];
  }

  static getPropsFromStores() {
    return DefaultStore.getState();
  }

  addSamplePosts = () => {
    Actions.addSamplePosts();
  }

  loadEarlierPosts = () => {
    var date = moment().subtract(this.postLists.length, 'days').utcOffset('+0600').format('L');
    ReactGA.event({
      category: 'Post List Interaction',
      action: 'Load previous day',
      value: this.postLists.length
    });
    Actions.getPosts(date, this.props.city);
    this.setState({nextDayLoaderIsActive: true})
  }

  renderPostLists() {
    this.postLists = [];
    var count = 1;
    for (var date in this.props.posts) {
      this.postLists.push(<PostList key={date} date={date} authorizedUser={this.props.user}  idx={count} city={this.props.city} postList={this.props.posts[date][this.state.activeType]} upvotes={this.props.upvotes} history={this.props.history}/>);
      count = count + 1;
    }
    if (this.postLists.length) {
      return (
        <Visibility fireOnMount={true} once={false} onBottomVisible={this.loadEarlierPosts}>
          {this.postLists}
          {
            this.state.nextDayLoaderIsActive
              ? <Loader size='big' active={this.state.nextDayLoaderIsActive} inline='centered'/>
              : <Button fluid basic onClick={this.loadEarlierPosts}>Загрузить более ранние посты...</Button>
          }
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
      <Menu fluid vertical>
        <Menu.Item>
          <Header as='h3' textAlign='center'>
            <Header.Content>
              Фильтр
            </Header.Content>
          </Header>
        </Menu.Item>
        <Menu.Item name='allPosts' active={this.state.activeType === 'allPosts'} onClick={this.filterByType}>Все посты</Menu.Item>
        <Menu.Item name='productPosts' active={this.state.activeType === 'productPosts'} onClick={this.filterByType}><Icon name={iconForType('product')} />{nameForType('product', true)}</Menu.Item>
        <Menu.Item name='eventPosts' active={this.state.activeType === 'eventPosts'} onClick={this.filterByType}><Icon name={iconForType('event')} />{nameForType('event', true)}</Menu.Item>
        <Menu.Item name='placePosts' active={this.state.activeType === 'placePosts'} onClick={this.filterByType}><Icon name={iconForType('place')} />{nameForType('place', true)}</Menu.Item>
        <Menu.Item name='promoPosts' active={this.state.activeType === 'promoPosts'} onClick={this.filterByType}><Icon name={iconForType('promo')} />{nameForType('promo', true)}</Menu.Item>
      </Menu>
    )
  }

  renderEvents() {
    return(
      <Segment.Group>
        <Segment>
          <Header as='h3' textAlign='center'>
            Ивенты
          </Header>
        </Segment>
        {
          this.props.events[this.todayDate]
            ?
              this.props.events[this.todayDate].map((item, idx) => {
                return <Segment key={idx}>
                  {item.name}
                </Segment>
              })
            :
            <Segment loading></Segment>
        }
      </Segment.Group>
    )
  }

  render() {
    return (
      <section>
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
        <Container>
          <Image fluid rounded src='img/banner.jpg' alt='btw.kz'/>
        </Container>
        <br />
        <Container>
          <Grid stackable>
            <Grid.Column width={3}>
              {this.renderTypeFilter()}
            </Grid.Column>
            <Grid.Column width={10}>
              {this.renderPostLists()}
            </Grid.Column>
            <Grid.Column width={3}>
              {this.renderEvents()}
              <Button fluid onClick={this.addSamplePosts}>Add sample posts</Button>
            </Grid.Column>
          </Grid>
        </Container>
      </section>
    );
  }
}

export default Homepage;
