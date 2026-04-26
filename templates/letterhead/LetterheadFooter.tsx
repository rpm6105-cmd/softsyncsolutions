interface LetterheadFooterProps {
  pageNumber: number;
}

export function LetterheadFooter({ pageNumber }: LetterheadFooterProps) {
  return (
    <div className="pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <div>
          <p>123 Business Avenue, Suite 100, San Francisco, CA 94102</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="italic bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">
            Automate. Integrate. Scale.
          </p>
          <span className="text-gray-300">|</span>
          <p className="font-medium text-gray-700">Page {pageNumber}</p>
        </div>
      </div>
    </div>
  );
}
