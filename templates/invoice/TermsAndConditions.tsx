export function TermsAndConditions() {
  return (
    <div className="py-12 border-b border-gray-200">
      <h3 className="text-[22px] font-semibold text-gray-900 mb-5">Terms & Conditions</h3>
      <div className="space-y-4 text-[14px] text-gray-700">
        <div>
          <h4 className="font-semibold text-[15px] text-gray-900 mb-2">Payment Terms</h4>
          <p className="leading-relaxed">
            30% deposit upon contract signing, 40% upon completion of Phase 3 (Development), 
            and final 30% upon project delivery and acceptance.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-[15px] text-gray-900 mb-2">Validity</h4>
          <p className="leading-relaxed">
            This proposal is valid for 30 days from the date above. Pricing and timeline are 
            subject to change after this period.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-[15px] text-gray-900 mb-2">Intellectual Property</h4>
          <p className="leading-relaxed">
            Upon final payment, all intellectual property rights for custom code and designs 
            will be transferred to the client. Third-party licenses remain with their respective owners.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-[15px] text-gray-900 mb-2">Scope Changes</h4>
          <p className="leading-relaxed">
            Any changes to the defined scope of work will be assessed and may result in 
            adjustments to timeline and pricing. Change requests will be documented and approved in writing.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-[15px] text-gray-900 mb-2">Confidentiality</h4>
          <p className="leading-relaxed">
            Both parties agree to maintain confidentiality of all proprietary information 
            shared during the course of this project.
          </p>
        </div>
      </div>
    </div>
  );
}