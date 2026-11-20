import React, { useMemo, useState } from "react";
import { Select } from "antd";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import {
  useGetSpeedCitiesQuery,
  useGetSpeedProfileQuery,
} from "../services/speedServiceGridApi";
import SpeedHeatmap from "../components/SpeedHeatmap";
import SpeedHeatmapSkeleton from "../components/SpeedHeatmapSkeleton";
import { T } from "../../../styles/tokens";

const SpeedServiceGridPage: React.FC = () => {
  const { data: cities = [], isLoading: citiesLoading } =
    useGetSpeedCitiesQuery();
  const [selectedCityId, setCityId] = useState<number | undefined>();
  // Default to the first city until the user picks one.
  const cityId = selectedCityId ?? cities[0]?.cityID;

  const {
    data = [],
    isFetching,
    error,
    refetch,
  } = useGetSpeedProfileQuery(cityId as number, {
    skip: cityId === undefined,
  });

  const cityOptions = useMemo(
    () => cities.map((c) => ({ label: c.cityName, value: c.cityID })),
    [cities],
  );

  return (
    <PageContainer
      title="Speed Service Grid"
      subtitle="Average travel speed by hour and day of week"
      headerActions={
        <Select
          showSearch
          optionFilterProp="label"
          placeholder="Select City"
          loading={citiesLoading}
          style={{ minWidth: 200, background: T.formcss.inputBg }}
          options={cityOptions}
          value={cityId}
          onChange={setCityId}
        />
      }
    >
      {citiesLoading || isFetching ? (
        <SpeedHeatmapSkeleton />
      ) : (
        <ApiStateWrapper
          isLoading={false}
          error={error}
          isEmpty={cityId !== undefined && !data.length}
          onRetry={refetch}
          emptyMessage="No speed data available for this city."
        >
          <SpeedHeatmap rows={data} />
        </ApiStateWrapper>
      )}
    </PageContainer>
  );
};

export default SpeedServiceGridPage;
