import React from 'react';
import ReactDOM from 'react-dom';
import EditorDemo from './EditorDemo';
import './demo.css';

document.addEventListener('DOMContentLoaded', () => {
  let rootNode = document.createElement('div');
  document.body.appendChild(rootNode);
  ReactDOM.render(
    <EditorDemo />,
    rootNode,
  );
});
