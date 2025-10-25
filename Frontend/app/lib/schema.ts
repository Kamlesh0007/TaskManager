import { ProjectStatus } from '@/types';
import {z} from 'zod'

export const signInSchema=z.object({
    email:z.string().nonempty("Email is required").email("Invalid email address"),
    password:z.string().nonempty("Password is required")
    .min(8, "Password must be at least 8 characters."),
})

export const signUpSchema=z.object({
    email:z.string().nonempty("Email is required").email("Invalid email address"),
    password:z.string().nonempty("Password is required")
    .min(8, "Password must be at least 8 characters."),
      name: z.string().nonempty("Name is required").min(3, "Name must be at least 3 characters"),
    confirmPassword: z.string().nonempty("Confirm Password is required").min(8, "Confirm Password must be 8 characters"),
}) .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

  export const forgotPasswordSchema = z.object({
  email: z.string().nonempty("Email is required").email("Invalid email address"),
});

  export const resetPasswordSchema = z
  .object({
    newPassword: z.string().nonempty("Password is required").min(8, "Password must be 8 characters"),
    confirmPassword: z.string().nonempty("Confirm Password is required").min(8, "Password must be 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });


  export const workspaceSchema = z.object({
  name: z.string().nonempty("Name is required").min(3, "Name must be at least 3 characters"),
  color: z.string().nonempty("Color is required").min(3, "Color must be at least 3 characters"),
  description: z.string().optional(),
});

export const projectSchema = z.object({
  title: z.string().nonempty("Title is required").min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus),
  startDate: z.string().min(10, "Start date is required"),
  dueDate: z.string().min(10, "Due date is required"),
  members: z
    .array(
      z.object({
        user: z.string(),
        role: z.enum(["manager", "contributor", "viewer"]),
      })
    )
    .optional(),
  tags: z.string().optional(),
});


export const createTaskSchema = z.object({
  title: z.string().nonempty("Title is required").min(3, "Task title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignees: z.array(z.string()).min(1, "At least one assignee is required"),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
});