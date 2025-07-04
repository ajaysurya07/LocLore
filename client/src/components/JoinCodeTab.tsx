import { useState } from 'react'
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store/store';
import { acceptFriendsReq } from '../store/Friends';

const JoinCodeTab = ({ userId, roomId, setRoomId }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const handleJoinWithCode = async () => {
        if (!userId || !roomId) {
            toast.error('Please enter both your user ID and the friend code');
            return;
        }

        setIsLoading(true);
        try {
            const payload:any  = {
                userId ,
                roomId
            }
            dispatch(acceptFriendsReq(payload))
                .then((data) => {
                    console.log("data:", data);
                    toast.success(`You are now friends!`);
                    setRoomId('');
                })
                .catch(err => console.error("error on accepting  a friend req : ", err));

        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                    Friend Code
                </label>
                <input
                    type="text"
                    id="roomId"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter the friend code"
                />
            </div>

            <button
                onClick={handleJoinWithCode}
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                {isLoading ? 'Connecting...' : 'Connect with Friend'}
            </button>

            <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h3 className="text-sm font-medium text-blue-800 mb-1">How to use:</h3>
                <ol className="list-decimal list-inside text-xs text-blue-700 space-y-1">
                    <li>Ask your friend for their friend code</li>
                    <li>Enter your user ID and paste their code above</li>
                    <li>Click "Connect with Friend" to become mutual friends</li>
                </ol>
            </div>
        </div>
    );
}

export default JoinCodeTab