import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TerminalCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  scanline?: boolean;
}

export function TerminalCard({ title, children, className, scanline = true }: TerminalCardProps) {
  return (
    <Card className={cn(
      "border-2 border-primary bg-card/50 backdrop-blur",
      scanline && "scanline",
      className
    )}>
      {title && (
        <CardHeader className="border-b border-primary/30">
          <CardTitle className="font-semibold text-glow-green tracking-widest text-[19px]">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
}
