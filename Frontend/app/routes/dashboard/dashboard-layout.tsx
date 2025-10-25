import Header from '@/components/layout/header';
import { SidebarComponent } from '@/components/layout/sidebar-component';
import { Loader } from '@/components/loader';
import { useAuth } from '@/provider/auth-context';
import type { Workspace } from '@/types';
import { useState } from 'react';
import { Navigate, Outlet, redirect } from 'react-router';
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { fetchData } from '@/lib/fetch-util';

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  // Track mobile sidebar visibility
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/sign-in" />;

  const handleWorkspaceSelected = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    setIsMobileSidebarOpen(false); // auto close sidebar on mobile after selection
  };

  return (
    <>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <SidebarComponent
          currentWorkspace={currentWorkspace}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col h-full">
          <Header
            onWorkspaceSelected={handleWorkspaceSelected}
            selectedWorkspace={currentWorkspace}
            onCreateWorkspace={() => setIsCreatingWorkspace(true)}
            onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)} // toggle icon in header
          />
          <main className="flex-1 overflow-y-auto h-full w-full">
            <div className="mx-auto container px-6  md:px-2 sm:px-6 lg:px-8 py-8 w-full h-full">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Create Workspace Modal */}
        <CreateWorkspace
          isCreatingWorkspace={isCreatingWorkspace}
          setIsCreatingWorkspace={setIsCreatingWorkspace}
        />
      </div>
    </>
  );
};

export default DashboardLayout;

export const clientLoader = async () => {
  try {
    const [workspaces] = await Promise.all([fetchData("/workspaces")]);
    return { workspaces };
  } catch (error: any) {
    console.log(error);
    if (error?.status === 401) return redirect("/sign-in");
  }
};
