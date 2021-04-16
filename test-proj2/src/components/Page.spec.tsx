import React from 'react';
import Page from './Page';
import { render } from '@testing-library/react';
import { mockSdk } from '../../test/mocks/mockSdk';

describe('Page component', () => {
  it('Component text exists', () => {
    const { getByText } = render(<Page sdk={mockSdk} />);

    expect(getByText('Hello Page Component')).toBeInTheDocument();
  });
});
