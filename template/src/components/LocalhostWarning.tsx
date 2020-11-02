import React from 'react';
import { Paragraph, TextLink, Note } from '@contentful/forma-36-react-components';

const LocalhostWarning = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '40px'
      }}>
      <Note title="It looks like you're running your app locally." style={{ maxWidth: '800px' }}>
        <Paragraph>
          If this is your first time running your app, please run `npx
          @contentful/create-contentful-app create-defintion` in your terminal then{' '}
          <TextLink href="https://app.contentful.com/deeplink?link=apps">
            install your app in a Contentful space.
          </TextLink>
        </Paragraph>

        <br />

        <Paragraph>
          More information about local development of Contentful apps{' '}
          <TextLink href="https://www.contentful.com/developers/docs/extensibility/ui-extensions/faq/#how-can-i-develop-with-the-ui-extension-sdk-locally">
            can be found here.
          </TextLink>
        </Paragraph>
      </Note>
    </div>
  );
};

export default LocalhostWarning;
