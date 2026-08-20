"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailIcon, LockIcon, UserIcon } from "lucide-react";

import { useLogin, useRegister } from "@/hooks/use-auth";
import {
    loginSchema,
    registerSchema,
    type RegisterFormValues,
} from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldLabel,
    FieldError,
    FieldContent,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

type AuthFormProps = {
    mode: "login" | "register";
};

type FormFields = RegisterFormValues;

export function AuthForm({ mode }: AuthFormProps) {
    const loginMutation = useLogin();
    const registerMutation = useRegister();

    const isPending = loginMutation.isPending || registerMutation.isPending;

    const schema = mode === "login" ? loginSchema : registerSchema;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormFields>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(schema) as any,
        defaultValues: {
            displayName: "",
            email: "",
            password: "",
        },
    });

    const onSubmit = (data: FormFields) => {
        if (mode === "login") {
            loginMutation.mutate({
                email: data.email,
                password: data.password,
            });
        } else {
            registerMutation.mutate({
                displayName: data.displayName,
                email: data.email,
                password: data.password,
            });
        }
    };

    return (
        <Card className="w-full overflow-hidden rounded-3xl border border-white/80 bg-white/85 shadow-[0_24px_70px_rgba(38,83,112,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-[#172847]/90">
            <div className="h-2 bg-[linear-gradient(90deg,#10264b,#5599c2,#f2b8ca)]" />
            <CardHeader className="space-y-3 px-7 pb-5 pt-8 text-center sm:px-9">
                <div className="flex justify-center">
                    <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-[#10264b] shadow-[0_12px_30px_rgba(16,38,75,0.2)]">
                        <Image src="/logo.png" alt="PixelZone Logo" width={64} height={64} className="scale-[2.2] object-contain" />
                    </div>
                </div>
                <CardTitle className="text-3xl font-semibold tracking-[-0.045em] text-[#10264b] dark:text-white">
                    {mode === "login" ? "Sign In" : "Create Account"}
                </CardTitle>
                <CardDescription className="mx-auto max-w-xs text-center leading-6 text-[#66758b] dark:text-[#b6c8dc]">
                    {mode === "login"
                        ? "Welcome back! Enter your credentials to access your account."
                        : "Enter your information to register for a new account."}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <CardContent className="space-y-5 px-7 sm:px-9">
                    {mode === "register" && (
                        <Field>
                            <FieldLabel>Display Name</FieldLabel>
                            <FieldContent>
                                <InputGroup>
                                    <InputGroupAddon align="inline-start">
                                        <UserIcon className="size-4 text-muted-foreground" />
                                    </InputGroupAddon>
                                    <InputGroupInput
                                        type="text"
                                        placeholder="John Doe"
                                        disabled={isPending}
                                        {...register("displayName")}
                                        aria-invalid={!!errors.displayName}
                                    />
                                </InputGroup>
                                <FieldError errors={[errors.displayName]} />
                            </FieldContent>
                        </Field>
                    )}

                    <Field>
                        <FieldLabel>Email Address</FieldLabel>
                        <FieldContent>
                            <InputGroup>
                                <InputGroupAddon align="inline-start">
                                    <MailIcon className="size-4 text-muted-foreground" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    type="email"
                                    placeholder="name@example.com"
                                    disabled={isPending}
                                    {...register("email")}
                                    aria-invalid={!!errors.email}
                                />
                            </InputGroup>
                            <FieldError errors={[errors.email]} />
                        </FieldContent>
                    </Field>

                    <Field>
                        <FieldLabel>Password</FieldLabel>
                        <FieldContent>
                            <InputGroup>
                                <InputGroupAddon align="inline-start">
                                    <LockIcon className="size-4 text-muted-foreground" />
                                </InputGroupAddon>
                                <InputGroupInput
                                    type="password"
                                    placeholder="••••••••"
                                    disabled={isPending}
                                    {...register("password")}
                                    aria-invalid={!!errors.password}
                                />
                            </InputGroup>
                            <FieldError errors={[errors.password]} />
                        </FieldContent>
                    </Field>
                </CardContent>
                <CardFooter className="flex flex-col gap-5 px-7 pb-8 pt-2 sm:px-9">
                    <Button
                        type="submit"
                        className="h-11 w-full justify-center gap-2 rounded-xl bg-[#10264b] font-semibold text-white shadow-[0_10px_24px_rgba(16,38,75,0.18)] hover:bg-[#193867]"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Spinner className="size-4" />
                                {mode === "login" ? "Signing In..." : "Creating Account..."}
                            </>
                        ) : (
                            mode === "login" ? "Sign In" : "Sign Up"
                        )}
                    </Button>

                    <div className="text-sm text-muted-foreground text-center">
                        {mode === "login" ? (
                            <>
                                {"Don't have an account? "}
                                <Link
                                    href="/register"
                                    className="text-primary hover:underline font-semibold"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="text-primary hover:underline font-semibold"
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
