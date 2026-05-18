import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const apiClient = {
  get: async <T>(
    url: string,
    baseUrl: string,
    customHeaders: Record<string, string> = {}
  ): Promise<T> => {
    const config: AxiosRequestConfig = {
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
        ...customHeaders,
      },
    };

    try {
      const response: AxiosResponse<T> = await axios.get(url, config);
      return response.data;
    } catch (error) {
      console.error(`GET API Call Failed: ${url}`, error);
      throw error;
    }
  },

  post: async <T, D = any>(
    url: string,
    baseUrl: string,
    data: D,
    customHeaders: Record<string, string> = {}
  ): Promise<T> => {
    const config: AxiosRequestConfig = {
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
        ...customHeaders, 
      },
    };

    try {
      // Axios POST syntax: axios.post(url, data, config)
      const response: AxiosResponse<T> = await axios.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`POST API Call Failed: ${url}`, error);
      throw error;
    }
  },
};

export default apiClient;