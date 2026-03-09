import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Database, LookupRow, LookupTableName } from "@/lib/database.types";

export type LookupOption = LookupRow<LookupTableName>;
export type PointSiteOption = Database["public"]["Tables"]["point_sites"]["Row"];
export type PurchaseSourceOption = Database["public"]["Tables"]["purchase_sources"]["Row"];
export type SalesChannelOption = Database["public"]["Tables"]["sales_channels"]["Row"];
export type CarrierOption = Database["public"]["Tables"]["carriers"]["Row"];
export type PointActivityRow = Database["public"]["Tables"]["point_activities"]["Row"] & {
  point_site?: Pick<PointSiteOption, "id" | "name" | "is_active"> | null;
};
export type ResaleTransactionRow = Database["public"]["Tables"]["resale_transactions"]["Row"] & {
  purchase_source?: Pick<PurchaseSourceOption, "id" | "name" | "is_active"> | null;
  sales_channel?: Pick<SalesChannelOption, "id" | "name" | "is_active"> | null;
};
export type MobileLineMonthlyCostRow = Database["public"]["Tables"]["mobile_line_monthly_costs"]["Row"];
export type MobileLineRow = Database["public"]["Tables"]["mobile_lines"]["Row"] & {
  carrier?: Pick<CarrierOption, "id" | "name" | "is_active"> | null;
  monthly_costs?: MobileLineMonthlyCostRow[] | null;
};

function getClientOrFallback() {
  return createSupabaseServerClient();
}

async function getLookupTable<T extends LookupTableName>(table: T) {
  const client = getClientOrFallback();

  if (!client) {
    return [] as Array<LookupRow<T>>;
  }

  const { data, error } = await client.from(table).select("*").order("sort_order").order("name");

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown) as Array<LookupRow<T>>;
}

async function getPointActivities(client: NonNullable<ReturnType<typeof createSupabaseServerClient>>) {
  const { data, error } = await client
    .from("point_activities")
    .select("*, point_site:point_sites(id, name, is_active)")
    .order("activity_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown) as PointActivityRow[];
}

async function getResaleTransactions(client: NonNullable<ReturnType<typeof createSupabaseServerClient>>) {
  const { data, error } = await client
    .from("resale_transactions")
    .select("*, purchase_source:purchase_sources(id, name, is_active), sales_channel:sales_channels(id, name, is_active)")
    .order("purchase_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown) as ResaleTransactionRow[];
}

async function getMobileLines(client: NonNullable<ReturnType<typeof createSupabaseServerClient>>) {
  const { data, error } = await client
    .from("mobile_lines")
    .select("*, carrier:carriers(id, name, is_active), monthly_costs:mobile_line_monthly_costs(*)")
    .order("contract_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown) as MobileLineRow[];
}

export async function getSettingsPageData() {
  const [pointSites, purchaseSources, salesChannels, carriers] = await Promise.all([
    getLookupTable("point_sites"),
    getLookupTable("purchase_sources"),
    getLookupTable("sales_channels"),
    getLookupTable("carriers"),
  ]);

  return {
    isConfigured: isSupabaseConfigured(),
    pointSites,
    purchaseSources,
    salesChannels,
    carriers,
  };
}

export async function getPointActivityPageData() {
  const client = getClientOrFallback();

  if (!client) {
    return {
      isConfigured: false,
      pointSites: [] as PointSiteOption[],
      pointActivities: [] as PointActivityRow[],
    };
  }

  const [pointSites, pointActivities] = await Promise.all([
    getLookupTable("point_sites"),
    getPointActivities(client),
  ]);

  return {
    isConfigured: true,
    pointSites,
    pointActivities,
  };
}

export async function getResalePageData() {
  const client = getClientOrFallback();

  if (!client) {
    return {
      isConfigured: false,
      purchaseSources: [] as PurchaseSourceOption[],
      salesChannels: [] as SalesChannelOption[],
      resaleTransactions: [] as ResaleTransactionRow[],
    };
  }

  const [purchaseSources, salesChannels, resaleTransactions] = await Promise.all([
    getLookupTable("purchase_sources"),
    getLookupTable("sales_channels"),
    getResaleTransactions(client),
  ]);

  return {
    isConfigured: true,
    purchaseSources,
    salesChannels,
    resaleTransactions,
  };
}

export async function getMobileLinePageData() {
  const client = getClientOrFallback();

  if (!client) {
    return {
      isConfigured: false,
      carriers: [] as CarrierOption[],
      mobileLines: [] as MobileLineRow[],
    };
  }

  const [carriers, mobileLines] = await Promise.all([
    getLookupTable("carriers"),
    getMobileLines(client),
  ]);

  return {
    isConfigured: true,
    carriers,
    mobileLines,
  };
}

export async function getDashboardPageData() {
  const client = getClientOrFallback();

  if (!client) {
    return {
      isConfigured: false,
      pointActivities: [] as PointActivityRow[],
      resaleTransactions: [] as ResaleTransactionRow[],
      mobileLines: [] as MobileLineRow[],
    };
  }

  const [pointActivities, resaleTransactions, mobileLines] = await Promise.all([
    getPointActivities(client),
    getResaleTransactions(client),
    getMobileLines(client),
  ]);

  return {
    isConfigured: true,
    pointActivities,
    resaleTransactions,
    mobileLines,
  };
}
