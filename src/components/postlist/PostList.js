import React, { Component } from 'react';
import { Segment, Header, Button } from 'semantic-ui-react';
import PostListItem from './PostListItem';
import ReactGA from 'react-ga';
import * as moment from 'moment';
import 'moment/locale/ru';

class PostList extends Component {

  constructor(props) {
    super(props);
    this.state = {postCountLimit: 10};
  }

  loadMorePosts = () => {
    if (this.props.postList.length > 0) {
      var la = this.props.idx.toString();
      ReactGA.event({
        category: 'Post List Interaction',
        action: 'Load more posts',
        label: la
      });
      this.setState({postCountLimit: this.state.postCountLimit + 10});
    }
  }

  getDayName(date) {
    var string = moment(date, 'DD.MM.YYYY').calendar(null, {
      sameDay: 'Сегодня',
      lastDay: 'Вчера',
      lastWeek: 'dddd',
      sameElse: 'DD/MM/YYYY'
    });
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  render() {
    return (
      <div>
        <Segment.Group>
          <Segment>
            <Header as='h3'textAlign='center'>
              {this.getDayName(this.props.date)}
            </Header>
          </Segment>

          {
            this.props.postList.length
              ?
                this.props.postList.map((item, idx) => {
                  if (idx < this.state.postCountLimit) {
                    return <PostListItem key={idx} authorizedUser={this.props.authorizedUser}  history={this.props.history} {...item}/>
                  } else {
                    return null;
                  }
                })
              :
              <Segment><p align='center'>Постов, к сожалению, нет <span role="img" aria-label="sorry">🤷‍</span></p></Segment>
          }

          {
            this.props.postList.length < this.state.postCountLimit
            ?
            null
            :
            <Button basic attached='bottom' onClick={this.loadMorePosts}>{'Загрузить еще ' + (this.props.postList.length-this.state.postCountLimit) + '...'}</Button>
          }

        </Segment.Group>
        <br />
      </div>
    );
  }
}

export default PostList;
