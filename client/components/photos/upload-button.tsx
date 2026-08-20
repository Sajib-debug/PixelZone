"use client";

import React, { useRef } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadPhoto } from "@/hooks/use-photos";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

type UploadButtonProps = {
    variant?: "button" | "dropzone";
};

export function UploadButton({ variant = "button" }: UploadButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { mutateAsync: upload, isPending } = useUploadPhoto();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter((file) => file.type.startsWith("image/"));

        if (validFiles.length !== files.length) {
            toast.error("Only image files can be uploaded.");
        }

        for (const file of validFiles) {
            try {
                await upload(file);
            } catch {
                // The mutation already reports the backend error.
            }
        }

        // Reset input so the same file can be re-selected
        e.target.value = "";
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    if (variant === "dropzone") {
        return (
            <div
                className="flex flex-col items-center gap-4 cursor-pointer"
                onClick={handleClick}
            >
                <Button className="cursor-pointer shadow-sm" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Spinner className="size-4" />
                            Uploading...
                        </>
                    ) : (
                        "Upload your first photo"
                    )}
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
        );
    }

    return (
        <>
            <Button
                className="gap-2 cursor-pointer shadow-sm"
                onClick={handleClick}
                disabled={isPending}
            >
                {isPending ? (
                    <>
                        <Spinner className="size-4" />
                        Uploading...
                    </>
                ) : (
                    <>
                        <UploadCloud className="size-4" />
                        Upload Photo
                    </>
                )}
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />
        </>
    );
}
