import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Upload a base64 data URL to Firebase Storage and return the download URL.
 * Falls back to returning the original data URL if Firebase Storage is not configured.
 */
export async function uploadPhoto(
  dataUrl: string,
  folder: string = "photos"
): Promise<string> {
  try {
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const storageRef = ref(storage, filename);
    await uploadString(storageRef, dataUrl, "data_url");
    return await getDownloadURL(storageRef);
  } catch {
    return dataUrl;
  }
}
