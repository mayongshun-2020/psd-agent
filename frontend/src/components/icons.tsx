import {
  Boxes,
  CheckCircle2,
  Eye,
  FileImage,
  Image,
  Layers,
  LayoutGrid,
  Library,
  Palette,
  Sparkles,
  Type,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  eye: Eye,
  layers: Layers,
  library: Library,
  palette: Palette,
  grid: LayoutGrid,
  type: Type,
  "file-image": FileImage,
  "check-circle": CheckCircle2,
  image: Image,
  boxes: Boxes,
  sparkles: Sparkles,
};

export function StageIcon({
  name,
  size = 18,
}: {
  name: string;
  size?: number;
}) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon size={size} />;
}
