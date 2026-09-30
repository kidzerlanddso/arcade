const Content = require("../models/content.model");
const sharp = require("sharp");
const { uploadTeacherAvatar, uploadProfileImage } = require("../services/supabaseStorage");

const validateNews = (body) => body?.issue && body?.title && body?.body;
const validateTeacher = (body) => body?.team && body?.name && body?.role && body?.email;
const validateSpotlight = (body) =>
  body?.title && body?.story && /^\d{4}-\d{2}-\d{2}$/.test(body?.achievementDate || "") &&
  ["teacher", "alumni", "community"].includes(body?.spotlightType) &&
  (body.spotlightType !== "alumni" || Boolean(body.subjectName?.trim()));

const sendError = (res, error, fallback) => res.status(500).send({ message: error?.message || fallback });

exports.findNews = (req, res) => Content.findAllNews((error, data) => error ? sendError(res, error, "Unable to load news.") : res.send(data));
exports.findTeachers = (req, res) => Content.findAllTeachers((error, data) => error ? sendError(res, error, "Unable to load teacher profiles.") : res.send(data));
exports.findPublicSpotlights = (req, res) => Content.findPublicSpotlights((error, data) => error ? sendError(res, error, "Unable to load teacher spotlights.") : res.send(data));
exports.findSpotlightById = (req, res) => Content.findSpotlightById(req.params.id, (error, data) => {
  if (error) return sendError(res, error, "Unable to load spotlight.");
  if (!data) return res.status(404).send({ message: "Spotlight not found." });
  res.send(data);
});
exports.findAllSpotlightsForAdmin = (req, res) => Content.findAllSpotlightsForAdmin((error, data) => error ? sendError(res, error, "Unable to load spotlights.") : res.send(data));
exports.findTeacherSpotlights = (req, res) => Content.findTeacherSpotlights(req.params.teacherId, (error, data) => error ? sendError(res, error, "Unable to load teacher spotlights.") : res.send(data));

exports.createSpotlight = (req, res) => {
  const spotlight = { ...req.body, spotlightType: "teacher", subjectName: null, teacherId: req.params.teacherId, createdBy: req.userId };
  if (!validateSpotlight(spotlight)) return res.status(400).send({ message: "Title, story, and achievement date are required." });
  Content.createSpotlight(spotlight, (error, data) => error ? sendError(res, error, "Unable to create teacher spotlight.") : res.status(201).send(data));
};

exports.createGeneralSpotlight = (req, res) => {
  if (!validateSpotlight(req.body) || req.body.spotlightType === "teacher") {
    return res.status(400).send({ message: "Choose an alumni or community spotlight and provide a title, story, and achievement date." });
  }
  Content.createSpotlight({ ...req.body, teacherId: null, createdBy: req.userId }, (error, data) => error ? sendError(res, error, "Unable to create spotlight.") : res.status(201).send(data));
};

exports.updateSpotlight = (req, res) => {
  if (!validateSpotlight(req.body)) return res.status(400).send({ message: "Title, story, and achievement date are required." });
  Content.updateSpotlight(req.params.id, req.body, (error, data) => {
    if (error) return sendError(res, error, "Unable to update teacher spotlight.");
    if (!data) return res.status(404).send({ message: "Teacher spotlight not found." });
    res.send(data);
  });
};

