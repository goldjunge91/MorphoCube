import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Layout from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Database,
  Globe,
  Shield,
  Share2,
  Palette,
  Save,
  Loader2,
} from "lucide-react";

// System settings form schema
const systemSettingsSchema = z.object({
  language: z.string(),
  theme: z.string(),
  exportFormats: z.object({
    pdf: z.boolean(),
    excel: z.boolean(),
    csv: z.boolean(),
    json: z.boolean(),
  }),
  defaultPrivacy: z.string(),
});

// Security settings form schema
const securitySettingsSchema = z.object({
  sessionTimeout: z.number().min(1),
  failedLoginAttempts: z.number().min(1).max(10),
  passwordPolicy: z.object({
    minLength: z.number().min(6).max(20),
    requireUppercase: z.boolean(),
    requireNumbers: z.boolean(),
    requireSpecialChars: z.boolean(),
  }),
});

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Redirect non-admin users away from this page
    if (user && !user.isAdmin) {
      navigate("/");
    }
  }, [user, navigate]);

  const systemForm = useForm<z.infer<typeof systemSettingsSchema>>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      language: "en",
      theme: "light",
      exportFormats: {
        pdf: true,
        excel: true,
        csv: true,
        json: false,
      },
      defaultPrivacy: "private",
    },
  });

  const securityForm = useForm<z.infer<typeof securitySettingsSchema>>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      sessionTimeout: 30,
      failedLoginAttempts: 3,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
      },
    },
  });

  const onSystemSubmit = (data: z.infer<typeof systemSettingsSchema>) => {
    setIsSaving(true);
    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "System settings have been updated successfully.",
      });
      console.log("System settings:", data);
    }, 1000);
  };

  const onSecuritySubmit = (data: z.infer<typeof securitySettingsSchema>) => {
    setIsSaving(true);
    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Security settings have been updated successfully.",
      });
      console.log("Security settings:", data);
    }, 1000);
  };

  if (!user || !user.isAdmin) {
    return <div>Redirecting...</div>; // Will redirect via useEffect
  }

  return (
    <Layout title="Admin Settings">
      <div className="space-y-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">System Settings</h1>
        </div>

        <Tabs defaultValue="general">
          <div className="flex space-x-8">
            <div className="w-64">
              <TabsList className="flex flex-col space-y-1 bg-transparent p-0">
                <TabsTrigger
                  value="general"
                  className="justify-start px-3 py-2 text-left w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="justify-start px-3 py-2 text-left w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="localization"
                  className="justify-start px-3 py-2 text-left w-full"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Localization
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className="justify-start px-3 py-2 text-left w-full"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger
                  value="sharing"
                  className="justify-start px-3 py-2 text-left w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Sharing
                </TabsTrigger>
                <TabsTrigger
                  value="database"
                  className="justify-start px-3 py-2 text-left w-full"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Database
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1">
              <TabsContent value="general" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>
                      Configure general application settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...systemForm}>
                      <form
                        onSubmit={systemForm.handleSubmit(onSystemSubmit)}
                        className="space-y-6"
                      >
                        <FormField
                          control={systemForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Language</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="de">German</SelectItem>
                                  <SelectItem value="fr">French</SelectItem>
                                  <SelectItem value="es">Spanish</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                This will be the default language for new users.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={systemForm.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Theme</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select theme" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                  <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                The default theme for all users.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={systemForm.control}
                          name="defaultPrivacy"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Privacy Setting</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select privacy setting" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="private">Private</SelectItem>
                                  <SelectItem value="public">Public</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Default privacy setting for new morphological boxes.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                          <h3 className="text-sm font-medium mb-3">Export Formats</h3>
                          <div className="space-y-3">
                            <FormField
                              control={systemForm.control}
                              name="exportFormats.pdf"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <FormLabel className="font-normal">PDF</FormLabel>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={systemForm.control}
                              name="exportFormats.excel"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <FormLabel className="font-normal">Excel</FormLabel>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={systemForm.control}
                              name="exportFormats.csv"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <FormLabel className="font-normal">CSV</FormLabel>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={systemForm.control}
                              name="exportFormats.json"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <FormLabel className="font-normal">JSON</FormLabel>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Settings
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Configure security settings for the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...securityForm}>
                      <form
                        onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
                        className="space-y-6"
                      >
                        <FormField
                          control={securityForm.control}
                          name="sessionTimeout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Session Timeout (minutes)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Time in minutes before an inactive session expires.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={securityForm.control}
                          name="failedLoginAttempts"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Failed Login Attempts</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Number of failed login attempts before account lockout.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                          <h3 className="text-sm font-medium mb-3">Password Policy</h3>
                          <div className="space-y-3">
                            <FormField
                              control={securityForm.control}
                              name="passwordPolicy.minLength"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Minimum Length</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={securityForm.control}
                              name="passwordPolicy.requireUppercase"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <FormLabel className="font-normal">
                                    Require Uppercase Letters
                                  </FormLabel>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={securityForm.control}
                              name="passwordPolicy.requireNumbers"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <FormLabel className="font-normal">
                                    Require Numbers
                                  </FormLabel>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={securityForm.control}
                              name="passwordPolicy.requireSpecialChars"
                              render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                  <FormLabel className="font-normal">
                                    Require Special Characters
                                  </FormLabel>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Settings
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="localization" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Localization Settings</CardTitle>
                    <CardDescription>
                      Configure language and regional settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Globe className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Advanced localization settings are under development and will be available soon.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize the look and feel of the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Palette className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Theme customization and appearance settings are under development.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sharing" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Sharing Settings</CardTitle>
                    <CardDescription>
                      Configure settings for sharing and collaboration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Share2 className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Advanced sharing and collaboration settings will be available in a future update.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="database" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Settings</CardTitle>
                    <CardDescription>
                      Configure database connection and storage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Database className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Database configuration and management settings are under development.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
