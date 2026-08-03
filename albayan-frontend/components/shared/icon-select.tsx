"use client";

import { createElement } from "react";
import {
  AlarmClock,
  Apple,
  Atom,
  Award,
  Baby,
  BadgeCheck,
  Bell,
  Book,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Braces,
  Brain,
  Briefcase,
  Bus,
  Calculator,
  Calendar,
  Camera,
  Carrot,
  ChartLine,
  ChefHat,
  ChessKnight,
  ClipboardList,
  Cloud,
  Coffee,
  CodeXml,
  Compass,
  Cookie,
  Cpu,
  CupSoda,
  Dice5,
  Dna,
  Dumbbell,
  Eraser,
  Flag,
  FlaskConical,
  Flower,
  FolderOpen,
  Folders,
  Footprints,
  FunctionSquare,
  Gamepad2,
  Globe2,
  GraduationCap,
  Hammer,
  Headphones,
  Heart,
  HeartPulse,
  Home,
  Hourglass,
  Infinity,
  Key,
  Landmark,
  Languages,
  Layers,
  Leaf,
  Library,
  Lightbulb,
  Lock,
  Magnet,
  Mail,
  Map as MapIcon,
  Mic,
  Microscope,
  Milk,
  Moon,
  MoonStar,
  Mountain,
  Music,
  NotebookPen,
  Palette,
  Paintbrush,
  PawPrint,
  Pencil,
  PenLine,
  PenTool,
  Phone,
  Plane,
  Puzzle,
  Quote,
  Rocket,
  Ruler,
  School,
  Scissors,
  ScrollText,
  Search,
  Send,
  Shapes,
  Shield,
  Ship,
  Smile,
  Sparkles,
  Star,
  Sun,
  Sword,
  Target,
  TestTube,
  Timer,
  TreeDeciduous,
  Trophy,
  Truck,
  User,
  Users,
  Video,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

export interface IconOption {
  name: string;
  component: LucideIcon;
}

export const iconOptions: IconOption[] = [
  { name: "BookOpen", component: BookOpen },
  { name: "Book", component: Book },
  { name: "BookMarked", component: BookMarked },
  { name: "BookOpenCheck", component: BookOpenCheck },
  { name: "NotebookPen", component: NotebookPen },
  { name: "ClipboardList", component: ClipboardList },
  { name: "ScrollText", component: ScrollText },
  { name: "Library", component: Library },
  { name: "School", component: School },
  { name: "GraduationCap", component: GraduationCap },
  { name: "Landmark", component: Landmark },
  { name: "Languages", component: Languages },
  { name: "Calculator", component: Calculator },
  { name: "Atom", component: Atom },
  { name: "FlaskConical", component: FlaskConical },
  { name: "TestTube", component: TestTube },
  { name: "Microscope", component: Microscope },
  { name: "Dna", component: Dna },
  { name: "Brain", component: Brain },
  { name: "Cpu", component: Cpu },
  { name: "CodeXml", component: CodeXml },
  { name: "Braces", component: Braces },
  { name: "FunctionSquare", component: FunctionSquare },
  { name: "Infinity", component: Infinity },
  { name: "ChartLine", component: ChartLine },
  { name: "Palette", component: Palette },
  { name: "Paintbrush", component: Paintbrush },
  { name: "Music", component: Music },
  { name: "Mic", component: Mic },
  { name: "Headphones", component: Headphones },
  { name: "Video", component: Video },
  { name: "Camera", component: Camera },
  { name: "PenTool", component: PenTool },
  { name: "PenLine", component: PenLine },
  { name: "Pencil", component: Pencil },
  { name: "Eraser", component: Eraser },
  { name: "Ruler", component: Ruler },
  { name: "Compass", component: Compass },
  { name: "Map", component: MapIcon },
  { name: "Mountain", component: Mountain },
  { name: "Globe2", component: Globe2 },
  { name: "Flag", component: Flag },
  { name: "Shapes", component: Shapes },
  { name: "Layers", component: Layers },
  { name: "Folders", component: Folders },
  { name: "FolderOpen", component: FolderOpen },
  { name: "Search", component: Search },
  { name: "Lightbulb", component: Lightbulb },
  { name: "Sparkles", component: Sparkles },
  { name: "Star", component: Star },
  { name: "Target", component: Target },
  { name: "Rocket", component: Rocket },
  { name: "Trophy", component: Trophy },
  { name: "Award", component: Award },
  { name: "BadgeCheck", component: BadgeCheck },
  { name: "Users", component: Users },
  { name: "User", component: User },
  { name: "Heart", component: Heart },
  { name: "HeartPulse", component: HeartPulse },
  { name: "Leaf", component: Leaf },
  { name: "Flower", component: Flower },
  { name: "TreeDeciduous", component: TreeDeciduous },
  { name: "Apple", component: Apple },
  { name: "Carrot", component: Carrot },
  { name: "Cookie", component: Cookie },
  { name: "CupSoda", component: CupSoda },
  { name: "ChefHat", component: ChefHat },
  { name: "Milk", component: Milk },
  { name: "Dumbbell", component: Dumbbell },
  { name: "Gamepad2", component: Gamepad2 },
  { name: "ChessKnight", component: ChessKnight },
  { name: "Puzzle", component: Puzzle },
  { name: "Dice5", component: Dice5 },
  { name: "Footprints", component: Footprints },
  { name: "Baby", component: Baby },
  { name: "Smile", component: Smile },
  { name: "PawPrint", component: PawPrint },
  { name: "Home", component: Home },
  { name: "Briefcase", component: Briefcase },
  { name: "Bus", component: Bus },
  { name: "Ship", component: Ship },
  { name: "Plane", component: Plane },
  { name: "Truck", component: Truck },
  { name: "Shield", component: Shield },
  { name: "Sword", component: Sword },
  { name: "Wrench", component: Wrench },
  { name: "Hammer", component: Hammer },
  { name: "Scissors", component: Scissors },
  { name: "Key", component: Key },
  { name: "Lock", component: Lock },
  { name: "Mail", component: Mail },
  { name: "Phone", component: Phone },
  { name: "Send", component: Send },
  { name: "Bell", component: Bell },
  { name: "Calendar", component: Calendar },
  { name: "Timer", component: Timer },
  { name: "AlarmClock", component: AlarmClock },
  { name: "Hourglass", component: Hourglass },
  { name: "Sun", component: Sun },
  { name: "Moon", component: Moon },
  { name: "MoonStar", component: MoonStar },
  { name: "Cloud", component: Cloud },
  { name: "Wind", component: Wind },
  { name: "Magnet", component: Magnet },
  { name: "Zap", component: Zap },
  { name: "Quote", component: Quote },
  { name: "Coffee", component: Coffee },
];

const iconMap = new Map(
  iconOptions.map((option) => [option.name, option.component] as const)
);

export function IconByName({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  if (!name) return null;

  const Icon = iconMap.get(name);
  if (!Icon) return null;

  return createElement(Icon, { className, "aria-hidden": true });
}

type IconSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  className?: string;
  clearLabel?: string;
};

export function IconSelect({
  value,
  onValueChange,
  id,
  className,
  clearLabel = "بدون أيقونة",
}: IconSelectProps) {
  const SelectedIcon = iconMap.get(value);

  return (
    <div className="flex w-full items-center gap-2">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-input text-muted-foreground"
      >
        {SelectedIcon ? createElement(SelectedIcon, { className: "size-4" }) : null}
      </span>
      <NativeSelect
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn("w-full flex-1 [&_select]:h-9", className)}
      >
        <NativeSelectOption value="">{clearLabel}</NativeSelectOption>
        {iconOptions.map((option) => (
          <NativeSelectOption key={option.name} value={option.name}>
            {option.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}
