/* @flow */
import React, {Component} from 'react';
import IconButton from '../ui/IconButton';
import autobind from 'class-autobind';

type Props = {
  style: string;
  onToggle: (style: string) => any;
  iconName: string;
};

export default class StyleButton extends Component {
  props: Props;

  constructor() {
    super(...arguments);
    autobind(this);
  }

  render() {
    let {style, onToggle, iconName, ...otherProps} = this.props; // eslint-disable-line no-unused-vars
    if (!iconName) {
      iconName = style.toLowerCase();
    }
    // `focusOnClick` will prevent the editor from losing focus when a control
    // button is clicked.
    return (
      <IconButton
        {...otherProps}
        iconName={iconName}
        onClick={this._onClick}
        focusOnClick={false}
      />
    );
  }

  _onClick() {
    this.props.onToggle(this.props.style);
  }
}
