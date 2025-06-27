import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store/store';
import { submitReminderForm } from '../store/Shop';

const ReminderForm = () => {
  const [formDetails, setFormDetails] = useState({
    text: "",
    category: "",
  });

  const disptach = useDispatch<AppDispatch>();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log('Form submitted:', formDetails);
    try {
      disptach(submitReminderForm(formDetails))
        .then((data) => { console.log(data) })
        .catch((error) => console.error("error on handleSubmi : ", error))
    } catch (error) {
      console.error("error on handleSubmi : ", error)
    }
  };

  return (
    <main className='absolute top-0'>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="text"
          placeholder='text'
          value={formDetails.text}
          onChange={handleChange}
        />
        <input
          type="text"
          name="category"
          placeholder='category'
          value={formDetails.category}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
    </main>
  );
};

export default ReminderForm;