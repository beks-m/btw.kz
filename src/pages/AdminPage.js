import React, { Component } from 'react';
import { Container, Header, Icon, Table, Button, Grid, Feed, Loader, Segment, Divider, Dropdown } from 'semantic-ui-react';
import ReactGA from 'react-ga';
import connectToStores from 'alt-utils/lib/connectToStores';
import AdminStore from '../stores/AdminStore';
import AdminActions from '../actions/AdminActions';
import moment from 'moment';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-datepicker/dist/react-datepicker-cssmodules.css';
import ProfileImage from '../components/ProfileImage';

@connectToStores
class AdminPage extends Component {

  constructor(props) {
    super(props);
    ReactGA.pageview(window.location.pathname, 'Admin page');
    this.state = {
      userActivityDate: 'Last'
    }
    AdminActions.getUnmoderatedPosts();
    AdminActions.getUnmoderatedComments();
    AdminActions.getUserActivityForDate();
    this.props.users && !this.props.users.length && AdminActions.getUsers();
  }

  static getStores(props) {
    return [AdminStore];
  }

  static getPropsFromStores(props) {
    return {
      ...AdminStore.getState()
    }
  }

  render() {
    return (
      <Container>
        <br />
        <br />

        <Grid>
          <Grid.Column width={13}>
            <Header size='large' textAlign='center'>
              <Icon name='coffee' fitted />
              <Header.Content>
                Немодерированные посты
              </Header.Content>
            </Header>
          </Grid.Column>
          <Grid.Column width={3}>
            <Button fluid onClick={() => {AdminActions.addSamplePosts()}}>Add sample post</Button>
          </Grid.Column>
        </Grid>

        {this.props.unmoderatedPosts ? (
          this.props.unmoderatedPosts.length ? (
            <Table color='red'>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Название</Table.HeaderCell>
                  <Table.HeaderCell>Категория</Table.HeaderCell>
                  <Table.HeaderCell>Hunter</Table.HeaderCell>
                  <Table.HeaderCell>Добавлено</Table.HeaderCell>
                  <Table.HeaderCell>Действие</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {
                  this.props.unmoderatedPosts.map((item, idx) => {
                    return <Table.Row key={idx} >
                      <Table.Cell>{item.name}</Table.Cell>
                      <Table.Cell>{item.type}</Table.Cell>
                      <Table.Cell>{item.hunterID}</Table.Cell>
                      <Table.Cell>{moment(item.timestamp).fromNow()}</Table.Cell>
                      <Table.Cell><Button onClick={() => { this.props.history.push('/admin/postEditor/' + item.id, {unmoderatedPost: item}); }}>Модерировать</Button></Table.Cell>
                    </Table.Row>
                  })
                }
              </Table.Body>
            </Table>
          ) : (
            <Segment textAlign='center' color='red'>{'Все отмодерировано 👌'}</Segment>
          )
        ) : (
          <Segment padded loading color='red'></Segment>
        )}

        <Divider section />

        <Grid>
          <Grid.Column width={13}>
            <Header size='large' textAlign='center'>
              <Icon name='comments' fitted />
              <Header.Content>
                Немодерированные комментарии
              </Header.Content>
            </Header>
          </Grid.Column>
          <Grid.Column width={3}>
          </Grid.Column>
        </Grid>

        {this.props.unmoderatedComments ? (
          this.props.unmoderatedComments.length ? (
            <Table color='blue'>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Пост</Table.HeaderCell>
                  <Table.HeaderCell>Автор</Table.HeaderCell>
                  <Table.HeaderCell>Содержимое</Table.HeaderCell>
                  <Table.HeaderCell>Добавлено</Table.HeaderCell>
                  <Table.HeaderCell>Действие</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {
                  this.props.unmoderatedComments.map((item, idx) => {
                    return <Table.Row key={idx} >
                      <Table.Cell><Link to={'/posts/' + item.postID}>{item.postID}</Link></Table.Cell>
                      <Table.Cell><Link to={'/users/' + item.userID}>{item.userID}</Link></Table.Cell>
                      <Table.Cell>{item.content}</Table.Cell>
                      <Table.Cell>{moment(item.timestamp).fromNow()}</Table.Cell>
                      <Table.Cell>
                        {this.state[item.id] ? (

                          this.props.commentStatuses[item.id] ? (
                            <Icon color='green' name='thumbs up' />
                          ) : (
                            <Icon color='red' name='thumbs down' />
                          )

                        ) : (
                          <div>
                            <Button icon disabled={this.state[item.id]} onClick={() => {
                              AdminActions.setCommentStatus(item.id, true);
                              this.setState({[item.id]: true})
                            }}>
                              <Icon color='green' name='thumbs up' />
                            </Button>
                            <Button icon disabled={this.state[item.id]} onClick={() => {
                              AdminActions.setCommentStatus(item.id, false);
                              this.setState({[item.id]: true})
                            }}>
                              <Icon color='red' name='thumbs down' />
                            </Button>
                          </div>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  })
                }
              </Table.Body>
            </Table>
          ) : (
            <Segment textAlign='center' color='blue'>{'Все отмодерировано 👌'}</Segment>
          )
        ) : (
          <Segment padded loading color='blue'></Segment>
        )}

        <Divider section />

        <Grid>
          <Grid.Column width={13}>
            <Header size='large' textAlign='center'>
              <Icon name='feed' fitted />
              <Header.Content>
                Активность пользователей
              </Header.Content>
            </Header>
          </Grid.Column>
          <Grid.Column width={3} textAlign='right'>
            <Dropdown text={this.state.userActivityDate} icon='calendar' floating labeled button className='icon'>
              <Dropdown.Menu>
                <Dropdown.Header content='Выберите дату' />
                <Dropdown.Divider />
                <Dropdown.Item text='Последние 20' onClick={() => {
                  this.setState({userActivityDate: 'Last'});
                }} />
                <Dropdown.Item text='Сегодня' onClick={() => {
                  this.setState({userActivityDate: moment().utcOffset('+0600').format('DD-MM-YYYY')});
                  AdminActions.getUserActivityForDate(moment().utcOffset('+0600').format('DD-MM-YYYY'));
                }} />
                <Dropdown.Item text='Вчера' onClick={() => {
                  this.setState({userActivityDate: moment().utcOffset('+0600').subtract(1, 'days').format('DD-MM-YYYY')});
                  AdminActions.getUserActivityForDate(moment().utcOffset('+0600').subtract(1, 'days').format('DD-MM-YYYY'));
                }} />
                <Dropdown.Item text='Другое' onClick={(e) => {e && e.preventDefault(); this.setState({datePickerIsOpen: true})}} />
              </Dropdown.Menu>
            </Dropdown>
            {this.state.datePickerIsOpen && (
              <DatePicker
                onChange={(date) => {
                  this.setState({datePickerIsOpen: false});
                  this.setState({userActivityDate: date.format('DD-MM-YYYY')});
                  AdminActions.getUserActivityForDate(date.format('DD-MM-YYYY'));
                }}
                inline
                withPortal
              />
            )}
          </Grid.Column>
        </Grid>

        <Segment color='green'>
          <Feed>
            {this.props.userActivity[this.state.userActivityDate] ? (
              this.props.userActivity[this.state.userActivityDate].map((item, idx) => {
                return (
                  <Feed.Event key={idx}>
                    <Feed.Label icon={item.type === 'upvote' ? 'heart' : 'comments'} />
                    <Feed.Content>
                      <Feed.Date>{moment(item.timestamp).fromNow()}</Feed.Date>
                      <Feed.Summary>
                        <Link to={{ pathname: '/users/' + item.userID }}>{item.userID}</Link>
                        {item.type === 'upvote' ? ' поставил(а) лайк посту ' : ' прокомментировал(а) пост '}
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
        </Segment>

        <Divider section />

        <Grid>
          <Grid.Column width={13}>
            <Header size='large' textAlign='center'>
              <Icon name='user' fitted />
              <Header.Content>
                Пользователи
              </Header.Content>
            </Header>
          </Grid.Column>
          <Grid.Column width={3}>
          </Grid.Column>
        </Grid>

        <Table color='yellow' attached={this.props.users && this.props.users.length && !this.props.usersEnded ? 'top' : null}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Фото</Table.HeaderCell>
              <Table.HeaderCell>Имя</Table.HeaderCell>
              <Table.HeaderCell>Дата регистрации</Table.HeaderCell>
              <Table.HeaderCell>Ссылка на фейсбук</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              this.props.users.map((item, idx) => {
                return <Table.Row key={idx} >
                  <Table.Cell><ProfileImage avatar facebookUID={item.facebookUID} facebookSize='small' /></Table.Cell>
                  <Table.Cell><Link to={'/users/' + item.userID}>{item.name}</Link></Table.Cell>
                  <Table.Cell>{moment(item.registeredOn).calendar()}</Table.Cell>
                  <Table.Cell><a href={'https://facebook.com/' + item.facebookUID} target='_blank'>Facebook</a></Table.Cell>
                </Table.Row>
              })
            }
          </Table.Body>
        </Table>
        {this.props.users && this.props.users.length && !this.props.usersEnded && (
          <Button attached='bottom' onClick={() => {AdminActions.getUsers(this.props.users[this.props.users.length - 1].snapshot)}}>...</Button>
        )}

      </Container>
    );
  }
}

export default AdminPage;
