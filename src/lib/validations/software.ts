import * as z from "zod";

export const softwareSchema = z.object({
  name: z.string().min(2, "Tên phần mềm phải có ít nhất 2 ký tự").max(100),
  version: z.string().max(50).optional().or(z.literal("")),
  license: z.string().max(200).optional().or(z.literal("")),
});

export type SoftwareFormValues = z.infer<typeof softwareSchema>;
