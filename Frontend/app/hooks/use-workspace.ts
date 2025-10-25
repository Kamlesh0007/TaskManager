import { useMutation, useQuery } from "@tanstack/react-query"
import { fetchData, postData } from "@/lib/fetch-util";
import type { WorkspaceForm } from "@/components/workspace/create-workspace";


export const useCreateWorkspace=()=>{
    return useMutation({
        mutationFn:(data:WorkspaceForm)=>postData("/workspaces",data)
    })
}


export const useGetWorkspacesQuery=()=>{
return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => fetchData("/workspaces"),
  });
}


export const useGetWorkspaceQuery = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
  });
};