export function BillingSection() {
  return (
    <div className="py-10 border-b border-gray-200">
      <div className="grid grid-cols-2 gap-12">
        <div>
          <h3 className="text-[16px] font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Bill To
          </h3>
          <div className="space-y-1">
            <p className="text-[18px] font-semibold text-gray-900">John Anderson</p>
            <p className="text-[15px] text-gray-700">TechVision Inc.</p>
            <p className="text-[15px] text-gray-600">john.anderson@techvision.com</p>
            <p className="text-[15px] text-gray-600">+1 (555) 123-4567</p>
          </div>
        </div>
        <div>
          <h3 className="text-[16px] font-semibold text-gray-400 uppercase tracking-wide mb-4">
            From
          </h3>
          <div className="space-y-1">
            <p className="text-[18px] font-semibold text-gray-900">Softsync Solutions</p>
            <p className="text-[15px] text-gray-700">123 Business Avenue, Suite 100</p>
            <p className="text-[15px] text-gray-700">San Francisco, CA 94102</p>
            <p className="text-[15px] text-gray-600">contact@softsync.io</p>
            <p className="text-[15px] text-gray-600">+1 (555) 987-6543</p>
          </div>
        </div>
      </div>
    </div>
  );
}
