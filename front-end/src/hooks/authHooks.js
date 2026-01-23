import useAxios from "../service/useAxios"

export function useLogin() {
  const { data, error, msg, loaded, isLoading, apiCall } = useAxios();

  const loginUser = async (Endpoint, payload) => {
    const Base_url = import.meta.env.VITE_USERBASEURL_user;

    try {
      await apiCall(
        payload,
        Base_url,
        "post",
        (response) => {
          console.log(response);
        },
        Endpoint,
        (errorMessage) => {
          console.log(errorMessage);
        }
      );
    } catch (err) {
      //  console.log(err);
    }
  };

  return { data, error, msg, loaded, isLoading, loginUser };
}