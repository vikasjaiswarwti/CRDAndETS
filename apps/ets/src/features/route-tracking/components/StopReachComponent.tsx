import { useMemo, useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { Stops, TripResponse } from "../types/tracking.types";
import { T } from "../../../styles/tokens";
import { useRouteTrackingMutation } from "../hooks/useRouteTrackingMutation";

interface StopReachComponentProps {
  open: boolean;
  onClose: () => void;
  stops: Stops[];
  leftData: TripResponse;
}

const StopReachComponent = ({
  open,
  onClose,
  stops,
  leftData,
}: StopReachComponentProps) => {
  const { Modal, Select, Button } = useUILibrary();
  const { cabReachedStop, isCabReachedStopLoading, cabReachedStopError } =
    useRouteTrackingMutation({
      onCabReachedStopSuccess: () => onClose(),
    });

  const [selectedStopId, setSelectedStopId] = useState<number | undefined>();

  const stopOptions = useMemo(
    () =>
      stops
        .filter((stop) => !stop.reached)
        .sort((a, b) => a.stopOrder - b.stopOrder)
        .map((stop) => ({
          label: `${stop.stopOrder}. ${stop.stopAddress || "Stop"}`,
          value: stop.stopId,
        })),
    [stops],
  );

  const selectedStop = useMemo(
    () => stops.find((stop) => stop.stopId === selectedStopId),
    [stops, selectedStopId],
  );

  // Any earlier stop (by stopOrder) that hasn't been reached yet means the
  // selected stop would be marked reached out of sequence.
  const skippedStops = useMemo(() => {
    if (!selectedStop) return [];
    return stops
      .filter(
        (stop) => stop.stopOrder < selectedStop.stopOrder && !stop.reached,
      )
      .sort((a, b) => a.stopOrder - b.stopOrder);
  }, [stops, selectedStop]);

  const isSequenceError = skippedStops.length > 0;

  const handleSubmit = async () => {
    if (!selectedStop || isSequenceError) return;

    try {
      await cabReachedStop({
        tripId: leftData.dsId,
        stopId: selectedStop.stopId,
        lat: selectedStop.stopLat,
        lng: selectedStop.stopLng,
      });
    } catch (error) {
      console.error("Stop reach failed", error);
    }
  };

  const fieldErrors = cabReachedStopError?.fieldErrors ?? [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Cab Reached Stop"
      width={480}
      destroyOnClose
      footer={
        <Button
          disabled={!selectedStop || isSequenceError || isCabReachedStopLoading}
          loading={isCabReachedStopLoading}
          onClick={handleSubmit}
          style={{
            background: "#3E9B73",
            color: "#fff",
            border: "1px solid transparent",
          }}
        >
          Submit
        </Button>
      }
      styles={{
        header: { borderBottom: "none" },
        mask: { background: "rgba(60, 80, 70, 0.35)" },
      }}
      style={{ borderRadius: 16 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: 500,
              color: "#374151",
            }}
          >
            Select Stop
          </label>

          <Select
            placeholder="Select stop"
            options={stopOptions}
            value={selectedStopId}
            onChange={(value) => setSelectedStopId(value)}
            showSearch
            allowClear
            style={{ width: "100%", background: T.formcss.inputBg }}
          />
        </div>

        {selectedStop && (
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: "#F3F4F6",
              color: "#374151",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <div>
              <strong>Stop:</strong>{" "}
              {selectedStop.stopAddress || "Unassigned stop"}
            </div>
            <div>
              <strong>Lat:</strong> {selectedStop.stopLat}
            </div>
            <div>
              <strong>Lng:</strong> {selectedStop.stopLng}
            </div>
          </div>
        )}

        {isSequenceError && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "#FFF7E6",
              border: "1px solid #FFD591",
              color: "#AD6800",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
              Sequence is not correct
            </div>
            <div>
              {skippedStops.length === 1
                ? `Stop ${skippedStops[0].stopOrder} (${skippedStops[0].stopAddress || "Stop"}) hasn't been marked reached yet.`
                : `Stops ${skippedStops.map((s) => s.stopOrder).join(", ")} haven't been marked reached yet.`}{" "}
              Mark earlier stops first.
            </div>
          </div>
        )}

        {fieldErrors.length > 0 && (
          <div
            style={{
              marginTop: 4,
              padding: "10px 12px",
              borderRadius: 8,
              background: "#FFF2F0",
              border: "1px solid #FFCCC7",
              color: "#CF1322",
              fontSize: 14,
            }}
          >
            {fieldErrors.map((err) => (
              <div key={err.field}>{err.message}</div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StopReachComponent;
