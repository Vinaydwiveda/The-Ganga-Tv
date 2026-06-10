const imagekit = require("../confid/imagekit.config.js");

const uploadImage = async (file) => {
  try {
    
    const response = await imagekit.upload({
      file: file.buffer,
      fileName: `${Date.now()}-${file.originalname}`,
      folder: "/ganga-tv",
    });

    return response;
  } catch (error) {
    throw error;
  }
};


const deleteImage = async (fileId) => {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};