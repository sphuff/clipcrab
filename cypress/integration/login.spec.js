describe('login', () => {
    it('should successfully log into our app', () => {
      cy.logInTestUser()
      cy.visit('http://localhost:3001/');
      cy.request('http://localhost:3001/user')
        .then(request => {
          const { body } = request;
          let profile = body && body.userProfile ? body.userProfile : null;
          return profile;
        })
        .then(userProfile => {
          expect(userProfile.displayName).to.equal('cypress_testing@clipcrab.com');
        });
    }); 
});