// firebase/certificate.js
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

// Uploads base64 certificate image and returns the download URL
export async function uploadCertificate(uid, base64Image) {
  try {
    const storage = getStorage();
    const filePath = `certificates/${uid}-${Date.now()}.png`;
    const fileRef = ref(storage, filePath);

    // Upload the base64 image as a data_url
    await uploadString(fileRef, base64Image, "data_url");

    // Return public download URL
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error("Certificate upload failed:", error);
    throw new Error("Failed to upload certificate.");
  }
}
