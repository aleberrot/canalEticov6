import { useState } from 'react';
import { TERMS } from '../data/terms';

export function TermsDisclosure() {
  const [open, setOpen] = useState(false);
  return (
    <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)} className="terms-disclosure text-left">
      <summary className="cursor-pointer text-primary underline">{TERMS.title}</summary>
      <div className="mt-4 space-y-3">{TERMS.paragraphs.map((text) => <p key={text}>{text}</p>)}</div>
      <button type="button" onClick={() => setOpen(false)} className="mt-4 text-primary underline">Cerrar</button>
    </details>
  );
}
