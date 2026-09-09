import * as z from "zod";
import { DeviceType, DeviceStatus } from "@prisma/client";

export const deviceSchema = z.object({
  name: z.string().min(2, "Tên thiết bị phải có ít nhất 2 ký tự").max(100),
  type: z.nativeEnum(DeviceType, { required_error: "Vui lòng chọn loại thiết bị" }),
  status: z.nativeEnum(DeviceStatus, { required_error: "Vui lòng chọn trạng thái" }),
  roomId: z.string().min(1, "Vui lòng chọn phòng máy"),
  manufacturer: z.string().max(100).optional().or(z.literal("")),
  model: z.string().max(100).optional().or(z.literal("")),
  serialNumber: z.string().max(100).optional().or(z.literal("")),
  purchaseDate: z.string().optional().or(z.literal("")),
  warrantyEnd: z.string().optional().or(z.literal("")),
  specifications: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type DeviceFormValues = z.infer<typeof deviceSchema>;

export const maintenanceSchema = z.object({
  type: z.string().min(1, "Vui lòng nhập loại bảo trì"),
  description: z.string().min(1, "Vui lòng nhập mô tả chi tiết"),
  cost: z.coerce.number().min(0, "Chi phí không được âm").optional(),
  performedAt: z.string().min(1, "Vui lòng chọn ngày thực hiện"),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

export const deviceSoftwareSchema = z.object({
  softwareId: z.string().min(1, "Vui lòng chọn phần mềm"),
});

export type DeviceSoftwareFormValues = z.infer<typeof deviceSoftwareSchema>;
