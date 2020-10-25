describe('happy path', () => {
    before(() => {
        cy.logInTestUser()
        // cy.visit('http://localhost:3000');
        cy.get('.appContainer');
    });

    it('full flow, from upload to encoding', () => {
        cy.fixture('mmbam.mp3', 'base64').as('mp3');
        cy.get('#audio-input').then(function (el) {
            const blob = Cypress.Blob.base64StringToBlob(this.mp3, 'audio/mpeg')
            const file = new File([blob], 'audio/mmbam.mp4', { type: 'audio/mpeg' })
            const list = new DataTransfer()

            list.items.add(file)
            const myFileList = list.files

            el[0].files = myFileList
            el[0].dispatchEvent(new Event('change', { bubbles: true }))
        })
        .then(() => cy.get('.editorContainer'))
        .then(() => cy.get('.editor-tray-lg .record-button').click())
        .then(() => cy.get('.editorContainer').contains('Now recording. Please wait to complete'))
        .then(() => cy.get('.editorContainer').contains('Encoding video. Almost there.', { timeout: 60000 }))
        .then(() => cy.get('.appContainer').contains('Congrats, you can download your video by clicking'))
        .then(() => cy.get('.encoding-link'))
    });
});