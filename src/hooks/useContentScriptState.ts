// import { useContext, useEffect } from 'react';

// export const useContentScriptState = () => {
//   const { state, setState } = useContext(TabContext);

//   useEffect(() => {
//     const handleMessage = (
//       // request: any, sender: any, sendResponse: any
//       message: any,
//       sender: any,
//       sendResponse: any
//     ) => {
//       if (
//         message.from === 'getInnerHtmlScript' &&
//         message.type === 'UPDATE_STATE'
//       ) {
//         setState((prevState: any) => ({ ...prevState, ...message.payload }));
//       }
//     };

//     chrome.runtime.onMessage.addListener(handleMessage);

//     return () => {
//       chrome.runtime.onMessage.removeListener(handleMessage);
//     };
//   }, [setState]);

//   const updateContentScriptState = (payload: any) => {
//     chrome.runtime.sendMessage({
//       from: 'useContentScriptState',
//       type: 'UPDATE_STATE',
//       payload,
//     });
//   };

//   return { state, updateContentScriptState };
// };
