type VehicleRequestResult = {
  ok: boolean;
  error?: string;
};

type DeleteVehicleParams = {
  vehicleId: string;
  userId?: string | null;
};

type SetActiveVehicleParams = {
  vehicleId: string;
  userId?: string | null;
  active?: boolean;
};

// Sends a delete request for a vehicle and returns a simple status object.
export const deleteVehicleRequest = async ({
  vehicleId,
  userId,
}: DeleteVehicleParams): Promise<VehicleRequestResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
  }

  if (!vehicleId) {
    return { ok: false, error: "Vehicle is missing." };
  }

  const payload: { vehicleId: string; userId?: string } = { vehicleId };
  if (userId && userId.trim()) {
    payload.userId = userId.trim();
  }

  try {
    const response = await fetch(`${baseUrl}/vehicles/delete-vehicle`, {
      method: "DELETE",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        error: responseData.message || "Could not delete car.",
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not delete car.",
    };
  }
};

// Sends a request to mark a vehicle active.
export const setActiveVehicleRequest = async ({
  vehicleId,
  userId,
  active = true,
}: SetActiveVehicleParams): Promise<VehicleRequestResult> => {
  const baseUrl = import.meta.env.VITE_APP_BACKEND_URL;
  if (!baseUrl) {
    return { ok: false, error: "Backend URL is not configured." };
  }

  if (!vehicleId) {
    return { ok: false, error: "Vehicle is missing." };
  }

  const payload: { vehicleId: string; userId?: string; active: boolean } = {
    vehicleId,
    active,
  };
  if (userId && userId.trim()) {
    payload.userId = userId.trim();
  }

  try {
    const response = await fetch(`${baseUrl}/vehicles/set-active-vehicle`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        error: responseData.message || "Could not update active car.",
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "Could not update active car.",
    };
  }
};
