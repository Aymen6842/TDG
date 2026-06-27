"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarFallback } from "@/lib/utils";

interface UserAvatarWithStatusProps {
  name: string;
  image?: string;
  isOnline?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function UserProfileImage({
  name,
  image,
  isOnline = false,
  size = "md"
}: UserAvatarWithStatusProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const dotSizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5"
  };

  return (
    <div className="relative inline-flex">
      <Avatar className={sizeClasses[size]}>
        {image && <AvatarImage src={image} alt={name} />}
        <AvatarFallback>{generateAvatarFallback(name)}</AvatarFallback>
      </Avatar>

      {isOnline && (
        <span
          className={`ring-background absolute right-0 bottom-0 rounded-full bg-green-500 ring-2 ${dotSizeClasses[size]}`}
        />
      )}
    </div>
  );
}
