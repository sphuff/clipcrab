const { expect } = require('chai');
const ForcedAlignmentController = require('../../src/controllers/ForcedAlignmentController');

describe('ForcedAlignmentController', () => {
    it('alignMedia', () => {
        expect(ForcedAlignmentController.alignMedia()).to.not.be.null;
    });
})