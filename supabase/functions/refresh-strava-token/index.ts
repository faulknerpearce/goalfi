import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const STRAVA_CLIENT_ID = Deno.env.get('STRAVA_CLIENT_ID')!
const STRAVA_CLIENT_SECRET = Deno.env.get('STRAVA_CLIENT_SECRET')!

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const url = new URL(req.url)
    const walletAddress = url.searchParams.get('walletAddress')

    if (!walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Wallet address is required' }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          status: 400,
        }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the token from database
    const { data: tokenData, error: fetchError } = await supabaseClient
      .from('access_tokens')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()

    if (fetchError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Token not found' }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          status: 404,
        }
      )
    }

    // Check if token is expired (expires_at is in seconds, convert to milliseconds)
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = tokenData.expires_at

    // If token is still valid (with 5 min buffer), return it
    if (expiresAt > now + 300) {
      return new Response(
        JSON.stringify({
          userId: tokenData.wallet_address, // Using wallet_address since strava_user_id doesn't exist
          accessToken: tokenData.access_token,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          status: 200,
        }
      )
    }

    // Token is expired or about to expire, refresh it
    const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        refresh_token: tokenData.refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    const refreshData = await refreshResponse.json()

    if (!refreshResponse.ok) {
      throw new Error(refreshData.message || 'Failed to refresh token')
    }

    // Update the token in database
    const { error: updateError } = await supabaseClient
      .from('access_tokens')
      .update({
        access_token: refreshData.access_token,
        refresh_token: refreshData.refresh_token,
        expires_at: refreshData.expires_at,
      })
      .eq('wallet_address', walletAddress.toLowerCase())

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({
        userId: tokenData.wallet_address, // Using wallet_address since strava_user_id doesn't exist
        accessToken: refreshData.access_token,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 200,
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 500,
      }
    )
  }
})
