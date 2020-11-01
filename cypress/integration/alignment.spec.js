describe('forced alignment', () => {
    before(() => {
        cy.logInTestUser()
        // cy.visit('http://localhost:3000');
        cy.get('.appContainer');
    });

    it('full flow, from upload to encoding', () => {
        cy.uploadTestAudio()
            .then(() => cy.get('.editorContainer'))
            .then(() => cy.contains('Transcribe Audio').click())
            .then(() => cy.contains('This is the text we got. Would you like to make any edits?'))
            .then(() => cy.get('.transcriptionInput-transcriptionEdit').clear().type('1234'))
            .then(() => cy.get('.transcriptionInput-transcriptionEditContainer').contains('Confirm').click())
            .then(() => cy.get('.transcriptionInput-container').contains('1234'))
    });
});