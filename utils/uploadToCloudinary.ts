const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export async function uploadToCloudinary(fileUri: string, resourceType: "image" | "video" | "raw" = "image") {
  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    type: resourceType === "image" ? "image/jpeg" : "video/mp4",
    name: `evidence_${Date.now()}`,
  } as any);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) throw new Error("Upload failed");

  const data = await res.json();
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
    format: data.format as string,
    bytes: data.bytes as number,
  };
}