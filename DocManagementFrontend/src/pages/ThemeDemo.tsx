import React from "react";
import { motion } from "framer-motion";
import { Palette, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { useTheme } from "@/context/ThemeContext";

const ThemeDemo = () => {
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <Palette className="h-10 w-10 text-primary" />
            Theme Demo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience our beautiful theming system with live previews of all
            components
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">Current: {theme.variant}</Badge>
            <Badge variant="outline">{theme.mode} mode</Badge>
          </div>
        </motion.div>

        {/* Theme Selector */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeSelector />
            </CardContent>
          </Card>
        </motion.div>

        {/* Component Examples */}
        <motion.div
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Buttons & Actions</CardTitle>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges & Status</CardTitle>
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
                  <span className="text-sm">
                    Warning - Minor issues detected
                  </span>
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
        </motion.div>

        {/* Cards Demo */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Card Layouts</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Card className="bg-card border border-border">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Feature Card</h4>
                  <p className="text-sm text-muted-foreground">
                    This card adapts to the current theme automatically.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Muted Card</h4>
                  <p className="text-sm text-muted-foreground">
                    Using muted background colors for variety.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-accent text-accent-foreground">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Accent Card</h4>
                  <p className="text-sm opacity-90">
                    Highlighted with accent colors for emphasis.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ThemeDemo;
