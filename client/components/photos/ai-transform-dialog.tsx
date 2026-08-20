"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, ImageIcon, Sparkles, Wand2, X } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { PhotoResponse, AiTransformType, AiTransformRequest } from "@/lib/api";
import { useAiPreview, useAiApply } from "@/hooks/use-photos";

type AiTransformDialogProps = {
    photo: PhotoResponse | null;
    open: boolean;
    onClose: () => void;
};

type ValidationErrors = {
    prompt?: string;
    width?: string;
    height?: string;
    focusObject?: string;
};

const TRANSFORM_OPTIONS: { value: AiTransformType; label: string; description: string }[] = [
    { value: "REMOVE_BACKGROUND", label: "Remove Background", description: "Remove the background from the photo" },
    { value: "BACKGROUND_AND_SHADOW", label: "Background & Shadow", description: "Add realistic shadow to background" },
    { value: "CHANGE_BACKGROUND", label: "Change Background", description: "Replace background with AI-generated scene" },
    { value: "GENERATIVE_FILL", label: "Generative Fill", description: "Expand the photo with AI-generated content" },
    { value: "SMART_CROP", label: "Smart Crop", description: "Intelligently crop to focus on the subject" },
    { value: "OBJECT_CROP", label: "Object Crop", description: "Crop to focus on a specific object" },
    { value: "RETOUCH", label: "Retouch", description: "Enhance and retouch the photo" },
    { value: "UPSCALE", label: "Upscale", description: "Increase resolution with AI" },
    { value: "AI_EDIT", label: "AI Edit", description: "Edit the photo with a text prompt" },
];

