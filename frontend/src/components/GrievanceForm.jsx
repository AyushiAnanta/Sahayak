const GrievanceForm = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border max-w-2xl">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        File a Grievance
      </h2>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Subject"
          className="p-3 rounded-lg border"
        />

        <textarea
          placeholder="Describe your issue..."
          className="p-3 h-32 rounded-lg border"
        />

        <select className="p-3 rounded-lg border">
          <option value="">Select Category</option>
          <option>Hostel Issue</option>
          <option>Canteen</option>
          <option>Fees</option>
          <option>Academics</option>
        </select>

        <button className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
          Submit Grievance
        </button>
      </div>
    </div>
  );
};

export default GrievanceForm;
