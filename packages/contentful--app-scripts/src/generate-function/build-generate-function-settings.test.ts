import { GenerateFunctionSettings } from "../types";
import assert from 'node:assert'
import { buildGenerateFunctionSettingsFromOptions } from './build-generate-function-settings';

describe('buildGenerateFunctionSettingsFromOptions', () => {
    it('should return GenerateFunctionSettings - using minimum template', async () => {
        const options = {
            name: 'test',
            source: 'APPEVENT-HANDLER',
            language: 'typescript'
        } as GenerateFunctionSettings
        const expected = {
            name: 'test',
            source: 'appevent-handler',
            language: 'typescript',
        } as GenerateFunctionSettings
        
        const settings = await buildGenerateFunctionSettingsFromOptions(options);
        assert.deepEqual(expected, settings);
    });
})