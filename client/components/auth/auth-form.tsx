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
        <Card className="w-full border-none bg-background/50 shadow-xl backdrop-blur-md">
            <CardHeader className="space-y-2 text-center">
                <div className="flex justify-center mb-1">
                    <div className="relative size-12 overflow-hidden rounded-xl shadow-md">
                        <Image src="/logo.png" alt="PixelZone Logo" fill className="object-cover" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-center">
                    {mode === "login" ? "Sign In" : "Create Account"}
                </CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                    {mode === "login"
                        ? "Welcome back! Enter your credentials to access your account."
                        : "Enter your information to register for a new account."}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <CardContent className="space-y-4">
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
                <CardFooter className="flex flex-col gap-4 mt-2">
                    <Button
                        type="submit"
                        className="w-full flex justify-center items-center gap-2 cursor-pointer"
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
