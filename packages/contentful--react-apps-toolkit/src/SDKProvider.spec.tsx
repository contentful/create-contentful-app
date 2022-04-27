import { render } from '@testing-library/react';
import { SDKProvider } from './SDKProvider';
import { init } from '@contentful/app-sdk';

jest.useFakeTimers();

jest.mock('@contentful/app-sdk', () => ({
  init: jest.fn(),
}));

describe('SDKProvider', () => {
  let consoleWarnMock: jest.MockInstance<any, any>;

  beforeEach(() => {
    // @ts-ignore
    init.mockImplementation((callback) => {
      callback({});
    });
    consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleWarnMock?.mockRestore();
  });

  it('renders its children when sdk the init returns the sdk', () => {
    const { getByText } = render(
      <SDKProvider>
        <div>children</div>
      </SDKProvider>
    );

    expect(getByText('children')).toBeTruthy();
  });
  it('calls console warn after timeout if callback is not returning ', () => {
    // @ts-ignore
    init.mockImplementation(() => {});
    render(
      <SDKProvider>
        <div>children</div>
      </SDKProvider>
    );

    jest.runAllTimers();

    expect(consoleWarnMock).toHaveBeenCalled();
  });
});
