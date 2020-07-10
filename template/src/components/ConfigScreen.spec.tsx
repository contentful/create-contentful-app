import React from 'react';
import ConfigScreen from './ConfigScreen';
import { configure, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

configure({
  testIdAttribute: 'data-test-id'
});

describe('Config Screen component', () => {
  it('Submits user changes', async () => {
    const mockSdk: any = {
      app: {
        onConfigure: jest.fn(),
        getParameters: jest.fn().mockReturnValueOnce({ defaultValue: 'just like buddy holly' }),
        setReady: jest.fn()
      }
    };
    render(<ConfigScreen sdk={mockSdk} />);

    const input = screen.getByTestId('cf-ui-text-input');

    userEvent.type(input, 'ooo eee ooo');

    // simulate the user clicking the install button
    const configurationData = await mockSdk.app.onConfigure.mock.calls[0][0]();

    expect(configurationData).toEqual({
      parameters: { defaultValue: 'ooo eee ooo' }
    });
  });
});
