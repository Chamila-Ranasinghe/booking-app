
import {apiClient} from "../api/common";
import type {User} from "../classes/CalendarClass";


export const getUsers = () => apiClient<User[]>("users");


