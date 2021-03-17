import React from 'react';
import EntryEditor from './EntryEditor';
import { render } from '@testing-library/react';
import { mockSdk } from '../../test/mocks/mockSdk';

describe('Entry component', () => {
  it('Component text exists', () => {
    const { getByText } = render(<EntryEditor sdk={mockSdk} />);

    expect(getByText('Hello Entry Editor Component')).toBeInTheDocument();
  });
});
