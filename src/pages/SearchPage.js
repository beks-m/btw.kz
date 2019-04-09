import React, { Component } from 'react';
import { Container, Icon, Segment, Card, Image, Label, Grid, Divider, Menu, Table, Statistic, Radio } from 'semantic-ui-react';
import ReactGA from 'react-ga';
import { InstantSearch, SearchBox, Highlight, Pagination, CurrentRefinements, ClearAll, PoweredBy } from 'react-instantsearch/dom';
import { connectHits, connectMenu, connectRefinementList } from 'react-instantsearch/connectors';
import { iconForType, nameForType, randomColor } from '../utils/contentFunctions';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const CustomHits = connectHits(({ hits }) =>
  <Card.Group doubling stackable itemsPerRow={3}>
    {hits.map(hit =>
      <Card key={hit.objectID}>
        {hit.media && hit.media[0] ? (
          <Image src={hit.media[0].thumbnail} as={Link} to={{ pathname: '/post/' + hit.objectID }}/>
        ) : (
          <Container>
            <Segment style={{ border: '0px', cursor: 'pointer' }} basic attached='top' inverted color={randomColor()} onClick={() => {
              this.props.history.push({
                pathname: '/post/' + hit.objectID,
              });
            }} >
              <Statistic inverted>
                <Statistic.Value text>
                  {hit.name}
                </Statistic.Value>
              </Statistic>
            </Segment>
          </Container>
        )}
        <Card.Content>
          <Card.Header>
            <Highlight attributeName="name" hit={hit} as={Link} to={{ pathname: '/post/' + hit.objectID }} />
          </Card.Header>
          <Card.Meta>
            <span className='date'>
              <Icon name={iconForType(hit.type)} /> {nameForType(hit.type)}
            </span>
          </Card.Meta>
          <Card.Description>
            <Highlight attributeName="shortDescription" hit={hit} />
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Icon name='heart' />
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
            <Radio checked={item.isRefined} onClick={e => {
              e.preventDefault();
              refine(item.value);
            }}/>
          </Table.Cell>
          <Table.Cell><Icon name={iconForType(item.label)} />{nameForType(item.label)}</Table.Cell>
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
    ReactGA.pageview(window.location.pathname + window.location.search, 'Search page');
  }

  render() {
    return (
      <Container>
        <Helmet>
          <title>Поиск | btw.kz</title>
          <meta name='description' content='Краудсорсинговый информационный портал' />
          <meta property='og:image' content='https://firebasestorage.googleapis.com/v0/b/btw-kz.appspot.com/o/logo-square-1024.png?alt=media&token=7c0b442b-ac8f-4779-9da7-2fb1228a2e89' />
        </Helmet>
        <br />
        <Image fluid rounded src='img/banner.jpg' alt='btw.kz'/>
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
          <Grid divided stackable>
            <Grid.Column width={4}>
              <PoweredBy />
              <Divider />
              <CurrentRefinements/>
              <Divider hidden fitted/>
              <ClearAll/>
              <Divider horizontal>Фильтр по типу</Divider>
              <TypeFilter attributeName="type"/>
              {/* <Divider horizontal>По тэгам</Divider>
              <TagFilter attributeName="tags"/> */}
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
