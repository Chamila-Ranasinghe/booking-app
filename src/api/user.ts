
import { getData, postData } from "../api/common";
import { getUsers, createUser} from "../api/APIclass";


/* users */
export const getAllUsers = () => getData(getUsers)
export const saveUser = () => postData (createUser)
