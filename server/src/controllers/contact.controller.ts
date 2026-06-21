import { Request, Response } from 'express';
import Contact from '../models/Contact';

export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const contact = new Contact({ name, email, message });
    await contact.save();

    res.status(200).json({
      message: 'Gửi liên hệ thành công',
      data: contact
    });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Lỗi server', data: error });
  }
};
