import { ImageWithFallback } from './figma/ImageWithFallback';

export function InvoiceHeader() {
  return (
    <div className="relative overflow-hidden pb-10 border-b border-gray-200">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 opacity-40"></div>
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden">
            <ImageWithFallback
              src="/src/imports/Screenshot_2026-04-10_at_12.25.03 PM.png"
              alt="Softsync Solutions Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Softsync Solutions
            </h1>
            <p className="text-[13px] text-gray-500 mt-0.5">SaaS Development Agency</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[28px] font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            INVOICE
          </p>
          <div className="space-y-0.5">
            <div className="flex gap-2 justify-end items-baseline">
              <span className="text-[12px] text-gray-500">Invoice #:</span>
              <span className="font-semibold text-[14px]">INV-2026-001</span>
            </div>
            <div className="flex gap-2 justify-end items-baseline">
              <span className="text-[12px] text-gray-500">Date:</span>
              <span className="font-semibold text-[14px]">April 17, 2026</span>
            </div>
            <div className="flex gap-2 justify-end items-baseline">
              <span className="text-[12px] text-gray-500">Due:</span>
              <span className="font-semibold text-[14px]">May 17, 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
