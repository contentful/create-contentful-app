import React from 'react';
import Sidebar from './Sidebar';
import { render } from '@testing-library/react';
import { mockSdk } from '../../test/mocks/mockSdk';

describe('Sidebar component', () => {
  it('Component text exists', () => {
    const { getByText } = render(<Sidebar sdk={mockSdk} />);

    expect(getByText('Hello Sidebar Component')).toBeInTheDocument();
  });
});
