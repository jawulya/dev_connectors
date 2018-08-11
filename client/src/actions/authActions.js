import { FETCH_ERRORS, SET_CURRENT_USER } from "./types";
import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";

//Register user
export const registerUser = (user, history) => dispatch => {
  axios
    .post("/api/users/register", user)
    .then(user => history())
    .catch(err =>
      dispatch({
        type: FETCH_ERRORS,
        payload: err.response.data
      })
    );
};

// Login user
export const loginUser = user => dispatch => {
  axios
    .post("/api/users/login", user)
    .then(res => {
      //save to local storage
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);
      //set token to Auth header
      setAuthToken(token);
      //decode token to get user data
      const decoded = jwt_decode(token);
      //set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: FETCH_ERRORS,
        payload: err.response.data
      })
    );
};

//set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

//Logout user

export const logoutUser = () => dispatch => {
  //Remove token from local storage
  localStorage.removeItem("jwtToken");
  //Remove auth header from requests
  setAuthToken(false);
  //clear current user and auth to false
  dispatch(setCurrentUser({}));
};
