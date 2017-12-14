import React, { Component } from 'react';
import PostList from '../postlist/PostList'
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../../stores/DefaultStore';
import Actions from '../../actions/Actions';
import { Container, Image, Grid, Loader} from 'semantic-ui-react';

@connectToStores
class Homepage extends Component {
  constructor(props) {
    super(props);
    Actions.getPosts();
  }

  static getStores() {
    return [DefaultStore];
  }

  static getPropsFromStores() {
    return DefaultStore.getState();
  }

  render() {
    return (
      <section>
        <Container>
          <Image fluid rounded src="img/banner.jpeg" alt="btw.kz"/>
        </Container>
        <br />
        <br />
        <Container>
          <Grid stackable divided>
            <Grid.Column width={3}>
              <h2>Left sidebar</h2>
            </Grid.Column>
            <Grid.Column width={10}>
              {
                this.props.posts.length
                ?
                <PostList postList={this.props.posts}/>
                :
                <Loader active size='big' />
              }
            </Grid.Column>
            <Grid.Column width={3}>
              <h2>Right sidebar</h2>
            </Grid.Column>
          </Grid>
        </Container>
      </section>
    );
  }
}

export default Homepage;
