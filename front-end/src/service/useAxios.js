import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";

const ERR_MSGS = {
  0: "Network error. Check your connection",
  500: "Internal server error",
  // 400: "Invalid input",
  // 401: "User  not signed in yet",
  403: "Access to page not allowed",
  // 404: "Requested resource not found",
};

function useAxios() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const accessToken = useSelector((state) => state.user.accessToken);

  const apiCall = async (
    payload,
    baseUrl,
    method,
    callback,
    url = null,
    failCallback = null
  ) => {
    setData(null);
    setMsg("");
    setError("");
    setLoaded(false);
    setIsLoading(true);
    const TOKEN = accessToken;

    const headers = {
      Authorization: `Bearer ${TOKEN}`,
    };

    try {
      const requestConfig = {
        method,
        url: `${baseUrl}${url}`,
        headers,
        data: method === "get" ? null : payload,
        timeout: 5000,
      };

      if (method === "get") {
        requestConfig.params = payload;
      } else if (
        ["put", "post", "delete", "patch", "options", "postForm"].includes(
          method
        )
      ) {
        if (method === "options") {
          headers["Content-Type"] = "multipart/form-data";
          requestConfig.method = "patch";
        }
        if (method === "postForm") {
          headers["Content-Type"] = "multipart/form-data";
          requestConfig.method = "post";
        }
        requestConfig.data = payload;
      }

      const response = await axios.request(requestConfig);

      if (method === "get" && !response.data) {
        setMsg("No result found");
      }

      setData(response.data);
      callback(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || -1;
        const errorMessage =
          error.response?.data?.message ||
          ERR_MSGS[statusCode] ||
          "connection time out check your network";

        if (error.code === "ERR_NETWORK ") {
        } else if (error.response?.status === 401) {
        } else if (failCallback) {
          failCallback(errorMessage);
        }

        // console.log(errorMessage);
        setError(errorMessage);
        setMsg(ERR_MSGS[error.status] || errorMessage);
      }
    } finally {
      setLoaded(true);
      setIsLoading(false);
    }
  };

  return {
    data,
    error,
    msg,
    loaded,
    isLoading,
    apiCall,
  };
}

export default useAxios;
