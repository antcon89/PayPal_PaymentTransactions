import axios from "axios";
import {
  API_HOST_PREFIX,
  onGlobalError,
  onGlobalSuccess,
} from "./serviceHelpers";

const endpoint = `${API_HOST_PREFIX}/api`;

var addPayment = (payload) => {
  const config = {
    method: "POST",
    url: endpoint + `/payments`,
    data: payload,
    crossdomain: true,
    headers: { "content-type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

var getSubscriptionType = () => {
  const config = {
    method: "GET",
    url: endpoint + `/subscriptions`,
    crossdomain: true,
    headers: { "content-type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

export { addPayment, getSubscriptionType };
