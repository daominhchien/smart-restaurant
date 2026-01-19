import axiosClient from "./axiosClient";

const customerApi = {
  createProfile: (data) => axiosClient.post("/customer", data),
};

export default customerApi;
