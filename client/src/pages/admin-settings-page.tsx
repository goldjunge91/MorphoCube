import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Layout from "@/components/client/layout";
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
    <Layout title="Global Settings">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Global Application Settings</h1>
        {/* Placeholder content */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">Global settings management interface (Super Admin only).</p>
          {/* Add settings form elements */}
        </div>
      </div>
    </Layout>
  );
}
