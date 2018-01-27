import React, { Component } from 'react';
import { Container, Header, Icon, Segment, Card, Image, Label, Grid, Divider, Checkbox, Menu, Table } from 'semantic-ui-react';
import ReactGA from 'react-ga';
import {InstantSearch, SearchBox, Highlight, Pagination, CurrentRefinements, ClearAll, PoweredBy } from 'react-instantsearch/dom';
import { connectHits, connectMenu, connectRefinementList } from 'react-instantsearch/connectors';

const CustomHits = connectHits(({ hits }) =>
  <Card.Group doubling stackable itemsPerRow={3}>
    {hits.map(hit =>
      <Card key={hit.objectID}>
        <Image src={hit.media[0].thumbnail} />
        <Card.Content>
          <Card.Header>
            <Highlight attributeName="name" hit={hit} />
          </Card.Header>
          <Card.Meta>
            <span className='date'>
              {hit.type}
            </span>
          </Card.Meta>
          <Card.Description>
            <Highlight attributeName="description" hit={hit} />
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
            <Icon name='chevron up' />
            {hit.upvoteCount + '   '}
            <Icon name='comments' />
            {hit.commentCount}
        </Card.Content>
      </Card>
    )}
  </Card.Group>
);

const TypeFilter = connectMenu(({ refine, items }) =>
  <Table>
    <Table.Body>
      {items.map(item =>
        <Table.Row key={item.value}>
          <Table.Cell collapsing>
            <Checkbox checked={item.isRefined} onClick={e => {
                e.preventDefault();
                refine(item.value);
              }}/>
          </Table.Cell>
          <Table.Cell><Icon name='rocket' />{item.label}</Table.Cell>
          <Table.Cell>{item.count}</Table.Cell>
        </Table.Row>
      )}
    </Table.Body>
  </Table>
);

const TagFilter = connectRefinementList(({ refine, items }) =>
  <Segment>
    <Menu vertical fluid>
      {items.map(item =>
        <Menu.Item key={item.value} active={item.isRefined} onClick={e => {
            e.preventDefault();
            refine(item.value);
          }}>
          {item.isRefined
          ? <Label color='blue'>{item.count}</Label>
          : <Label>{item.count}</Label>}
          {item.label}
        </Menu.Item>
      )}
    </Menu>
  </Segment>
);

class SearchPage extends Component {

  constructor(props) {
    super(props);
    ReactGA.pageview('Search page');
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
        <Menu.Item name='productPosts' active={this.state.activeType === 'productPosts'} onClick={this.filterByType}><Icon name='rocket' />Только продукты</Menu.Item>
        <Menu.Item name='eventPosts' active={this.state.activeType === 'eventPosts'} onClick={this.filterByType}><Icon name='calendar' />Только ивенты</Menu.Item>
        <Menu.Item name='placePosts' active={this.state.activeType === 'placePosts'} onClick={this.filterByType}><Icon name='map signs' />Только места</Menu.Item>
        <Menu.Item name='promoPosts' active={this.state.activeType === 'promoPosts'} onClick={this.filterByType}><Icon name='percent' />Только промоакции</Menu.Item>
      </Menu>
    )
  }

  render() {
    return (
      <Container>
        <Container>
          <Image fluid rounded src='img/banner.jpg' alt='btw.kz'/>
        </Container>
        <br />
        <br />
        <br />
        <InstantSearch
          appId="XIN12YYIRV"
          apiKey="cb62d78aa7fee794413aef5ba3e58829"
          indexName="posts"
        >
          <Container textAlign='center'><SearchBox placeholder='Искать...' defaultRefinement={this.props.history.location.state}/></Container>
          <br />
          <br />
          <br />
          <Grid divided>
            <Grid.Column width={4}>
              <PoweredBy />
              <Divider />
              <CurrentRefinements/>
              <Divider />
              <ClearAll/>
              <Divider horizontal>Искать в...</Divider>
              <TypeFilter attributeName="type"/>
              <Divider horizontal>По тэгам</Divider>
              <TagFilter attributeName="tags"/>
            </Grid.Column>
            <Grid.Column width={12}>
              <CustomHits />
              <Pagination />
            </Grid.Column>
          </Grid>
        </InstantSearch>
      </Container>
    );
  }
}

export default SearchPage;
