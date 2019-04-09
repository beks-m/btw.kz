/* @flow */

import React, {Component} from 'react';
import IconButton from './IconButton';
import InputPopover from './InputPopover';
import autobind from 'class-autobind';
import {Popup} from "semantic-ui-react";

type Props = {
    iconName: string;
    showPopover: boolean,
    onTogglePopover: Function,
    onSubmit: Function;
};

export default class PopoverIconButton extends Component {
    props: Props;

    constructor() {
        super(...arguments);
        autobind(this);
    }

    render() {
        let {onTogglePopover, showPopover, ...props} = this.props; // eslint-disable-line no-unused-vars
        return (
            <Popup position="bottom center" open={showPopover} onOpen={onTogglePopover} trigger={<IconButton isActive={showPopover} {...props}/>} content={this._renderPopover()} on="click"/>
        )
    }

    _renderPopover() {
        if (!this.props.showPopover) {
            return null;
        }
        return (
            <InputPopover
                onSubmit={this._onSubmit}
                onCancel={this._hidePopover}
            />
        );
    }

    _onSubmit() {
        this.props.onSubmit(...arguments);
    }

    _hidePopover() {
        if (this.props.showPopover) {
            this.props.onTogglePopover(...arguments);
        }
    }
}
