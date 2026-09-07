'use client';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../components/ui/accordion';
import { asset } from '../../lib/paths';
export { Photo } from './Photo';
export { Gallery } from './Gallery';
export function LinkArrow({
  href,
  children,
  button = false,
  light = false,
  external = false,
}: {
  href: string;
  children: ReactNode;
  button?: boolean;
  light?: boolean;
  external?: boolean;
}) {
  return (
    <a
      className={button ? `button ${light ? 'cream' : 'forest'}` : 'text-link'}
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
      <ArrowUpRight size={18} />
    </a>
  );
}
export function Pattern({
  tone = 'paper',
  variant,
}: {
  tone?: 'forest' | 'copper' | 'paper';
  variant?: 'fans';
}) {
  return (
    <div
      aria-hidden="true"
      className={`brand-pattern pattern-${tone}${variant ? ` pattern-${variant}` : ''}`}
      style={{
        backgroundImage: `url(${asset(`/brand/patterns/${variant ?? `direction-${tone === 'copper' ? 'copper' : 'forest'}`}.svg`)})`,
      }}
    />
  );
}
export function FaqList({
  items,
  headingLevel = 3,
}: {
  items: string[][];
  headingLevel?: 2 | 3;
}) {
  return (
    <Accordion className="faq-list">
      {items.map(([q, a], i) => (
        <AccordionItem key={q} value={String(i)}>
          <AccordionTrigger headingLevel={headingLevel}>{q}</AccordionTrigger>
          <AccordionContent>
            <p>{a}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
