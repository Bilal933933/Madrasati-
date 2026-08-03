"use client";

import { useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { uploadsApi } from "@/features/uploads/services/uploadsApi";
import { showApiError } from "@/lib/apiErrors";
import { imageUrl } from "@/lib/image";

type ImageUploadProps = {
  value: string;
  onValueChange: (path: string) => void;
  id?: string;
  className?: string;
};

export function ImageUpload({ value, onValueChange, id, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = imageUrl(value);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const response = await uploadsApi.uploadImage(file);
      onValueChange(response.data.path);
    } catch (error) {
      setError("تعذّر رفع الصورة. تأكد من صيغتها وحجمها (أقل من 2 ميجابايت).");
      showApiError(error, "تعذّر رفع الصورة. تأكد من صيغتها وحجمها (أقل من 2 ميجابايت).");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        <span
          className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-input bg-muted text-muted-foreground"
          aria-hidden="true"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-5" />
          )}
        </span>

        <div className="flex flex-1 items-center gap-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? <Spinner /> : <Upload />}
            {isUploading ? "جارٍ الرفع..." : "اختر صورة"}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onValueChange("")}
            >
              <X />
              إزالة
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          الصيغ المدعومة: JPG، PNG، WebP، GIF — بحد أقصى 2 ميجابايت.
        </p>
      )}
    </div>
  );
}
