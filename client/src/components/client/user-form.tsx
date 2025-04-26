import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Define the schema again or import it if shared
const userFormSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .optional()
        .or(z.literal("")),
    isAdmin: z.boolean().default(false),
    isTenantAdmin: z.boolean().default(false),
    isActive: z.boolean().default(true),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
    form: UseFormReturn<UserFormValues>;
    onSubmit: (data: UserFormValues) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    submitButtonText?: string;
    isEditMode?: boolean;
}

export function UserForm({
    form,
    onSubmit,
    onCancel,
    isSubmitting,
    submitButtonText = "Submit",
    isEditMode = false,
}: UserFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                {/* Username */}
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="johndoe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Email */}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Password */}
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isEditMode ? "New Password (optional)" : "Password"}</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder={isEditMode ? "Leave blank to keep current" : "••••••••"}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Roles */}
                <div className="space-y-2">
                    <FormLabel>Roles</FormLabel>
                    {/* Tenant Admin Switch */}
                    <FormField
                        control={form.control}
                        name="isTenantAdmin"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Tenant Administrator</FormLabel>
                                    <p className="text-xs text-muted-foreground">
                                        Can manage users and settings for this tenant.
                                    </p>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {/* isAdmin might be deprecated */}
                    {/* <FormField ... name="isAdmin" ... /> */}
                </div>

                {/* Active Status */}
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Active</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                    Inactive users cannot log in.
                                </p>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* Footer moved to parent component (DialogFooter) */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isEditMode ? "Updating..." : "Creating..."}
                            </>
                        ) : (
                            submitButtonText
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
