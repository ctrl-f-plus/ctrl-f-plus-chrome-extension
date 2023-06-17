```bash
FAIL  __tests__/e2e/e2e.test.ts (48.137 s)
  Tab Navigation Extension
    Single Tab: Basic Match Navigation
      Match Highlighting
        ✓ Extension finds and highlights correct number of matches (1076 ms)
      Count Display
        ✓ Total Matches Count is accurate (15 ms)
      Navigation Methods
        Navigation works correctly with nextButton
          ✓ Navigation works correctly with nextButton (118 ms)
        Navigation works correctly with Enter Key
          ✓ Navigation works correctly with Enter key (3047 ms)
        Navigation works correctly with Previous Button
          ✓ Navigation works correctly with previousButton (87 ms)
      Closing the Search Input
        ✓ closing the search input hides the overlay (1 ms)
        ✓ closing the search input unhighlights all matches (1012 ms)
    Two Tabs: Tab Switching and Skipping
      Match Highlighting
        ✓ Extension finds and highlights correct number of matches (1074 ms)
      Count Display
        ✕ Total Matches Count is accurate (15 ms)
      Navigation Methods
        Navigation works correctly with nextButton
          ✕ Navigation works correctly with nextButton (11 ms)
        Navigation works correctly with Enter Key
          ✕ Navigation works correctly with Enter key (4 ms)
        Navigation works correctly with Previous Button
          ✕ Navigation works correctly with previousButton (5 ms)
      Closing the Search Input
        ✓ closing the search input hides the overlay (1 ms)
        ✓ closing the search input unhighlights all matches (1012 ms)
    Three Tabs: Multiple Tab Switching and Skipping
      Match Highlighting
        ✓ Extension finds and highlights correct number of matches (1109 ms)
      Count Display
        ✓ Total Matches Count is accurate (9 ms)
      Navigation Methods
        Navigation works correctly with nextButton
          ✕ Navigation works correctly with nextButton (415 ms)
        Navigation works correctly with Enter Key
          ✓ Navigation works correctly with Enter key (5145 ms)
        Navigation works correctly with Previous Button
          ✓ Navigation works correctly with previousButton (289 ms)
      Closing the Search Input
        ✓ closing the search input hides the overlay (2 ms)
        ✓ closing the search input unhighlights all matches (1013 ms)
    Three Tabs: All Tabs with Matches
      Match Highlighting
        ✓ Extension finds and highlights correct number of matches (1184 ms)
      Count Display
        ✓ Total Matches Count is accurate (19 ms)
      Navigation Methods
        Navigation works correctly with nextButton
          ✕ Navigation works correctly with nextButton (53 ms)
        Navigation works correctly with Enter Key
          ✕ Navigation works correctly with Enter key (1061 ms)
        Navigation works correctly with Previous Button
          ✕ Navigation works correctly with previousButton (45 ms)
      Closing the Search Input
        ✓ closing the search input hides the overlay (1 ms)
        ✓ closing the search input unhighlights all matches (1012 ms)
    Three Tabs: No Matches in Any Tab
      Match Highlighting
        ✓ Extension finds and highlights correct number of matches (1085 ms)
      Count Display
        ✓ Total Matches Count is accurate (11 ms)
      Navigation Methods
        Navigation works correctly with nextButton
          ✓ Navigation works correctly with nextButton (11 ms)
        Navigation works correctly with Enter Key
          ✓ Navigation works correctly with Enter key (6 ms)
        Navigation works correctly with Previous Button
          ✓ Navigation works correctly with previousButton (7 ms)
      Closing the Search Input
        ✓ closing the search input hides the overlay (1 ms)
        ✓ closing the search input unhighlights all matches (1012 ms)
    Eight Tabs: Mixed Matches
      Match Highlighting
        ✓ Extension finds and highlights correct number of matches (1151 ms)
      Count Display
        ✓ Total Matches Count is accurate (32 ms)
      Navigation Methods
        Navigation works correctly with nextButton
          ✕ Navigation works correctly with nextButton (271 ms)
        Navigation works correctly with Enter Key
          ✕ Navigation works correctly with Enter key (1104 ms)
        Navigation works correctly with Previous Button
          ✕ Navigation works correctly with previousButton (126 ms)
      Closing the Search Input
        ✓ closing the search input hides the overlay (1 ms)
        ✓ closing the search input unhighlights all matches (1050 ms)

  ● Tab Navigation Extension › Two Tabs: Tab Switching and Skipping › Count Display › Total Matches Count is accurate

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 0

      191 |           totalMatchesCount = parseInt(matchingCounts.split('/')[1]);
      192 |
    > 193 |           expect(totalMatchesCount).toBe(totalHighlightCount);
          |                                     ^
      194 |         });
      195 |       });
      196 |

      at toBe (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:193:37)
      at call (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator.tryCatch (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator._invoke [as next] (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)

  ● Tab Navigation Extension › Two Tabs: Tab Switching and Skipping › Navigation Methods › Navigation works correctly with nextButton › Navigation works correctly with nextButton

    expect(received).toStrictEqual(expected) // deep equality

    - Expected  - 1
    + Received  + 1

      Array [
    -   1,
    +   0,
      ]

      515 |   }
      516 |
    > 517 |   expect(navigatedTabPath2).toStrictEqual(expectedNavPath);
          |                             ^
      518 | }
      519 |

      at toStrictEqual (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:517:29)
      at call (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator.tryCatch (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator._invoke [as next] (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)

  ● Tab Navigation Extension › Two Tabs: Tab Switching and Skipping › Navigation Methods › Navigation works correctly with Enter Key › Navigation works correctly with Enter key

    expect(received).toStrictEqual(expected) // deep equality

    - Expected  - 1
    + Received  + 1

      Array [
    -   1,
    +   0,
      ]

      515 |   }
      516 |
    > 517 |   expect(navigatedTabPath2).toStrictEqual(expectedNavPath);
          |                             ^
      518 | }
      519 |

      at toStrictEqual (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:517:29)
      at call (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator.tryCatch (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator._invoke [as next] (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)

  ● Tab Navigation Extension › Two Tabs: Tab Switching and Skipping › Navigation Methods › Navigation works correctly with Previous Button › Navigation works correctly with previousButton

    expect(received).toStrictEqual(expected) // deep equality

    - Expected  - 1
    + Received  + 1

      Array [
    -   1,
    +   0,
      ]

      515 |   }
      516 |
    > 517 |   expect(navigatedTabPath2).toStrictEqual(expectedNavPath);
          |                             ^
      518 | }
      519 |

      at toStrictEqual (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:517:29)
      at call (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator.tryCatch (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator._invoke [as next] (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)

  ● Tab Navigation Extension › Three Tabs: Multiple Tab Switching and Skipping › Navigation Methods › Navigation works correctly with nextButton › Navigation works correctly with nextButton

    expect(received).toStrictEqual(expected) // deep equality

    - Expected  - 1
    + Received  + 0

      Array [
        0,
    -   2,
        0,
      ]

      515 |   }
      516 |
    > 517 |   expect(navigatedTabPath2).toStrictEqual(expectedNavPath);
          |                             ^
      518 | }
      519 |

      at toStrictEqual (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:517:29)
      at call (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator.tryCatch (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator._invoke [as next] (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)

  ● Tab Navigation Extension › Three Tabs: All Tabs with Matches › Navigation Methods › Navigation works correctly with nextButton › Navigation works correctly with nextButton

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 1

      489 |     let currentMatchIndex = parseInt(matchingCounts.split('/')[0]);
      490 |
    > 491 |     expect(globalMatchIndex).toBe(currentMatchIndex - 1);
          |                              ^
      492 |
      493 |     let expectedValue;
      494 |     if (isNavigatingFowards) {

      at toBe (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:491:30)
      at call (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator.tryCatch (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator._invoke [as next] (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)

  ● Tab Navigation Extension › Three Tabs: All Tabs with Matches › Navigation Methods › Navigation works correctly with Enter Key › Navigation works correctly with Enter key

    expect(received).toBe(expected) // Object.is equality

    Expected: 8
    Received: 1

      489 |     let currentMatchIndex = parseInt(matchingCounts.split('/')[0]);
      490 |
    > 491 |     expect(globalMatchIndex).toBe(currentMatchIndex - 1);
          |                              ^
      492 |
      493 |     let expectedValue;
      494 |     if (isNavigatingFowards) {

      at toBe (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:491:30)
      at call (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator.tryCatch (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator._invoke [as next] (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)

  ● Tab Navigation Extension › Three Tabs: All Tabs with Matches › Navigation Methods › Navigation works correctly with Previous Button › Navigation works correctly with previousButton

    expect(received).toBe(expected) // Object.is equality

    Expected: 7
    Received: 8

      489 |     let currentMatchIndex = parseInt(matchingCounts.split('/')[0]);
      490 |
    > 491 |     expect(globalMatchIndex).toBe(currentMatchIndex - 1);
          |                              ^
      492 |
      493 |     let expectedValue;
      494 |     if (isNavigatingFowards) {

      at toBe (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:491:30)
      at call (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator.tryCatch (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator._invoke [as next] (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)

  ● Tab Navigation Extension › Eight Tabs: Mixed Matches › Navigation Methods › Navigation works correctly with nextButton › Navigation works correctly with nextButton

    expect(received).toBe(expected) // Object.is equality

    Expected: 0
    Received: 3

      489 |     let currentMatchIndex = parseInt(matchingCounts.split('/')[0]);
      490 |
    > 491 |     expect(globalMatchIndex).toBe(currentMatchIndex - 1);
          |                              ^
      492 |
      493 |     let expectedValue;
      494 |     if (isNavigatingFowards) {

      at toBe (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:491:30)
      at call (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator.tryCatch (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator._invoke [as next] (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)

  ● Tab Navigation Extension › Eight Tabs: Mixed Matches › Navigation Methods › Navigation works correctly with Enter Key › Navigation works correctly with Enter key

    expect(received).toBe(expected) // Object.is equality

    Expected: 4
    Received: 1

      489 |     let currentMatchIndex = parseInt(matchingCounts.split('/')[0]);
      490 |
    > 491 |     expect(globalMatchIndex).toBe(currentMatchIndex - 1);
          |                              ^
      492 |
      493 |     let expectedValue;
      494 |     if (isNavigatingFowards) {

      at toBe (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:491:30)
      at call (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator.tryCatch (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator._invoke [as next] (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)

  ● Tab Navigation Extension › Eight Tabs: Mixed Matches › Navigation Methods › Navigation works correctly with Previous Button › Navigation works correctly with previousButton

    expect(received).toBe(expected) // Object.is equality

    Expected: 3
    Received: 7

      489 |     let currentMatchIndex = parseInt(matchingCounts.split('/')[0]);
      490 |
    > 491 |     expect(globalMatchIndex).toBe(currentMatchIndex - 1);
          |                              ^
      492 |
      493 |     let expectedValue;
      494 |     if (isNavigatingFowards) {

      at toBe (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:491:30)
      at call (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator.tryCatch (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at Generator._invoke [as next] (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)
      at asyncGeneratorStep (/home/benchavez/Code (Ubuntu VM)../../../../../../Projects/ctrl-f-plus/ctrl-f-plus-chrome-extension/__tests__/e2e/e2e.test.ts:2:1)



```
