import { GenerateFunctionSettings } from "../types";
import assert from 'node:assert'
import { buildGenerateFunctionSettingsCLI } from './build-generate-function-settings';

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
})