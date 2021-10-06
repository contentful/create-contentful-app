import React from 'react';
import { PlainClientAPI } from 'contentful-management';
import { Paragraph } from '@contentful/forma-36-react-components';
import { EditorExtensionSDK } from '@contentful/app-sdk';

interface EditorProps {
  sdk: EditorExtensionSDK;
  cma: PlainClientAPI;
}

const Entry = (props: EditorProps) => {
  return <Paragraph>Hello Entry Editor Component</Paragraph>;
};

export default Entry;
