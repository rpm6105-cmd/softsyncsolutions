export function Timeline() {
  const phases = [
    { phase: 'Phase 1: Discovery & Planning', duration: '2 weeks', deliverable: 'Project roadmap and technical specifications' },
    { phase: 'Phase 2: Design', duration: '3 weeks', deliverable: 'UI/UX designs and interactive prototypes' },
    { phase: 'Phase 3: Development', duration: '12 weeks', deliverable: 'Fully functional application with all core features' },
    { phase: 'Phase 4: Testing & QA', duration: '3 weeks', deliverable: 'Bug-free, tested application ready for deployment' },
    { phase: 'Phase 5: Deployment & Launch', duration: '1 week', deliverable: 'Live production environment' },
    { phase: 'Phase 6: Support & Maintenance', duration: '90 days', deliverable: 'Ongoing support and optimization' },
  ];

  return (
    <div className="py-10 border-b border-gray-200">
      <h3 className="text-[22px] font-semibold text-gray-900 mb-5">Project Timeline</h3>
      <p className="text-[15px] text-gray-600 mb-7">
        Estimated project duration: <span className="font-semibold text-gray-900">21 weeks</span> (approximately 5 months)
      </p>
      <div className="space-y-5">
        {phases.map((item, index) => (
          <div key={index} className="flex gap-5">
            <div className="flex-shrink-0 w-24 pt-0.5">
              <span className="inline-block px-3 py-1.5 rounded-full text-[13px] font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                {item.duration}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[15px] text-gray-900">{item.phase}</h4>
              <p className="text-[14px] text-gray-600 mt-1.5 leading-relaxed">{item.deliverable}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}