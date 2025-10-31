import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { walletAddress, stravaAccessToken, stravaRefreshToken, expiresAt } = await req.json()

    console.log('Received data:', { walletAddress, stravaAccessToken, stravaRefreshToken, expiresAt })

    if (!walletAddress || !stravaAccessToken || !stravaRefreshToken || !expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          status: 400,
        }
      )
    }

    // Convert Unix timestamp (seconds) to ISO 8601 date string
    const expiresAtDate = new Date(expiresAt * 1000).toISOString()
    console.log('Converted timestamp:', expiresAtDate)

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Upsert the token data
    const { error } = await supabaseClient
      .from('access_tokens')
      .upsert({
        wallet_address: walletAddress.toLowerCase(),
        access_token: stravaAccessToken,
        refresh_token: stravaRefreshToken,
        expires_at: expiresAtDate,
      }, {
        onConflict: 'wallet_address'
      })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ message: 'Successfully saved token' }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in save-strava-token:', error)
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'No stack trace available'
      }),
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
