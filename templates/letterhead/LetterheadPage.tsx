import { LetterheadHeader } from './LetterheadHeader';
import { LetterheadFooter } from './LetterheadFooter';
import { ReactNode } from 'react';

interface LetterheadPageProps {
  pageNumber: number;
  children: ReactNode;
}

export function LetterheadPage({ pageNumber, children }: LetterheadPageProps) {
  return (
    <div
      className="mx-auto bg-white shadow-lg mb-8 print:shadow-none print:mb-0"
      style={{
        width: '210mm',
        minHeight: '297mm',
        maxWidth: '100%',
      }}
    >
      <div className="flex flex-col h-full px-16 py-12">
        <LetterheadHeader />

        {/* Content area with generous margins */}
        <div className="flex-1 py-10">
          {children}
        </div>

        <LetterheadFooter pageNumber={pageNumber} />
      </div>
    </div>
  );
}
