import React, { Component } from 'react';
import { Container, Menu, Icon, Modal, Button, Dropdown, Image, Search } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../../stores/DefaultStore';
import Actions from '../../actions/Actions';
import ReactGA from 'react-ga';
import algoliasearch from 'algoliasearch';
import {withRouter} from 'react-router';
import { iconForType, nameForType } from '../utils/contentFunctions';

@connectToStores
class NavigationBar extends Component {
  constructor(props) {
    super(props);
    Actions.initSession();
    this.state = { isLoading: false, results: [], value: '' };

    this.cities = [
      { key: 1, text: 'Алматы', value: 'Almaty' },
      { key: 2, text: 'Астана', value: 'Astana' },
    ];
    var client = algoliasearch("XIN12YYIRV", "cb62d78aa7fee794413aef5ba3e58829");
    this.searchIndex = client.initIndex('posts');
  }

  static getStores(props) {
    return [DefaultStore];
  }

  static getPropsFromStores(props) {
    return DefaultStore.getState();
  }

  handleCityChange = (e, { value }) => {
    Actions.changeCity(value);
  }

  handleResultSelect = (e, { result }) => {
    if (result.date === 'search') {
      this.props.history.push('/search', this.state.value);
    } else {
      this.props.history.push('/posts/' + result.doc.date + '/' + result.doc.objectID);
    }
    this.setState({value: ''});
  }

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value });

    //get results
    var results = {};

    // only query string
    this.searchIndex.search({ query: value }, (err, content) => {
      if (err) {
        console.error(err);
        return;
      }

      for (var h in content.hits) {
        console.log(
          `Hit(${content.hits[h].objectID}): ${content.hits[h].toString()}`
        );
        results[content.hits[h].objectID] = {
          name: content.hits[h].type,
          results: [{
            title: content.hits[h].name,
            image: content.hits[h].media[0].thumbnail,
            description: content.hits[h].description.substring(0, 100).concat('...'),
            price: '🔼 ' + content.hits[h].upvoteCount,
            doc: content.hits[h]
          }]
        }
      }
      results['last'] = {
        name: '',
        results: [{
          description: 'Открыть все результаты...  Search by Algolia',
          date: 'search',
          image: 'img/algolia.png'
        }]
      }
      this.setState({
        isLoading: false,
        results: results
      })
    });

  }

  render() {
    return (
      <Container>
        <Menu stackable>
          <Menu.Item header as={Link} to='/'><Icon name='coffee' fitted/>btw.kz</Menu.Item>
          <Dropdown placeholder='Выберите город' options={this.cities} value={this.props.city} onChange={this.handleCityChange} item />
          <Menu.Item as={Link} to='/about'>О проекте</Menu.Item>
          <Menu.Menu position='right'>
            <Menu.Item>
              <Search
                category
                noResultsMessage='Ничего не найдено 😕'
                loading={this.state.isLoading}
                onResultSelect={this.handleResultSelect}
                onSearchChange={this.handleSearchChange}
                results={this.state.results}
                value={this.state.value}
              />
            </Menu.Item>
            {
              this.props.user
                ?
                  <Dropdown trigger={<div><Icon name='add'/>Добавить</div>} item>
                    <Dropdown.Menu>
                      <Dropdown.Item icon={iconForType('product')} text={nameForType('product')} as={Link} to='/new/product' />
                      <Dropdown.Item icon={iconForType('event')} text={nameForType('event')} as={Link} to='/new/event' />
                      <Dropdown.Item icon={iconForType('place')} text={nameForType('place')} as={Link} to='/new/place' />
                      <Dropdown.Item icon={iconForType('promo')} text={nameForType('promo')} as={Link} to='/new/promo' />
                    </Dropdown.Menu>
                  </Dropdown>
                :
              null
            }
            {
              this.props.user
              ?
              <Dropdown trigger={<Image src={this.props.user.photoURL} size='mini' circular />} item>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to='/profile'>Профиль</Dropdown.Item>
                  <Dropdown.Item onClick={function(){
                    ReactGA.event({
                      category: 'Login',
                      action: 'Clicked logout button',
                    });
                    Actions.logout();
                  }}>Выйти</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              :
              <Modal trigger={<Menu.Item>Войти/Регистрация</Menu.Item>} dimmer='blurring' onOpen={function(){
                ReactGA.modalview('Login Modal');
                ReactGA.event({
                  category: 'Login',
                  action: 'Opened login modal',
                });
              }}>
                <Modal.Header>Авторизация</Modal.Header>
                <Modal.Content>
                  Регистрация и авторизация проходят через Facebook
                </Modal.Content>
                <Modal.Actions>
                  <Button color='facebook' onClick={function(){
                    ReactGA.event({
                      category: 'Login',
                      action: 'Clicked login button',
                      label: 'Facebook'
                    });
                    Actions.login();
                  }}>
                    <Icon name='facebook' /> Войти через Facebook
                  </Button>
                </Modal.Actions>
              </Modal>
            }
          </Menu.Menu>
        </Menu>
      </Container>
    )
  }
}

export default withRouter(NavigationBar);
