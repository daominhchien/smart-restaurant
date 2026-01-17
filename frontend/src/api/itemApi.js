import axiosClient from "./axiosClient";

const itemApi = {
  getAllItems: (
    page = 0,
    size = 100,
    categoryId = null,
    status = null,
    sortBy = "CREATED_DATE",
    direction = "DESC"
  ) => {
    return axiosClient.get("/menu/items", {
      params: {
        page,
        size,
        categoryId,
        status,
        sortBy,
        direction,
      },
    });
  },

  getItemsByIdsFromAll: async (itemIds = []) => {
    if (!itemIds.length) return [];

    const response = await itemApi.getAllItems(0, 1000, null, null);

    const items = response.result || response.data?.result || [];

    // filter theo id
    return items.filter((item) => itemIds.includes(item.itemId));
  },

  addNewItem: (data) => axiosClient.post("/menu/items", data),

  update: (id, data) => axiosClient.put(`/menu/items/${id}`, data),
};

export default itemApi;
