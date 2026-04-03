import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


export interface ResponseObj<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
}



// GET
export const getRecords  = async () => {
  const res = await axios.get("/users");
  return res.data;
};

// POST
export const createRecords = (url: string) => {
  return async (data: any) => {
    const res = await axios.post(url, data);
    return res;
  };
};

// UPDATE
export const updateRecords  = async ({ id, data }: any) => {
  const res = await axios.put(`/users/${id}`, data);
  return res.data;
};

// DELETE
export const deleteRecords = async (id: string) => {
  await axios.delete(`/users/${id}`);
};        



export function useApiQuery<T>(queryKey: string[], queryFn: () => Promise<T>) {
  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn,
  });

  return {
    data,
    error: error as Error | null,
    isLoading,
  };
}

export const useApiMutation = (
  mutationFn: (data: any) => Promise<any>,
  queryKey: string[]
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      // auto refresh related data
      console.log("API Response:", data);
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
