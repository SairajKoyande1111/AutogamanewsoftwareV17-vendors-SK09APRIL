import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto text-center border-none shadow-xl">
        <CardContent className="pt-6 pb-8">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500 opacity-80" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-display">Page Not Found</h1>
          <p className="text-gray-500 mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>

          <Link href="/dashboard" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8">
            Return to Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
