import Analytics from 'analytics-node';

// Public write key scoped to data source
const SEGMENT_WRITE_KEY = 'IzCq3j4dQlTAgLdMykRW9oBHQKUy1xMm';

interface CCAEventProperties {
  template?: string; // can be example, source or JS or TS
  manager: 'npm' | 'yarn';
  interactive: boolean;
}

export function track(properties: CCAEventProperties) {
  if (process.env.DISABLE_ANALYTICS) {
    return;
  }

  try {
    const client = new Analytics(SEGMENT_WRITE_KEY, {
      errorHandler: () => {
        // noop
      },
    });
    client.track({
      event: 'app-cli-cca-creation',
      properties,
      timestamp: new Date(),
      anonymousId: Date.now(), // generate a random id
    });
    // eslint-disable-next-line no-empty
  } catch (e) {
    // ignore any error, to not block the cca run
  }
}
