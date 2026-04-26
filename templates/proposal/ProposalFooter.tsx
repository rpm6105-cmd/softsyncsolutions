import { Mail, Phone, Globe, MapPin } from 'lucide-react';

export function ProposalFooter() {
  return (
    <div className="py-10 mt-4">
      <div className="grid grid-cols-2 gap-12 mb-8">
        <div>
          <h4 className="font-semibold text-[15px] text-gray-900 mb-4">Contact Information</h4>
          <div className="space-y-2.5 text-[14px] text-gray-600">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>hello@softsyncsolutions.com</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>+1 (555) 987-6543</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>www.softsyncsolutions.com</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>123 Tech Street, San Francisco, CA 94102</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-[15px] text-gray-900 mb-4">Acceptance</h4>
          <p className="text-[14px] text-gray-600 mb-6 leading-relaxed">
            To accept this proposal and begin work, please sign below and return a copy 
            along with the initial deposit.
          </p>
          <div className="border-t border-gray-300 pt-8 mt-8">
            <div className="grid grid-cols-2 gap-6 text-[13px]">
              <div>
                <p className="text-gray-500 mb-2">Signature</p>
                <div className="border-b border-gray-400 h-10"></div>
              </div>
              <div>
                <p className="text-gray-500 mb-2">Date</p>
                <div className="border-b border-gray-400 h-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center pt-8 border-t border-gray-200">
        <p className="text-[12px] text-gray-400">
          © 2026 Softsync Solutions. All rights reserved. | Professional SaaS Development Services
        </p>
      </div>
    </div>
  );
}