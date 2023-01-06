import Analytics from 'analytics-node';

// Public write key scoped to data source
const SEGMENT_WRITE_KEY = 'define me'

interface CCAEventProperties {
  template?: string; // can be example, source or JS or TS
  manager: 'npm' | 'yarn';
  interactive: boolean;
}

export function track(properties: CCAEventProperties) {
  if (process.env.DISABLE_ANALYTICS) {
    return;
  }

  const client = new Analytics(SEGMENT_WRITE_KEY);

  try {
    client.track({event: 'app-cli-cca-creation', properties, timestamp: new Date() });
    // eslint-disable-next-line no-empty
  } catch (e) {
    // we just want to ignore an error from the tracking service
  }
}