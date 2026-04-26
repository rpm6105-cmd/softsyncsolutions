import { CheckCircle2 } from 'lucide-react';

export function ScopeOfWork() {
  const scopeItems = [
    'Full-stack web application development with React and Node.js',
    'RESTful API design and implementation',
    'Database architecture and optimization (PostgreSQL)',
    'User authentication and authorization system',
    'Responsive UI/UX design for desktop and mobile devices',
    'Third-party integrations (payment processing, analytics, CRM)',
    'Automated testing and quality assurance',
    'Cloud deployment and DevOps configuration (AWS/Azure)',
    'Documentation and knowledge transfer',
    'Post-launch support and maintenance (90 days)',
  ];

  return (
    <div className="py-10 border-b border-gray-200">
      <h3 className="text-[22px] font-semibold text-gray-900 mb-5">Scope of Work</h3>
      <div className="space-y-3.5">
        {scopeItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-[15px] text-gray-700">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}