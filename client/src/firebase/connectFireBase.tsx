import { ref, set, onDisconnect } from "firebase/database";
import { db } from "../connection/firebase";

export const connectFireBase = (userId: string, lat: number, lng: number) => {

  console.log("ConnectFireBase :  ", { userId, lat, lng });

  const locRef = ref(db, `userLocations/${userId}`);

  set(locRef, { lat, lng, timestamp: Date.now() });
  onDisconnect(locRef).remove();

  return;
}

export default connectFireBase