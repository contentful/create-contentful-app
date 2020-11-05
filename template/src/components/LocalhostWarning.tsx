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
      <Note title="App running outside of Contentful" style={{ maxWidth: '800px' }}>
        <Paragraph>
          Contentful Apps need to run inside the Contentful web app to function properly. Install
          the app into a space and render your app into one of the{' '}
          <TextLink href="https://www.contentful.com/developers/docs/extensibility/ui-extensions/sdk-reference/#locations">
            available locations
          </TextLink>
          . Follow our{' '}
          <TextLink href="https://www.contentful.com/developers/docs/extensibility/app-framework/tutorial/">
            guide to get started
          </TextLink>
          .
        </Paragraph>
        <br />
        <Paragraph>
          If you're already familiar with the app framework,{' '}
          <TextLink href="https://app.contentful.com/deeplink?link=apps">
            manage your AppDefinition and AppInstallation here
          </TextLink>
          .
        </Paragraph>
      </Note>
    </div>
  );
};

export default LocalhostWarning;
