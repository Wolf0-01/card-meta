"use client";

import { useRef } from "react";

import Button from "@/components/ui/Button";

interface Props {
  onImport(content: string): void | Promise<void>;
}

export default function ImportDeckButton({
  onImport,
}: Props) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  function openFilePicker() {
    inputRef.current?.click();
  }

  async function handleFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.endsWith(".ydk")) {
      alert(
        "Seleccione un archivo .ydk"
      );

      return;
    }

    const content =
      await file.text();

    await onImport(content);

    event.target.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".ydk"
        className="hidden"
        onChange={handleFile}
      />

      <Button
        variant="secondary"
        onClick={openFilePicker}
      >
        Importar .ydk
      </Button>
    </>
  );
}