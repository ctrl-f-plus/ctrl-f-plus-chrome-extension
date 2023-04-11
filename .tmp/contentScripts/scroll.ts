// src/contentScripts/scroll.ts

interface scrollToElementProps {
  element: any;
}

export const scrollToElement = ({ element }: scrollToElementProps) => {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
};
