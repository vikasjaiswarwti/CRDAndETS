import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Result, Spin } from "antd";
import Header from "../components/Header";
import TripMap from "../components/TripMap";
import { useGetSharedCabQuery } from "../services/sharedCabApi";
import { useSignalRTracking } from "../../route-tracking/hooks/useSignalRTracking";
import { ROUTES } from "../../../shared/constants/app.constants";

const REDIRECT_AFTER_SECONDS = 60;

// Shown instead of the map once the trip is over; sends the user to login after a minute
const TripCompleted: React.FC = () => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_AFTER_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    const timeout = setTimeout(() => {
      navigate(ROUTES.LOGIN, { replace: true });
    }, REDIRECT_AFTER_SECONDS * 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <Result
      status="success"
      title="Trip completed"
      subTitle={`Thank you for riding with us. Redirecting to login in ${secondsLeft}s.`}
      extra={
        <Button type="primary" onClick={() => navigate(ROUTES.LOGIN, { replace: true })}>
          Go to login
        </Button>
      }
    />
  );
};

const SharedCab: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dsId = searchParams.get("dsId") ?? "";
  const accessToken = searchParams.get("access_token") ?? "";
  const hasParams = Boolean(dsId && accessToken);

  const { data, isLoading, isError } = useGetSharedCabQuery(
    { dsId, accessToken },
    { skip: !hasParams },
  );
  const { currentLocation } = useSignalRTracking(
    Number(dsId),
    accessToken,
    data?.trackingMode ?? "",
    data?.isCompleted == false,
  );

  const renderBody = () => {
    if (!hasParams) {
      return (
        <Result
          status="warning"
          title="Invalid link"
          subTitle="This shared cab link is missing required details."
        />
      );
    }
    if (isLoading) {
      return (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spin size="large" />
        </div>
      );
    }
    if (isError || !data) {
      return (
        <Result
          status="error"
          title="Unable to load trip"
          subTitle="The link may have expired. Please ask for a new one."
        />
      );
    }
    if (!data.isTripFound) {
      return (
        <Result
          status="info"
          title="Trip not found"
          subTitle="This trip is no longer available."
        />
      );
    }
    if (data.isCompleted) {
      return <TripCompleted />;
    }
    return <TripMap trip={data} currentLocation={currentLocation} />;
  };
  return (
    <div style={{ height: "100vh" }}>
      <Header />
      {renderBody()}
    </div>
  );
};

export default SharedCab;
