import { ImageWithFallback } from './figma/ImageWithFallback';

export function ProposalHeader() {
  return (
    <div className="relative overflow-hidden pb-10 border-b border-gray-200">
      {/* Lighter, more subtle background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 opacity-40"></div>
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Larger logo */}
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
        <div className="text-right">
          <p className="text-[12px] text-gray-500 uppercase tracking-wide">Proposal Date</p>
          <p className="font-semibold text-[15px] mt-0.5">April 17, 2026</p>
        </div>
      </div>
      {/* Larger title */}
      <div className="mt-8">
        <h2 className="text-[40px] font-bold text-gray-900 leading-tight">Project Proposal</h2>
        <p className="text-[15px] text-gray-600 mt-2">Professional SaaS Development Services</p>
      </div>
    </div>
  );
}