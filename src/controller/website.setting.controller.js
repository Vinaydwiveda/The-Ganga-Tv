const Setting = require("../models/Website.setting.Schema.js");
const {uploadImage,deleteImage} = require("../services/imagekit.service.js")

// Get Website Settings
const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Settings (First Time Only)
const createSettings = async (req, res) => {
  try {
    const existingSettings = await Setting.findOne();

    if (existingSettings) {
      return res.status(400).json({
        success: false,
        message: "Settings already exist",
      });
    }

    let logo = "";
    let logoFileId = "";

    let banner = "";
    let bannerFileId = "";

    // Logo Upload 
    if (req.files?.logo?.[0]) {
      const uploadedLogo = await uploadImage( 
        req.files.logo[0]
      ); 

      logo = uploadedLogo.url;
      logoFileId = uploadedLogo.fileId;
    }

    // Banner Upload
    if (req.files?.banner?.[0]) {
      const uploadedBanner = await uploadImage(    
        req.files.banner[0]
      );

      banner = uploadedBanner.url;
      bannerFileId = uploadedBanner.fileId;
    }

    const settings = await Setting.create({
      websiteName: req.body.websiteName,
      footerText: req.body.footerText,

      youtube: req.body.youtube,
      facebook: req.body.facebook,
      instagram: req.body.instagram,
      linkedin: req.body.linkedin,
      twitter: req.body.twitter,

      logo,
      logoFileId,

      banner,
      bannerFileId,
    });

    res.status(201).json({
      success: true,
      message: "Settings created successfully",
      data: settings,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } 
};

// Update Settings
const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      settings = new Setting();
    }

    // Logo Upload
    if (req.files?.logo?.[0]) {

      if (settings.logoFileId) {
        await deleteImage(settings.logoFileId);
      }

      const uploadedLogo = await uploadImage(
        req.files.logo[0]
      );

      settings.logo = uploadedLogo.url;
      settings.logoFileId = uploadedLogo.fileId;
    }

    // Banner Upload
    if (req.files?.banner?.[0]) {

      if (settings.bannerFileId) {
        await deleteImage(settings.bannerFileId);
      }

      const uploadedBanner = await uploadImage(
        req.files.banner[0]
      );

      settings.banner = uploadedBanner.url;
      settings.bannerFileId = uploadedBanner.fileId;
    }

    settings.websiteName = req.body.websiteName || settings.websiteName;
    settings.footerText = req.body.footerText || settings.footerText;

    settings.youtube = req.body.youtube || settings.youtube;
    settings.facebook = req.body.facebook || settings.facebook;
    settings.instagram = req.body.instagram || settings.instagram;
    settings.linkedin = req.body.linkedin || settings.linkedin;
    settings.twitter = req.body.twitter || settings.twitter;

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  updateSettings,
};

module.exports = {
  getSettings,
  createSettings,
  updateSettings,
};