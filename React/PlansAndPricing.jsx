import React, { Fragment, useEffect, useState } from "react";
import { Grid, Container, ButtonGroup, Card, Button } from "@material-ui/core";
import {
  PayPalButtons,
  usePayPalScriptReducer,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js";
import { REACT_APP_PAYPAL_CLIENT_ID } from "../../services/serviceHelpers";
import PropTypes from "prop-types";
import * as paymentService from "../../services/paymentService";
import toastr from "toastr";

import { useHistory } from "react-router-dom";

import debug from "sabio-debug";
const _logger = debug.extend("PaymentAndPricing");

const ButtonWrapper = ({
  type,
  // eslint-disable-next-line camelcase
  plan_id,
  cost,
  subscriptionTypeId,
  subscriptionName,
}) => {
  const [{ options }, dispatch] = usePayPalScriptReducer();
  useEffect(() => {
    dispatch({
      type: "resetOptions",
      value: {
        ...options,
        intent: "subscription",
      },
    });
  }, [type]);

  const history = useHistory();

  function onAddPaymentSuccess(response) {
    _logger("onAddPaymentSuccess", response);
    toastr.success("You have successfully subscribed");
    history.push("/sabio");
  }
  function onAddPaymentError(err) {
    _logger("onAddPaymentError", err);
    toastr.error("Failed to subscribe");
  }

  return (
    <PayPalButtons
      createSubscription={(data, actions) => {
        return actions.subscription
          .create({
            // eslint-disable-next-line camelcase
            plan_id: plan_id,
          })
          .then((orderId) => {
            _logger("orderId", orderId);
            return orderId;
          });
      }}
      onApprove={(data, actions) => {
        _logger("actions", actions);
        _logger("data", data);

        const subData = {};
        subData.subscriptionId = data.subscriptionID;
        subData.orderId = data.orderID;
        subData.name = subscriptionName;
        subData.cost = cost;
        subData.isRenewed = false;
        subData.subscriptionTypeId = subscriptionTypeId;
        subData.paymentTypeId = 1;

        paymentService
          .addPayment(subData)
          .then(onAddPaymentSuccess)
          .catch(onAddPaymentError);
      }}
      style={{
        label: "subscribe",
        color: "white",
        shape: "pill",
      }}
    />
  );
};

export default function PlansAndPricing() {
  const [cards, setCards] = useState([]);

  const onGetSubscriptionTypeSuccess = (response) => {
    _logger("<<< onGetSubscriptionTypeSuccess >>>", response);
    setCards(() => [[response.items.map(mapSubscriptionType)]]);
  };

  const onGetSubscriptionTypeError = (err) => {
    _logger("onGetSubscriptionTypeError", err);
    toastr.error("Unable to retrieve subscription plans");
  };

  useEffect(() => {
    paymentService
      .getSubscriptionType()
      .then(onGetSubscriptionTypeSuccess)
      .catch(onGetSubscriptionTypeError);
  }, []);

  function mapSubscriptionType(oneSubscriptionType) {
    return (
      <Grid key={oneSubscriptionType.id} item xs={12} md={6} lg={4}>
        <Card className="card-box shadow-xxl mb-4">
          <div className="card-body px-5 pb-1 pt-4 text-center">
            <h3 className="display-3 my-2 font-weight-bold text-black">
              {oneSubscriptionType.name}
            </h3>
            <span className="display-2 font-weight-bold">
              <small className="font-size-lg">$</small>
              {oneSubscriptionType.cost}
            </span>
            <p className="text-black-50 mb-0">monthly fee, for a single user</p>
            <p className="text-black p-2">{oneSubscriptionType.description}</p>
            <div className="px-2">
              <ButtonWrapper
                type="subscription"
                plan_id={oneSubscriptionType.planId}
                cost={oneSubscriptionType.cost}
                subscriptionTypeId={oneSubscriptionType.id}
                subscriptionName={oneSubscriptionType.name}
              />
            </div>
            <ul className="list-unstyled text-left mb-3 font-weight-bold font-size-sm">
              <li className="px-4 py-2">
                <span className="badge-circle-inner mr-2 badge badge-success">
                  Success
                </span>
                Daily Blogs
              </li>
              <li className="px-4 py-2">
                <span className="badge-circle-inner mr-2 badge badge-success">
                  Success
                </span>
                Guided Meditation
              </li>
              <li className="px-4 py-2">
                <span className="badge-circle-inner mr-2 badge badge-success">
                  Success
                </span>
                Personalized Articles
              </li>
              {oneSubscriptionType.name === "Standard" ? (
                <li className="px-4 py-2 text-black-50">
                  <span className="badge-circle-inner mr-2 badge badge-danger">
                    Danger
                  </span>
                  Premium support
                </li>
              ) : (
                <li className="px-4 py-2">
                  <span className="badge-circle-inner mr-2 badge badge-success">
                    Success
                  </span>
                  Premium support
                </li>
              )}
            </ul>
          </div>
        </Card>
      </Grid>
    );
  }

  return (
    <Fragment>
      <PayPalScriptProvider
        options={{
          "client-id": REACT_APP_PAYPAL_CLIENT_ID,
          components: "buttons",
          intent: "subscription",
          vault: true,
        }}
      >
        <div className="bg-light py-3 py-xl-5">
          <Container className="py-3 py-xl-5">
            <div className="d-block d-xl-flex mb-4 justify-content-between">
              <div>
                <h1 className="display-3 text-dark mb-2 font-weight-bold">
                  Plans &#38; pricing
                </h1>
                <p className="font-size-lg text-black">
                  Choose a plan that&#39;s right for you.
                </p>
              </div>
              <div className="d-flex align-items-center">
                <ButtonGroup color="secondary" variant="outlined">
                  <Button>Monthly</Button>
                  <Button>Yearly</Button>
                </ButtonGroup>
              </div>
            </div>
            <Grid container spacing={4} className="d-flex align-items-center">
              <Grid key={`default ${1}`} item xs={12} md={6} lg={4}>
                <Card className="card-box shadow-xxl mb-4">
                  <div className="card-body px-5 pb-1 pt-4 text-center">
                    <h3 className="display-3 my-2 font-weight-bold text-black">
                      Basic
                    </h3>
                    <span className="display-2 font-weight-bold">
                      <small className="font-size-lg">$</small>0
                    </span>
                    <p className="text-black-50 mb-0">
                      monthly fee, for a single user
                    </p>
                    <p className="text-black py-2">
                      Description for basic plan
                    </p>
                    <div className="py-5">
                      <p className="text-black-50 mb-0">
                        No Subscription needed
                      </p>
                    </div>
                    <ul className="list-unstyled text-left mb-3 font-weight-bold font-size-sm">
                      <li className="px-4 py-2">
                        <span className="badge-circle-inner mr-2 badge badge-success">
                          Success
                        </span>
                        Daily Blogs
                      </li>
                      <li className="px-4 py-2 text-black-50">
                        <span className="badge-circle-inner mr-2 badge badge-danger">
                          Danger
                        </span>
                        Guided Meditation
                      </li>
                      <li className="px-4 py-2 text-black-50">
                        <span className="badge-circle-inner mr-2 badge badge-danger">
                          Danger
                        </span>
                        Personalized Articles
                      </li>
                      <li className="px-4 py-2 text-black-50">
                        <span className="badge-circle-inner mr-2 badge badge-danger">
                          Danger
                        </span>
                        Premium support
                      </li>
                    </ul>
                  </div>
                </Card>
              </Grid>
              {cards}
            </Grid>
          </Container>
        </div>
      </PayPalScriptProvider>
    </Fragment>
  );
}

ButtonWrapper.propTypes = {
  type: PropTypes.string.isRequired,
  // eslint-disable-next-line camelcase
  plan_id: PropTypes.string.isRequired,
  cost: PropTypes.number.isRequired,
  subscriptionTypeId: PropTypes.number.isRequired,
  subscriptionName: PropTypes.string.isRequired,
};
