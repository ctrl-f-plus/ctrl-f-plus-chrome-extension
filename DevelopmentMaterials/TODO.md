- Re-implement the chrome storage utility
<!-- - Add Environment Variables
  - Set showLayover and showMatches to true for testing -->
- See if you can get tailwind styles to work in the `SearchInput` component so that you don't have to mix tailwind with vanilla css
- Add logging to the application:
  - Move the `console.log('Received message:', message);` output to the logger
- Split Content Script so that everything isn't injected into all tabs all of the time.
- Context(s):
  - Should `LayoverContext` be split further?
  - `TabStateContext`
    - Rename?
    - Review the commented out code?
- Review the logic in the `useFindMatches` hook and see if it should be broken down into separate hooks
- `useMessageHandler` Hook:
  - Review the use of `async` on your messages and update this hook accordingly
  - Rename?
  - See if you can use it in more places
  <!-- - Fix the `popup` button so that it opens the search component -->
- Finalize the manifest file
- Cleanup all uses of `state2`
- Cleanup the use of `searchValue` and `findValue`

- FIX: Issue that comes up when you search the same value two times in a row, but the tabs or any of their respective content was changed in between searches. When this happens, the search logic doesn't know to examine the changed content because it is triggering a `nextMatch()` not a `New Search`.

- FIX: input styling is broken on this page: https://eslint.org/docs/latest/rules/no-case-declarations