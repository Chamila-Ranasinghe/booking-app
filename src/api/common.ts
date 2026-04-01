import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";

export interface ResponseObj<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
}

export const getData = (url: string) =>
    axios.get(url)
         .then((res)=> res);

export const postData = (url: string, data?: any) =>
    axios.post(url, data)
         .then((res)=> res);

export const putData = (url: string) =>
    axios.post(url)
         .then((res)=> res);


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

export function useApiMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>
) {
  const { mutate, data, error, isPending } = useMutation({
    mutationFn,
  });

  return {
    mutate,
    data,
    error: error as Error | null,
    isLoading: isPending,
  };
}