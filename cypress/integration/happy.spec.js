describe('happy path', () => {
    before(() => {
        cy.logInTestUser()
        // cy.visit('http://localhost:3000');
        cy.get('.appContainer');
    });

    it('full flow, from upload to encoding', () => {
        cy.uploadTestAudio()
        .then(() => cy.get('.editorContainer'))
        .then(() => cy.get('.editor-tray-lg .record-button').click())
        .then(() => cy.get('.editorContainer').contains('Now recording. Please wait to complete'))
        .then(() => cy.get('.editorContainer').contains('Encoding video. Almost there.', { timeout: 60000 }))
        .then(() => cy.get('.appContainer').contains('Congrats, you can download your video by clicking'))
        .then(() => cy.get('.encoding-link'))
    });
});