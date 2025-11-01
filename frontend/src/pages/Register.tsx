import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { UserPlus } from 'lucide-react';

/**
 * Register form validation schema
 */
const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Register page component
 */
export default function Register() {
    const navigate = useNavigate();
    const { register: registerUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            await registerUser(data.name, data.email, data.password);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
                            <UserPlus className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Create an account</CardTitle>
                    <CardDescription className="text-center">
                        Enter your information to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            error={errors.name?.message}
                            {...register('name')}
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="john@example.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            error={errors.password?.message}
                            {...register('password')}
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            error={errors.confirmPassword?.message}
                            {...register('confirmPassword')}
                        />

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Create account
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-indigo-600 hover:text-indigo-500 font-medium"
                            >
                                Sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}