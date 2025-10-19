"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";

export default function TestThemePage() {
  const { theme } = useTheme();

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Theme Test Page
          </h1>
          <p className="text-muted-foreground">
            Current theme: <span className="font-semibold text-foreground">{theme}</span>
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Card 1</CardTitle>
            <CardDescription>
              This card should adapt to the current theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                All text colors should be properly themed.
              </p>
              <div className="flex gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Card 2</CardTitle>
            <CardDescription>
              Background and borders should match theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  Muted background with proper contrast
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-foreground">
                  Bordered content with themed border
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme Status</CardTitle>
          <CardDescription>
            Current theme information and system status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background border rounded-lg">
              <div className="text-2xl font-bold text-foreground">✓</div>
              <div className="text-sm text-muted-foreground">Theme Provider</div>
            </div>
            <div className="text-center p-4 bg-background border rounded-lg">
              <div className="text-2xl font-bold text-foreground">✓</div>
              <div className="text-sm text-muted-foreground">CSS Variables</div>
            </div>
            <div className="text-center p-4 bg-background border rounded-lg">
              <div className="text-2xl font-bold text-foreground">✓</div>
              <div className="text-sm text-muted-foreground">Components</div>
            </div>
            <div className="text-center p-4 bg-background border rounded-lg">
              <div className="text-2xl font-bold text-foreground">✓</div>
              <div className="text-sm text-muted-foreground">Transitions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




