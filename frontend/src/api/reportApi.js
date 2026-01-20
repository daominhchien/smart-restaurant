import axiosClient from "./axiosClient";

const reportApi = {
  // --- Revenue Summary Reports ---

  // Params: { year: number, fromMonth: number, toMonth: number }
  // Response:
  //   {
  //   "code": "1000",
  //   "result": [
  //     {
  //       "label": "Tuần 1 - Tháng 1/2026",
  //       "revenue": 433000
  //     },
  //     {
  //       "label": "Tuần 2 - Tháng 1/2026",
  //       "revenue": 278250
  //     },
  //     {
  //       "label": "Tuần 4 - Tháng 1/2026",
  //       "revenue": 306600
  //     }
  //   ]
  // }
  revenueWeekly: (params) =>
    axiosClient.get(`/reports/revenue/weekly`, { params }),

  // Params: { fromYear: number, toYear: number }
  // Resonse:
  //   {
  //   "code": "string",
  //   "message": "string",
  //   "result": [
  //     {
  //       "label": "string",
  //       "revenue": 0.1
  //     }
  //   ]
  // }
  revenueMonthly: (params) =>
    axiosClient.get(`/reports/revenue/monthly`, { params }),

  // Params: { from: string (YYYY-MM-DD), to: string (YYYY-MM-DD) }
  //   {
  //   "code": "1000",
  //   "result": [
  //     {
  //       "label": "2026-01-01",
  //       "revenue": 220000
  //     },
  //     {
  //       "label": "2026-01-02",
  //       "revenue": 110000
  //     },
  //     {
  //       "label": "2026-01-03",
  //       "revenue": 103000
  //     },
  //     {
  //       "label": "2026-01-05",
  //       "revenue": 231000
  //     },
  //     {
  //       "label": "2026-01-06",
  //       "revenue": 47250
  //     },
  //     {
  //       "label": "2026-01-20",
  //       "revenue": 306600
  //     }
  //   ]
  // }
  revenueDaily: (params) =>
    axiosClient.get(`/reports/revenue/daily`, { params }),

  // --- Revenue Itemized Reports ---

  // Params: { year: number, fromMonth: number, toMonth: number }
  //   {
  //   "code": "string",
  //   "message": "string",
  //   "result": [
  //     {
  //       "label": "string",
  //       "itemName": "string",
  //       "revenue": 0.1
  //     }
  //   ]
  // }
  revenueWeeklyItems: (params) =>
    axiosClient.get(`/reports/revenue/weekly/items`, { params }),

  // Params: { fromYear: number, toYear: number }
  //   {
  //   "code": "1000",
  //   "result": [
  //     {
  //       "label": "Tháng 1/2026",
  //       "itemName": "Pizza",
  //       "revenue": 210000
  //     }
  //   ]
  // }
  revenueMonthlyItems: (params) =>
    axiosClient.get(`/reports/revenue/monthly/items`, { params }),

  // Params: { from: string (YYYY-MM-DD), to: string (YYYY-MM-DD) }
  //   {
  //   "code": "1000",
  //   "result": [
  //     {
  //       "label": "2026-01-01",
  //       "itemName": "Pho",
  //       "revenue": 140000
  //     },
  //     {
  //       "label": "2026-01-02",
  //       "itemName": "Pizza",
  //       "revenue": 50000
  //     }
  //   ]
  // }
  revenueDailyItems: (params) =>
    axiosClient.get(`/reports/revenue/daily/items`, { params }),
};

export default reportApi;
