export function InvoiceTable() {
  const invoiceItems = [
    { description: 'Discovery & Planning Phase', quantity: 40, rate: 150, amount: 6000 },
    { description: 'UI/UX Design & Prototyping', quantity: 80, rate: 150, amount: 12000 },
    { description: 'Frontend Development', quantity: 200, rate: 150, amount: 30000 },
    { description: 'Backend Development & API', quantity: 180, rate: 150, amount: 27000 },
    { description: 'Testing & Quality Assurance', quantity: 80, rate: 150, amount: 12000 },
    { description: 'Deployment & DevOps Setup', quantity: 40, rate: 150, amount: 6000 },
  ];

  return (
    <div className="py-10">
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-purple-600">
              <th className="text-left py-4 px-5 font-semibold text-[14px] text-white">Description</th>
              <th className="text-center py-4 px-5 font-semibold text-[14px] text-white">Hours</th>
              <th className="text-right py-4 px-5 font-semibold text-[14px] text-white">Rate</th>
              <th className="text-right py-4 px-5 font-semibold text-[14px] text-white">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, index) => (
              <tr key={index} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-5 text-[15px] text-gray-700">{item.description}</td>
                <td className="py-4 px-5 text-center text-[15px] text-gray-600">{item.quantity}</td>
                <td className="py-4 px-5 text-right text-[15px] text-gray-600">${item.rate}/hr</td>
                <td className="py-4 px-5 text-right font-medium text-[15px] text-gray-900">
                  ${item.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
