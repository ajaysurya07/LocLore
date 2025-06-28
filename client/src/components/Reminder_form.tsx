import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store/store';
import { submitReminderForm } from '../store/Reminder';

// Define category options
const CATEGORIES = [
  'grocery',
  'pharmacy',
  'shopping',
  'work',
  'personal',
  'meeting',
  'other'
] as const;

type Category = typeof CATEGORIES[number];

interface ReminderFormData {
  notes: string;
  category: Category | '';
  user_id: string;
  name: string;
}

const ReminderForm = () => {
  const [formDetails, setFormDetails] = useState<ReminderFormData>({
    notes: "",
    category: "",
    user_id: "", // You might want to get this from auth state
    name: "",
  });

  const dispatch = useDispatch<AppDispatch>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDetails.category) {
      alert('Please select a category');
      return;
    }

    try {
      const result = await dispatch(submitReminderForm({
        ...formDetails,
        user_id: "106122007"
      }));
      console.log('Reminder created:', result.payload);
      // Reset form after successful submission
      setFormDetails({
        notes: "",
        category: "",
        user_id: "",
        name: "",
      });
    } catch (error) {
      console.error("Error submitting reminder:", error);
    }
  };

  return (
    <main className='absolute top-0 p-4 bg-white rounded-lg shadow-md'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label htmlFor="name" className='block mb-1 font-medium'>Reminder Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder='e.g. Buy groceries'
            value={formDetails.name}
            onChange={handleChange}
            className='w-full p-2 border rounded'
            required
          />
        </div>

        <div>
          <label htmlFor="category" className='block mb-1 font-medium'>Category</label>
          <select
            id="category"
            name="category"
            value={formDetails.category}
            onChange={handleChange}
            className='w-full p-2 border rounded'
            required
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className='block mb-1 font-medium'>Notes</label>
          <input
            type="text"
            id="notes"
            name="notes"
            placeholder='Additional details'
            value={formDetails.notes}
            onChange={handleChange}
            className='w-full p-2 border rounded'
          />
        </div>

        <button 
          type="submit" 
          className='w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
        >
          Create Reminder
        </button>
      </form>
    </main>
  );
};

export default ReminderForm;