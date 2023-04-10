// function highlightWord(searchText: string) {
//   const body = document.getElementsByTagName('body')[0];
//   const regex = new RegExp(searchText, 'gi');
//   const matches = body.textContent.match(regex);

//   if (matches && matches.length > 0) {
//     const range = document.createRange();
//     const sel = window.getSelection();
//     const nodeFilter = {
//       acceptNode: function (node) {
//         return node.nodeType === Node.TEXT_NODE
//           ? NodeFilter.FILTER_ACCEPT
//           : NodeFilter.FILTER_SKIP;
//       },
//     };
//     const treeWalker = document.createTreeWalker(
//       body,
//       NodeFilter.SHOW_TEXT,
//       nodeFilter,
//       false
//     );

//     let matchIndex = 0;
//     let nodeIndex = 0;
//     while (treeWalker.nextNode()) {
//       const node = treeWalker.currentNode;
//       const nodeText = node.textContent;
//       const matchStartIndex = nodeText
//         .toLowerCase()
//         .indexOf(searchText.toLowerCase(), matchIndex);
//       if (matchStartIndex !== -1) {
//         nodeIndex++;
//         const startIdx = matchStartIndex;
//         const endIdx = matchStartIndex + searchText.length;
//         range.setStart(node, startIdx);
//         range.setEnd(node, endIdx);
//         const mark = document.createElement('mark');
//         mark.style.backgroundColor = 'yellow';
//         range.surroundContents(mark);
//         matchIndex = endIdx;
//       } else {
//         matchIndex = 0;
//       }
//     }
//     sel.removeAllRanges();
//     sel.addRange(range);
//   }
// }

// chrome.runtime.onMessage.addListener((message) => {
//   if (message.type === 'highlight_word') {
//     highlightWord(message.word);
//   }
// });

// ####################################################

// // start/src/contentScript/contentScript.tsx

// import React, { useEffect, useState } from 'react';
// import ReactDOM from 'react-dom';
// import { Messages } from '../utils/messages';
// import DraggableModal from '../components/DraggableModal';
// import SearchInput from '../components/SearchInput';
// import './contentScript.css';

// const App: React.FC<{}> = () => {
//   const [showModal, setShowModal] = useState<boolean>(false);

//   const sendMessageToBackground = () => {
//     chrome.runtime.sendMessage({
//       from: 'content',
//       type: 'content',
//       // payload: 'Hello from content script',
//       payload: { title: document.title, innerHtml: document.body.innerHTML },
//     });
//   };

//   // const handleMessages = (msg: Messages) => {
//   //   if (msg.from === 'background' && msg.type === 'content') {
//   //     console.log('Message received from background script:', msg.payload);
//   //   }
//   // };

//   const handleSubmit = (value: string) => {
//     // sendMessageToBackground();
//     chrome.runtime.sendMessage({
//       from: 'content',
//       type: 'execute-content-script',
//     });
//   };

//   useEffect(() => {
//     // const innerHTML = document.body.innerHTML;
//     const innerHTML = document.title;
//     chrome.runtime.sendMessage({
//       from: 'content',
//       type: 'get-inner-html',
//       payload: innerHTML,
//     });

//     // return null;

//     // chrome.runtime.onMessage.addListener(handleMessages);

//     // return () => {
//     //   chrome.runtime.onMessage.removeListener(handleMessages);
//     // };

//     // ctrl-shft-f keydown listen:
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.ctrlKey && e.shiftKey && e.key === 'F') {
//         setShowModal((prevState) => !prevState);
//       }
//     };
//     window.addEventListener('keydown', handleKeyDown);

//     // Cleanup the event listener on unmount
//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [showModal]);

//   // console.log('ContentScript now running...');

//   return (
//     <>
//       {showModal && (
//         <div className="overlayCard">
//           <DraggableModal>
//             <SearchInput onSubmit={handleSubmit} />
//           </DraggableModal>
//         </div>
//       )}
//     </>
//   );
// };

// const root = document.createElement('div');
// document.body.appendChild(root);
// ReactDOM.render(<App />, root);
