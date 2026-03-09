export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      point_sites: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_sources: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales_channels: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      carriers: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      point_activities: {
        Row: {
          id: string;
          activity_date: string;
          point_site_id: string;
          title: string;
          reward_amount: number;
          is_completed: boolean;
          completed_date: string | null;
          condition_note: string | null;
          inquiry_url: string | null;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          activity_date: string;
          point_site_id: string;
          title: string;
          reward_amount?: number;
          is_completed?: boolean;
          completed_date?: string | null;
          condition_note?: string | null;
          inquiry_url?: string | null;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          activity_date?: string;
          point_site_id?: string;
          title?: string;
          reward_amount?: number;
          is_completed?: boolean;
          completed_date?: string | null;
          condition_note?: string | null;
          inquiry_url?: string | null;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      resale_transactions: {
        Row: {
          id: string;
          purchase_date: string;
          item_name: string;
          purchase_source_id: string;
          purchase_source_note: string | null;
          sales_channel_id: string;
          sales_channel_note: string | null;
          purchase_amount: number;
          sale_amount: number | null;
          sale_date: string | null;
          discount_amount: number;
          shipping_fee: number;
          fee_amount: number;
          other_expense: number;
          is_completed: boolean;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          purchase_date: string;
          item_name: string;
          purchase_source_id: string;
          purchase_source_note?: string | null;
          sales_channel_id: string;
          sales_channel_note?: string | null;
          purchase_amount?: number;
          sale_amount?: number | null;
          sale_date?: string | null;
          discount_amount?: number;
          shipping_fee?: number;
          fee_amount?: number;
          other_expense?: number;
          is_completed?: boolean;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          purchase_date?: string;
          item_name?: string;
          purchase_source_id?: string;
          purchase_source_note?: string | null;
          sales_channel_id?: string;
          sales_channel_note?: string | null;
          purchase_amount?: number;
          sale_amount?: number | null;
          sale_date?: string | null;
          discount_amount?: number;
          shipping_fee?: number;
          fee_amount?: number;
          other_expense?: number;
          is_completed?: boolean;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mobile_lines: {
        Row: {
          id: string;
          contract_date: string;
          line_type: "campaign" | "normal";
          carrier_id: string;
          phone_number: string;
          registered_email: string | null;
          management_id: string | null;
          title: string;
          reward_amount: number | null;
          initial_cost: number;
          cancellation_cost: number;
          cancellation_date: string | null;
          completed_date: string | null;
          contract_status: "active" | "cancelled";
          device_name: string | null;
          return_due_date: string | null;
          returned_date: string | null;
          is_completed: boolean;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contract_date: string;
          line_type: "campaign" | "normal";
          carrier_id: string;
          phone_number: string;
          registered_email?: string | null;
          management_id?: string | null;
          title: string;
          reward_amount?: number | null;
          initial_cost?: number;
          cancellation_cost?: number;
          cancellation_date?: string | null;
          completed_date?: string | null;
          contract_status?: "active" | "cancelled";
          device_name?: string | null;
          return_due_date?: string | null;
          returned_date?: string | null;
          is_completed?: boolean;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contract_date?: string;
          line_type?: "campaign" | "normal";
          carrier_id?: string;
          phone_number?: string;
          registered_email?: string | null;
          management_id?: string | null;
          title?: string;
          reward_amount?: number | null;
          initial_cost?: number;
          cancellation_cost?: number;
          cancellation_date?: string | null;
          completed_date?: string | null;
          contract_status?: "active" | "cancelled";
          device_name?: string | null;
          return_due_date?: string | null;
          returned_date?: string | null;
          is_completed?: boolean;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mobile_line_monthly_costs: {
        Row: {
          id: string;
          mobile_line_id: string;
          start_date: string;
          end_date: string | null;
          monthly_fee: number;
          memo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mobile_line_id: string;
          start_date: string;
          end_date?: string | null;
          monthly_fee?: number;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mobile_line_id?: string;
          start_date?: string;
          end_date?: string | null;
          monthly_fee?: number;
          memo?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      resale_transactions_with_profit: {
        Row: {
          id: string;
          purchase_date: string;
          item_name: string;
          purchase_source_id: string;
          purchase_source_note: string | null;
          sales_channel_id: string;
          sales_channel_note: string | null;
          purchase_amount: number;
          sale_amount: number | null;
          sale_date: string | null;
          discount_amount: number;
          shipping_fee: number;
          fee_amount: number;
          other_expense: number;
          is_completed: boolean;
          memo: string | null;
          created_at: string;
          updated_at: string;
          profit: number;
          aggregation_date: string;
        };
      };
      mobile_lines_with_costs: {
        Row: {
          id: string;
          contract_date: string;
          line_type: "campaign" | "normal";
          carrier_id: string;
          phone_number: string;
          registered_email: string | null;
          management_id: string | null;
          title: string;
          reward_amount: number | null;
          initial_cost: number;
          cancellation_cost: number;
          cancellation_date: string | null;
          completed_date: string | null;
          contract_status: "active" | "cancelled";
          device_name: string | null;
          return_due_date: string | null;
          returned_date: string | null;
          is_completed: boolean;
          memo: string | null;
          created_at: string;
          updated_at: string;
          monthly_cost_total: number;
          total_cost: number;
          profit: number;
          aggregation_date: string;
        };
      };
    };
  };
};

export type LookupTableName = "point_sites" | "purchase_sources" | "sales_channels" | "carriers";
export type LookupRow<T extends LookupTableName> = Database["public"]["Tables"][T]["Row"];