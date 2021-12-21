import React from 'react';
import Field from './Field';
import { render } from '@testing-library/react';

describe('Field component', () => {
  it('Component text exists', () => {
    // @ts-ignore This field component should ideally have an sdk and
    // cma property. 
    const { getByText } = render(<Field />);

    expect(getByText('Hello Entry Field Component')).toBeInTheDocument();
  });
});
