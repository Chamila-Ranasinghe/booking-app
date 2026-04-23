// export const baseUrl = "https://play.codebytes.co/api/";
export const baseUrl = "http://localhost/booking-app-backend/"



/* user */
export const createUser = baseUrl + "register.php";
export const loginuser = baseUrl + "login.php";
export const verifyemail = baseUrl + "email_check_real_html.php";
export const OtpVerification = baseUrl + "email_verify.php";
export const logoutuser = baseUrl + "logout.php";


/* bookings */

export const createBooking = baseUrl + "insert_booking_data.php";
export const getBookings = baseUrl + "get_booking_data.php";
export const editBookings = baseUrl + "edit_booking_data.php";
export const confirmEvents = baseUrl + "confirm_booking.php";
export const deleteEvents = baseUrl + "delete_booking.php";


/* Master data */

export const getSports = baseUrl + "get_sports.php";
export const getTimeSlots = baseUrl + "get_timeslots.php";