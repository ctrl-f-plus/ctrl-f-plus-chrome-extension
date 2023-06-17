```
Unit Tests:
These tests are meant to test individual functions or components in isolation. They are the building blocks of your testing strategy.

Input Field Tests:

Test if the input field correctly captures user input.
Test if the input field handles special characters correctly.
Search Functionality Tests:

Test if the search function correctly searches within a string (or a representation of a webpage's content).
Navigation Button Tests:

Test if the next button correctly navigates to the next match in a provided set of matches.
Test if the previous button correctly navigates to the previous match in a provided set of matches.
Close Functionality Tests:

Test if the close button correctly resets any state related to the search function.
Integration Tests:
Integration tests ensure that different parts of your application work together correctly.

Search Form Tests:

Test if the search form correctly calls the search function when a query is inputted.
Test if the search form correctly displays the match count returned by the search function.
Test if the next and previous buttons correctly navigate the current highlight based on the matches returned by the search function.
Test if the close button correctly hides the search form and resets its state.
Hotkey Tests:

Test if pressing the hotkey correctly displays the search form.
End-to-End Tests:
End-to-end tests simulate user interactions to verify the whole system works as expected.

Single-tab Search Tests:

Test if triggering the search via the hotkey correctly injects the search form into the tab's HTML.
Test if entering a query into the search form correctly highlights matches in the tab.
Test if the next and previous buttons correctly navigate between matches.
Test if the close button correctly removes the search form from the tab's HTML.
Multi-tab Search Tests:

Test if triggering the search via the hotkey correctly injects the search form into all tabs' HTML.
Test if entering a query into the search form correctly highlights matches in all tabs.
Test if the next and previous buttons correctly navigate between matches across all tabs.
Test if the close button correctly removes the search form from all tabs' HTML.
```
```
describe('Test Extension', () => {

  describe('Single-tab Search Tests', () => {
    it('should correctly inject the search form into the tab\'s HTML when hotkey is pressed',
    );

    it('should correctly highlight matches in the tab when a query is entered',
    );

    it('should correctly navigate between matches when next and previous buttons are clicked',
    );

    it('should correctly remove the search form from the tab\'s HTML when close button is clicked',
    );
  });

  describe('Multi-tab Search Tests', () => {
    it('should correctly inject the search form into all tabs\' HTML when hotkey is pressed',
    );

    it('should correctly highlight matches in all tabs when a query is entered',
    );

    it('should correctly navigate between matches across all tabs when next and previous buttons are clicked',
    );

    it('should correctly remove the search form from all tabs\' HTML when close button is clicked',
    );
  });
});
```
