import React, { Component } from 'react';
import { Label, Button, Popup, Header, Image, Grid, Segment, Responsive, Divider, Statistic, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import UpvoteButton from '../components/UpvoteButton';
import { iconForType, nameForType, randomColor } from '../utils/contentFunctions';
import ReactGA from 'react-ga';
import * as moment from 'moment';

class PostListItem extends Component {

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
    return (
      <Segment clearing>
        <Label icon={iconForType(this.props.post.type)} content={nameForType(this.props.post.type)} ribbon />
        <Grid stackable>
          <Grid.Row verticalAlign='middle'>
            <Grid.Column width={5}>
              {this.props.post.media && this.props.post.media.length ? (
                <Image rounded src={this.props.post.media[0].thumbnail}
                  alt={this.props.post.name}
                  fluid
                  bordered
                  as={Link} to={{ pathname: '/posts/' + this.props.post.id, post: this.props.post }}
                />
              ) : (
                <Segment style={{cursor: 'pointer'}} inverted color={randomColor()} onClick={() => {
                  this.props.history.push({
                      pathname: '/posts/' + this.props.post.id,
                      post: this.props.post,
                  });
                }}>
                  <Statistic inverted size={this.state.width >= 1200 || this.state.width < 768 ? null : 'small'}>
                    <Statistic.Value text>
                      {this.props.post.name}
                    </Statistic.Value>
                  </Statistic>
                </Segment>
              )}

            </Grid.Column>
            <Grid.Column width={8}>
              <Header as={Link} to={{ pathname: '/posts/' + this.props.post.id, post: this.props.post }}><Header.Content>{this.props.post.name}</Header.Content></Header>
              <p>{this.props.post.shortDescription}</p>
              { this.props.post.startDate && (
                <section>
                  <Label basic style={{marginTop: '0.2rem'}}><Icon name='clock' style={{marginRight: '0rem'}}/></Label>
                  <Label basic content={moment(this.props.post.endDate).isBefore(moment()) ? 'Закончено' : moment(this.props.post.startDate).isBefore(moment()) ? 'Проходит сейчас' : moment(this.props.post.startDate).calendar()} />
                </section>
              )}
              <Label basic style={{marginTop: '0.2rem', marginLeft: '0rem'}}><Icon name='tag' style={{marginRight: '0rem'}}/></Label>
              {Object.keys(this.props.post.tags).map((object, idx) => {
                if (idx < 2) {
                  return <Label style={{marginTop: '0.2rem'}} as='a' key={idx} content={object} color={randomColor()} onClick={() => {
                    ReactGA.event({
                      category: 'Post List Interaction',
                      action: 'Tag click',
                      label: object
                    });
                    this.props.history.push('/tags/' + object);
                  }} />;
                }
              })}
            </Grid.Column>
            <Grid.Column width={3} textAlign='right'>
              <UpvoteButton post={this.props.post} pageName='Homepage'/>
              <Responsive
                minWidth={500}
              >
                <Divider fitted hidden />
              </Responsive>
              {this.props.authorizedUser ? (
                <Button
                  size='mini'
                  icon='comments'
                  label={{ basic: true, pointing: 'left', content: this.props.post.commentCount }}
                  onClick={() => {
                    ReactGA.event({
                        category: 'Post List Interaction',
                        action: 'Comment button click'
                    });
                    if (this.props.authorizedUser) {
                      this.props.history.push({
                          pathname: '/posts/' + this.props.post.id,
                          post: this.props.post,
                          comment: true
                      });
                    }
                  }}
                />
              ) : (
                <Popup
                  trigger={
                    <Label><Icon name='comments' />{this.props.post.commentCount}</Label>
                  }
                  content='Авторизуйтесь, чтобы оставить комментарий'
                  size='tiny'
                  position='left center'
                />
              )}
              <Responsive
                maxWidth={500}
              >
                <br />
              </Responsive>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }

}

export default PostListItem;
