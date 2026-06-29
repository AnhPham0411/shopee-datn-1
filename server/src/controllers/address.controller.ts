import { Request, Response } from 'express';
import User from '../models/User';

const getUserId = (req: Request) => (req as any).user._id;

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(getUserId(req));
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.status(200).json({ message: 'Lấy danh sách địa chỉ thành công', data: user.addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const validateAddress = (body: any): string | null => {
  const required = ['fullName', 'phone', 'province', 'district', 'ward', 'detail'];
  for (const f of required) {
    if (!body[f] || String(body[f]).trim() === '') return `Thiếu thông tin: ${f}`;
  }
  if (!/^0\d{9}$/.test(String(body.phone).trim())) return 'Số điện thoại không hợp lệ';
  return null;
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(getUserId(req));
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const err = validateAddress(req.body);
    if (err) return res.status(400).json({ message: err });

    const { fullName, phone, province, district, ward, detail, isDefault } = req.body;
    // Địa chỉ đầu tiên hoặc được yêu cầu làm mặc định
    const makeDefault = isDefault === true || user.addresses.length === 0;
    if (makeDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }
    user.addresses.push({ fullName, phone, province, district, ward, detail, isDefault: makeDefault } as any);
    await user.save();

    res.status(201).json({ message: 'Thêm địa chỉ thành công', data: user.addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(getUserId(req));
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const address = (user.addresses as any).id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });

    const err = validateAddress({ ...address.toObject(), ...req.body });
    if (err) return res.status(400).json({ message: err });

    const { fullName, phone, province, district, ward, detail, isDefault } = req.body;
    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (province !== undefined) address.province = province;
    if (district !== undefined) address.district = district;
    if (ward !== undefined) address.ward = ward;
    if (detail !== undefined) address.detail = detail;
    if (isDefault === true) {
      user.addresses.forEach((a) => (a.isDefault = false));
      address.isDefault = true;
    }
    await user.save();

    res.status(200).json({ message: 'Cập nhật địa chỉ thành công', data: user.addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(getUserId(req));
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const address = (user.addresses as any).id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });

    const wasDefault = address.isDefault;
    address.deleteOne();
    // Nếu xóa địa chỉ mặc định mà còn địa chỉ khác → đặt cái đầu làm mặc định
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    await user.save();

    res.status(200).json({ message: 'Xóa địa chỉ thành công', data: user.addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(getUserId(req));
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const address = (user.addresses as any).id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });

    user.addresses.forEach((a) => (a.isDefault = false));
    address.isDefault = true;
    await user.save();

    res.status(200).json({ message: 'Đặt địa chỉ mặc định thành công', data: user.addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
