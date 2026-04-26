export function PaymentDetails() {
  return (
    <div className="py-10 border-b border-gray-200">
      <h3 className="text-[22px] font-semibold text-gray-900 mb-6">Payment Details</h3>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-[16px] font-semibold text-gray-900 mb-4">Bank Transfer</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[14px] text-gray-600">Bank Name:</span>
              <span className="text-[14px] font-medium text-gray-900">First National Bank</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[14px] text-gray-600">Account Name:</span>
              <span className="text-[14px] font-medium text-gray-900">Softsync Solutions LLC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[14px] text-gray-600">Account Number:</span>
              <span className="text-[14px] font-medium text-gray-900">1234 5678 9012</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[14px] text-gray-600">Routing Number:</span>
              <span className="text-[14px] font-medium text-gray-900">021000021</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[14px] text-gray-600">SWIFT Code:</span>
              <span className="text-[14px] font-medium text-gray-900">FNBAUS33</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-[16px] font-semibold text-gray-900 mb-4">Digital Payment</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[14px] text-gray-600">UPI ID:</span>
              <span className="text-[14px] font-medium text-gray-900">softsync@bank</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[14px] text-gray-600">PayPal:</span>
              <span className="text-[14px] font-medium text-gray-900">payments@softsync.io</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[14px] text-gray-600">Venmo:</span>
              <span className="text-[14px] font-medium text-gray-900">@SoftsyncSolutions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-[14px] text-gray-700">
          <span className="font-semibold text-gray-900">Payment Instructions:</span> Please include invoice number
          <span className="font-semibold"> INV-2026-001</span> in the payment reference. Payment is due within 30 days
          of the invoice date. For questions regarding this invoice, contact us at billing@softsync.io
        </p>
      </div>
    </div>
  );
}
