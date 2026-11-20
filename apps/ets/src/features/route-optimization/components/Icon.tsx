// src/features/route-maker/components/Icon.tsx

interface Props {
  src: string; // plain import — no ?react needed
  size?: number;
  title?: string;
  style?: React.CSSProperties;
}

export default function Icon({ src, size = 16, title, style }: Props) {
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={title ?? ""}
      aria-hidden={!title}
      draggable={false}
      style={{ display: "inline-block", flexShrink: 0, ...style }}
    />
  );
}
