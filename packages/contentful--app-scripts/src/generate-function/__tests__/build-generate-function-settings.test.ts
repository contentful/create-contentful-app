import { GenerateFunctionSettings } from "../../types";
import assert from 'node:assert'

const { buildGenerateFunctionSettingsFromOptions } = require('../build-generate-function-settings');

describe('buildGenerateFunctionSettingsFromOptions', () => {
    it('should return GenerateFunctionSettings - using minimum template', async () => {
        const options = {
            name: 'test',
            template: 'typescript',
        }
        const expected = {
            name: 'test',
            sourceType: 'template',
            sourceName: 'typescript',
            language: 'typescript',
        } as GenerateFunctionSettings
        
        const settings = await buildGenerateFunctionSettingsFromOptions(options);
        assert.deepEqual(expected, settings);
    });

    it('should return GenerateFunctionSettings - using minimum example', async () => {
        const options = {
            name: 'test',
            example: 'appevent-handler',
            language: 'typescript'
        }
        const expected = {
            name: 'test',
            sourceType: 'example',
            sourceName: 'appevent-handler',
            language: 'typescript',
        }
        const settings = await buildGenerateFunctionSettingsFromOptions(options);
        assert.deepEqual(expected, settings);
    });
})