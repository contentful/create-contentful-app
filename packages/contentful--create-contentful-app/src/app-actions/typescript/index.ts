// import type { APIGatewayEvent, Context } from 'aws-lambda';

exports.handler = async (event: any) => {
  console.debug(`Event: ${JSON.stringify(event, null, 2)}`);

  const { parameters } = event;

  const response = {
    message: `Hello from your hosted app action. I recieved the following message as a paramater: ${JSON.stringify(
      parameters.message
    )} `,
  };

  return response;
};
