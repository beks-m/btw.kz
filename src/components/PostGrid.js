import React, { Component } from 'react';
import { Container, Icon, Card, Loader, Image, Button, Divider, Visibility, Segment, Statistic, Label } from 'semantic-ui-react';
import { iconForType, nameForType, randomColor } from '../utils/contentFunctions';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import * as moment from 'moment';
import 'moment/locale/ru';

class PostGrid extends Component {

  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth
    }
  }

  componentWillMount() {
    window.addEventListener('resize', this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  handleWindowSizeChange = () => {
    this.setState({ width: window.innerWidth });
  };

  render() {
    return(
      this.props.posts && this.props.posts.length ? (
        <Container>
          {this.state.width < 768 && <br />}
          <Visibility fireOnMount={true} once={false} onBottomVisible={this.props.loadMorePosts}>
            <Card.Group doubling stackable itemsPerRow={4}>
              {this.props.posts.map(post =>
                <Card key={post.id}>
                  {post.media && post.media.length ? (
                    <Image src={post.media[0].thumbnail} as={Link} to={{ pathname: '/posts/' + post.id, post: post }} label={{ content: nameForType(post.type), icon: iconForType(post.type), ribbon: true }}/>
                  ) : (
                    <div>
                      <Segment style={{ border: '0px', cursor: 'pointer' }} attached='top' inverted color={randomColor()} onClick={() => {
                        this.props.history.push({
                            pathname: '/posts/' + post.id,
                            post: post,
                        });
                      }} >
                        <Label icon={iconForType(post.type)} content={nameForType(post.type)} ribbon />
                        <Statistic inverted>
                          <Statistic.Value text>
                            {post.name}
                          </Statistic.Value>
                        </Statistic>
                      </Segment>
                    </div>
                  )}

                  <Card.Content>
                    <Card.Header as={Link} to={{ pathname: '/posts/' + post.id, post: post }}>
                      {post.name}
                    </Card.Header>
                    <Card.Meta>
                      {post.startDate && (
                        <div>
                          <Icon name='clock' />
                          <span className='date'>
                            {moment(post.endDate).isBefore(moment()) ? 'Уже закончилось ' : moment(post.startDate).calendar() + ' - ' + moment(post.endDate).calendar()}
                          </span>
                        </div>
                      )}
                    </Card.Meta>
                    <Card.Description>
                      {post.shortDescription}
                    </Card.Description>
                  </Card.Content>
                  <Card.Content extra>
                    <Icon name='heart' />
                    {post.upvoteCount + '   '}
                    <Icon name='comments' />
                    {post.commentCount}
                    {' '}
                    <Icon name='tag' />
                    {Object.keys(post.tags).map((object, idx) => {
                      return <span key={idx}>{object}{idx !== Object.keys(post.tags).length-1 ? ', ' : null}</span>;
                    })}
                  </Card.Content>
                </Card>
              )}
            </Card.Group>
          </Visibility>
          <Divider hidden />
          {this.props.posts && !this.props.ended && !this.props.morePostsLoaderIsActive ? (
            <Button fluid onClick={this.props.loadMorePosts}>...</Button>
          ) : (
            <Loader size='big' active={this.props.morePostsLoaderIsActive} inline='centered'/>
          )}
        </Container>
      ) : (
        <Container>
          <p align='center'>Постов, к сожалению, нет <span role="img" aria-label="sorry">🤷‍</span></p>
        </Container>
      )
    )
  }

}

export default withRouter(PostGrid);
