'use client';

import { useEffect } from 'react';

/**
 * FaqAccordion
 *
 * Attaches smooth-close behaviour to all `.faq-item` <details> elements
 * rendered inside `.product-content`.
 *
 * Problem: When a <details> element is closed the browser removes the `open`
 * attribute synchronously, so the CSS transition on `grid-template-rows`
 * never plays – the content collapses instantly.
 *
 * Solution: Intercept the click, temporarily add `.faq-closing` (which CSS
 * transitions back to 0fr), wait for the animation duration, then allow the
 * browser to close the element.
 */
export default function FaqAccordion() {
  useEffect(() => {
    const DURATION = 280; // must match CSS transition duration

    const details = document.querySelectorAll<HTMLDetailsElement>(
      '.product-content details.faq-item',
    );

    const handlers: Array<[HTMLDetailsElement, (e: MouseEvent) => void]> = [];

    details.forEach((el) => {
      const handler = (e: MouseEvent) => {
        // Only intercept when the item is currently OPEN (user is closing it)
        if (!el.open) return;

        e.preventDefault();

        // Add closing class → CSS transitions to 0fr
        el.classList.add('faq-closing');

        setTimeout(() => {
          el.open = false;
          el.classList.remove('faq-closing');
        }, DURATION);
      };

      // Listen on the summary so we get the click before browser toggles
      const summary = el.querySelector('summary');
      if (summary) {
        summary.addEventListener('click', handler as EventListener);
        handlers.push([el, handler as unknown as (e: MouseEvent) => void]);
      }
    });

    return () => {
      handlers.forEach(([el, handler]) => {
        const summary = el.querySelector('summary');
        if (summary) summary.removeEventListener('click', handler as EventListener);
      });
    };
  }, []);

  return null; // renders nothing
}
