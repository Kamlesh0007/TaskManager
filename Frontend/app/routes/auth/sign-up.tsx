import {  signUpSchema } from '@/lib/schema';
import { useForm } from 'react-hook-form'
import type z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { useSignUpMutation } from '@/hooks/use-auth';
import { toast } from 'sonner';


export type signUpFormData = z.infer<typeof signUpSchema>
const SignUp = () => {
   const navigate = useNavigate();
  const form = useForm<signUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
           name: '',
      confirmPassword: '',
    }
  });
  //console.log(form);

const {mutate,isPending}=  useSignUpMutation();
  const handleOnsubmit = (values: signUpFormData) => {
    console.log(values);
    mutate(values,{
           onSuccess: () => {
        toast.success("Email Verification Required", {
          description:
            "Please check your email for a verification link. If you don't see it, please check your spam folder.",
        });

        form.reset();
        navigate("/sign-in");
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error);
        toast.error(errorMessage);
      }
    })

  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center  bg-muted/60 p-4">
      <Card className='max-w-md w-full shadow-xl'>
        <CardHeader>
       <CardHeader className="text-center mb-5">
          <CardTitle className="text-2xl font-bold">     Create an account</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
              Create an account to continue
          </CardDescription>
        </CardHeader>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleOnsubmit)} className='space-y-2'>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        autoComplete='on'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                 <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Kamlesh Yadav" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
              
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className='mb-2'>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                     
                    </div>
                    <FormControl>
           
                      <PasswordInput  placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                
                   
                  </FormItem>
                )}
              />
<FormField
              
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className='mb-2'>
                    <div className="flex items-center justify-between">
                      <FormLabel>Confirm Password</FormLabel>
                     
                    </div>
                    <FormControl>
           
                      <PasswordInput  placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                 
                  </FormItem>
                )}
              />

     <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing up..." : "Sign up"}
              </Button>
            </form>
          </Form>

          <CardFooter className="flex items-center justify-center mt-6">
            <div className="flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?<Link to="/sign-in" className='text-green-900'> Sign in</Link>
              </p>
            </div>
          </CardFooter>
        </CardContent>


      </Card>

    </div>
  )
}

export default SignUp