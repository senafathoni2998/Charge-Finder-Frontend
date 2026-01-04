import { useCallback, useState, useRef, useEffect } from "react";

const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequests = useRef([]);

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);
      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          credentials: "include",
          signal: httpAbortCtrl.signal,
        });

        const responseData = await response.json();

        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrl
        );

        console.log(activeHttpRequests);

        if (!response.ok) {
          throw new Error(responseData.message || "Failed to fetch data");
        }

        setIsLoading(false);
        return responseData;
      } catch (err) {
        if (err.name === "AbortError") {
          setIsLoading(false);
          // Optionally, you can skip setting error for aborts
          return;
        }
        console.error(err);
        setError(err.message);
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    return () => {
      // Only abort requests that are still pending
      activeHttpRequests.current.forEach((abortCtrl) => {
        if (abortCtrl) abortCtrl.abort();
      });
      activeHttpRequests.current = [];
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};

export default useHttpClient;
