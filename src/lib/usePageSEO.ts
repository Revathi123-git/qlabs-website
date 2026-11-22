
import { useEffect } from 'react';

interface PageSEOProps {
  title: string;
  description: string;
  path: string;
}

export function usePageSEO({
  title,
  description,
  path,
}: PageSEOProps) {
  useEffect(() => {
    const url = `https://qlabsdiagnostics.com${path}`;

    document.title = title;

    const setMeta = (
      selector: string,
      attribute: string,
      value: string
    ) => {
      let element = document.querySelector(selector);

      if (!element) {
        element = document.createElement('meta');
        document.head.appendChild(element);
      }

      element.setAttribute(attribute, value);
    };

    setMeta('meta[name="description"]', 'name', 'description');
    setMeta('meta[name="description"]', 'content', description);

    setMeta('meta[property="og:title"]', 'property', 'og:title');
    setMeta('meta[property="og:title"]', 'content', title);

    setMeta('meta[property="og:description"]', 'property', 'og:description');
    setMeta('meta[property="og:description"]', 'content', description);

    setMeta('meta[property="og:url"]', 'property', 'og:url');
    setMeta('meta[property="og:url"]', 'content', url);

    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title');
    setMeta('meta[name="twitter:title"]', 'content', title);

    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description');
    setMeta('meta[name="twitter:description"]', 'content', description);

    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    canonical.href = url;
  }, [title, description, path]);
}
