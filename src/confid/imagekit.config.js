const ImageKit = require("imagekit");

const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } =
  process.env;

let imagekit;

// Don’t crash during app boot when env vars aren’t present (e.g., CI/unit tests).
if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
  imagekit = {
    upload: async () => {
      throw new Error("ImageKit not configured (missing env vars)");
    },
    deleteFile: async () => {
      throw new Error("ImageKit not configured (missing env vars)");
    },
  };
} else {
  imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
  });
}

module.exports = imagekit;

