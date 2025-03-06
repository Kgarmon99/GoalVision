
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar({ className }: { className?: string }) {
  return (
    <Avatar className={`player-avatar ${className || ""}`}>
      <AvatarImage src="/images/user-profile.jpeg" alt="Kahlil Garmon" />
      <AvatarFallback>KG</AvatarFallback>
    </Avatar>
  );
}
