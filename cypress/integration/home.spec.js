describe('forced alignment', () => {
    before(() => {
        cy.logInTestUser()
        // cy.visit('http://localhost:3000');
        cy.get('.appContainer');
    });

    it('Should be able to enter and submit text', () => {
        cy.uploadTestAudio()
            .then(() => cy.get('.editorContainer'))
            .then(() => cy.contains('Transcribe Audio').click())
            .then(() => cy.contains('This is the text we got. Would you like to make any edits?'))
            .then(() => cy.get('.transcriptionInput-transcriptionEdit').clear().type('1234'))
            .then(() => cy.get('.transcriptionInput-transcriptionEditContainer').contains('Confirm').click())
            .then(() => cy.get('.transcriptionInput-container', { timeout: 60000 }).contains('1234'))
    });

    it('should be able to play/pause audio', () => {
        cy.get('.timelineContainer')
            .then(() => cy.get('.timeline-playPauseBtn .fa-pause').click())
            .then(() => cy.get('.timeline-playPauseBtn .fa-play'))
    });
});