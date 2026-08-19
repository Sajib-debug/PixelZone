"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Wand2, ChevronDown } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import type { PhotoResponse, AiTransformType, AiTransformRequest } from "@/lib/api";
import { useAiPreview, useAiApply } from "@/hooks/use-photos";

type AiTransformDialogProps = {
    photo: PhotoResponse | null;
    open: boolean;
    onClose: () => void;
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

    const { mutate: preview, isPending: previewing } = useAiPreview();
    const { mutate: apply, isPending: applying } = useAiApply();

    if (!photo) return null;

    const buildRequest = (): AiTransformRequest => {
        const req: AiTransformRequest = { type };
        if (prompt.trim()) req.prompt = prompt.trim();
        if (width) req.width = parseInt(width, 10);
        if (height) req.height = parseInt(height, 10);
        if (focusObject.trim()) req.focusObject = focusObject.trim();
        return req;
    };

    const handlePreview = () => {
        preview(
            { photoId: photo.id, request: buildRequest() },
            {
                onSuccess: (data) => {
                    setPreviewUrl(data.previewUrl);
                    setPreviewChain(data.transformChain);
                },
            }
        );
    };

    const handleApply = () => {
        apply(
            { photoId: photo.id, request: buildRequest() },
            { onSuccess: onClose }
        );
    };

    const handleTypeChange = (val: AiTransformType) => {
        setType(val);
        setPreviewUrl(null);
        setPreviewChain(null);
        setPrompt("");
        setWidth("");
        setHeight("");
        setFocusObject("");
    };

    const showPrompt = type === "CHANGE_BACKGROUND" || type === "AI_EDIT" || type === "GENERATIVE_FILL";
    const showSize = type === "GENERATIVE_FILL" || type === "SMART_CROP";
    const showFocusObject = type === "OBJECT_CROP";

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="size-5 text-primary" />
                        AI Transform
                        <span className="text-muted-foreground font-normal text-sm ml-1 truncate max-w-xs">
                            — {photo.fileName}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col md:flex-row gap-0 overflow-hidden max-h-[70vh]">
                    {/* Controls panel */}
                    <div className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r overflow-y-auto">
                        <div className="p-6 space-y-5">
                            {/* Transformation type */}
                            <div className="space-y-2">
                                <Label>Transformation Type</Label>
                                <Select value={type} onValueChange={(v) => handleTypeChange(v as AiTransformType)}>
                                    <SelectTrigger>
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
                                <p className="text-xs text-muted-foreground">
                                    {TRANSFORM_OPTIONS.find((o) => o.value === type)?.description}
                                </p>
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
                                    <Textarea
                                        placeholder={
                                            type === "CHANGE_BACKGROUND"
                                                ? "e.g. A sunny beach with palm trees"
                                                : type === "AI_EDIT"
                                                ? "e.g. Make the sky more dramatic"
                                                : "Optional: describe the fill content"
                                        }
                                        rows={3}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                    />
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
                                        <Input
                                            type="number"
                                            placeholder="e.g. 1920"
                                            value={width}
                                            onChange={(e) => setWidth(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            Height (px)
                                            <span className="text-destructive ml-1">*</span>
                                        </Label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 1080"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                        />
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
                                    <Input
                                        placeholder="e.g. person, cat, car"
                                        value={focusObject}
                                        onChange={(e) => setFocusObject(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview panel */}
                    <div className="flex-1 bg-muted/20 flex flex-col overflow-hidden">
                        <div className="grid grid-cols-2 flex-1 overflow-hidden divide-x">
                            {/* Original */}
                            <div className="flex flex-col">
                                <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b bg-background/50">
                                    Original
                                </div>
                                <div className="relative flex-1 min-h-0 overflow-hidden">
                                    <Image
                                        src={photo.thumbnailUrl || photo.url}
                                        alt="Original"
                                        fill
                                        className="object-contain p-2"
                                        unoptimized
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="flex flex-col">
                                <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b bg-background/50">
                                    Preview
                                </div>
                                <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                                    {previewing ? (
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <Spinner className="size-8" />
                                            <p className="text-sm">Generating preview...</p>
                                        </div>
                                    ) : previewUrl ? (
                                        <>
                                            <Image
                                                src={previewUrl}
                                                alt="Preview"
                                                fill
                                                className="object-contain p-2"
                                                unoptimized
                                            />
                                            {previewChain && (
                                                <div className="absolute bottom-2 left-2 right-2 rounded bg-black/60 px-2 py-1 text-[10px] text-white/80 truncate">
                                                    {previewChain}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                                            <Wand2 className="size-10 opacity-30" />
                                            <p className="text-sm">
                                                Configure settings and click Preview to see the result
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t flex gap-2 justify-end">
                    <Button variant="outline" onClick={onClose} disabled={applying}>
                        Cancel
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handlePreview}
                        disabled={previewing || applying}
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
                        onClick={handleApply}
                        disabled={applying || previewing}
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
