// Supabase Edge Function to proxy NPPES API requests
// This avoids CORS issues by making requests from the server side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const NPPES_API_BASE = "https://npiregistry.cms.hhs.gov/api/";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Max-Age": "86400",
      }
    });
  }

  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { action, ...params } = body;

    let url = `${NPPES_API_BASE}?version=2.1`;

    if (action === "searchByNumber") {
      const { number } = params;
      if (!number) {
        return new Response(
          JSON.stringify({ error: "NPI number is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const cleanNPI = number.replace(/\D/g, "");
      if (cleanNPI.length !== 10) {
        return new Response(
          JSON.stringify({ error: "NPI must be exactly 10 digits" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      url += `&number=${cleanNPI}`;
    } else if (action === "searchByName") {
      const { firstName, lastName, organizationName, state, limit = 10 } = params;
      
      if (organizationName) {
        url += `&organization_name=${encodeURIComponent(organizationName)}`;
      } else if (firstName && lastName) {
        url += `&first_name=${encodeURIComponent(firstName)}`;
        url += `&last_name=${encodeURIComponent(lastName)}`;
      } else if (lastName) {
        url += `&last_name=${encodeURIComponent(lastName)}`;
      }
      
      if (state) {
        url += `&state=${encodeURIComponent(state)}`;
      }
      
      url += `&limit=${limit}`;
    } else if (action === "searchTaxonomy") {
      const { description, limit = 20 } = params;
      if (!description) {
        return new Response(
          JSON.stringify({ error: "Taxonomy description is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      url += `&taxonomy_description=${encodeURIComponent(description)}`;
      url += `&limit=${limit}`;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use 'searchByNumber', 'searchByName', or 'searchTaxonomy'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Make request to NPPES API
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`NPPES API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in NPI lookup function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

