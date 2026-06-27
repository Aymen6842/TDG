// import { Avatar, AvatarImage } from "@/components/ui/avatar";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import useUserInfo from "../../hooks/extraction/use-user";
// import { useTranslations } from "next-intl";

// interface Props {
//   id: string;
// }

// export function UserConnections({ id }: Props) {
//   const t = useTranslations("modules.users.connections");
//   const { user, userIsLoading, userError } = useUserInfo({ id });

//   return (
//     user && (
//       <div className="grid gap-6 lg:grid-cols-2">
//         <Card className="overflow-hidden pb-0">
//           <CardHeader>
//             <CardTitle>{t("title")}</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {user.teams
//               .map((team) => (
//                 <div key={team.id} className="flex items-center gap-4">
//                   <div className="relative">
//                     <Avatar className="size-10">
//                       <AvatarImage src={team.image} alt={team.name} />
//                     </Avatar>
//                     {/* {connection.online && (
//                   <div className="border-background absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 bg-green-500" />
//                 )} */}
//                   </div>

//                   <div className="min-w-0 flex-1">
//                     <p className="font-medium">{team.name}</p>
//                     {/* <p className="text-muted-foreground text-sm">
//                   {connection.connections} connections
//                 </p> */}
//                   </div>

//                   {/* {connection.status === "connected" ? (
//                 <Button
//                   size="icon-sm"
//                   className="shrink-0 rounded-full bg-blue-500 hover:bg-blue-600">
//                   <UserCheck />
//                 </Button>
//               ) : (
//                 <Button size="icon-sm" variant="outline" className="shrink-0 rounded-full">
//                   <UserPlus />
//                 </Button>
//               )} */}
//                 </div>
//               ))}
//           </CardContent>
//         </Card>
//       </div>
//     )
//   );
// }
