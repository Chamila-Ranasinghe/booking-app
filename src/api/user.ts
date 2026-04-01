
import { getData } from "../api/common";
import { getUsers } from "../api/APIclass";



export const getAllUsers = () => getData(getUsers)
