// UserCard.tsx
import React from 'react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';

// Interface pour définir le type des propriétés de l'utilisateur
export interface User {
  id: number;
  username: string;
  email: string;
}

// Interface pour les props du composant
interface UserCardProps {
  user: User;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const { username, email } = user;
  
  // Obtenir les initiales pour l'avatar fallback
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    <Card className="w-80 max-w-md shadow-lg">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${username}`} alt={username} />
          <AvatarFallback>{getInitials(username)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-xl">{username}</CardTitle>
          <CardDescription className="text-sm text-gray-500">{email}</CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <span className="text-xs text-gray-400">Dernière connexion: Aujourd'hui</span>
      </CardFooter>
    </Card>
  );
};

// Exemple d'utilisation:
export default function UserCardExample() {
  const userExample = {
    id: 1,
    username: "root",
    email: "r@r.com"
  };
  
  return <UserCard user={userExample} />;
}