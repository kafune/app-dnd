import { useState } from "react";
import { folderAvatarUrl, initials } from "@/lib/avatar";
import type { Folder } from "@/lib/types";
import { cn } from "@/lib/cn";

type Props = {
  folder: Pick<Folder, "id" | "name" | "avatarVersion">;
  /** Lado em px. */
  size?: number;
  className?: string;
};

/** Foto da pasta: quadrado arredondado, para não confundir com a foto (redonda) das fichas. */
export function FolderAvatar({ folder, size = 56, className }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = folderAvatarUrl(folder);
  const showImage = !!src && failedSrc !== src;

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-700",
        className,
      )}
      style={{ width: size, height: size, backgroundColor: showImage ? "#e4e4e7" : "#3f3f46" }}
    >
      {showImage ? (
        <img
          src={src}
          alt={`Foto da pasta ${folder.name}`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="select-none font-mono font-semibold text-white" style={{ fontSize: Math.max(10, Math.round(size * 0.36)) }}>
          {initials(folder.name)}
        </span>
      )}
    </span>
  );
}
