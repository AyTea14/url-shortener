export interface HealthStats {
    status: "ok" | "down";
    info: { database: { status: "up" | "down" } };
    error: unknown | null;
}
