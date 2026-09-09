import * as z from "zod";

export const roomSchema = z.object({
  name: z.string().min(2, "Tên phòng phải có ít nhất 2 ký tự").max(100),
  location: z.string().min(2, "Vị trí phải có ít nhất 2 ký tự"),
  capacity: z.coerce.number().min(1, "Sức chứa tối thiểu là 1").max(500, "Sức chứa tối đa là 500"),
  description: z.string().max(500).optional().or(z.literal("")),
});

export type RoomFormValues = z.infer<typeof roomSchema>;
