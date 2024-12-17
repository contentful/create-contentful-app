export const handler = async (event, context) => {
  const cma = context.cma!;

  const { foo } = event.body;

  console.log('this is from my app action function!');
  return {
    action: 'this is my action',
    event,
    foo,
    someExampleUsingCMA: await cma.locale.getMany({}),
  };
};
