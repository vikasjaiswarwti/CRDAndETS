import { useSelector } from "react-redux";
import ViewDetails from "../components/ViewDetails";
import { selectAuthLoading } from "../../auth/slices/authSlice";
import { useGetGlobalUserQuery } from "../services/profileApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { Skeleton } from "antd";
import { useEffect } from "react";
import { useGetCurrentUserQuery } from "../../auth/services/authApi";

const SectionCardSkeleton = () => {
  return (
    <div
      className="bg-white rounded-2xl mt-5 overflow-hidden"
      style={{
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3 bg-[#eaf6ec] border-b border-[#dceee3]"
        style={{ padding: "10px 15px" }}
      >
        <Skeleton.Avatar
          active
          size={28}
          shape="circle"
          style={{ background: "#cfe8d8" }}
        />
        <Skeleton.Input
          active
          size="small"
          style={{
            width: 140,
            height: 18,
          }}
        />
      </div>

      <div className="p-5" style={{ padding: 20 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { data: user } = useGetCurrentUserQuery();
  const authLoading = useSelector(selectAuthLoading); // 👈 ADD THIS

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError,
    refetch,
  } = useGetGlobalUserQuery(user?.id ?? skipToken);
  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [skipToken, user?.id, authLoading]);
  // Show skeleton while auth is loading
  if (authLoading) {
    return (
      <div style={{ background: "#fff", height: "100%", width: "100%" }}>
        <SectionCardSkeleton />
        <SectionCardSkeleton />
        <SectionCardSkeleton />
      </div>
    );
  }

  // Show skeleton while profile is loading
  if (isProfileLoading) {
    return (
      <div style={{ background: "#fff", height: "100%", width: "100%" }}>
        <SectionCardSkeleton />
        <SectionCardSkeleton />
        <SectionCardSkeleton />
      </div>
    );
  }

  // Handle error
  if (isError) {
    return (
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          color: "#dc2626",
          border: "1px solid #fecaca",
        }}
      >
        Failed to load profile. Please refresh the page or try again later.
      </div>
    );
  }

  // Show profile data
  return (
    <div style={{ background: "#fff" }}>
      {profile && (
        <ViewDetails data={profile} onProfileUpdated={refetch} />
      )}
    </div>
  );
};

export default UserProfile;
