import React from 'react';

/**
 * Converts **bold** markdown markers in AI-generated text into <strong> elements.
 * Returns a React.ReactNode — use inside any JSX paragraph.
 *
 * Example:
 *   renderBold("The **CMA** approved the **£4.2bn** deal.")
 *   → <>The <strong>CMA</strong> approved the <strong>£4.2bn</strong> deal.</>
 */
export function renderBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return text; // nothing to bold

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-stone-900 dark:text-stone-50">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}

/**
 * Strips **bold** markers from a string, returning plain text.
 * Use before slicing excerpts so markers don't get cut mid-word.
 */
export function stripBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1');
}
