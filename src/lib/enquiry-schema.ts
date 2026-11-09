import { z } from "zod";
import { budgetOptions, timelineOptions } from "@/content/enquiry-options";
import { serviceOptions } from "@/content/services";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Please keep this under ${max} characters.`)
    .optional()
    .transform((v) => (v ? v : undefined));

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120, "Please keep your name under 120 characters."),
  businessName: optionalText(160),
  email: z.string().trim().max(200).email("Please enter a valid email address."),
  website: optionalText(300).refine(
    (v) => !v || /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v) || /^@[\w.]{2,40}$/.test(v),
    "Please enter a website address (e.g. yourbrand.com) or a social handle (e.g. @yourbrand).",
  ),
  service: z.enum(serviceOptions as unknown as [string, ...string[]], { message: "Please choose a service." }),
  description: z
    .string()
    .trim()
    .min(20, "Please tell us a little more about your project (at least 20 characters).")
    .max(5000, "Please keep your description under 5,000 characters."),
  budget: z.enum(budgetOptions as unknown as [string, ...string[]], { message: "Please choose a budget range." }),
  timeline: z.enum(timelineOptions as unknown as [string, ...string[]], { message: "Please choose a timeline." }),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type EnquiryField = keyof EnquiryInput;

export type EnquiryState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<EnquiryField, string>>; values?: Record<string, string> }
  | { status: "success"; name: string };
