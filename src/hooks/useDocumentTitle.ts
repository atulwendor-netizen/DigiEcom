import { useEffect } from 'react';

export function useDocumentTitle(title: string, description?: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | DigiEcom` : 'DigiEcom — Premium Digital Products Storefront';

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    return () => {
      document.title = previousTitle;
    };
  }, [title, description]);
}
