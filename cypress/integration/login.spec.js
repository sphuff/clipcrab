describe('login', () => {
    it('should successfully log into our app', () => {
      cy.visit('http://localhost:3001/');
      cy.logInTestUser()
        .then(userProfile => {
          expect(userProfile.displayName).to.equal('cypress_testing@clipcrab.com');
        });
      });
});