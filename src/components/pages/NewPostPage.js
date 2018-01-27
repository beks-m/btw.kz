import React, { Component } from 'react';
import Actions from '../../actions/Actions';
import connectToStores from 'alt-utils/lib/connectToStores';
import DefaultStore from '../../stores/DefaultStore';
import { Container, Icon, Form, Input, Select, Button, Label, Header, Segment, Divider, Modal, Image, Popup, Search, Message, TextArea, Accordion, Radio, Dropdown, Grid, Progress, Dimmer, Loader } from 'semantic-ui-react';
import Dropzone from 'react-dropzone';
import ReactGA from 'react-ga';
import RichTextEditor from '../utils/react-rte-semantic/RichTextEditor';
import PropTypes from 'prop-types';
import algoliasearch from 'algoliasearch';
import Interweave from 'interweave';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-datepicker/dist/react-datepicker-cssmodules.css';
import { YMaps, Map, Placemark } from 'react-yandex-maps';
import scrollToComponent from 'react-scroll-to-component';
import { encode } from 'node-base64-image';
import ImageCompressor from 'image-compressor.js';
import { allStrings } from './NewPostPageStrings';

@connectToStores
class NewPostPage extends Component {

  constructor(props) {
    super(props);

    Actions.clearNewPostProps();

    this.state = {
        activeSectionIndexes: {0: true, 1: false, 2: false, 3: false},
        nameFieldValue: '',
        nameFieldValueError: false,
        startDate: null,
        startDateFieldValueError: false,
        endDate: null,
        endDateFieldValueError: false,
        shortDescriptionFieldValue: '',
        shortDescriptionFieldValueError: false,
        AlmatyFieldValue: (this.props.city === 'Almaty'),
        AstanaFieldValue: (this.props.city === 'Astana'),
        publishNextDayField: false,
        cityFieldValueError: false,
        locationCoordinatesFieldValueError: false,
        locationAddressFieldValue: null,
        locationCommentFieldValue: '',
        linkFieldValue: '',
        links: [],
        linkFieldValueError: false,
        tagSearchFieldValue: '',
        tags: [],
        tagSearchIsLoading: false,
        tagSearchResults: [],
        tagSearchFieldValueError: false,
        dropzoned: true,
        mediaPreviews: [],
        mediaModalOpen: false,
        mediaModalLoading: false,
        media: [],
        mediaLink: '',
        mediaType: 'image',
        descriptionFieldValue: RichTextEditor.createEmptyValue(),
        descriptionFocusedStyle: null,
        hunterOrMakerValue: 'hunter',
        commentFieldValue: '',
        showSinglePostPreview: false,
        showPostListPreview: false,
        termsFieldValue: false,
        termsFieldValueError: false,
        successModalIsOpen: false
    };

    this.locationCoordinatesFieldValue = null;

    this.mapCenter = (this.props.city === 'Almaty') ? [43.242051, 76.939534] : [51.128433, 71.430546];

    if (this.props.unmoderatedPost) { // to allow embeding this page into moderation page
      this.state.activeSectionIndexes = {0: true, 1: true, 2: true, 3: true};
      this.state.type = this.props.unmoderatedPost.type;
      this.state.nameFieldValue = this.props.unmoderatedPost.name;
      if (this.props.unmoderatedPost.startDate) {
        this.state.startDate = moment(this.props.unmoderatedPost.startDate, 'DD.MM.YYYY');
        this.state.endDate = moment(this.props.unmoderatedPost.endDate, 'DD.MM.YYYY');
      }
      this.state.shortDescriptionFieldValue = this.props.unmoderatedPost.shortDescription;
      this.state.AlmatyFieldValue = this.props.unmoderatedPost.Almaty;
      this.state.AstanaFieldValue = this.props.unmoderatedPost.Astana;
      this.state.publicationDateFieldValue = moment(this.props.unmoderatedPost.publicationDate, 'DD.MM.YYYY');
      if (this.props.unmoderatedPost.locationCoordinates) {
        this.locationCoordinatesFieldValue = this.props.unmoderatedPost.locationCoordinates;
        this.mapCenter = this.props.unmoderatedPost.locationCoordinates;
        this.state.locationAddressFieldValue = this.props.unmoderatedPost.locationAddress;
        this.state.locationCommentFieldValue = this.props.unmoderatedPost.locationComment;
      }
      this.state.links = this.props.unmoderatedPost.links;
      this.state.tags = this.props.unmoderatedPost.tags;
      this.state.descriptionFieldValue = RichTextEditor.createValueFromString(this.props.unmoderatedPost.description, 'html');
      this.state.postIDFieldValue = this.props.unmoderatedPost.id;
      this.state.hunterOrMakerValue = this.props.unmoderatedPost.makers && this.props.unmoderatedPost.hunterID === this.props.unmoderatedPost.makers[0] ? 'maker' : 'hunter';
      this.state.commentFieldValue = this.props.unmoderatedPost.comment;
      this.state.termsFieldValue = true;
      this.state.editors = [];
      this.state.media = this.props.unmoderatedPost.media;
      var mediaPreviews = [];
      for (var i in this.props.unmoderatedPost.media) {
        if (this.props.unmoderatedPost.media[i].type === 'image') {
          mediaPreviews.push(this.props.unmoderatedPost.media[i].link);
        } else { // youtube
          mediaPreviews.push(this.props.unmoderatedPost.media[i].thumbnail);
        }
      }
      this.state.mediaPreviews = mediaPreviews;
    } else {
      ReactGA.pageview('New post page');
      this.state.type = this.props.match.params.type;
    }

    // algolia search
    const client = algoliasearch("XIN12YYIRV", "cb62d78aa7fee794413aef5ba3e58829");
    this.searchIndex = client.initIndex('tags');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match) {
      this.setState({ type: nextProps.match.params.type });
    }
  }

  static getStores() {
    return [DefaultStore];
  }

  static getPropsFromStores() {
    return DefaultStore.getState();
  }

  static propTypes = {
    onChange: PropTypes.func
  };

  // common function to handle all Inputs' onChange
  handleInputChange = (e, { name, value }) => {
    e.preventDefault();
    var errorString = name + 'Error';
    this.setState({ [name]: value, [errorString]: false });
  }

  handleSectionTitleClick = (e, titleProps) => {
    const { index } = titleProps;
    var newActiveSectionIndexes = this.state.activeSectionIndexes;
    newActiveSectionIndexes[index] = !newActiveSectionIndexes[index];
    this.setState({ activeSectionIndexes: newActiveSectionIndexes });
  }

  // first section - name and Tagline

  renderSection0() {
    return([
      <Accordion.Title key='01' active={this.state.activeSectionIndexes[0]} index={0} onClick={this.handleSectionTitleClick}>
        <Icon name='dropdown' />
        <span style={{fontSize:'1.2em'}}><b>{allStrings[this.state.type]['section0Title']}</b></span>
      </Accordion.Title>,
      <Accordion.Content key='02' active={this.state.activeSectionIndexes[0]}>
        <Segment>
          <Form>
            <Form.Field required error={this.state.nameFieldValueError}>
              <label ref={(c) => {this.nameFieldInput = c}}>{allStrings[this.state.type]['nameFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                <Interweave tagName="div" content={allStrings[this.state.type]['nameFieldPopup']}/>
              </Popup></label>
              <Input maxLength='100' name='nameFieldValue' placeholder={allStrings[this.state.type]['nameFieldPlaceholder']} onChange={this.handleInputChange} defaultValue={this.state.nameFieldValue} />
            </Form.Field>

            {
              this.state.type === 'event' || this.state.type === 'promo'
                ?
                  <Form.Field>
                    <Grid stackable>
                      <Grid.Column width={5}>
                        <Form.Field required error={this.state.startDateFieldValueError}>
                          <label ref={(input) => { this.startDateFieldInput = input; }}>{allStrings[this.state.type]['startDateFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                            <Interweave tagName="div" content={allStrings[this.state.type]['startDateFieldPopup']}/>
                          </Popup></label>
                          <DatePicker
                            selected={this.state.startDate}
                            placeholderText='20 января 2018 г., 12:30'
                            onChange={(date) => { this.setState({startDate: date}); }}
                            showTimeSelect
                            timeFormat='HH:mm'
                            locale='ru'
                            dateFormat='LLL'
                            className='dateInput'
                          />
                        </Form.Field>
                      </Grid.Column>
                      <Grid.Column width={5}>
                        <Form.Field required error={this.state.endDateFieldValueError}>
                          <label ref={(input) => { this.endDateFieldInput = input; }}>{allStrings[this.state.type]['endDateFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                            <Interweave tagName="div" content={allStrings[this.state.type]['endDateFieldPopup']}/>
                          </Popup></label>
                          <DatePicker
                            selected={this.state.endDate}
                            placeholderText='22 января 2018 г., 21:30'
                            onChange={(date) => { this.setState({endDate: date});}}
                            showTimeSelect
                            locale='ru'
                            dateFormat='LLL'
                            className='dateInput'
                          />
                        </Form.Field>
                      </Grid.Column>
                    </Grid>
                  </Form.Field>
                :
              null
            }

            <Form.Field required error={this.state.shortDescriptionFieldValueError}>
              <label ref={(c) => {this.shortDescriptionFieldInput = c}}>{allStrings[this.state.type]['shortDescriptionFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                <Interweave tagName="div" content={allStrings[this.state.type]['shortDescriptionFieldPopup']}/>
              </Popup></label>
              <TextArea autoHeight maxLength='200' name='shortDescriptionFieldValue' placeholder={allStrings[this.state.type]['shortDescriptionFieldPlaceholder']} onChange={this.handleInputChange} defaultValue={this.state.shortDescriptionFieldValue} />
            </Form.Field>

            <Form.Group inline>
              <Form.Field required error={this.state.cityFieldValueError}>
                <label ref={(c) => {this.cityFieldInput = c}}>{allStrings[this.state.type]['cityFieldLabel']}<Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                  <Interweave tagName="div" content={allStrings[this.state.type]['cityFieldPopup']}/>
                </Popup></label>
              </Form.Field>
              {
                this.state.type === 'event' || this.state.type === 'place'
                  ?
                    [<Form.Field key='Almaty' control={Radio} label='Алматы' error={this.state.cityFieldValueError} checked={this.state.AlmatyFieldValue} onChange={() => { this.setState({ AlmatyFieldValue: true, AstanaFieldValue: false }) }} />,
                    <Form.Field key='Astana' control={Radio} label='Астана' error={this.state.cityFieldValueError} checked={this.state.AstanaFieldValue} onChange={() => { this.setState({ AlmatyFieldValue: false, AstanaFieldValue: true }) }} />]
                  :
                  [<Form.Checkbox key='Almaty' label='Алматы' error={this.state.cityFieldValueError} onChange={() => { this.setState({AlmatyFieldValue: !this.state.AlmatyFieldValue, cityFieldValueError: false}); }} checked={this.state.AlmatyFieldValue}/>,
                <Form.Checkbox key='Astana' label='Астана' error={this.state.cityFieldValueError} onChange={() => {this.setState({AstanaFieldValue: !this.state.AstanaFieldValue, cityFieldValueError: false})}} checked={this.state.AstanaFieldValue}/>]
              }
            </Form.Group>

            {
              this.state.type !== 'product'
                ?
                  <Form.Field required={this.state.type === 'place'} error={this.state.locationCoordinatesFieldValueError}>
                    <label ref={(c) => {this.locationFieldInput = c}}>{allStrings[this.state.type]['locationFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                      <Interweave tagName='div' content={allStrings[this.state.type]['locationFieldPopup']}/>
                    </Popup></label>
                    <Segment.Group>
                      <Segment>
                        <Grid verticalAlign='middle' stackable>
                          <Grid.Column width={3}>
                            <Form.Field><label>Выбранное расположение</label></Form.Field>
                          </Grid.Column>
                          <Grid.Column width={13}>

                            {
                              this.state.locationAddressFieldValue
                                ?
                                  <span>{this.state.locationAddressFieldValue}<i>{'   (' + this.locationCoordinatesFieldValue[0] + ', ' + this.locationCoordinatesFieldValue[1] + ')'}</i></span>
                                :
                                <i>Расположение не выбрано, Вы можете выбрать расположение нажав на карту ниже</i>
                            }

                          </Grid.Column>
                        </Grid>
                      </Segment>
                      {
                        this.state.locationAddressFieldValue
                          ?
                            <Segment>
                              <Grid stackable>
                                <Grid.Column width={3}>
                                  <Form.Field><label>Комментарий к расположению</label></Form.Field>
                                </Grid.Column>
                                <Grid.Column width={13}>
                                  <Form.Input maxLength='200' name='locationCommentFieldValue' placeholder={allStrings[this.state.type]['locationCommentFieldPlaceholder']} onChange={this.handleInputChange} />
                                </Grid.Column>
                              </Grid>
                            </Segment>
                          :
                        null
                      }
                      <Segment>
                        <YMaps>
                          <Map state={{ center: this.mapCenter, zoom: 16}} options={{yandexMapDisablePoiInteractivity: true, suppressMapOpenBlock: true }} width='inherit' onClick={(e) => {
                            var coords = e.get('coords');
                            this.placemark.geometry.setCoordinates(coords);
                            this.locationCoordinatesFieldValue = coords;
                          }}
                            instanceRef={(yandexMap) => {
                              if (yandexMap) {
                                this.yandexMap = yandexMap;
                                this.yandexMapSearch = yandexMap.controls.get('searchControl');
                                this.yandexMapSearch.options.set('noPlacemark', 'true');
                                this.yandexMapSearch.events.add('resultselect', (e) => {
                                  var results = this.yandexMapSearch.getResultsArray();
                                  this.placemark.geometry.setCoordinates(results[e.get('index')]['geometry'].getCoordinates());
                                  this.yandexMap.setCenter(results[e.get('index')]['geometry'].getCoordinates());
                                });
                              }
                            }} >

                            <Placemark
                              geometry={{
                                type: 'Point',
                                coordinates: this.locationCoordinatesFieldValue ? this.locationCoordinatesFieldValue : this.mapCenter,
                              }}
                              options={{
                                draggable: true
                              }}
                              instanceRef={(placemark) => { this.placemark = placemark }}
                              onGeometryChange={() => {
                                this.placemark.properties.set('iconCaption', 'поиск...');
                                window.ymaps.geocode(this.placemark.geometry.getCoordinates()).then((res) => {
                                  var firstGeoObject = res.geoObjects.get(0);
                                  this.placemark.properties.set({
                                    iconCaption: firstGeoObject.getAddressLine(),
                                  });
                                  this.mapCenter = this.yandexMap.getCenter();
                                  this.setState({locationAddressFieldValue: firstGeoObject.getAddressLine()});
                                });
                              }}
                            />

                          </Map>
                        </YMaps>
                      </Segment>
                    </Segment.Group>
                  </Form.Field>
                :
              null
            }

            {
              this.props.unmoderatedPost
              ?
              null
              :
              <Form.Button type='button' onClick={this.openNextSection0} primary content={allStrings[this.state.type]['nextSectionButtonName']} />
            }
          </Form>
        </Segment>
      </Accordion.Content>
    ])
  }

  openNextSection0 = () => {
    var error = false;

    if (this.state.nameFieldValue === '') {
      this.setState({nameFieldValueError: true});
      error = true;
      scrollToComponent(this.nameFieldInput, { offset: 0, align: 'top', duration: 500})
    }
    // check dates
    if (this.state.type === 'event' || this.state.type === 'promo') {
      if (!this.state.startDate) {
        this.setState({startDateFieldValueError: true});
        if (!error) {
          error = true;
          scrollToComponent(this.startDateFieldInput, { offset: 0, align: 'top', duration: 500});
        }
      }
      if (!this.state.endDate) {
        this.setState({endDateFieldValueError: true});
        if (!error) {
          error = true;
          scrollToComponent(this.endDateFieldInput, { offset: 0, align: 'top', duration: 500})
        }
      }
    }
    if (this.state.shortDescriptionFieldValue === '') {
      this.setState({shortDescriptionFieldValueError: true});
      if (!error) {
        error = true;
        scrollToComponent(this.shortDescriptionFieldInput, { offset: 0, align: 'top', duration: 500});
      }
    }
    if (!this.state.AlmatyFieldValue && !this.state.AstanaFieldValue) {
      this.setState({cityFieldValueError: true});
      if (!error) {
        error = true;
        scrollToComponent(this.cityFieldInput, { offset: 0, align: 'top', duration: 500});
      }
    }
    // check location
    if (this.state.type === 'place' && !this.locationCoordinatesFieldValue) {
      this.setState({locationCoordinatesFieldValueError: true});
      if (!error) {
        error = true;
        scrollToComponent(this.locationFieldInput, { offset: 0, align: 'top', duration: 500});
      }
    }

    // if not error -> open next section
    if (!error) {
      this.setState({ activeSectionIndexes: {0: false, 1: true, 2: false, 3: false} });
    }
  }

  // third section - additional info (tags, links, media, description)

  renderSection1() {
    return([
      <Accordion.Title key='11' active={this.state.activeSectionIndexes[1]} index={1} onClick={this.handleSectionTitleClick}>
        <Icon name='dropdown' />
        <span style={{fontSize:'1.2em'}}><b>{allStrings[this.state.type]['section1Title']}</b></span>
      </Accordion.Title>,
      <Accordion.Content key='12' active={this.state.activeSectionIndexes[1]}>
        <Segment>
          <Form error={this.state.formError} warning={this.state.formWarning}>
            {
              this.props.unmoderatedPost
              ?
              null
              :
              <Message info list={allStrings[this.state.type]['infoMessage1']} />
            }

            {this.renderLinksField()}

            {this.renderTagsField()}

            {this.renderMediaField()}

            {this.renderDescriptionField()}

            {
              this.props.unmoderatedPost
              ?
              null
              :
              <Form.Field>
                <Button type='button' onClick={this.openPreviousSection1} content={allStrings[this.state.type]['previousSectionButtonName']} />
                <Button type='button' onClick={this.openNextSection1} primary content={allStrings[this.state.type]['nextSectionButtonName']} />
              </Form.Field>
            }
          </Form>
        </Segment>
      </Accordion.Content>
    ])
  }

  openNextSection1 = () => {
    this.setState({ activeSectionIndexes: {0: false, 1: false, 2: true, 3: false} });
  }

  openPreviousSection1 = () => {
    this.setState({ activeSectionIndexes: {0: true, 1: false, 2: false, 3: false} });
  }

  // Text editor for description

  renderDescriptionField() {
    return(
      <Form.Field>
        <label>{allStrings[this.state.type]['descriptionFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
          <Interweave tagName="div" content={allStrings[this.state.type]['descriptionFieldPopup']}/>
        </Popup></label>
        <RichTextEditor
          value={this.state.descriptionFieldValue}
          onChange={this.onChange}
          placeholder={allStrings[this.state.type]['descriptionFieldPlaceholder']}
          onFocus={this.setParentFocused}
          onBlur={this.setParentBlured}
          toolbarConfig={this.toolbarConfig}
          rootStyle={this.state.descriptionFocusedStyle}
        />
      </Form.Field>
    )
  }

  onChange = (value) => {
    this.setState({ descriptionFieldValue: value });
    if (this.props.onChange) {
      // Send the changes up to the parent component as an HTML string.
      // This is here to demonstrate using `.toString()` but in a real app it
      // would be better to avoid generating a string on each change.
      this.props.onChange(
        value.toString('html')
      );
    }
  };

  setParentFocused = () => {
    this.setState({descriptionFocusedStyle: {
      color: 'rgba(0, 0, 0, 0.95)',
      background: '#FFFFFF',
      border: '1px solid #85B7D9',
    }});
  }

  setParentBlured = () => {
    this.setState({descriptionFocusedStyle: null});
  }

  toolbarConfig = {
    // Optionally specify the groups to display (displayed in the order listed).
    display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'LINK_BUTTONS', 'BLOCK_TYPE_DROPDOWN', 'HISTORY_BUTTONS'],
    INLINE_STYLE_BUTTONS: [
      {label: 'Bold', style: 'BOLD'},
      {label: 'Italic', style: 'ITALIC'},
      {label: 'Underline', style: 'UNDERLINE'},
      {label: 'Strikethrough', style: 'STRIKETHROUGH'},
    ],
    BLOCK_TYPE_DROPDOWN: [
      {label: 'Обычный текст', style: 'unstyled'},
      {label: 'Заголовок', style: 'header-three'}
    ],
    BLOCK_TYPE_BUTTONS: [
      {label: 'UL', style: 'unordered-list-item', iconName: 'unordered list'},
      {label: 'OL', style: 'ordered-list-item', iconName: 'ordered list'}
    ]
  };

  // tags field

  renderTagsField() {
    return([
      <Form.Group key='tag0'>
        <Form.Field width={15} error={this.state.tagSearchFieldValueError}>
          <label>{allStrings[this.state.type]['tagFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
            <Interweave tagName="div" content={allStrings[this.state.type]['tagFieldPopup']}/>
          </Popup></label>
          <Search
            placeholder={allStrings[this.state.type]['tagFieldPlaceholder']}
            noResultsMessage='Такой тэг еще не использовался'
            loading={this.state.tagSearchIsLoading}
            onResultSelect={this.handleTagSearchResultSelect}
            onSearchChange={this.handleTagSearchChange}
            results={this.state.tagSearchResults}
            value={this.state.tagSearchFieldValue}
            icon='tag'
          />
        </Form.Field>
        <Form.Field>
          <label><br /></label>
          <Button type='button' onClick={this.addTag}>Добавить</Button>
        </Form.Field>
      </Form.Group>,
      <Form.Field key='tag1'>
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
    if (this.state.tagSearchFieldValue !== '') {
      var currentState = this.state;
      currentState['tags'].push(this.state.tagSearchFieldValue);
      currentState['tagSearchFieldValue'] = '';
      this.setState(currentState);
    } else {
      this.setState({tagSearchFieldValueError: true});
    }
  }

  handleTagSearchResultSelect = (e, { result }) => {
    var currentState = this.state;
    currentState['tags'].push(result.title);
    currentState['tagSearchFieldValue'] = '';
    this.setState(currentState);
  }

  handleTagSearchChange = (e, { value }) => {
    this.setState({ tagSearchIsLoading: true, tagSearchFieldValue: value, tagSearchFieldValueError: false });
    var results = [];
    results.push({
      title: value,
    })
    // only query string
    this.searchIndex.search({ query: value }, (err, content) => {
      if (err) {
        console.error(err);
        return;
      }
      for (var h in content.hits) {
        results.push(
          {
            title: content.hits[h].name
          }
        );
      }
      this.setState({
        tagSearchIsLoading: false,
        tagSearchResults: results
      })
    });
  }

  // links field

  renderLinksField() {
    return([
      <Form.Group key='link0'>
        <Form.Field width={15} error={this.state.linkFieldValueError}>
          <label>{allStrings[this.state.type]['linkFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
            <Interweave tagName="div" content={allStrings[this.state.type]['linkFieldPopup']}/>
          </Popup></label>
          <Input placeholder={allStrings[this.state.type]['linkFieldPlaceholder']} type='text' icon='globe' name='linkFieldValue' onChange={this.handleInputChange} value={this.state.linkFieldValue} onKeyPress={e => {if (e.key === 'Enter') {this.addLink()}}}/>
        </Form.Field>
        <Form.Field>
          <label><br /></label>
          <Button type='button' onClick={this.addLink}>Добавить</Button>
        </Form.Field>
      </Form.Group>,
      <Form.Field key='link1'>
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
    if (this.state.linkFieldValue !== '') {
      var currentState = this.state;
      currentState['links'].push(this.state.linkFieldValue);
      currentState['linkFieldValue'] = '';
      this.setState(currentState);
    } else {
      this.setState({linkFieldValueError: true});
    }
  }

  // add media field

  renderMediaField() {
    return(
      <Form.Field>
        <label>{allStrings[this.state.type]['mediaFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
          <Interweave tagName="div" content={allStrings[this.state.type]['mediaFieldPopup']}/>
        </Popup></label>
          {
            this.state.mediaPreviews.map((item, idx) => {
              return <Image spaced='right' key={idx} size='large' inline bordered src={item} label={{ corner: 'right', icon: 'delete', onClick: () => this.deleteMediaPreview(idx) }}/>
            })
          }
          <Button type='button' icon='plus' size='massive' onClick={() => {
            var currentState = this.state;
            currentState['mediaModalOpen'] = true;
            this.setState(currentState);
          }}/>
      </Form.Field>
    )
  }

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
      const imageCompressor = new ImageCompressor();
      imageCompressor.compress(file, {height: 125}).then((result) => {
        currentState['media'].push({
          type: 'image',
          file: file,
          thumbFile: result
        });
        this.setState(currentState);
      });
    });
  }

  b64toBlob = (b64Data, contentType='', sliceSize=512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  addMediaLink = () => {
    var currentState = this.state;
    if (this.state.mediaType === 'image') {
      encode(this.state.mediaLink, {local: false, string: true}, (error, image) => {
        this.setState({ mediaModalLoading: false });
        if (!error) {
          var contentType = 'image/jpg';
          var blob = this.b64toBlob(image, contentType);
          const imageCompressor = new ImageCompressor();
          imageCompressor.compress(blob, {height: 250}).then((result) => {
            this.setState({ mediaModalLoading: true });
            currentState['media'].push({
              type: 'image',
              file : blob,
              thumbFile: result
            });
            currentState['mediaPreviews'].push(this.state.mediaLink);
            currentState['mediaLink'] = '';
            currentState['mediaModalOpen'] = false;
            this.setState(currentState);
          });
        } else {
          this.setState(currentState);
          alert("Произошла ошибка при загрузке изображения по ссылке\n" + error.message);
        }
      });
    } else {
      // check if this is youtube link
      var isYoutube = false;
      var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
      if (this.state.mediaLink.match(p)) {
        isYoutube = this.state.mediaLink.match(p)[1];
      }
      if (isYoutube) {
        // extract video id
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        var match = this.state.mediaLink.match(regExp);
        var youtubeID = (match&&match[7].length===11)? match[7] : false;
        var thumbnailLink = 'https://img.youtube.com/vi/' + youtubeID + '/hqdefault.jpg';
        currentState['media'].push({
          type: 'youtube',
          videoID: youtubeID,
          thumbnail: thumbnailLink
        });
        currentState['mediaPreviews'].push(thumbnailLink);
        currentState['mediaLink'] = '';
        currentState['mediaModalOpen'] = false;
        this.setState(currentState);
      } else {
        this.setState(currentState);
        alert("Произошла ошибка при обработке видео, проверьте правильность ссылки");
      }
    }
  }

  deleteMediaPreview(idx) {
    var currentState = this.state;
    currentState['mediaPreviews'].splice(idx, 1);
    currentState['media'].splice(idx, 1);
    this.setState(currentState);
  }

  renderAddMediaModal() {
    return(
      <Modal onClose={() => {
        var currentState = this.state;
        currentState['mediaModalOpen'] = false;
        this.setState(currentState);
      }} open={this.state.mediaModalOpen} closeIcon>
        <Modal.Content>
        <Dimmer.Dimmable dimmed={this.state.mediaModalLoading}>
          <Dimmer active={this.state.mediaModalLoading} inverted>
            <Loader />
          </Dimmer>

          <Divider horizontal>загрузите медиа с устройства</Divider>
          <Segment as={Dropzone} onDrop={this.onDrop} onDragEnter={this.setDropzoneActive} onDragLeave={this.setDropzoneInactive} multiple textAlign='center' tertiary={this.state.dropzoned} disabled={this.state.dropzoned} padded='very'>
            Перетащите файлы для загрузки в эту область, либо нажмите для вызова стандартного загрузчика
            <br />
            (принимаются только изображения формата .jpg, .png, .gif)
          </Segment>
          <Divider horizontal>или загрузите медиа по ссылке</Divider>
          <Input action fluid placeholder='https://upload.wikimedia.org/wikipedia/en/a/af/Almaty_Collage.png' type='text' iconPosition='left' labelPosition='right' name='mediaLink' onChange={this.handleInputChange} value={this.state.mediaLink}>
            <Icon name='globe' />
            <input />
            <Select compact options={[
              { key: 'i', text: 'Изображение', value: 'image' },
              { key: 'y', text: 'Youtube', value: 'youtube' },
            ]} value={this.state.mediaType} onChange={(e, { value }) => this.setState({ mediaType: value })} />
            <Button type='button' onClick={this.addMediaLink}>Добавить</Button>
          </Input>
        </Dimmer.Dimmable>
        </Modal.Content>
      </Modal>
    )
  }

  // section - Hunter/Maker comment

  renderSection2() {
    return([
      <Accordion.Title key='21' active={this.state.activeSectionIndexes[2]} index={2} onClick={this.handleSectionTitleClick}>
        <Icon name='dropdown' />
        <span style={{fontSize:'1.2em'}}><b>{allStrings[this.state.type]['section2Title']}</b></span>
      </Accordion.Title>,
      <Accordion.Content key='22' active={this.state.activeSectionIndexes[2]}>
        <Segment>
          <Form>
            {
              this.props.unmoderatedPost
                ?
                  null
                :
                <Message info list={allStrings[this.state.type]['infoMessage2']} />
            }
            <Form.Field>
              <label>{allStrings[this.state.type]['hunterOrMakerQuestionFieldLabel']}</label>
            </Form.Field>
            <Form.Field control={Radio} label={allStrings[this.state.type]['makerAnswer']} value='maker' checked={this.state.hunterOrMakerValue === 'maker'} onChange={this.handleRadioChange} />
            <Form.Field control={Radio} label={allStrings[this.state.type]['hunterAnswer']} value='hunter' checked={this.state.hunterOrMakerValue === 'hunter'} onChange={this.handleRadioChange} />
            <Form.Field>
              {
                this.state.hunterOrMakerValue === 'maker'
                  ?
                    <label>{allStrings[this.state.type]['makerCommentFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                      <Interweave tagName="div" content={allStrings[this.state.type]['makerCommentFieldPopup']}/>
                    </Popup></label>
                  :
                  <label>{allStrings[this.state.type]['hunterCommentFieldLabel']} <Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                    <Interweave tagName="div" content={allStrings[this.state.type]['hunterCommentFieldPopup']}/>
              </Popup></label>
            }

              <TextArea autoHeight style={{ minHeight: 80 }} name='commentFieldValue'  placeholder={allStrings[this.state.type]['commentFieldPlaceholder']} onChange={this.handleInputChange} defaultValue={this.state.commentFieldValue} />
            </Form.Field>
            {
              this.props.unmoderatedPost
              ?
              null
              :
              <Form.Group inline>
                <Form.Field>
                  <label>{allStrings[this.state.type]['publishNextDayFieldLabel']}<Popup wide='very' position='right center' trigger={<Icon link color='blue' name='question circle outline' />}>
                    <Interweave tagName="div" content={allStrings[this.state.type]['publishNextDayFieldPopup']}/>
                  </Popup></label>
                </Form.Field>
                <Form.Field control={Radio} label='Сразу' checked={!this.state.publishNextDayField} onChange={() => { this.setState({ publishNextDayField: false }) }} />
                <Form.Field control={Radio} label='На следующий день' checked={this.state.publishNextDayField} onChange={() => { this.setState({ publishNextDayField: true }) }} />
              </Form.Group>
            }
            {
              this.props.unmoderatedPost
              ?
              null
              :
              <Form.Field>
                <Button type='button' onClick={this.openPreviousSection2} content={allStrings[this.state.type]['previousSectionButtonName']} />
                <Button type='button' onClick={this.openNextSection2} primary content={allStrings[this.state.type]['nextSectionButtonName']} />
              </Form.Field>
            }
          </Form>
        </Segment>
      </Accordion.Content>
    ])
  }

  openNextSection2 = () => {
    this.setState({ activeSectionIndexes: {0: false, 1: false, 2: false, 3: true} });
  }

  openPreviousSection2 = () => {
    this.setState({ activeSectionIndexes: {0: false, 1: true, 2: false, 3: false} });
  }

  handleRadioChange = (e, { value }) => {
    this.setState({ hunterOrMakerValue: value })
  }

  // section - preview, terms and captcha

  renderSection3() {
    return([
      <Accordion.Title key='31' active={this.state.activeSectionIndexes[3]} index={3} onClick={this.handleSectionTitleClick}>
        <Icon name='dropdown' />
        <span style={{fontSize:'1.2em'}}><b>{allStrings[this.state.type]['section3Title']}</b></span>
      </Accordion.Title>,
      <Accordion.Content key='32' active={this.state.activeSectionIndexes[3]}>
        <Segment>
          <Form>
            <Message info list={allStrings[this.state.type]['infoMessage3']} />
            <Accordion fluid exclusive={false}>
              <Accordion.Title active={this.state.showPostListPreview} onClick={() => {this.setState({showPostListPreview: !this.state.showPostListPreview})}}>
                <Icon name='dropdown' />
                На главной странице
              </Accordion.Title>
              <Accordion.Content active={this.state.showPostListPreview}>
                На главной странице
              </Accordion.Content>
              <Accordion.Title active={this.state.showSinglePostPreview} onClick={() => {this.setState({showSinglePostPreview: !this.state.showSinglePostPreview})}}>
                <Icon name='dropdown' />
                На отдельной странице с полной информацией
              </Accordion.Title>
              <Accordion.Content active={this.state.showSinglePostPreview}>
                На отдельной странице с полной информацией
              </Accordion.Content>
            </Accordion>
            <Form.Field>
              <ReCAPTCHA
                ref={(el) => { this.captcha = el; }}
                size='invisible'
                sitekey='6LegOT8UAAAAAApRCM7E0Q-RLFaGCP5jN48k5Ixn'
                onChange={this.captchaOnChange}
              />
            </Form.Field>
            <Popup hoverable wide='very' position='right center' trigger={<Form.Checkbox required label='Согласен с условиями пользования btw.kz' error={this.state.termsFieldValueError} onChange={() => {this.setState({termsFieldValue: !this.state.termsFieldValue, termsFieldValueError: false})}}/>} value={this.state.termsFieldValue}>
              <div>
                Стандартные формальности. Ознакомиться можно <Link to='/terms ' target='_blank'>тут</Link>
              </div>
            </Popup>
            <Form.Field>
              <Button type='button' onClick={this.openPreviousSection3} content={allStrings[this.state.type]['previousSectionButtonName']} />
              <Button type='button' onClick={this.submitForm} primary content={allStrings[this.state.type]['finalSubmitButtonName']} />
            </Form.Field>
          </Form>
        </Segment>
      </Accordion.Content>
    ])
  }

  submitForm = () => {

    var error = false;

    if (this.state.nameFieldValue === '') {
      this.setState({nameFieldValueError: true});
      error = true;
      this.setState({ activeSectionIndexes: {0: true, 1: true, 2: true, 3: true} });
      scrollToComponent(this.nameFieldInput, { offset: 0, align: 'top', duration: 500})
    }
    // check dates
    if (this.state.type === 'event' || this.state.type === 'promo') {
      if (!this.state.startDate) {
        this.setState({startDateFieldValueError: true});
        if (!error) {
          error = true;
          this.setState({ activeSectionIndexes: {0: true, 1: true, 2: true, 3: true} });
          scrollToComponent(this.startDateFieldInput, { offset: 0, align: 'top', duration: 500});
        }
      }
      if (!this.state.endDate) {
        this.setState({endDateFieldValueError: true});
        if (!error) {
          error = true;
          this.setState({ activeSectionIndexes: {0: true, 1: true, 2: true, 3: true} });
          scrollToComponent(this.endDateFieldInput, { offset: 0, align: 'top', duration: 500})
        }
      }
    }
    if (this.state.shortDescriptionFieldValue === '') {
      this.setState({shortDescriptionFieldValueError: true});
      if (!error) {
        error = true;
        this.setState({ activeSectionIndexes: {0: true, 1: true, 2: true, 3: true} });
        scrollToComponent(this.shortDescriptionFieldInput, { offset: 0, align: 'top', duration: 500});
      }
    }
    if (!this.state.AlmatyFieldValue && !this.state.AstanaFieldValue) {
      this.setState({cityFieldValueError: true});
      if (!error) {
        error = true;
        this.setState({ activeSectionIndexes: {0: true, 1: true, 2: true, 3: true} });
        scrollToComponent(this.cityFieldInput, { offset: 0, align: 'top', duration: 500});
      }
    }
    // check location
    if (this.state.type === 'place' && !this.locationCoordinatesFieldValue) {
      this.setState({locationCoordinatesFieldValueError: true});
      if (!error) {
        error = true;
        this.setState({ activeSectionIndexes: {0: true, 1: true, 2: true, 3: true} });
        scrollToComponent(this.locationFieldInput, { offset: 0, align: 'top', duration: 500});
      }
    }
    if (!this.state.termsFieldValue) {
      this.setState({termsFieldValueError: true});
      error = true;
    }

    // if not error -> submit
    if (!error) {
      // this.captcha.execute();
      var date = moment().utcOffset('+0600').format('L');
      if (this.state.publishNextDayField) {
        date = moment().add(1, 'days').utcOffset('+0600').format('L');
      }
      if (this.props.unmoderatedPost) {
        date = this.state.publicationDateFieldValue.utcOffset('+0600').format('L');
      }
      var post = {
        name: this.state.nameFieldValue,
        shortDescription: this.state.shortDescriptionFieldValue,
        Almaty: this.state.AlmatyFieldValue,
        Astana: this.state.AstanaFieldValue,
        links: this.state.links,
        media: this.state.media,
        tags: this.state.tags,
        description: this.state.descriptionFieldValue.toString('html'),
        publicationDate: date,
        hunterID: this.props.user.uid,
        comment: this.state.commentFieldValue,
        type: this.state.type
      };
      if (this.state.hunterOrMakerValue === 'maker') {
        post['makers'] = [this.props.user.uid];
      }
      if (this.state.type !== 'product') {
        post['locationCoordinates'] = this.locationCoordinatesFieldValue;
        post['locationAddress'] = this.state.locationAddressFieldValue;
        post['locationComment'] = this.state.locationCommentFieldValue;
      }
      if (this.state.type === 'event' || this.state.type === 'promo') {
        post['startDate'] = this.state.startDate.toDate();
        post['endDate'] = this.state.endDate.toDate();
      }
      if (this.props.unmoderatedPost) {
        post['editors'] = this.state.editors;
        post['id'] = this.state.postIDFieldValue;
        Actions.addNewPost(post, this.props.unmoderatedPost);
        // notify parent that finished
        this.setState({ successModalIsOpen: true });
      } else {
        Actions.sendPostToModeration(post);
        this.setState({ successModalIsOpen: true });
      }
    }
  }

  openPreviousSection3 = () => {
    this.setState({ activeSectionIndexes: {0: false, 1: false, 2: true, 3: false} });
  }

  captchaOnChange(value) {
    console.log("Captcha value:", value);
  }

  // success modal

  renderSuccessModal() {
    return(
      <Modal
        open={this.state.successModalIsOpen}
        closeOnDimmerClick={false}
        closeOnEscape={false}
        size='small'
        dimmer='blurring'
      >
        {
          this.props.unmoderatedPost
          ?
          <Header icon={ !this.props.postSubmitted ? 'cloud upload' : 'check circle outline' } content={ !this.props.postSubmitted ? allStrings[this.state.type]['uploadingMessageHeader'] : allStrings[this.state.type]['moderationSuccessMessageHeader'] } />
          :
          <Header icon={ !this.props.postSubmitted ? 'cloud upload' : 'check circle outline' } content={ !this.props.postSubmitted ? allStrings[this.state.type]['uploadingMessageHeader'] : allStrings[this.state.type]['successMessageHeader'] } />
        }
        <Modal.Content>
          <Progress percent={this.props.uploadProgress} progress autoSuccess>Загрузка медиафайлов</Progress>
          {
            this.props.postSubmitted && !this.props.unmoderatedPost
            ?
            <Interweave tagName="div" content={allStrings[this.state.type]['successMessageContent']}/>
            :
            null
          }
        </Modal.Content>
        <Modal.Actions>
          {
            this.props.unmoderatedPost
            ?
            <Button primary disabled={!this.props.postSubmitted} onClick={this.props.finished} inverted>
              Назад
            </Button>
            :
            <Button primary disabled={!this.props.postSubmitted} onClick={() => {this.props.history.push('/')}} inverted>
              На главную
            </Button>
          }
        </Modal.Actions>
      </Modal>
    )
  }

  // admin section for date and id

  renderDateAndID() {
    return([
      <Accordion.Title key='21' active={this.state.activeSectionIndexes[3]} index={3} onClick={this.handleSectionTitleClick}>
        <Icon name='dropdown' />
      <span style={{fontSize:'1.2em'}}><b>{allStrings[this.state.type]['dateAndIDSectionTitle']}</b></span>
      </Accordion.Title>,
      <Accordion.Content key='22' active={this.state.activeSectionIndexes[3]}>
        <Segment>
          <Form>
            <Form.Field>
              <label ref={(c) => {this.postIDFieldInput = c}}>Post ID/URL</label>
              <Input name='postIDFieldValue' onChange={this.handleInputChange} defaultValue={this.state.postIDFieldValue} />
            </Form.Field>
            <Form.Field>
              <label ref={(input) => { this.publicationDateFieldInput = input; }}>Дата публикации</label>
              <DatePicker
                selected={this.state.publicationDateFieldValue}
                highlightDates={[moment()]}
                placeholderText='20 января 2018 г., 12:30'
                onChange={(date) => { this.setState({publicationDateFieldValue: date});}}
                locale='ru'
                dateFormat='LLL'
                className='dateInput'
              />
            </Form.Field>
            <Form.Field>
              <label ref={(c) => {this.moderatorFieldInput = c}}>Добавить редактора в пост</label>
              <Dropdown placeholder='Выберите ID модератора' selection options={[{ value: null, text: '...' }, { value: '83kYwJwX1HTlTFXhdYGkxm18Rtk2', text: 'Azamat Koptleuov' }, { value: 'FjhVkknrtlQO9KXJpnczsQInZEw1', text: 'Kanat Zhaksybekov' }, { value: 'HCxKfES35Qb07MOOELUgPA0KbIj1', text: 'Zhenya Ismailova' }, { value: 'PkZMIB10cAaYltZXQUJsvW9hKYs1', text: 'Kuanysh Bekbolatov' }, { value: 'PpKB8jmgfmOfGaBtr8SN9X5i1ma2', text: 'Karim Yussupov' }, { value: 'Qcd6NX3F9JUEHHkbfChtxL1fDjT2', text: 'Zhanel Meirambek' }, { value: 'iBEhE0ZoCbgALQTYjReNyVggfPz2', text: 'Samal Zhunussova' }, { value: 'kMroZQFmD7U9EQEwy19COLuYml42', text: 'Anton Kalkin' }, { value: 'vYizwWaraVO1qoazWUwsqMkleX43', text: 'Ira Afonyeva' }, { value: 'zbUs2ZW3CMcSGKsObcFZFzD0frA2', text: 'Aleksandr Bakhmutov' }]} value={ this.state.editors[0] } onChange={(event, data) => { this.setState({editors: [data.value]}) }}/>
            </Form.Field>
          </Form>
        </Segment>
      </Accordion.Content>
    ])
  }

  // component's main render function

  render() {
    return (
      <Container>
        {this.renderAddMediaModal()}
        <style>
          {`.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list {
            padding-left: 0;
            padding-right: 0;
          }
          .dateInput {
            min-width:110%!important;
          }`}
        </style>
        <Header as='h2'>
          <Icon name='plus' />
          {
            this.props.unmoderatedPost
              ? <Header.Content>
                Тип поста -
                {' '}
                <Dropdown inline header='тип поста' options={[{ value: 'product', icon:'rocket', text: 'продукт', content: 'Продукт' }, { value: 'event', icon: 'calendar', text: 'ивент', content: 'Ивент' }, { value: 'place', icon: 'map signs', text: 'место', content: 'Место' }, { value: 'promo', icon: 'percent', text: 'промоакция', content: 'Промоакция' }]} value={ this.state.type } onChange={(event, data) => {
                  this.setState({type: data.value});
                  if (this.state.AlmatyFieldValue === this.state.AstanaFieldValue) {
                    this.setState({AstanaFieldValue: !this.state.AlmatyFieldValue})
                  }
                    }} />
                </Header.Content>
                : <Header.Content>
                  Добавить
                  {' '}
                  <Dropdown inline header='тип поста' options={[{ value: 'product', icon:'rocket', text: 'новый продукт', content: 'Продукт' }, { value: 'event', icon: 'calendar', text: 'новый ивент', content: 'Ивент' }, { value: 'place', icon: 'map signs', text: 'новое место', content: 'Место' }, { value: 'promo', icon: 'percent', text: 'новую промоакцию', content: 'Промоакция' }]} value={ this.state.type } onChange={(event, data) => {
                    this.setState({type: data.value});
                    if (this.state.AlmatyFieldValue === this.state.AstanaFieldValue) {
                      this.setState({AstanaFieldValue: !this.state.AlmatyFieldValue})
                    }
                    this.props.history.push('/new/' + data.value);
                    }} />
                  </Header.Content>
                  }
        </Header>
        {
          this.props.unmoderatedPost
          ?
          null
          :
          <Message info list={allStrings[this.state.type]['infoMessage']} />
        }
        <Accordion fluid exclusive={false}>
          {this.renderSection0()}
          {this.renderSection1()}
          {this.renderSection2()}
          {
            this.props.unmoderatedPost
            ?
            this.renderDateAndID()
            :
            this.renderSection3()
          }
        </Accordion>
        <br />
        {
          this.props.unmoderatedPost
          ?
          <Button primary onClick={() => {this.submitForm()}}>
            Опубликовать
          </Button>
          :
          null
        }
        {this.renderSuccessModal()}
      </Container>
    );
  }
}

export default NewPostPage;
