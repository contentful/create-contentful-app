exports.handler = async (payload: any) => {
  const { parameters } = payload;

  const response = {
    message: `Hello from your hosted app action. I recieved the following message as a paramater: ${JSON.stringify(
      parameters.message
    )} `,
  };

  return response;
};
