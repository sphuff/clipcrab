// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (overrides = {}) => {
    Cypress.log({
      name: 'loginViaAuth0',
      message: Cypress.env('auth_url') +':' + Cypress.env('auth_audience'),
    });
  
    const options = {
      method: 'POST',
      url: Cypress.env('auth_url'),
      body: {
        grant_type: 'password',
        username: Cypress.env('auth_username'),
        password: Cypress.env('auth_password'),
        audience: Cypress.env('auth_audience'),
        scope: 'openid profile email',
        client_id: Cypress.env('auth_client_id'),
        client_secret: Cypress.env('auth_client_secret'),
      },
    };
    cy.request(options);
});

Cypress.Commands.add('lazyLogin', (overrides = {}) => {
  Cypress.log({
    name: 'lazyLogin',
    message: Cypress.env('auth_url') +':' + Cypress.env('auth_audience'),
  });
  
  cy.get('input[type="email"]')
    .type(Cypress.env('auth_username'));
  cy.get('input[type="password"]')
    .type(Cypress.env('auth_password'));

  cy.setCookie('hasAuthenticated', 'true');
  return cy.get('form')
    .submit();
});

Cypress.Commands.add('logInTestUser', (overrides = {}) => {
  Cypress.log({
    name: 'logInTestUser',
    message: Cypress.env('auth_url') +':' + Cypress.env('auth_audience'),
  });

  return cy.visit('http://localhost:3001/')
    .then(() => cy.wait(1000))
    .then(() => cy.document())
    .then(doc => {
      if (doc.querySelector('input[type="email"]') !== null) {
        return cy.lazyLogin();
      }
    });
});

Cypress.Commands.add('uploadTestAudio', (overrides = {}) => {
  Cypress.log({
    name: 'uploadTestAudio',
  });

  cy.fixture('mmbam.mp3', 'base64').as('mp3');
  return cy.get('#audio-input').then(function (el) {
      const blob = Cypress.Blob.base64StringToBlob(this.mp3, 'audio/mpeg')
      const file = new File([blob], 'audio/mmbam.mp4', { type: 'audio/mpeg' })
      const list = new DataTransfer()

      list.items.add(file)
      const myFileList = list.files

      el[0].files = myFileList
      el[0].dispatchEvent(new Event('change', { bubbles: true }))
  });
});

