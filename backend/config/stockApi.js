import axios from "axios";

const BASE_URL = "https://finnhub.io/api/v1";

export const fetchLiveQuote = async (
  symbol
) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/quote`,
      {
        params: {
          symbol,
          token: process.env.STOCK_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching live quote:",
      error.message
    );

    return null;
  }
};


export const fetchCompanyProfile =
  async (symbol) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/stock/profile2`,
        {
          params: {
            symbol,
            token:
              process.env.STOCK_API_KEY,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching company profile:",
        error.message
      );

      return null;
    }
  };