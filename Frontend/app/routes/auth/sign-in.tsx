import { signInSchema } from '@/lib/schema';
import { useForm } from 'react-hook-form'
import type z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { useLoginMutation } from '@/hooks/use-auth';
import { useAuth } from '@/provider/auth-context';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export type signInFormData = z.infer<typeof signInSchema>
const SignIn = () => {
    const navigate = useNavigate();
  const { login } = useAuth();
  const form = useForm<signInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  //console.log(form);
  const { mutate, isPending } = useLoginMutation();
  const handleOnsubmit = (values: signInFormData) => {
 mutate(values, {
      onSuccess: (data) => {
        login(data);
        console.log(data);
        toast.success("Login successful");
        navigate("/dashboard");
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || "An error occurred";
        console.log(error);
        toast.error(errorMessage);
      },
    });

  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/60  p-4">
      <Card className='max-w-md w-full shadow-xl'>
        <CardHeader>
       <CardHeader className="text-center mb-5">
          <CardTitle className="text-2xl font-bold">Welcome back to TaskHub</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in to your account to continue
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
                name="password"
                render={({ field }) => (
                  <FormItem className='mb-2'>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      {/* <Link
                        to="/forgot-password"
                        className="text-sm text-green-700"
                      >
                        Forgot password?
                      </Link> */}
                    </div>
                    <FormControl>
                      {/* <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      /> */}
                      <PasswordInput  placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                       <div className="flex items-center justify-end">
           
                      <Link
                        to="/forgot-password"
                        className="text-sm text-green-700"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </FormItem>
                )}
              />


            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 mr-2" /> : "Sign in"}
              </Button>
            </form>
          </Form>

          <CardFooter className="flex items-center justify-center mt-6">
            <div className="flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account? <Link to="/sign-up" className='text-green-900'> Sign up</Link>
              </p>
            </div>
          </CardFooter>
        </CardContent>


      </Card>

    </div>
  )
}

export default SignIn