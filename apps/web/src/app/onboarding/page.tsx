'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const onboardingSchema = z.object({
  username: z.string().min(3).max(20),
  gender: z.enum(['MALE', 'FEMALE']),
  dateOfBirth: z.string().refine((date) => {
    const dob = new Date(date);
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 13;
  }, { message: "You must be at least 13 years old" })
});

export default function OnboardingPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: '',
      dateOfBirth: '',
    },
  });

  async function onSubmit(values: z.infer<typeof onboardingSchema>) {
    try {
      const res = await apiFetch('/api/auth/onboarding', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/');
      } else {
        setServerError(data.error || 'Failed to complete onboarding');
      }
    } catch (err) {
      setServerError('An error occurred');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Complete your profile</h2>
          <p className="text-sm text-gray-500 mt-2">Just a few more details to get started.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This cannot be changed later.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && <p className="text-sm font-medium text-destructive">{serverError}</p>}
            
            <Button type="submit" className="w-full">Complete Onboarding</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
