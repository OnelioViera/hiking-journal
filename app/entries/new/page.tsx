import EntryForm from '@/components/forms/EntryForm';

export default function NewEntryPage() {
  return (
    <div className="max-w-6xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Entry</h1>
        <p className="text-gray-600">
          Document your hiking adventure with detailed information about the trail, 
          weather conditions, and your experience.
        </p>
      </div>
      
      <div className="pb-16">
        <EntryForm />
      </div>
    </div>
  );
} 