import cloudinary from "../config/cloudinary";

export async function uploadImage(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { folder: "oncgGlobal" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || "");
      }
    );
  });
}
