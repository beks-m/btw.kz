import React, { Component } from 'react';
import connectToStores from 'alt-utils/lib/connectToStores';
import PostsStore from '../stores/PostsStore';
import DefaultStore from '../stores/DefaultStore';
import PostsActions from '../actions/PostsActions';
import { Container, Header, Icon, Loader, Grid, Divider, Dropdown, Menu } from 'semantic-ui-react';
import ReactGA from 'react-ga';
import PostGrid from '../components/PostGrid';
import ScrollToTop from '../components/ScrollToTop';
import * as moment from 'moment';
import 'moment/locale/ru';
import { iconForType, nameForType } from '../utils/contentFunctions';
import { Link } from 'react-router-dom';

// legacy class before events and promos
@connectToStores
class TimedPostsPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      type: this.props.location.pathname.split('/')[1],
      activeItem: 'date'
    }
    // check if links is just events without date
    if (!this.props.match.params.date) {
      var date = moment().utcOffset('+0600').format('DD-MM-YYYY');
      this.props.history.replace('/' + this.state.type + '/' + date)
    }
    PostsActions.getTimedPostsForDate(this.props.match.params.date, this.props.city);
    ReactGA.pageview(window.location.pathname, this.state.type[0].toUpperCase() + this.state.type.slice(1) + ' - ' + this.props.match.params.date);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({type: nextProps.location.pathname.split('/')[1]});
  }

  static getStores() {
    return [DefaultStore, PostsStore];
  }

  static getPropsFromStores() {
    return {
      ...DefaultStore.getState(),
      ...PostsStore.getState()
    }
  }

  render() {
    return (
      <Container>
        <ScrollToTop/>
        <Divider hidden />

        <Menu secondary pointing widths={2}>
          <Menu.Item name='date' content='Просмотр по датам' active={this.state.activeItem === 'date'} onClick={() => {this.setState({activeItem: 'date'})}} />
          <Menu.Item name='tags' content='Просмотр по тэгам' active={this.state.activeItem === 'tags'} onClick={() => {this.setState({activeItem: 'tags'})}} />
        </Menu>

        <Divider hidden />
        <Grid verticalAlign='middle'>
          <Grid.Column width={8}>
            <Header size='large' >
              <Icon name={iconForType(this.state.type.slice(0, -1))} />
              <Header.Content>
                {moment(this.props.match.params.date, 'DD-MM-YYYY').calendar(null, {
                  sameDay: '[Сегодня]',
                  nextDay: '[Завтра]',
                  lastDay: '[Вчера]',
                  lastWeek: 'D MMMM YYYY',
                  nextWeek: 'D MMMM YYYY',
                  sameElse: 'D MMMM YYYY',
                })}
                {this.props.timedPostsForDate[this.props.match.params.date] &&
                  <Header.Subheader>
                    Всего - {this.props.timedPostsForDate[this.props.match.params.date].length || '0'}
                  </Header.Subheader>
                }
              </Header.Content>
            </Header>
          </Grid.Column>
          <Grid.Column textAlign='right' width={8}>
            <Dropdown text={nameForType(this.state.type.slice(0, -1), true)} icon='filter' floating labeled button className='icon'>
              <Dropdown.Menu>
                <Dropdown.Header content='Выберите тип' />
                <Dropdown.Divider />
                <Dropdown.Item value='all' icon={iconForType('timedPost')} text={nameForType('timedPost')} as={Link} to={'/timedPosts/' + this.props.match.params.date} />
                <Dropdown.Item value='event' icon={iconForType('event')} text={nameForType('event', true)} as={Link} to={'/events/' + this.props.match.params.date} />
                <Dropdown.Item value='promo' icon={iconForType('promo')} text={nameForType('promo', true)} as={Link} to={'/promos/' + this.props.match.params.date} />
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown text='Дата' icon='calendar' floating labeled button className='icon'>
              <Dropdown.Menu>
                <Dropdown.Header content='Выберите дату' />
                <Dropdown.Divider />
                <Dropdown.Item text='Сегодня' />
                <Dropdown.Item text='Завтра' />
                <Dropdown.Item text='Суббота' />
                <Dropdown.Item text='Воскресенье' />
                <Dropdown.Item text='Другое' />
              </Dropdown.Menu>
            </Dropdown>
          </Grid.Column>
        </Grid>
        <Divider />

        {this.props[this.state.type + 'ForDate'][this.props.match.params.date] ? (
          <PostGrid posts={this.props[this.state.type + 'ForDate'][this.props.match.params.date]} loadMorePosts={()=>{}} ended={true} morePostsLoaderIsActive={false} />
        ) : (
          <Loader active />
        )}
      </Container>
    );
  }
}

export default TimedPostsPage;
