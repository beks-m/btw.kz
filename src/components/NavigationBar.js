import React, { Component } from 'react';
import { Container, Menu, Icon, Modal, Button, Dropdown, Image, Search, Responsive, Divider, Label } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../stores/DefaultStore';
import Actions from '../actions/Actions';
import ReactGA from 'react-ga';
import algoliasearch from 'algoliasearch';
import { withRouter } from 'react-router';
import { iconForType, nameForType } from '../utils/contentFunctions';
import ProfileImage from './ProfileImage.js';

@connectToStores
class NavigationBar extends Component {
  constructor(props) {
    super(props);

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

  // componentWillReceiveProps(nextProps) {
  //   console.log(this.props)
  //   if (this.props.user && nextProps.user && this.props.user.roles !== nextProps.user.roles) {
  //     console.log('fd')
  //     this.forceUpdate();
  //   }
  // }

  handleCityChange = (e, { value }) => {
    Actions.changeCity(value);
  }

  handleResultSelect = (e, { result }) => {
    if (result.type === 'last') {
      this.props.history.push('/search', this.state.value);
    } else {
      this.props.history.push('/post/' + result.objectID);
    }
    this.setState({value: ''});
  }

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value });
    // only query string
    this.searchIndex.search({ query: value }, (err, content) => {
      if (err) {
        console.error(err);
        return;
      }
      var results = {};
      for (var h in content.hits) {
        results[content.hits[h].objectID] = {
          type: content.hits[h].type,
          tag: Object.keys(content.hits[h].tags)[0],
          results: [{
            title: content.hits[h].name,
            image: content.hits[h].media && content.hits[h].media[0] ? content.hits[h].media[0].thumbnail : '',
            description: content.hits[h].shortDescription,
            price: '❤️ ' + content.hits[h].upvoteCount,
            objectID: content.hits[h].objectID
          }]
        }
      }
      results['last'] = {
        type: 'last',
        results: [{
          title: content.hits.length ? '...' : 'Ничего не найдено 😕',
          description: 'Нажмите сюда для открытия расширенного поиска',
          type: 'last'
        }]
      }
      this.setState({
        isLoading: false,
        results: results
      })
    });
  }

  // common function to handle all Inputs' onChange
  handleInputChange = (e, { name, value }) => {
    e.preventDefault();
    this.setState({ [name]: value, loginFieldEmptyError: false });
  }

  renderLoginModal() {
    return(
      <Modal trigger={<Dropdown.Item>Войти/Регистрация</Dropdown.Item>} dimmer='blurring' onOpen={function(){
        ReactGA.modalview('Login Modal');
        ReactGA.event({
            category: 'Login',
            action: 'Opened login modal',
        });
      }}>
        <Modal.Header>Авторизация</Modal.Header>
        <Modal.Content>
          {/* <Container textAlign='center'>
            <Message negative hidden={!this.state.loginFieldEmptyError}>
              <Message.Header>Заполните, пожалуйста, оба поля для продолжения</Message.Header>
            </Message>
            <Message negative hidden={!this.props.loginIncorrectError}>
              <Message.Header>Логин или пароль не совпадают с нашими данными 😕</Message.Header>
            </Message>
            <Input style={{width: '50%'}} iconPosition='left' name='loginFieldValue' placeholder='Email' onChange={this.handleInputChange} error={this.state.loginFieldEmptyError || this.props.loginIncorrectError}>
              <Icon name='at' />
              <input />
            </Input>
            <br />
            <br />
            <Input style={{width: '50%'}} type="password" iconPosition='left' name='passwordFieldValue' placeholder='Пароль' onChange={this.handleInputChange} error={this.state.loginFieldEmptyError || this.props.loginIncorrectError}>
              <Icon name='lock' />
              <input />
            </Input>
          </Container> */}
          Авторизация и регистрация происходят через Facebook
        </Modal.Content>
        <Modal.Actions>
          {/*   <Button onClick={() => {
            if ((this.state.loginFieldValue && this.state.loginFieldValue !== '') || (this.state.passwordFieldValue && this.state.passwordFieldValue !== '')) {
              ReactGA.event({
            category: 'Login',
            action: 'Clicked login button',
            label: 'Email'
              });
              Actions.loginWithEmail(this.state.loginFieldValue, this.state.passwordFieldValue);
            } else {
              this.setState({loginFieldEmptyError: true});
            }

            }}>
            <Icon name='envelope' /> Войти через email
          </Button> */}
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
    )
  }

  renderComputerMenu() {
    return([
      <Dropdown key='city' placeholder='Выберите город' options={this.cities} value={this.props.city} onChange={this.handleCityChange} item />,
      <Menu.Item key='about' as={Link} to='/about'>О проекте</Menu.Item>,
      <Menu.Menu key='right' position='right'>
        <Menu.Item>
          <Search
            category
            noResultsMessage='Ничего не найдено 😕'
            loading={this.state.isLoading}
            onResultSelect={this.handleResultSelect}
            onSearchChange={this.handleSearchChange}
            results={this.state.results}
            value={this.state.value}
            categoryRenderer={({ type }) => {
              if (type==='last') {
                return(
                  <div style={{textAlign: 'center'}}>
                    <Image size='mini' src='img/algolia.png' inline />
                    <span>Search by Algolia</span>
                  </div>
                )
              } else {
                return(
                  <div style={{textAlign: 'center', fontSize: '0.8rem'}}><Icon name={iconForType(type)} size='big'/>{nameForType(type)}</div>
                )
              }
            }}
          />
        </Menu.Item>
        {this.props.user && (
          <Dropdown key='new' trigger='Добавить' item>
            <Dropdown.Menu>
              <Dropdown.Item icon={iconForType('product')} text={nameForType('product')} as={Link} to='/new/product' />
              <Dropdown.Item icon={iconForType('event')} text={nameForType('event')} as={Link} to='/new/event' />
              <Dropdown.Item icon={iconForType('place')} text={nameForType('place')} as={Link} to='/new/place' />
              <Dropdown.Item icon={iconForType('promo')} text={nameForType('promo')} as={Link} to='/new/promo' />
              <Dropdown.Item icon={iconForType('content')} text={nameForType('content')} as={Link} to='/new/content' />
            </Dropdown.Menu>
          </Dropdown>
        )}
        {this.props.user ? (
          <Dropdown key='profile' trigger={this.props.user.providerData[0].photoURL ? <ProfileImage facebookUID={this.props.user.providerData[0].uid} facebookSize='small' size='mini' circular /> : <Icon name='user' circular />} item>
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to='/profile'>Профиль</Dropdown.Item>
              {this.props.user.roles && this.props.user.roles.admin && (
                <Dropdown.Item as={Link} to='/admin'>Админка</Dropdown.Item>
              )}
              <Dropdown.Item onClick={function(){
                ReactGA.event({
                  category: 'Login',
                  action: 'Clicked logout button',
                });
                Actions.logout();
              }}>Выйти</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          this.renderLoginModal()
        )}
      </Menu.Menu>
    ])
  }

  render() {
    return (
      <Container>
        <Responsive as={Menu} {...Responsive.onlyMobile} borderless fixed='top'>
          <Menu.Menu position='left'>
            <Dropdown item icon='sidebar'>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to='/'>
                  <Icon name='home' />
                  На главную
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to='/about'>
                  <Icon name='coffee' />
                  О проекте
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to='/search'>
                  <Icon name='search' />
                  Поиск
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Header>
                  Город
                </Dropdown.Header>
                <Dropdown.Item onClick={() => {
                  Actions.changeCity('Almaty');
                }}>
                  <Icon name={this.props.city === 'Almaty' ? 'circle' : 'circle thin'} />
                  Алматы
                </Dropdown.Item>
                <Dropdown.Item onClick={() => {
                  Actions.changeCity('Astana');
                }}>
                  <Icon name={this.props.city === 'Astana' ? 'circle' : 'circle thin'} />
                  Астана
                </Dropdown.Item>
                <Dropdown.Divider />
                {this.props.user && ([
                  <Dropdown.Header key='add'>
                    Добавить
                  </Dropdown.Header>,
                  <Dropdown.Item key='product' icon={iconForType('product')} text={nameForType('product')} as={Link} to='/new/product' />,
                  <Dropdown.Item key='event' icon={iconForType('event')} text={nameForType('event')} as={Link} to='/new/event' />,
                  <Dropdown.Item key='place' icon={iconForType('place')} text={nameForType('place')} as={Link} to='/new/place' />,
                  <Dropdown.Item key='promo' icon={iconForType('promo')} text={nameForType('promo')} as={Link} to='/new/promo' />,
                  <Dropdown.Item key='content' icon={iconForType('content')} text={nameForType('content')} as={Link} to='/new/content' />,
                ])}
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Menu>
          <Menu.Item header as={Link} to='/'><Icon name='coffee' fitted/>btw.kz<Label style={{marginLeft: '4px', paddingLeft: '4px', paddingRight: '4px', paddingTop: '2px', paddingBottom: '2px'}} color='red'>beta</Label></Menu.Item>
          <Menu.Menu position='right'>
            <Dropdown trigger={this.props.user && this.props.user.providerData[0].photoURL ? <ProfileImage facebookUID={this.props.user.providerData[0].uid} facebookSize='small' size='mini' circular /> : <Icon name='user' />} item  icon={null}>
              <Dropdown.Menu>
                {this.props.user ? ([
                  <Dropdown.Item key='profileM' as={Link} to='/profile'>
                    <Icon name='user' />
                    Профиль
                  </Dropdown.Item>,
                  <Dropdown.Item key='loginM' onClick={function(){
                    ReactGA.event({
                        category: 'Login',
                        action: 'Clicked logout button',
                    });
                    Actions.logout();
                  }}>
                    <Icon name='log out' />
                    Выйти
                  </Dropdown.Item>
                ]) : (
                  this.renderLoginModal()
                )}
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Menu>
        </Responsive>
        <Responsive as={Divider} {...Responsive.onlyMobile} hidden />
        <Responsive as={Divider} {...Responsive.onlyMobile} hidden />
        <Responsive minWidth={Responsive.onlyTablet.minWidth} as={Menu} stackable>
          <Menu.Item header as={Link} to='/'><Icon name='coffee' fitted/>btw.kz<Label style={{borderTopRightRadius: '0'}} attached='top right' color='red'>beta</Label></Menu.Item>
          {this.renderComputerMenu()}
        </Responsive>
      </Container>
    )
  }
}

export default withRouter(NavigationBar);
