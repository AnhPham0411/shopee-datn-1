import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { updateProfile, uploadAvatar } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Configure multer for file upload limitations
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 1 * 1024 * 1024 // 1 MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      return cb(new Error('Chỉ cho phép file ảnh .jpg, .jpeg, .png'));
    }
    cb(null, true);
  }
});

router.use(requireAuth);

router.put('/', updateProfile);

// Handle multer error explicitly to not return sensitive info
router.post('/upload-avatar', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, uploadAvatar);

export default router;
