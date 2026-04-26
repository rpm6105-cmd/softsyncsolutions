import { InvoiceHeader } from './components/InvoiceHeader';
import { BillingSection } from './components/BillingSection';
import { InvoiceTable } from './components/InvoiceTable';
import { InvoiceTotal } from './components/InvoiceTotal';
import { PaymentDetails } from './components/PaymentDetails';
import { InvoiceNotes } from './components/InvoiceNotes';
import { InvoiceFooter } from './components/InvoiceFooter';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* A4 Document Container */}
      <div
        className="mx-auto bg-white shadow-lg"
        style={{
          width: '210mm',
          minHeight: '297mm',
          maxWidth: '100%',
        }}
      >
        {/* Document Content with proper padding */}
        <div className="px-16 py-12">
          <InvoiceHeader />
          <BillingSection />
          <InvoiceTable />
          <InvoiceTotal />
          <PaymentDetails />
          <InvoiceNotes />
          <InvoiceFooter />
        </div>
      </div>
    </div>
  );
}
