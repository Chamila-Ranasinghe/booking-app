import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export interface ResponseObj<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
}

export const getData = (url: string) =>
    axios.get(url)
         .then((res)=> res);

export const postData = (url: string) =>
    axios.post(url)
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