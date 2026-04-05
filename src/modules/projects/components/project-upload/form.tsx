// "use client";
// import { useEffect } from "react";
// import { PlusCircle } from "lucide-react";
// import { useTranslations } from "next-intl";

// import useUserUpload from "@/modules/users/hooks/user-upload";
// import useUserRoles from "@/modules/auth/hooks/users/roles";

// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList
// } from "@/components/ui/command";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { ErrorBanner } from "@/components/error-banner";
// import { castRoleFromFrontendToBackend } from "@/modules/auth/utils/user-roles";
// import { UserRoleOnBackendSide } from "@/modules/auth/types";
// import { Label } from "@/components/ui/label";
// import ProfileImageUpload from "@/components/images-upload/profile-image-upload";
// import { ProjectType } from "../../types/projects";

// interface UserCreationFormProps {
//   onFinish: () => void;
//   project?: ProjectType;
// }

// export default function UserUploadForm({ onFinish, project = undefined }: UserCreationFormProps) {
//   const t = useTranslations("modules.projects");

//   const { form, isPending, onSubmit, error } = useUserUpload({
//     onSuccess: () => {
//       form.reset();
//       onFinish();
//     },
//     project
//   });

//   const { roles, rolesAreLoading } = useUserRoles();

//   useEffect(() => {
//     if (user) {
//       form.reset({
//         fullName: user.name,
//         email: user.email,
//         phone: user.phone,
//         roles: user.roles.map((role) =>
//           castRoleFromFrontendToBackend(role)
//         ) as UserRoleOnBackendSide[],
//         imageUrl: user.image || ""
//       });
//     }
//   }, [user]);

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//         {/* --- Main Image --- */}
//         <ProfileImageUpload
//           defaultImageUrl={form.watch(`imageUrl`)}
//           defaultImageUrlInputName={`imageUrl`}
//           inputName={`image`}
//         />

//         <FormField
//           control={form.control}
//           name="fullName"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>{t("upload.form.labels.fullName")}</FormLabel>
//               <FormControl>
//                 <Input placeholder={t("upload.form.placeholders.fullName")} {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="email"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>{t("upload.form.labels.email")}</FormLabel>
//               <FormControl>
//                 <Input type="email" placeholder={t("upload.form.placeholders.email")} {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="phone"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>{t("upload.form.labels.phone")}</FormLabel>
//               <FormControl>
//                 <Input type="phone" placeholder={t("upload.form.placeholders.phone")} {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {!user && (
//           <FormField
//             control={form.control}
//             name="password"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>{t("upload.form.labels.password")}</FormLabel>
//                 <FormControl>
//                   <Input
//                     isPasswordInput={true}
//                     placeholder={t("upload.form.placeholders.password")}
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         )}

//         <FormField
//           name="roles"
//           control={form.control}
//           render={({ field }) => (
//             <FormItem>
//               <Label> {t("upload.form.labels.roles")}</Label>
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button variant="outline" className="w-full">
//                     <PlusCircle />
//                     {t("upload.form.labels.roles")}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-52 p-0">
//                   <Command>
//                     <CommandInput
//                       placeholder={t("table.filters.roles.placeholder")}
//                       className="h-9"
//                     />

//                     <CommandList className="">
//                       <CommandEmpty>{t("table.filters.roles.noResults")}</CommandEmpty>

//                       <CommandGroup>
//                         <FormControl>
//                           <CommandGroup>
//                             {roles?.map((role) => (
//                               <CommandItem key={role.value} value={role.value}>
//                                 <div className="flex items-center space-x-3 py-1">
//                                   <Checkbox
//                                     id={role.value}
//                                     checked={field.value?.includes(role.value)}
//                                     onCheckedChange={(checked) => {
//                                       if (checked) {
//                                         field.onChange([...(field.value ?? []), role.value]);
//                                       } else {
//                                         field.onChange(
//                                           field.value?.filter((value) => value !== role.value)
//                                         );
//                                       }
//                                     }}
//                                   />
//                                   <label
//                                     htmlFor={role.value}
//                                     className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
//                                     {role.label}
//                                   </label>
//                                 </div>
//                               </CommandItem>
//                             ))}
//                           </CommandGroup>
//                         </FormControl>
//                       </CommandGroup>
//                     </CommandList>
//                   </Command>
//                 </PopoverContent>
//               </Popover>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {error !== "" && <ErrorBanner error={error} />}

//         <div className="flex justify-end gap-3 pt-4">
//           <Button type="button" variant="outline" onClick={onFinish} disabled={isPending}>
//             {t("actions.cancel")}
//           </Button>
//           <Button type="submit" disabled={isPending}>
//             {isPending
//               ? t("actions.creating")
//               : user
//                 ? t("actions.updateUser")
//                 : t("actions.createUser")}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }
