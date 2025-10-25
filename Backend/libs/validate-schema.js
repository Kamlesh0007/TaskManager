import { z} from 'zod'

 const loginSchema=z.object({
    email:z.string().nonempty("Email is required").email("Invalid email address"),
    password:z.string().nonempty("Password is required")
    .min(8, "Password must be at least 8 characters."),
})

 const registerSchema=z.object({
    email:z.string().nonempty("Email is required").email("Invalid email address"),
    password:z.string().nonempty("Password is required")
    .min(8, "Password must be at least 8 characters."),
      name: z.string().nonempty("Name is required").min(3, "Name must be at least 3 characters"),
    confirmPassword: z.string().nonempty("Confirm Password is required").min(8, "Confirm Password must be 8 characters"),
})

   const verifyEmailSchema=z.object({
    token:z.string().nonempty("token is required").min(1,"Token must be atleast 1 character"),

})

   const resetPasswordRequestSchema=z.object({
    email:z.string().nonempty("email is required").email(),

})


   const resetPasswordSchema=z.object({
      token: z.string().min(1, "Token is required"),
       newPassword:z.string().nonempty("Password is required")
    .min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().nonempty("Confirm Password is required").min(8, "Confirm Password must be 8 characters")

})

const workspaceSchema = z.object({
  name: z.string().nonempty("Name is required").min(3, "Name must be at least 3 characters"),
  color: z.string().nonempty("Color is required").min(3, "Color must be at least 3 characters"),
  description: z.string().optional(),
});
const projectSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  status: z.enum([
    "Planning",
    "In Progress",
    "On Hold",
    "Completed",
    "Cancelled",
  ]),
  startDate: z.string(),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
  members: z
    .array(
      z.object({
        user: z.string(),
        role: z.enum(["manager", "contributor", "viewer"]),
      })
    )
    .optional(),
});


const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignees: z.array(z.string()).min(1, "At least one assignee is required"),
});

  export {
  registerSchema,
  loginSchema,
  verifyEmailSchema,resetPasswordRequestSchema,resetPasswordSchema,workspaceSchema,projectSchema,taskSchema
};