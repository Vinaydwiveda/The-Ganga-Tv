const News = require("../models/news.Schema");
const {uploadImage,deleteImage} =require('../services/imagekit.service.js')
// Create News
const createNews = async (req, res) => {
  try {
 
    let thumbnail = "";
    let thumbnailFileId = "";
    let uploaded = null;
    if (req.file) {
       uploaded = await uploadImage(req.file); 

      thumbnail = uploaded.url;
      thumbnailFileId = uploaded.fileId;
    }


    const news = await News.create({
      title: req.body.title,
      summary: req.body.summary,
      description: req.body.description,
      category: req.body.category,
      status: req.body.status,
      tags: req.body.tags?.split(",") || [],
      thumbnail,
      thumbnailFileId,
      editor: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: news,
    });

  } catch (error) {

  return res.status(500).json({
    success: false,
    message: error.message,
  });
}
};

// Get All News
const getAllNews = async (req, res) => {
  try {
    const news = await News.find()
      .populate("editor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single News
const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate("editor", "name email");

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update News
const updateNews = async (req, res) => {
  try {
    if (req.file) {
       uploaded = await uploadImage(req.file); 

      thumbnail = uploaded.url;
      thumbnailFileId = uploaded.fileId;
    }
    const news = await News.findByIdAndUpdate(
      req.params.id,
      req.body,
      uploaded
        ? {
            thumbnail: uploaded.url,
            thumbnailFileId: uploaded.fileId,
          }
        : {},
      {
        new: true,
        runValidators: true,
      }
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete News
const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    // Delete image from ImageKit
    if (news.thumbnailFileId) {
      await deleteImage(news.thumbnailFileId);
    }

    // Delete news from MongoDB
    await News.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "News and image deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get News By Category
const getNewsByCategory = async (req, res) => {
  try {
    const news = await News.find({
      category: req.params.category,
    }).populate("editor", "name");

    res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get News By Editor
const getNewsByEditor = async (req, res) => {
  try {
    const news = await News.find({
      editor: req.params.editorId,
    }).populate("editor", "name email");

    res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
  getNewsByCategory,
  getNewsByEditor,
};