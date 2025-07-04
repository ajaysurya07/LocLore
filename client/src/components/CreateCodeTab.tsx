import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store/store';
import { postFriendsReq } from '../store/Friends';

const CreateCodeTab = ({ userId, generatedRoomId, setGeneratedRoomId }: any) => {

    const dispatch = useDispatch<AppDispatch>();

    const handleGenerateCode = async () => {
        console.log("userIf for creating fR ::", userId);
        if (!userId) {
            toast.error('Please enter your user ID');
            return;
        }
        try {
            dispatch(postFriendsReq(userId))
                .then((data) => {
                    console.log("data:", data);
                    setGeneratedRoomId(data.payload.roomID);
                    toast.success('Friend code generated!');
                })
                .catch(err => console.error("error on creating a friend req : ", err));
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedRoomId);
        toast.success('Copied to clipboard!');
    };

    return (
        <div>
            <button
                onClick={handleGenerateCode}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                generate a code 
            </button>
            {generatedRoomId && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-2">Share this code with your friend:</p>
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={generatedRoomId}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-white text-gray-900 font-mono"
                        />
                        <button
                            onClick={copyToClipboard}
                            className="bg-indigo-600 text-white px-3 py-2 rounded-r-md hover:bg-indigo-700"
                        >
                            Copy
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        This code will expire in 24 hours or after first use.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CreateCodeTab;