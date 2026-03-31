const baseUrl = "https://jsonplaceholder.typicode.com/";

export async function fetchData(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(baseUrl + endpoint, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export const createUser = (user: any) =>
  fetchData("users", {
    method: "POST",
    body: JSON.stringify(user),
  });

export const deleteUser = (id: number) =>
  fetchData(`users/${id}`, {
    method: "DELETE",
  });  

