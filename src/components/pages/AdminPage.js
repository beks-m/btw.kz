import React, { Component } from 'react';
import { Container, Header, Icon, Table, Button } from 'semantic-ui-react';
import ReactGA from 'react-ga';
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../../stores/DefaultStore';
import Actions from '../../actions/Actions';
import moment from 'moment';

@connectToStores
class AdminPage extends Component {

  constructor(props) {
    super(props);
    ReactGA.pageview('Admin page');
    Actions.getUnmoderatedPosts();
  }

  static getStores(props) {
    return [DefaultStore];
  }

  static getPropsFromStores(props) {
    return DefaultStore.getState();
  }

  render() {
    return (
      <Container>
        <Header size='huge' textAlign='center'>
          <Icon name='coffee' fitted />
          <Header.Content>
            Новые посты
          </Header.Content>
        </Header>

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
                  <Table.Cell><Button onClick={() => { this.props.history.push('/admin/unmoderatedPost/' + item.id, {unmoderatedPost: item}); }}>Модерировать</Button></Table.Cell>
                </Table.Row>
              })
            }
          </Table.Body>
        </Table>
      </Container>
    );
  }
}

export default AdminPage;
