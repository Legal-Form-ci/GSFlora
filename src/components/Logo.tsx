import logoSrc from "@/assets/logo-schoolhub-pro.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "full" | "mark";
  invert?: boolean;
}

const Logo = ({ className, variant = "full", invert = false }: LogoProps) => {
  return (
    <img
      src={logoSrc}
      alt="SchoolHub Pro — digitaliser. gérer. grandir."
      className={cn(
        "object-contain select-none",
        invert && "brightness-0 invert",
        variant === "mark" ? "h-10 w-10" : "h-10 w-auto",
        className
      )}
      draggable={false}
    />
  );
};

export default Logo;