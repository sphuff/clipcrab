describe('forced alignment', () => {
    before(() => {
        cy.logInTestUser()
        // cy.visit('http://localhost:3000');
        cy.get('.appContainer');
    });

    it('full flow, from upload to encoding', () => {
        cy.uploadTestAudio()
            .then(() => cy.get('.editorContainer'))
            .then(() => cy.contains('Transcribe Text').click())
            .then(() => cy.contains('This is what we got. Would you like to make any edits?'))
    });
});