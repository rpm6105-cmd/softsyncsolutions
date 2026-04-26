export function ClientInfo() {
  return (
    <div className="grid grid-cols-2 gap-12 py-10 border-b border-gray-200">
      <div>
        <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Prepared For
        </h3>
        <div className="space-y-1.5">
          <p className="font-semibold text-[18px] text-gray-900">Acme Corporation</p>
          <p className="text-[15px] text-gray-600">John Smith</p>
          <p className="text-[15px] text-gray-600">Chief Technology Officer</p>
          <p className="text-[15px] text-gray-600">john.smith@acmecorp.com</p>
          <p className="text-[15px] text-gray-600">+1 (555) 123-4567</p>
        </div>
      </div>
      <div>
        <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Prepared By
        </h3>
        <div className="space-y-1.5">
          <p className="font-semibold text-[18px] text-gray-900">Softsync Solutions</p>
          <p className="text-[15px] text-gray-600">Sarah Johnson</p>
          <p className="text-[15px] text-gray-600">Senior Solutions Architect</p>
          <p className="text-[15px] text-gray-600">sarah@softsyncsolutions.com</p>
          <p className="text-[15px] text-gray-600">+1 (555) 987-6543</p>
        </div>
      </div>
    </div>
  );
}