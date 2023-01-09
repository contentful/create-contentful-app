import Analytics from 'analytics-node';

// Public write key scoped to data source
const SEGMENT_WRITE_KEY = 'rU9puFk7E1NlAkD0UXCdy6tEFHXc2OyN'

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
    client.track({
      event: 'app-cli-cca-creation',
      properties,
      timestamp: new Date(),
      anonymousId: 'anonymous' 
    });
    // eslint-disable-next-line no-empty
  } catch (e) {
    // ignore any error, to not block the cca run
  }
}