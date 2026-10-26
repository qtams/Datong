import {
  Camera,
  Car,
  Dumbbell,
  Gamepad2,
  Gem,
  Gift,
  GraduationCap,
  Heart,
  House,
  Laptop,
  PawPrint,
  PiggyBank,
  Plane,
  ShieldCheck,
  Utensils,
} from "lucide-react";

const SAVINGS_GOAL_ICON_OPTIONS = [
  {
    id: "emergency",
    label: "Emergency fund",
    icon: ShieldCheck,
    background: "#e8f1f2",
    color: "#172126",
  },
  {
    id: "travel",
    label: "Travel",
    icon: Plane,
    background: "#e6f4f5",
    color: "#0f5962",
  },
  {
    id: "health",
    label: "Health",
    icon: Heart,
    background: "#f9ecec",
    color: "#8a3030",
  },
  {
    id: "car",
    label: "Car",
    icon: Car,
    background: "#edf1f5",
    color: "#273746",
  },
  {
    id: "home",
    label: "Home",
    icon: House,
    background: "#f2eee7",
    color: "#65543d",
  },
  {
    id: "gift",
    label: "Gift",
    icon: Gift,
    background: "#f5eefa",
    color: "#63447b",
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    background: "#eaf0fa",
    color: "#304e7a",
  },
  {
    id: "wedding",
    label: "Wedding",
    icon: Gem,
    background: "#f8edf2",
    color: "#783a56",
  },
  {
    id: "food",
    label: "Food",
    icon: Utensils,
    background: "#faf1e7",
    color: "#7d4a20",
  },
  {
    id: "technology",
    label: "Technology",
    icon: Laptop,
    background: "#e9f0f2",
    color: "#294d57",
  },
  {
    id: "pet",
    label: "Pet",
    icon: PawPrint,
    background: "#f3eee9",
    color: "#684e3b",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: Gamepad2,
    background: "#efedfa",
    color: "#4f447c",
  },
  {
    id: "fitness",
    label: "Fitness",
    icon: Dumbbell,
    background: "#e9f4ed",
    color: "#315c40",
  },
  {
    id: "memories",
    label: "Memories",
    icon: Camera,
    background: "#edf2f7",
    color: "#34495e",
  },
  {
    id: "general",
    label: "General savings",
    icon: PiggyBank,
    background: "#eeeeef",
    color: "#27272a",
  },
];

export const SAVINGS_GOAL_ICONS =
  SAVINGS_GOAL_ICON_OPTIONS.map((item) => ({
    ...item,
    background: "#111111",
    color: "#ffffff",
  }));

export function getSavingsGoalIcon(iconId) {
  return (
    SAVINGS_GOAL_ICONS.find(
      (item) => item.id === iconId,
    ) || SAVINGS_GOAL_ICONS[0]
  );
}
