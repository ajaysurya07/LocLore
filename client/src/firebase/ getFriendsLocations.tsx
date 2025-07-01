import { get, ref } from 'firebase/database';
import { db } from "../connection/firebase";

interface FriendLocation {
      id : string;
      position : number[];
}

async function getFriendsLocations(friendIds: string[]): Promise<FriendLocation[]> {
    const locations: FriendLocation[] = [];

    await Promise.all(friendIds.map(async (id) => {
        console.log("looking for the id : ", id);
        const snapshot = await get(ref(db, `userLocations/${id}`));
        if (snapshot.exists()) {
            const location = snapshot.val();
            locations.push({
                id: id,
               position  : [ location.lat, location.lng]
            });
        }
    }));
    return locations;
}

export default getFriendsLocations;