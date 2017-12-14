import React, { Component } from 'react';
import ReactGA from 'react-ga';
import './App.css';
import Homepage from './components/pages/Homepage';
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from './stores/DefaultStore';
import Actions from './actions/Actions';
import { Route, BrowserRouter, Link } from 'react-router-dom';
import SinglePostPage from './components/pages/SinglePostPage';
import AboutPage from './components/pages/AboutPage';
import NewPostPage from './components/pages/NewPostPage';
import ProfilePage from './components/pages/ProfilePage';
import { Menu, Input, Container, Image, Icon, Dropdown, Modal, Button } from 'semantic-ui-react';

@connectToStores
class App extends Component {
  constructor(props) {
    super(props);
    Actions.initSession();
    // Add your tracking ID created from https://analytics.google.com/analytics/web/#home/
    ReactGA.initialize('UA-110404917-1');
    // This just needs to be called once since we have no routes in this case.
    ReactGA.pageview(window.location.pathname);
  }

  static getStores(props) {
    return [DefaultStore];
  }

  static getPropsFromStores(props) {
    return DefaultStore.getState();
  }

  renderProfileOrLoginMenuItem() {
    if (this.props.user) {
      return (
        <Dropdown trigger={<Image src={this.props.user.photoURL} size='mini' circular />} item>
          <Dropdown.Menu>
            <Dropdown.Item as={Link} to='/profile'>Профиль</Dropdown.Item>
            <Dropdown.Item onClick={function(){Actions.logout()}}>Выйти</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )
    } else {
      return (
        <Modal trigger={<Menu.Item>Войти/Регистрация</Menu.Item>} dimmer='blurring'>
          <Modal.Header>Авторизация</Modal.Header>
          <Modal.Content>
            Регистрация и авторизация проходят через Facebook
          </Modal.Content>
          <Modal.Actions>
            <Button color='facebook' onClick={function(){Actions.login()}}>
              <Icon name='facebook' /> Войти через Facebook
            </Button>
          </Modal.Actions>
        </Modal>
      )
    }
  }

  renderNewPostMenuItem() {
    if (this.props.user) {
      return (
        <Dropdown trigger={<div><Icon name='add' size='large'/>Добавить</div>} item>
          <Dropdown.Menu>
            <Dropdown.Item icon='calendar' text='Ивент' as={Link} to='/newPost' />
            <Dropdown.Item icon='map signs' text='Место' as={Link} to='/newPost' />
            <Dropdown.Item icon='rocket' text='Продукт' as={Link} to='/newPost' />
            <Dropdown.Item icon='percent' text='Акция' as={Link} to='/newPost' />
            <Dropdown.Item icon='music' text='Музыка' as={Link} to='/newPost' />
            <Dropdown.Item icon='film' text='Кино' as={Link} to='/newPost' />
            <Dropdown.Item icon='newspaper' text='Событие' as={Link} to='/newPost' />
          </Dropdown.Menu>
        </Dropdown>
      )
    }
  }

  render() {
    return (
      <BrowserRouter>
        <section>
          <br />
          <Container>
            <Menu stackable>
              <Menu.Item header as={Link} to='/'><Icon name='coffee' fitted/>btw.kz</Menu.Item>
              <Menu.Item as={Link} to='/about'>О проекте</Menu.Item>
              <Menu.Menu position='right'>
                <Menu.Item><Input className='icon' icon='search' placeholder='Искать...' /></Menu.Item>
                {this.renderNewPostMenuItem()}
                {this.renderProfileOrLoginMenuItem()}
              </Menu.Menu>
            </Menu>
          </Container>
          <br />
          <Route exact path='/' component={Homepage}/>
          <Route path='/about' component={AboutPage}/>
          <Route path='/profile' component={ProfilePage}/>
          <Route path='/newPost' component={NewPostPage}/>
          <Route path='/post/:id' component={SinglePostPage}/>
        </section>
      </BrowserRouter>
    );
  }
}

export default App;
