import React from 'react';
import { Paragraph } from '@contentful/forma-36-react-components';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';

interface FieldProps {
  sdk: FieldExtensionSDK;
}

const Field = (prop: FieldProps) => {
  return <Paragraph>Hello Entry Field Component</Paragraph>;
};

export default Field;
