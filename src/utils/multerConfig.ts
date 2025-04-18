import multer from "multer";
import multerS3 from "multer-s3";
import { v4 as uuidv4 } from "uuid";
import S3 from "../config/s3.config";
import path from "path";

// Configure content type detection
const customContentType = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: any
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return cb(null, "image/jpeg");
    case ".png":
      return cb(null, "image/png");
    case ".svg":
      return cb(null, "image/svg+xml");
    default:
      return cb(null, "application/octet-stream");
  }
};

// Initialize S3 upload
export const upload = multer({
  storage: multerS3({
    s3: S3,
    bucket: process.env.S3_BUCKET_NAME || "ds-nature-ayur",
    contentType: customContentType,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = uuidv4();
      const ext = path.extname(file.originalname);
      cb(null, `products/${uniqueSuffix}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|svg/;
    const ext = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (ext && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only .png, .jpg, .jpeg, and .svg format allowed!"));
  },
});
