import  { useState } from 'react';
import { Toaster  } from 'react-hot-toast';
import CreateCodeTab from './CreateCodeTab';
import JoinCodeTab from './JoinCodeTab';



function AddFriends({userId} : any) {
  const [activeTab, setActiveTab] = useState('create');
//   const [userId, setUserId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [generatedRoomId, setGeneratedRoomId] = useState('');

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <Toaster position="top-center" />
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">Friend Connect</h1>
        
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'create' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('create')}
          >
            Create Code
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'join' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('join')}
          >
            Join with Code
          </button>
        </div>

        {activeTab === 'create' ? (
          <CreateCodeTab
            userId={userId} 
            generatedRoomId={generatedRoomId} 
            setGeneratedRoomId={setGeneratedRoomId} 
          />
        ) : (
          <JoinCodeTab
            userId={userId} 
            roomId={roomId} 
            setRoomId={setRoomId} 
          />
        )}
      </div>
    </div>
  );
}

export default AddFriends;