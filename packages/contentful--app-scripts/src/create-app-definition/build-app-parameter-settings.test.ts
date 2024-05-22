import sinon from 'sinon';
import inquirer from 'inquirer';
import { buildAppParameterSettings } from './build-app-parameter-settings';

describe('buildAppParameterSettings', async () => {
  let chai: Chai.ChaiStatic;
  let promptStub: sinon.SinonStub;

  beforeEach(async () => {
    promptStub = sinon.stub(inquirer, 'prompt');
    chai = await import('chai');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should add instance parameters correctly', async () => {
    promptStub.onCall(0).resolves({
      instanceOrInstallation: 'instance',
      name: 'param1',
      id: 'param1',
      type: 'Symbol',
      required: false,
    });
    promptStub.onCall(1).resolves({ addAnother: false });

    const parameters = await buildAppParameterSettings();

    chai.expect(parameters.instance).to.deep.equal([
      {
        name: 'param1',
        id: 'param1',
        type: 'Symbol',
        required: false,
        default: undefined,
        description: undefined,
        options: undefined,
        labels: undefined,
      },
    ]);
    chai.expect(parameters.installation).to.deep.equal([]);
  });

  it('should add installation parameters correctly', async () => {
    promptStub.onCall(0).resolves({
      instanceOrInstallation: 'installation',
      name: 'param1',
      id: 'param1',
      type: 'Secret',
      required: true,
    });
    promptStub.onCall(1).resolves({ addAnother: false });

    const parameters = await buildAppParameterSettings();

    chai.expect(parameters.installation).to.deep.equal([
      {
        name: 'param1',
        id: 'param1',
        type: 'Secret',
        required: true,
        default: undefined,
        description: undefined,
        options: undefined,
        labels: undefined,
      },
    ]);
    chai.expect(parameters.instance).to.deep.equal([]);
  });

  it('should handle multiple parameters', async () => {
    promptStub.onCall(0).resolves({
      instanceOrInstallation: 'instance',
      name: 'param1',
      id: 'param1',
      type: 'Symbol',
      required: false,
    });
    promptStub.onCall(1).resolves({ addAnother: true });
    promptStub.onCall(2).resolves({
      instanceOrInstallation: 'installation',
      name: 'param2',
      id: 'param2',
      type: 'Number',
      required: true,
      default: '42',
    });
    promptStub.onCall(3).resolves({ addAnother: false });

    const parameters = await buildAppParameterSettings();

    chai.expect(parameters.instance).to.deep.equal([
      {
        name: 'param1',
        id: 'param1',
        type: 'Symbol',
        required: false,
        default: undefined,
        description: undefined,
        options: undefined,
        labels: undefined,
      },
    ]);
    chai.expect(parameters.installation).to.deep.equal([
      {
        name: 'param2',
        id: 'param2',
        type: 'Number',
        required: true,
        default: '42',
        description: undefined,
        options: undefined,
        labels: undefined,
      },
    ]);
  });

  it('should ensure unique IDs for instance parameters', async () => {
    // invalid attempt
    promptStub.onCall(0).resolves({
      instanceOrInstallation: 'instance',
      name: 'param1',
      id: 'param1',
      type: 'Symbol',
      required: false,
    });
    promptStub.onCall(1).resolves({ addAnother: true });
    promptStub.onCall(2).resolves({
      instanceOrInstallation: 'instance',
      name: 'param2',
      id: 'param1',
      type: 'Symbol',
      required: false,
    });
    promptStub.onCall(3).resolves({ addAnother: false });

    // valid attempt
    promptStub.onCall(4).resolves({
      instanceOrInstallation: 'instance',
      name: 'param1',
      id: 'param1',
      type: 'Symbol',
      required: false,
    });
    promptStub.onCall(5).resolves({ addAnother: true });
    promptStub.onCall(6).resolves({
      instanceOrInstallation: 'instance',
      name: 'param2',
      id: 'param2',
      type: 'Symbol',
      required: false,
    });
    promptStub.onCall(7).resolves({ addAnother: false });

    const consoleSpy = sinon.spy(console, 'log');
    await buildAppParameterSettings();
    chai.expect(consoleSpy.calledWith('Instance parameter IDs must be unique.')).to.be.true;
    consoleSpy.restore();
  });

  it('should ensure unique IDs for installation parameters', async () => {
    // invalid attempt
    promptStub.onCall(0).resolves({
      instanceOrInstallation: 'installation',
      name: 'param1',
      id: 'param1',
      type: 'Symbol',
      required: false,
    });
    promptStub.onCall(1).resolves({ addAnother: true });
    promptStub.onCall(2).resolves({
      instanceOrInstallation: 'installation',
      name: 'param2',
      id: 'param1',
      type: 'Symbol',
      required: false,
    });
    promptStub.onCall(3).resolves({ addAnother: false });

    // valid attempt
    promptStub.onCall(4).resolves({
      instanceOrInstallation: 'installation',
      name: 'param1',
      id: 'param1',
      type: 'Symbol',
      required: false,
    });
    promptStub.onCall(5).resolves({ addAnother: true });
    promptStub.onCall(6).resolves({
      instanceOrInstallation: 'installation',
      name: 'param2',
      id: 'param2',
      type: 'Symbol',
      required: false,
    });
    promptStub.onCall(7).resolves({ addAnother: false });

    const consoleSpy = sinon.spy(console, 'log');
    await buildAppParameterSettings();
    chai.expect(consoleSpy.calledWith('Installation parameter IDs must be unique.')).to.be.true;
    consoleSpy.restore();
  });
});


