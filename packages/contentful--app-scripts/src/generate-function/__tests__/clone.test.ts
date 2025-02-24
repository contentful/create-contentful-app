import { SinonStub, stub } from "sinon";
import { expect } from "chai";
import * as fs from 'fs-extra';
import * as cloneModule from '../clone';
import { cloneFunction } from '../clone';
import { GenerateFunctionSettings } from '../../types';


describe('cloneFunction', () => {
    let consoleLogStub: SinonStub;
    let fsReaddirStub: SinonStub;
    let fsRenameStub: SinonStub;
    let fsCopyStub: SinonStub;
    let fsRemoveStub: SinonStub;
    let fsReadJsonStub: SinonStub;
    let fsWriteJsonStub: SinonStub;
    let cloneAndResolveManifestsStub: SinonStub;
    let errorStub: SinonStub;

    const localPath = '/local/path';
    const settings: GenerateFunctionSettings = {
        name: 'testFunction',
        sourceName: 'typescript',
        sourceType: 'template',
        language: 'typescript'
    };

    beforeEach(() => {
        consoleLogStub = stub(console, 'log');
        fsReaddirStub = stub(fs, 'readdir').resolves(['function.ts']);
        fsRenameStub = stub(fs, 'rename').resolves();
        fsCopyStub = stub(fs, 'copy').resolves();
        fsRemoveStub = stub(fs, 'remove').resolves();
        fsReadJsonStub = stub(fs, 'readJson').resolves({ functions: [{}] });
        fsWriteJsonStub = stub(fs, 'writeJson').resolves();
        cloneAndResolveManifestsStub = stub(cloneModule, 'cloneFunction').resolves();
        errorStub = stub(console, 'error');
    });

    afterEach(() => {
        consoleLogStub.restore();
        fsReaddirStub.restore();
        fsRenameStub.restore();
        fsCopyStub.restore();
        fsRemoveStub.restore();
        fsReadJsonStub.restore();
        fsWriteJsonStub.restore();
        cloneAndResolveManifestsStub.restore();
        errorStub.restore();
    });

    it('should clone and set up the function correctly', async () => {
        await cloneFunction(localPath, settings);

        expect(consoleLogStub.calledWithMatch(/Cloning function/)).to.be.true;
        expect(cloneAndResolveManifestsStub.calledOnce).to.be.true;
        expect(fsReaddirStub.calledOnce).to.be.true;
        expect(fsRenameStub.calledOnce).to.be.true;
        expect(fsCopyStub.calledOnce).to.be.true;
        expect(fsRemoveStub.calledOnce).to.be.true;
        expect(fsReadJsonStub.calledOnce).to.be.true;
        expect(fsWriteJsonStub.calledOnce).to.be.true;
    });

    it('should throw an error if no function file is found', async () => {
        fsReaddirStub.resolves([]);

        try {
            await cloneFunction(localPath, settings);
        } catch (e) {
            expect(e.message).to.equal('No function file found in /local/path/tmp');
        }

        expect(errorStub.calledOnce).to.be.true;
    });

    it('should handle errors and log them', async () => {
        const error = new Error('Test error');
        cloneAndResolveManifestsStub.rejects(error);

        try {
            await cloneFunction(localPath, settings);
        } catch (e) {
            expect(errorStub.calledWithMatch(/Failed to clone function/)).to.be.true;
        }
    });
});
