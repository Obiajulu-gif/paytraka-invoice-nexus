import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 h-14 border-b border-border bg-card flex items-center px-4 gap-2">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <img 
                src="https://einvoice.firs.gov.ng/favicon.png" 
                alt="FIRS" 
                className="h-6 w-6"
              />
              <span className="text-sm text-muted-foreground hidden sm:inline">FIRS Compliant</span>
            </div>
          </header>
          <div className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
