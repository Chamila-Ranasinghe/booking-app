import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ResponseObj<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
}

// const config = {
//   headers:{
//     "Content-Type":"application/json",
//   }
// }

export const getData = async (url: string) =>
    await axios.get(url)
         .then((res)=> res);

export const postData = async(url: string, data?: any) =>
    await axios.post(url, data)
         .then((res)=> res);

export const putData = async ({id, data, url}: {
  id: string; data: any; url: string }) => {
  const res = await axios.put(url + id, data);
  return res.data;
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

// export function useApiMutation<T, V>(
//   mutationFn: (variables: V) => Promise<T>
// ) {
//   const { mutate, data, error, isPending } = useMutation({
//     mutationFn,
//   });

//   return {
//     mutate,
//     data,
//     error: error as Error | null,
//     isLoading: isPending,
//   };
// }

export const useApiMutation = (mutationFn: any, queryKey: string[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};