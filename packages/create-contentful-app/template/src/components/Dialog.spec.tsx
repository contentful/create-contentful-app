import React from 'react';
import Dialog from './Dialog';
import { render } from '@testing-library/react';
import { mockSdk } from '../../test/mocks/mockSdk';

describe('Dialog component', () => {
  it('Component text exists', () => {
    const { getByText } = render(<Dialog sdk={mockSdk} />);

    expect(getByText('Hello Dialog Component')).toBeInTheDocument();
  });
});