exports.uploadSpotlightImage = async (req, res) => {
  if (!req.file) return res.status(400).send({ message: "No image file uploaded." });
  try {
    const compressedBuffer = await sharp(req.file.buffer)
      .resize(1200, 675, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();
    const imagePath = `teacher-spotlights/spotlight-${req.params.id}-${Date.now()}.webp`;
    const imageUrl = await uploadProfileImage(imagePath, compressedBuffer, "image/webp");
    Content.updateSpotlightImage(req.params.id, imageUrl, (error, data) => {
      if (error?.kind === "not_found") return res.status(404).send({ message: "Teacher spotlight not found." });
      if (error) return sendError(res, error, "Unable to save spotlight image.");
      res.send(data);
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Unable to process spotlight image." });
  }
};

exports.deleteSpotlight = (req, res) => Content.deleteSpotlight(req.params.id, (error, data) => {
  if (error?.kind === "not_found") return res.status(404).send({ message: "Teacher spotlight not found." });
  if (error) return sendError(res, error, "Unable to delete teacher spotlight.");
  res.send(data);
});

exports.createNews = (req, res) => {
  if (!validateNews(req.body)) return res.status(400).send({ message: "Issue, title, and body are required." });
  Content.createNews({ ...req.body, createdBy: req.userId }, (error, data) => error ? sendError(res, error, "Unable to create news item.") : res.status(201).send(data));
};

exports.updateNews = (req, res) => {
  if (!validateNews(req.body)) return res.status(400).send({ message: "Issue, title, and body are required." });
  Content.updateNews(req.params.id, req.body, (error, data) => {
    if (error) return sendError(res, error, "Unable to update news item.");
    if (!data) return res.status(404).send({ message: "News item not found." });
    res.send(data);
  });
};

exports.uploadNewsImage = async (req, res) => {
  if (!req.file) return res.status(400).send({ message: "No image file uploaded." });

  try {
    const compressedBuffer = await sharp(req.file.buffer)
      .resize(1200, 675, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();
    const imagePath = `news/news-${req.params.id}-${Date.now()}.webp`;
    const imageUrl = await uploadProfileImage(imagePath, compressedBuffer, "image/webp");

    Content.updateNewsImage(req.params.id, imageUrl, (error, data) => {
      if (error?.kind === "not_found") return res.status(404).send({ message: "News item not found." });
      if (error) return sendError(res, error, "Unable to save news image.");
      res.send(data);
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Unable to process news image." });
  }
};

exports.createTeacher = (req, res) => {
  if (!validateTeacher(req.body)) return res.status(400).send({ message: "Team, name, role, and email are required." });
  Content.createTeacher({ ...req.body, createdBy: req.userId }, (error, data) => error ? sendError(res, error, "Unable to create teacher profile.") : res.status(201).send(data));
};

exports.updateTeacher = (req, res) => {
  if (!validateTeacher(req.body)) return res.status(400).send({ message: "Team, name, role, and email are required." });
  Content.updateTeacher(req.params.id, req.body, (error, data) => {
    if (error) return sendError(res, error, "Unable to update teacher profile.");
    if (!data) return res.status(404).send({ message: "Teacher profile not found." });
    res.send(data);
  });
};

exports.uploadTeacherImage = async (req, res) => {
  if (!req.file) return res.status(400).send({ message: "No image file uploaded." });

  try {
    const compressedBuffer = await sharp(req.file.buffer)
      .resize(600, 600, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();
    const imagePath = `teachers/teacher-${req.params.id}-${Date.now()}.webp`;
    const imageUrl = await uploadTeacherAvatar(imagePath, compressedBuffer, "image/webp");

    Content.updateTeacherImage(req.params.id, imageUrl, (error, data) => {
      if (error?.kind === "not_found") return res.status(404).send({ message: "Teacher profile not found." });
      if (error) return sendError(res, error, "Unable to save teacher image.");
      res.send(data);
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Unable to process teacher image." });
  }
};

exports.delete = (req, res) => Content.deleteById(req.params.id, (error, data) => {
  if (error?.kind === "not_found") return res.status(404).send({ message: "Content item not found." });
  if (error) return sendError(res, error, "Unable to delete content item.");
  res.send(data);
});

exports.deleteNews = (req, res) => Content.deleteNewsById(req.params.id, (error, data) => {
  if (error?.kind === "not_found") return res.status(404).send({ message: "News item not found." });
  if (error) return sendError(res, error, "Unable to delete news item.");
  res.send(data);
});

exports.deleteTeacher = (req, res) => Content.deleteTeacherById(req.params.id, (error, data) => {
  if (error?.kind === "not_found") return res.status(404).send({ message: "Teacher profile not found." });
  if (error) return sendError(res, error, "Unable to delete teacher profile.");
  res.send(data);
});
