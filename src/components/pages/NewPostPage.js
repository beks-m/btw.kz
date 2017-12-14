import React, { Component } from 'react';
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../../stores/DefaultStore';
import { Container, Icon, Form, Input, Select, Button, Label, TextArea, Header, Segment, Divider, Modal, Image} from 'semantic-ui-react';
import Dropzone from 'react-dropzone'

@connectToStores
class NewPostPage extends Component {

  // TODO: add help buttons on each Field
  // TODO: remove required field popup on opening modal

  constructor(props) {
    super(props);
    this.categoryDropdownValues = [
      { key: 'e', icon: 'calendar', text: 'Ивент', value: 'event' },
      { key: 'pl', icon: 'map signs', text: 'Место', value: 'place' },
      { key: 'pr', icon: 'rocket', text: 'Продукт', value: 'product' },
      { key: 's', icon: 'percent', text: 'Акция', value: 'sales' },
      { key: 'mu', icon: 'music', text: 'Музыка', value: 'music' },
      { key: 'mo', icon: 'film', text: 'Кино', value: 'movie' },
      { key: 'n', icon: 'newspaper', text: 'Событие', value: 'news' },
    ];
    this.mediaDropdownValues = [
      { key: 'i', text: 'Image', value: 'image' },
      { key: 'y', text: 'Youtube', value: 'youtube' },
    ]
    this.state = {
      tag: '',
      tags: [],
      link: '',
      links: [],
      nameError: false,
      descriptionError: false,
      dropzoned: true,
      mediaPreviews: [],
      mediaModalOpen: false
    };
  }

  static getStores() {
    return [DefaultStore];
  }

  static getPropsFromStores() {
    return DefaultStore.getState();
  }

  // common function to handle all Inputs' onChange
  handleInputChange = (e, { name, value }) => this.setState({ [name]: value })

  // tags field

  renderTagsField() {
    return([
      <Form.Field key={0}>
        <label>Тэги</label>
        <Input
           name='tag'
           iconPosition='left'
           labelPosition='right'
           placeholder='Образование, Digital'
           onChange={this.handleInputChange}
           value={this.state.tag}
         >
         <Icon name='tag' />
         <input />
         <Label as='a' onClick={this.addTag}>Добавить</Label>
         </Input>
      </Form.Field>,
      <Form.Field key={1}>
        {
          this.state.tags.map((item, idx) => {
            return <Label tag key={idx}>{item}<Icon name='delete' onClick={() => {
              var currentState = this.state;
              currentState['tags'].splice(idx, 1);
              this.setState(currentState);
            }} /></Label>})
        }
      </Form.Field>
    ])
  }

  addTag = () => {
    var currentState = this.state;
    // TODO: split tags by comma
    currentState['tags'].push(this.state.tag);
    currentState['tag'] = '';
    this.setState(currentState);
  }

  // links field

  renderLinksField() {
    return([
      <Form.Field key={0}>
        <label>Ссылки</label>
        <Input placeholder='inmind.kz' type='text' iconPosition='left' labelPosition='right' name='link' onChange={this.handleInputChange} value={this.state.link}>
          <Icon name='globe' />
          <input />
          <Label as='a' onClick={this.addLink}>Добавить</Label>
        </Input>
      </Form.Field>,
      <Form.Field key={1}>
        {
          this.state.links.map((item, idx) => {
            return <Label key={idx}>{item}<Icon name='delete' onClick={() => {
              var currentState = this.state;
              currentState['links'].splice(idx, 1);
              this.setState(currentState);
            }} /></Label>
          })
        }
      </Form.Field>
    ])
  }

  addLink = () => {
    var currentState = this.state;
    currentState['links'].push(this.state.link);
    currentState['link'] = '';
    this.setState(currentState);
  }

  // add media field

  setDropzoneActive = () => {
    var currentState = this.state;
    currentState['dropzoned'] = false;
    this.setState(currentState);
  }

  setDropzoneInactive = () => {
    var currentState = this.state;
    currentState['dropzoned'] = true;
    this.setState(currentState);
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    acceptedFiles.forEach(file => {
      //req.attach(file.name, file);
      // add them to list of files to display
      var currentState = this.state;
      currentState['mediaPreviews'].push(URL.createObjectURL(file));
      currentState['mediaModalOpen'] = false;
      this.setState(currentState);

    });
  }

  deleteMediaPreview(idx) {
    var currentState = this.state;
    currentState['mediaPreviews'].splice(idx, 1);
    this.setState(currentState);
  }

  renderAddMediaModal() {
    return(
      <Modal onClose={() => {
        var currentState = this.state;
        currentState['mediaModalOpen'] = false;
        this.setState(currentState);
      }} open={this.state.mediaModalOpen} closeIcon>
        <Header icon='picture' content='Добавить медиа' />
        <Modal.Content>
          <Input placeholder='inmind.kz' type='text' iconPosition='left' labelPosition='right' name='link' onChange={this.handleInputChange} value={this.state.link}>
            <Icon name='globe' />
            <input />
            <Label as='a' onClick={this.addLink}>Добавить</Label>
          </Input>
          <Divider horizontal>или</Divider>
          <Segment as={Dropzone} onDrop={this.onDrop} onDragEnter={this.setDropzoneActive} onDragLeave={this.setDropzoneInactive} multiple textAlign='center' tertiary={this.state.dropzoned} disabled={this.state.dropzoned} padded='very'>
            Перетащите в эту область файлы для загрузки, либо нажмите для вызова стандартного загрузчика устройства
          </Segment>
        </Modal.Content>
        <Modal.Actions>
          <Button color='green'>
            <Icon name='checkmark' /> Yes
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }

  // component's main render function

  render() {
    return (
      <Container>

        {this.renderAddMediaModal()}

        <Header as='h2'>
          <Icon name='plus' />
          <Header.Content>
            Добавить новый пост
          </Header.Content>
        </Header>

        <Form>
          <Form.Field required error={this.state.nameError}>
            <label>Заголовок</label>
            <Input placeholder='Образовательный портал inmind.kz...' />
          </Form.Field>
          <Form.Field required error={this.state.descriptionError}>
            <label>Описание</label>
            <TextArea autoHeight placeholder='Inmind.kz - образовательная платформа и конструктор онлайн-курсов нового покаления на казахском языке. Мы разрабатываем алгоритмы адаптивного обучения, бесплатно сотрудничаем с авторами МООС и стараемся сделать мир лучше...' rows={4} />
          </Form.Field>

          {this.renderLinksField()}

          {this.renderTagsField()}

          <Form.Field>
            <label>Медиа</label>
              {
                this.state.mediaPreviews.map((item, idx) => {
                  return <Image spaced='right' key={idx} size='tiny' src={item} label={{ corner: 'right', icon: 'delete', onClick: () => this.deleteMediaPreview(idx) }}/>
                })
              }
              <Button icon='plus' size='massive' onClick={() => {
                var currentState = this.state;
                currentState['mediaModalOpen'] = true;
                this.setState(currentState);
              }}/>
          </Form.Field>



          <Form.Checkbox label='I agree to the Terms and Conditions' error />
        </Form>

      </Container>
    );
  }
}

export default NewPostPage;
