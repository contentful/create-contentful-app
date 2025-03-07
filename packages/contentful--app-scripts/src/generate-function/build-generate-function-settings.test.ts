import { GenerateFunctionSettings } from "../types";
import assert from 'node:assert'
import { buildGenerateFunctionSettingsCLI, validateArguments } from './build-generate-function-settings';

describe('buildGenerateFunctionSettingsCLI', () => {
    it('should return GenerateFunctionSettings - using minimum template', async () => {
        const options = {
            name: 'test',
            example: 'APPEVENT-HANDLER',
            language: 'typescript'
        } as GenerateFunctionSettings
        const expected = {
            name: 'test',
            example: 'appevent-handler',
            language: 'typescript',
        } as GenerateFunctionSettings
        
        const settings = await buildGenerateFunctionSettingsCLI(options);
        assert.deepEqual(expected, settings);
    });
    it('should fail if name is not alphanumeric', async () => {
        const options = {
            name: 'test!',
            example: 'APPEVENT-HANDLER',
            language: 'javascript'
        } as GenerateFunctionSettings
        try {
            await buildGenerateFunctionSettingsCLI(options);
        }
        catch (e) {
            assert.equal(e.message, '\x1B[31mInvalid function name: test!. Note that function names must be alphanumeric.\x1B[39m');
        }
    });
    it('should fail if name is in banned names', async () => {
        const options = {
            name: 'example',
            example: 'APPEVENT-HANDLER',
            language: 'javascript'
        } as GenerateFunctionSettings
        try {
            await buildGenerateFunctionSettingsCLI(options);
        }
        catch (e) {
            assert.equal(e.message, '\x1B[31mInvalid function name: example is not allowed.\x1B[39m');
        }
    });
    it('should fail if name is empty', async () => {
        const options = {
            example: 'APPEVENT-HANDLER',
            name: '',
            language: 'javascript'
        } as GenerateFunctionSettings
        try {
            await buildGenerateFunctionSettingsCLI(options);
        }
        catch (e) {
            assert.equal(e.message, '\x1B[31mInvalid function name:  is not allowed.\x1B[39m');
        }
    });
    it('should fail if name is not provided', async () => {
        const options = {
            example: 'APPEVENT-HANDLER',
            language: 'javascript'
        } as GenerateFunctionSettings
        try {
            await buildGenerateFunctionSettingsCLI(options);
        }
        catch (e) {
            assert.equal(e.message, '\x1B[31mYou must specify a function name, an example, and a language\x1B[39m');
        }
    });

    it('should fail if example is not provided', async () => {
        const options = {
            name: 'test',
            language: 'javascript'
        } as GenerateFunctionSettings
        try {
            await buildGenerateFunctionSettingsCLI(options);
        }
        catch (e) {
            assert.equal(e.message, '\x1B[31mYou must specify a function name, an example, and a language\x1B[39m');
        }
    });
    it('should fail if language is not provided', async () => {
        const options = {
            name: 'test',
            example: 'APPEVENT-HANDLER',
        } as GenerateFunctionSettings
        try {
            await buildGenerateFunctionSettingsCLI(options);
        }
        catch (e) {
            assert.equal(e.message, '\x1B[31mYou must specify a function name, an example, and a language\x1B[39m');
        }
    });

    it('should continue with typescript if language is not in the list', async () => {
        const options = {
            name: 'test',
            example: 'APPEVENT-HANDLER',
            language: 'python'
        } 
        const expected = {
            name: 'test',
            example: 'appevent-handler',
            language: 'typescript',
        } as GenerateFunctionSettings
        validateArguments(options as GenerateFunctionSettings);
        assert.deepEqual(expected, options);
    });
})