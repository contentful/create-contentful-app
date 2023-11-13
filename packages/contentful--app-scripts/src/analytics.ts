import { Analytics } from '@segment/analytics-node'

// Public write key scoped to data source
const SEGMENT_WRITE_KEY = 'IzCq3j4dQlTAgLdMykRW9oBHQKUy1xMm';

/**
 *
 * @param {object} properties tracking properties
 * @param {string} properties.command triggered command e.g create-app-definition, upload, etc.
 * @param {boolean} properties.ci value if --ci flag has been set
 * @returns
 */
export function track({ command, ci }: { command: string; ci: boolean; }) {
  if (process.env.DISABLE_ANALYTICS) {
    return;
  }

  try {
    const client = new Analytics({
      writeKey: SEGMENT_WRITE_KEY,
    })
    client.on('error', (err) => { /* noop */ })
    client.track({
      event: 'app-cli-app-scripts',
      properties: {
        command,
        ci: String(ci),
      },
      anonymousId: Date.now().toString(), // generate a random id
      timestamp: new Date(),
    });
    // eslint-disable-next-line no-empty
  } catch (e) {
    // ignore any error, to not block the call
  }
}
