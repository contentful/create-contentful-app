import Analytics from 'analytics-node';

interface Properties {
  name: string;
  manager: 'yarn' | 'npm';
}

class AnalyticsClient {
  private client: Analytics

  constructor() {
    this.client = new Analytics(process.env.SEGMENT_WRITE_KEY);
  }

  track(properties: Properties) {
    if (process.env.DISABLE_ANALYTICS) {
      return;
    }

    const segmentEvent: Parameters<Analytics['track']>[0] = {
      event: 'cli_create_app',
      properties,
    };

    try {
      this.client.track(segmentEvent);
    } catch (e) {
      console.error(e);
    }
  }
}

const client = new AnalyticsClient();

export default client;
