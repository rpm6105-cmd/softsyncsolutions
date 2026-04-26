export function PricingTable() {
  const pricingItems = [
    { item: 'Discovery & Planning Phase', hours: 40, rate: 150, amount: 6000 },
    { item: 'UI/UX Design & Prototyping', hours: 80, rate: 150, amount: 12000 },
    { item: 'Frontend Development', hours: 200, rate: 150, amount: 30000 },
    { item: 'Backend Development & API', hours: 180, rate: 150, amount: 27000 },
    { item: 'Database Design & Integration', hours: 60, rate: 150, amount: 9000 },
    { item: 'Testing & Quality Assurance', hours: 80, rate: 150, amount: 12000 },
    { item: 'Deployment & DevOps', hours: 40, rate: 150, amount: 6000 },
    { item: 'Project Management', hours: 60, rate: 150, amount: 9000 },
  ];

  const subtotal = pricingItems.reduce((sum, item) => sum + item.amount, 0);
  const discount = subtotal * 0.1;
  const total = subtotal - discount;

  return (
    <div className="py-12 border-b border-gray-200">
      <h3 className="text-[22px] font-semibold text-gray-900 mb-6">Investment Breakdown</h3>
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-purple-600">
              <th className="text-left py-4 px-5 font-semibold text-[14px] text-white">Service Item</th>
              <th className="text-center py-4 px-5 font-semibold text-[14px] text-white">Hours</th>
              <th className="text-right py-4 px-5 font-semibold text-[14px] text-white">Rate</th>
              <th className="text-right py-4 px-5 font-semibold text-[14px] text-white">Amount</th>
            </tr>
          </thead>
          <tbody>
            {pricingItems.map((item, index) => (
              <tr key={index} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-5 text-[15px] text-gray-700">{item.item}</td>
                <td className="py-4 px-5 text-center text-[15px] text-gray-600">{item.hours}</td>
                <td className="py-4 px-5 text-right text-[15px] text-gray-600">${item.rate}/hr</td>
                <td className="py-4 px-5 text-right font-medium text-[15px] text-gray-900">
                  ${item.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300">
              <td colSpan={3} className="py-4 px-5 text-right font-semibold text-[15px] text-gray-700">
                Subtotal:
              </td>
              <td className="py-4 px-5 text-right font-semibold text-[15px] text-gray-900">
                ${subtotal.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="py-4 px-5 text-right font-semibold text-[15px] text-green-700">
                Discount (10%):
              </td>
              <td className="py-4 px-5 text-right font-semibold text-[15px] text-green-700">
                -${discount.toLocaleString()}
              </td>
            </tr>
            <tr className="bg-gradient-to-r from-blue-600 to-purple-600">
              <td colSpan={3} className="py-5 px-5 text-right font-bold text-white text-[17px]">
                Total Investment:
              </td>
              <td className="py-5 px-5 text-right font-bold text-white text-[17px]">
                ${total.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}