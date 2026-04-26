export function InvoiceTotal() {
  const subtotal = 93000;
  const discount = 0;
  const taxRate = 0.18;
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + tax;

  return (
    <div className="pb-10 border-b border-gray-200">
      <div className="flex justify-end">
        <div className="w-full max-w-md">
          <div className="space-y-3 bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-baseline">
              <span className="text-[15px] text-gray-700">Subtotal:</span>
              <span className="text-[16px] font-semibold text-gray-900">
                ${subtotal.toLocaleString()}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-baseline">
                <span className="text-[15px] text-green-700">Discount:</span>
                <span className="text-[16px] font-semibold text-green-700">
                  -${discount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between items-baseline">
              <span className="text-[15px] text-gray-700">Tax (GST 18%):</span>
              <span className="text-[16px] font-semibold text-gray-900">
                ${tax.toLocaleString()}
              </span>
            </div>
            <div className="h-px bg-gray-300 my-2"></div>
            <div className="flex justify-between items-baseline bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 -mx-2">
              <span className="text-[17px] font-bold text-white">Total Amount:</span>
              <span className="text-[22px] font-bold text-white">
                ${total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
