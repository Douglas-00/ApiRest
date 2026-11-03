"use client";

import { useRef, useState, type DragEvent } from "react";
import { useUpload } from "@/lib/queries";
import { validateFile } from "@/lib/validation";
import { Alert } from "./ui";

export function FileUpload() {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const upload = useUpload();

  async function handle(files: FileList | File[]) {
    const list = [...files];
    const invalid = list.map(validateFile).filter((e): e is string => e !== null);
    setErrors(invalid);
    setUploaded([]);
    // Uploads valid files one by one so each gets its own success/error.
    for (const file of list.filter((f) => !validateFile(f))) {
      try {
        await upload.mutateAsync(file);
        setUploaded((u) => [...u, file.name]);
      } catch (e) {
        setErrors((errs) => [...errs, `${file.name}: ${(e as Error).message}`]);
      }
    }
    if (input.current) input.current.value = "";
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    handle(event.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      <label
        onDragOver={(e) => (e.preventDefault(), setDragging(true))}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? "border-accent bg-accent-soft" : "border-border hover:border-accent"
        }`}
      >
        <span aria-hidden className="grid size-10 place-items-center rounded-full bg-accent-soft text-lg font-semibold text-accent">+</span>
        <span className="text-sm font-medium">{upload.isPending ? "Enviando…" : "Arraste arquivos ou clique para escolher"}</span>
        <span className="text-xs text-muted">Até 5 MB por arquivo</span>
        <input
          ref={input}
          type="file"
          multiple
          aria-label="Escolher arquivos"
          className="sr-only"
          onChange={(e) => e.target.files && handle(e.target.files)}
        />
      </label>
      {errors.map((e) => <Alert key={e} tone="error">{e}</Alert>)}
      {uploaded.length > 0 && (
        <Alert tone="success">
          {uploaded.length === 1 ? `"${uploaded[0]}" enviado` : `${uploaded.length} arquivos enviados`}
        </Alert>
      )}
    </div>
  );
}
