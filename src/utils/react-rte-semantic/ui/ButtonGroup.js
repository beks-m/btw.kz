/* @flow */

import React from 'react';

import {Button} from "semantic-ui-react";

type Props = {
  className?: string;
};

export default function ButtonGroup(props: Props) {
  return (
    <Button.Group {...props}/>
  );
}
