import { imageUrl } from "@/lib/image";

type EntityThumbProps = {
  image: string | null | undefined;
  icon: string | null | undefined;
  color: string | null | undefined;
  label: string;
};

export function EntityThumb({ image, icon, color, label }: EntityThumbProps) {
  const src = imageUrl(image);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="size-6 shrink-0 rounded-md object-cover"
      />
    );
  }

  return (
    <span
      className="flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-medium text-primary-foreground"
      style={{ backgroundColor: color ?? "var(--primary)" }}
    >
      {icon ?? label.charAt(0)}
    </span>
  );
}
