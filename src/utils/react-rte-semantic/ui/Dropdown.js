/* @flow */
import React, {Component} from 'react';
import autobind from 'class-autobind';
import {Dropdown as SemanticDropdown} from "semantic-ui-react";

import styles from "./Dropdown.css";

type Choice = {
    label: string;
    className?: string;
};

type Props = {
    choices: Map<string, Choice>;
    selectedKey: ?string;
    onChange: (selectedKey: string) => any;
    className?: string;
};

export default class Dropdown extends Component {
    props: Props;

    constructor() {
        super(...arguments);
        autobind(this);
    }

    render() {
        let {selectedKey} = this.props;
        return (
            <div className={styles.compactedDropdown}>
                <SemanticDropdown selection value={selectedKey} onChange={this._onChange}
                                  options={this._renderChoices()}/>
            </div>
        );
    }

    _onChange = (event: Object, data: { value: string }) => {
        this.props.onChange(data.value);
    };

    _renderChoices() {
        let {choices} = this.props;
        let entries = Array.from(choices.entries());
        return entries.map(([key, {label, className}]) => {
            return {key: key, value: key, text: label}
        })
    }
}
