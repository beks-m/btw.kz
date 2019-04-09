import React, { Component } from 'react';
import connectToStores from 'alt-utils/lib/connectToStores';
import PostsStore from '../stores/PostsStore';
import DefaultStore from '../stores/DefaultStore';
import PostsActions from '../actions/PostsActions';
import { Container, Header, Icon, Loader, Grid, Divider } from 'semantic-ui-react';
import ReactGA from 'react-ga';
import PostGrid from '../components/PostGrid';
import ScrollToTop from '../components/ScrollToTop';
import { iconForType, nameForType } from '../utils/contentFunctions';
import { Helmet } from 'react-helmet';

@connectToStores
class PromosPage extends Component {

  constructor(props) {
    super(props);
    PostsActions.getActivePromos(this.props.city);
    PostsActions.getSoonPromos(this.props.city);
    ReactGA.pageview(window.location.pathname, 'Promos page');
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
          <title>{nameForType('promo', true) + ' на ' + this.props.match.params.date} | btw.kz</title>
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
          <Grid.Column width={16}>
            <Header size='large' >
              <Icon name={iconForType('promo')} />
              <Header.Content>
                {'Активные ' + nameForType('promo', true).toLowerCase()}
                {/* {this.props.timedPostsForDate[this.props.match.params.date] &&
                  <Header.Subheader>
                    Всего - {this.props.timedPostsForDate[this.props.match.params.date].length || '0'}
                  </Header.Subheader>
                } */}
              </Header.Content>
            </Header>
          </Grid.Column>
          {/* <Grid.Column textAlign='right' width={8}>
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
          </Grid.Column> */}
        </Grid>

        <Divider />

        {this.props.activePromos ? (
          <PostGrid posts={this.props.activePromos} loadMorePosts={()=>{}} ended={true} morePostsLoaderIsActive={false} />
        ) : (
          <Loader active />
        )}

        <Header size='large' >
          <Icon name={iconForType('promo')} />
          <Header.Content>
            Скоро
            {/* {this.props.timedPostsForDate[this.props.match.params.date] &&
              <Header.Subheader>
              Всего - {this.props.timedPostsForDate[this.props.match.params.date].length || '0'}
              </Header.Subheader>
            } */}
          </Header.Content>
        </Header>

        <Divider />

        {this.props.soonPromos ? (
          <PostGrid posts={this.props.soonPromos} loadMorePosts={()=>{}} ended={true} morePostsLoaderIsActive={false} />
        ) : (
          <Loader active />
        )}

      </Container>
    );
  }
}

export default PromosPage;