export function AiTransformDialog({ photo, open, onClose }: AiTransformDialogProps) {
    const [type, setType] = useState<AiTransformType>("REMOVE_BACKGROUND");
    const [prompt, setPrompt] = useState("");
    const [width, setWidth] = useState<string>("");
    const [height, setHeight] = useState<string>("");
    const [focusObject, setFocusObject] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewChain, setPreviewChain] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"original" | "preview">("original");

    const previewMutation = useAiPreview();
    const applyMutation = useAiApply();

    if (!photo) return null;

    const requiresPrompt = type === "CHANGE_BACKGROUND" || type === "AI_EDIT";
    const requiresDimensions = type === "GENERATIVE_FILL" || type === "SMART_CROP";
    const requiresFocusObject = type === "OBJECT_CROP";
    const showPrompt = requiresPrompt || type === "GENERATIVE_FILL";
    const showSize = requiresDimensions;
    const showFocusObject = requiresFocusObject;

    const getValidationErrors = (): ValidationErrors => {
        const errors: ValidationErrors = {};
        if (requiresPrompt && !prompt.trim()) {
            errors.prompt = "Please enter a prompt.";
        }

        if (requiresDimensions) {
            const parsedWidth = Number(width);
            const parsedHeight = Number(height);
            if (!Number.isInteger(parsedWidth) || parsedWidth < 64 || parsedWidth > 4096) {
                errors.width = "Width must be an integer between 64 and 4096 pixels.";
            }
            if (!Number.isInteger(parsedHeight) || parsedHeight < 64 || parsedHeight > 4096) {
                errors.height = "Height must be an integer between 64 and 4096 pixels.";
            }
        }

        if (requiresFocusObject) {
            const sanitized = focusObject.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
            if (!sanitized) {
                errors.focusObject = "Please enter a focus object, such as person or face.";
            }
        }

        return errors;
    };

    const validationErrors = getValidationErrors();
    const hasValidationErrors = Object.keys(validationErrors).length > 0;

    const buildRequest = (): AiTransformRequest | null => {
        const errors = getValidationErrors();
        if (Object.keys(errors).length > 0) {
            return null;
        }

        const req: AiTransformRequest = { type };
        if ((requiresPrompt || type === "GENERATIVE_FILL") && prompt.trim()) {
            req.prompt = prompt.trim();
        }
        if (requiresDimensions) {
            req.width = Number(width);
            req.height = Number(height);
        }
        if (requiresFocusObject) req.focusObject = focusObject.trim();
        return req;
    };

    const handlePreview = () => {
        const request = buildRequest();
        if (!request) return;
        previewMutation.reset();
        previewMutation.mutate(
            { photoId: photo.id, request },
            {
                onSuccess: (data) => {
                    setPreviewUrl(data.previewUrl);
                    setPreviewChain(data.transformChain);
                    setViewMode("preview");
                },
            }
        );
    };

    const handleApply = () => {
        const request = buildRequest();
        if (!request) return;
        applyMutation.reset();
        applyMutation.mutate(
            { photoId: photo.id, request },
            { onSuccess: onClose }
        );
    };

    const handleTypeChange = (val: AiTransformType) => {
        setType(val);
        setPreviewUrl(null);
        setPreviewChain(null);
        setViewMode("original");
        setPrompt("");
        setWidth("");
        setHeight("");
        setFocusObject("");
        previewMutation.reset();
        applyMutation.reset();
    };

    const getErrorMessage = (error: Error | null, fallback: string) => {
        const message = error?.message || "";
        if (message.includes("Focus object is required")) return "Please enter a focus object.";
        if (message.includes("Invalid focus object")) return "Use letters, numbers, spaces, hyphens, or underscores for the focus object.";
        if (message.includes("must be between 64 and 4096")) return "Dimensions must be between 64 and 4096 pixels.";
        if (message.includes("Prompt is required")) return "Please enter a prompt.";
        if (message.includes("Timed out waiting")) return "The transformation is taking longer than expected. The request was valid; please try again.";
        return fallback;
    };

    const previewError = previewMutation.error as Error | null;
    const applyError = applyMutation.error as Error | null;
    const previewing = previewMutation.isPending;
    const applying = applyMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false} className="flex h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-[#dcebf2] bg-[#f7fbfd] p-0 shadow-[0_30px_100px_rgba(38,83,112,0.22)] dark:border-white/10 dark:bg-[#0d1d33] sm:h-[min(90vh,860px)] sm:w-[min(92vw,1180px)] sm:max-w-[min(92vw,1180px)] sm:rounded-3xl">
                <DialogHeader className="border-b border-[#dcebf2] bg-white px-6 py-5 dark:border-white/10 dark:bg-[#10213e]">
                    <div className="flex items-center gap-3 pr-8">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#dff4fb] text-[#3189ad] dark:bg-[#1f4c66] dark:text-[#bdeaf8]">
                            <Sparkles className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-xl font-semibold tracking-[-0.03em] text-[#10264b] dark:text-white">AI Transform</DialogTitle>
                            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground"><ImageIcon className="size-3.5" /> {photo.fileName}</p>
                        </div>
                        <div className="ml-auto hidden rounded-full bg-[#eaf7fb] px-3 py-1 text-xs font-medium text-[#3189ad] dark:bg-[#1f4c66] dark:text-[#bdeaf8] sm:block">Create a new version</div>
                        <Button variant="ghost" size="icon" className="absolute right-3 top-3 size-9 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10" onClick={onClose} aria-label="Close AI transform"><X className="size-4" /></Button>
                    </div>
                </DialogHeader>

                <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[minmax(290px,36%)_minmax(0,1fr)] md:overflow-hidden">
                    {/* Controls panel */}
                    <div className="min-w-0 border-b border-[#dcebf2] bg-white md:overflow-y-auto md:border-b-0 md:border-r dark:border-white/10 dark:bg-[#10213e]">
                        <div className="space-y-6 p-5 sm:p-6">
                            {/* Transformation type */}
                            <div className="space-y-2">
                                <div>
                                    <Label className="text-sm font-semibold text-[#10264b] dark:text-white">Choose a transformation</Label>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">Pick an effect, then tune its options below.</p>
                                </div>
                                <Select value={type} onValueChange={(v) => handleTypeChange(v as AiTransformType)}>
                                    <SelectTrigger className="h-11 bg-[#f7fbfd] dark:bg-white/5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TRANSFORM_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <div>
                                                    <div className="font-medium">{opt.label}</div>
                                                    <div className="text-xs text-muted-foreground">{opt.description}</div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex items-start gap-2 rounded-xl bg-[#eef8fb] p-3 text-xs leading-5 text-[#397b97] dark:bg-[#1b4055] dark:text-[#bdeaf8]"><Check className="mt-0.5 size-3.5 shrink-0" />{TRANSFORM_OPTIONS.find((o) => o.value === type)?.description}</div>
                            </div>

                            {/* Prompt */}
                            {showPrompt && (
                                <div className="space-y-2">
                                    <Label>
                                        Prompt
                                        {type !== "GENERATIVE_FILL" && (
                                            <span className="text-destructive ml-1">*</span>
                                        )}
                                    </Label>
                                    <Textarea className="min-h-24 resize-none bg-[#f7fbfd] dark:bg-white/5"
                                        placeholder={
                                            type === "CHANGE_BACKGROUND"
                                                ? "e.g. A sunny beach with palm trees"
                                                : type === "AI_EDIT"
                                                ? "e.g. Make the sky more dramatic"
                                                : "Optional: describe the fill content"
                                        }
                                        rows={3}
                                        value={prompt}
                                        onChange={(e) => {
                                            setPrompt(e.target.value);
                                            previewMutation.reset();
                                            applyMutation.reset();
                                        }}
                                        aria-invalid={!!(validationErrors.prompt)}
                                    />
                                    {validationErrors.prompt && <p className="text-xs text-destructive">{validationErrors.prompt}</p>}
                                </div>
                            )}

                            {/* Width / Height */}
                            {showSize && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>
                                            Width (px)
                                            <span className="text-destructive ml-1">*</span>
                                        </Label>
                                        <Input className="bg-[#f7fbfd] dark:bg-white/5"
                                            type="number"
                                            placeholder="e.g. 1920"
                                            value={width}
                                            onChange={(e) => {
                                                setWidth(e.target.value);
                                                previewMutation.reset();
                                                applyMutation.reset();
                                            }}
                                            aria-invalid={!!(validationErrors.width)}
                                        />
                                        {validationErrors.width && <p className="text-xs text-destructive">{validationErrors.width}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            Height (px)
                                            <span className="text-destructive ml-1">*</span>
                                        </Label>
                                        <Input className="bg-[#f7fbfd] dark:bg-white/5"
                                            type="number"
                                            placeholder="e.g. 1080"
                                            value={height}
                                            onChange={(e) => {
                                                setHeight(e.target.value);
                                                previewMutation.reset();
                                                applyMutation.reset();
                                            }}
                                            aria-invalid={!!(validationErrors.height)}
                                        />
                                        {validationErrors.height && <p className="text-xs text-destructive">{validationErrors.height}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Focus object */}
                            {showFocusObject && (
                                <div className="space-y-2">
                                    <Label>
                                        Focus Object
                                        <span className="text-destructive ml-1">*</span>
                                    </Label>
                                    <Input className="bg-[#f7fbfd] dark:bg-white/5"
                                        placeholder="e.g. person, cat, car"
                                        value={focusObject}
                                        onChange={(e) => {
                                            setFocusObject(e.target.value);
                                            previewMutation.reset();
                                            applyMutation.reset();
                                        }}
                                        aria-invalid={!!(validationErrors.focusObject)}
                                    />
                                    {validationErrors.focusObject && <p className="text-xs text-destructive">{validationErrors.focusObject}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview workspace */}
                    <div className="flex min-h-[360px] min-w-0 flex-col overflow-hidden bg-[#edf5f8] p-3 dark:bg-[#071326] sm:p-5 md:min-h-0">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <div><p className="text-sm font-semibold text-[#10264b] dark:text-white">Preview workspace</p><p className="text-xs text-muted-foreground">Generate a preview, then switch between the original and result.</p></div>
                            <div className="flex rounded-xl border border-[#cfe5ec] bg-white p-1 dark:border-white/10 dark:bg-white/5">
                                <Button type="button" variant="ghost" size="sm" className={`h-8 rounded-lg px-3 text-xs ${viewMode === "original" ? "bg-[#e7f5f9] text-[#246d88] dark:bg-[#1f4c66] dark:text-[#bdeaf8]" : "text-muted-foreground"}`} onClick={() => setViewMode("original")}>Original</Button>
                                <Button type="button" variant="ghost" size="sm" disabled={!previewUrl} className={`h-8 rounded-lg px-3 text-xs ${viewMode === "preview" ? "bg-[#e7f5f9] text-[#246d88] dark:bg-[#1f4c66] dark:text-[#bdeaf8]" : "text-muted-foreground"}`} onClick={() => setViewMode("preview")}>Preview {previewUrl && <Check className="ml-1 size-3.5 text-emerald-500" />}</Button>
                            </div>
                        </div>
                        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#c9e5ee] bg-[#f5fafb] shadow-sm dark:border-white/10 dark:bg-[#0b1930]">
                            {previewing ? (
                                <div className="flex h-full min-h-[350px] flex-col items-center justify-center gap-3 text-muted-foreground"><Spinner className="size-9" /><p className="text-sm">Generating preview...</p></div>
                            ) : previewError ? (
                                <div className="flex h-full min-h-[350px] flex-col items-center justify-center gap-3 p-6 text-center">
                                    <div className="flex size-11 items-center justify-center rounded-full bg-[#fff0f1] text-destructive dark:bg-destructive/15"><X className="size-5" /></div>
                                    <div><p className="font-semibold text-[#10264b] dark:text-white">Unable to generate preview</p><p className="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">{getErrorMessage(previewError, "Something went wrong while generating the transformation. Please try again.")}</p></div>
                                    <Button type="button" variant="outline" size="sm" onClick={handlePreview}>Try again</Button>
                                </div>
                            ) : viewMode === "preview" && previewUrl ? (
                                <><Image src={previewUrl} alt="AI generated preview" fill className="object-contain p-3 sm:p-6" unoptimized />{previewChain && <div className="absolute bottom-3 left-3 right-3 truncate rounded-lg bg-black/65 px-3 py-2 text-xs text-white/85">{previewChain}</div>}</>
                            ) : (
                                <Image src={photo.url} alt="Original photo" fill className="object-contain p-3 sm:p-6" unoptimized />
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex flex-col-reverse gap-2 border-t border-[#dcebf2] bg-white px-5 py-4 sm:flex-row sm:justify-between dark:border-white/10 dark:bg-[#10213e]">
                    <div className="min-w-0 flex-1">
                        {applyError ? <p className="text-xs leading-5 text-destructive">{getErrorMessage(applyError, "Something went wrong while creating the transformed photo. Please try again.")}</p> : <p className="hidden text-xs text-muted-foreground sm:block">Preview before applying changes to your library.</p>}
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto">
                    <Button className="flex-1 sm:flex-none" variant="outline" onClick={onClose} disabled={applying}>
                        Cancel
                    </Button>
                    <Button
                        variant="secondary"
                        className="flex-1 bg-[#e7f5f9] text-[#246d88] hover:bg-[#d5eef5] sm:flex-none dark:bg-[#1f4c66] dark:text-[#bdeaf8]"
                        onClick={handlePreview}
                        disabled={previewing || applying || hasValidationErrors}
                    >
                        {previewing ? (
                            <>
                                <Spinner className="size-4 mr-2" />
                                Previewing...
                            </>
                        ) : (
                            <>
                                <Wand2 className="size-4 mr-2" />
                                Preview
                            </>
                        )}
                    </Button>
                    <Button
                        className="flex-1 sm:flex-none"
                        onClick={handleApply}
                        disabled={applying || previewing || hasValidationErrors}
                    >
                        {applying ? (
                            <>
                                <Spinner className="size-4 mr-2" />
                                Applying...
                            </>
                        ) : (
                            <>
                                <Sparkles className="size-4 mr-2" />
                                Apply
                            </>
                        )}
                    </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
