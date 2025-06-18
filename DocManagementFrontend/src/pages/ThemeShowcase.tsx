import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Monitor,
  Users,
  FileText,
  Settings,
  Building2,
  Eye,
  Heart,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ThemeShowcase: React.FC = () => {
  const { theme, availableThemes } = useTheme();
  const [selectedDemo, setSelectedDemo] = useState<string>("overview");

  const demoSections = [
    { id: "overview", name: "Theme Overview", icon: Palette },
    { id: "components", name: "UI Components", icon: Monitor },
    { id: "forms", name: "Forms & Inputs", icon: FileText },
    { id: "tables", name: "Data Tables", icon: Building2 },
    { id: "navigation", name: "Navigation", icon: Settings },
  ];

  const ThemeOverviewDemo = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          🎨 Theme Showcase
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience the power of dynamic theming with our comprehensive theme
          system. Switch between beautiful, carefully crafted color schemes that
          transform your entire application.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Current: {availableThemes.find((t) => t.id === theme.variant)?.name}
          </Badge>
          <Badge variant="outline" className="text-sm px-3 py-1">
            {theme.mode} mode
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableThemes.map((themeOption) => (
          <Card
            key={themeOption.id}
            className={cn(
              "relative overflow-hidden transition-all duration-300 hover:shadow-lg group cursor-pointer",
              theme.variant === themeOption.id
                ? "ring-2 ring-primary shadow-md"
                : ""
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{themeOption.name}</CardTitle>
                {theme.variant === themeOption.id && (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {themeOption.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-background"
                    style={{ backgroundColor: themeOption.colors.primary }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-background"
                    style={{ backgroundColor: themeOption.colors.secondary }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2 border-background"
                    style={{ backgroundColor: themeOption.colors.accent }}
                  />
                </div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <div>Primary: {themeOption.colors.primary}</div>
                  <div>Secondary: {themeOption.colors.secondary}</div>
                  <div>Accent: {themeOption.colors.accent}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const ComponentsDemo = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          UI Components
        </h2>
        <p className="text-muted-foreground mb-6">
          See how all UI components adapt to the selected theme automatically.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Button size="icon" variant="outline" className="h-8 w-8">
                <Heart className="h-4 w-4" />
              </Button>
              Buttons & Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="h-8 w-8 p-0 justify-center">
                !
              </Badge>
              Badges & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Error</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">
                  Online - All systems operational
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Warning - Minor issues detected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">
                  Error - System maintenance required
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const FormsDemo = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Forms & Inputs
        </h2>
        <p className="text-muted-foreground mb-6">
          Form elements automatically inherit theme colors for consistent
          design.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Contact Form</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Enter your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Your message here..."
            />
          </div>
          <Button className="w-full">Send Message</Button>
        </CardContent>
      </Card>
    </div>
  );

  const TablesDemo = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Data Tables</h2>
        <p className="text-muted-foreground mb-6">
          Tables and data grids seamlessly adapt to theme colors.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">John Doe</TableCell>
                <TableCell>Administrator</TableCell>
                <TableCell>
                  <Badge variant="secondary">Active</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Jane Smith</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>
                  <Badge variant="secondary">Active</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Bob Johnson</TableCell>
                <TableCell>User</TableCell>
                <TableCell>
                  <Badge variant="outline">Inactive</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const NavigationDemo = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Navigation</h2>
        <p className="text-muted-foreground mb-6">
          Navigation elements showcase theme consistency across interactive
          states.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex">
            {/* Sidebar Preview */}
            <div className="w-64 bg-card border-r border-border p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-accent text-accent-foreground">
                  <Monitor className="h-4 w-4" />
                  <span className="text-sm font-medium">Dashboard</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Users</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Documents</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">Settings</span>
                </div>
              </div>
            </div>

            {/* Main Content Preview */}
            <div className="flex-1 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Dashboard Overview</h3>
                  <Button size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">
                      Total Users
                    </div>
                    <div className="text-2xl font-bold">1,234</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">
                      Documents
                    </div>
                    <div className="text-2xl font-bold">5,678</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">Active</div>
                    <div className="text-2xl font-bold">90%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDemo = () => {
    switch (selectedDemo) {
      case "overview":
        return <ThemeOverviewDemo />;
      case "components":
        return <ComponentsDemo />;
      case "forms":
        return <FormsDemo />;
      case "tables":
        return <TablesDemo />;
      case "navigation":
        return <NavigationDemo />;
      default:
        return <ThemeOverviewDemo />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Theme Selector Sidebar */}
        <div className="w-80 border-r border-border bg-card p-6 min-h-screen">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Theme Controls</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Customize your application's appearance with our dynamic theming
                system.
              </p>
            </div>

            <ThemeSelector />

            <div className="pt-6 border-t border-border">
              <h3 className="font-medium mb-3">Demo Sections</h3>
              <div className="space-y-1">
                {demoSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedDemo(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                      selectedDemo === section.id
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <motion.div
            key={selectedDemo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            {renderDemo()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ThemeShowcase;
