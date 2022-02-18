import React from 'react';

export const useHelloWorld = () => {
  React.useEffect(() => {
    console.log('hello world');
  }, []);
};
