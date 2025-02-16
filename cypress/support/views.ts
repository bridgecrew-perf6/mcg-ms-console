import { BRIDGE_PASSWORD } from '../consts';

export const submitButton = 'button[type=submit]';
export const masthead = {
  username: {
    shouldBeVisible: () =>
      cy
        .byTestID(Cypress.env(BRIDGE_PASSWORD) ? 'user-dropdown' : 'username')
        .should('be.visible'),
    shouldHaveText: (text: string) =>
      cy
        .byTestID(Cypress.env(BRIDGE_PASSWORD) ? 'user-dropdown' : 'username')
        .should('have.text', text),
  },
  clickMastheadLink: (path: string) => {
    return cy.byTestID(path).click();
  },
};
