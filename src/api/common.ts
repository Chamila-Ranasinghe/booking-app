import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaleTime } from "../classes/CalendarClass";
import api from "./axios";


export interface ResponseObj<T> {
  data: T | undefined;
  error: string;
  message: string;
  success: boolean;
}



// GET
export const getRecords = (url: string, params: any = null) => {
  return async () => {
    const res = await api.get(url, {params:params });
    return res.data;
  };
};

// POST
export const createRecords = (url: string) => {
  return async (data: any) => {
    const res = await api.post(url, data);
    return res.data;
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



export function useApiQuery<T>(queryKey: string[], queryFn: () => Promise<T>, staleTime: number = StaleTime.TENMINUTES) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: staleTime,
    
    // refetchOnWindowFocus: false
  });
}

export const useApiMutation = (
  mutationFn: (data: any) => Promise<any>,
  queryKey: string[]
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      // auto refresh related data
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
