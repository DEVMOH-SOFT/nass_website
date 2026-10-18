import axios from "axios";
import { config } from "../config.js";

class KorapayService {
  async initializeTransaction({ email, name, amount, reference, metadata, redirectUrl }) {
    const response = await axios.post(
      `${config.korapay.baseUrl}/charges/initialize`,
      {
        amount,
        currency: config.voting.currency,
        reference,
        merchant_bears_cost: false,
        customer: {
          email,
          name,
        },
        redirect_url: redirectUrl || `${config.frontendUrl}/voting/leaderboard?reference=${reference}`,
        notification_url: `${config.webhookBaseUrl}/api/voting/webhooks/korapay`,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${config.korapay.secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  }

  async verifyTransaction(reference) {
    const response = await axios.get(`${config.korapay.baseUrl}/charges/${reference}`, {
      headers: {
        Authorization: `Bearer ${config.korapay.secretKey}`,
      },
    });

    return response.data;
  }
}

export default new KorapayService();
