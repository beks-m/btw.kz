import React, { Component } from 'react';
import connectToStores from 'alt-utils/lib/connectToStores';
import PostsStore from '../stores/PostsStore';
import DefaultStore from '../stores/DefaultStore';
import PostsActions from '../actions/PostsActions';
import { Container, Header, Icon, Loader, Grid, Divider, Dropdown } from 'semantic-ui-react';
import ReactGA from 'react-ga';
import PostGrid from '../components/PostGrid';
import ScrollToTop from '../components/ScrollToTop';
import * as moment from 'moment';
import 'moment/locale/ru';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-datepicker/dist/react-datepicker-cssmodules.css';
import { iconForType, nameForType } from '../utils/contentFunctions';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

@connectToStores
class EventsPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeItem: 'date',
      datePickerIsOpen: false
    }
    // check if links is just events without date
    if (!this.props.match.params.date) {
      var date = moment().utcOffset('+0600').format('DD-MM-YYYY');
      this.props.history.replace('/events/' + date)
    }
    ReactGA.pageview(window.location.pathname, 'Events page - ' + this.props.match.params.date);
    PostsActions.getTimedPostsForDate(this.props.match.params.date, this.props.city);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.date !== nextProps.match.params.date) {
      PostsActions.getTimedPostsForDate(nextProps.match.params.date, this.props.city);
    }
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
        <Helmet>
          <title>{nameForType('event', true) + ' на ' + this.props.match.params.date} | btw.kz</title>
          <meta name='description' content='Краудсорсинговый информационный портал' />
          <meta property='og:image' content='https://firebasestorage.googleapis.com/v0/b/btw-kz.appspot.com/o/logo-square-1024.png?alt=media&token=7c0b442b-ac8f-4779-9da7-2fb1228a2e89' />
        </Helmet>
        <Divider hidden />

        {/* <Menu secondary pointing widths={2}>
          <Menu.Item name='date' content='Просмотр по датам' active={this.state.activeItem === 'date'} onClick={() => {this.setState({activeItem: 'date'})}} />
          <Menu.Item name='tags' content='Просмотр по тэгам' active={this.state.activeItem === 'tags'} onClick={() => {this.setState({activeItem: 'tags'})}} />
          </Menu>
        <Divider hidden /> */}

        <Grid verticalAlign='middle'>
          <Grid.Column width={8}>
            <Header size='large' >
              <Icon name={iconForType('event')} />
              <Header.Content>
                {moment(this.props.match.params.date, 'DD-MM-YYYY').calendar(null, {
                  sameDay: '[Сегодня]',
                  nextDay: '[Завтра]',
                  lastDay: '[Вчера]',
                  lastWeek: 'D MMMM YYYY',
                  nextWeek: 'D MMMM YYYY',
                  sameElse: 'D MMMM YYYY',
                })}
                {/* {this.props.timedPostsForDate[this.props.match.params.date] &&
                  <Header.Subheader>
                    Всего - {this.props.timedPostsForDate[this.props.match.params.date].length || '0'}
                  </Header.Subheader>
                } */}
              </Header.Content>
            </Header>
          </Grid.Column>
          <Grid.Column textAlign='right' width={8}>
            <Dropdown text={this.props.match.params.date} icon='calendar' floating labeled button className='icon'>
              <Dropdown.Menu>
                <Dropdown.Header content='Выберите дату' />
                <Dropdown.Divider />
                <Dropdown.Item text='Сегодня' as={Link} to={'/events/' + moment().format('DD-MM-YYYY')} />
                <Dropdown.Item text='Завтра' as={Link} to={'/events/' + moment().add(1, 'days').format('DD-MM-YYYY')}/>
                <Dropdown.Item text='Суббота' as={Link} to={'/events/' + moment().day(6).format('DD-MM-YYYY')}/>
                <Dropdown.Item text='Воскресенье' as={Link} to={'/events/' + moment().day(7).format('DD-MM-YYYY')}/>
                <Dropdown.Item text='Другое' onClick={(e) => {e && e.preventDefault(); this.setState({datePickerIsOpen: true})}} />
              </Dropdown.Menu>
            </Dropdown>

            {this.state.datePickerIsOpen && (
              <DatePicker
                selected={moment(this.props.match.params.date, 'DD-MM-YYYY')}
                onChange={(date) => {
                  this.setState({datePickerIsOpen: false});
                  this.props.history.push('/events/' + date.format('DD-MM-YYYY'))
                }}
                inline
                withPortal
              />
            )}

          </Grid.Column>
        </Grid>

        <Divider />

        {this.props.eventsForDate[this.props.match.params.date] ? (
          <PostGrid posts={this.props.eventsForDate[this.props.match.params.date]} loadMorePosts={()=>{}} ended={true} morePostsLoaderIsActive={false} />
        ) : (
          <Loader active />
        )}
      </Container>
    );
  }
}

export default EventsPage;
