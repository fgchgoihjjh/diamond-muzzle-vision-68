
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversation_id } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client for fetching diamond data
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch recent diamond inventory data
    const { data: diamonds, error: diamondsError } = await supabase
      .from('inventory')
      .select('*')
      .limit(50);

    if (diamondsError) {
      console.error('Error fetching diamonds:', diamondsError);
    }

    // Create context about the diamond inventory
    const inventoryContext = diamonds ? 
      `Current diamond inventory includes ${diamonds.length} stones with shapes: ${
        [...new Set(diamonds.map(d => d.shape))].join(', ')
      }. Price range: $${Math.min(...diamonds.map(d => d.price_per_carat || 0))} - $${Math.max(...diamonds.map(d => d.price_per_carat || 0))} per carat.` 
      : 'Diamond inventory data is currently unavailable.';

    const systemPrompt = `You are a professional diamond expert and sales assistant for a high-end diamond jewelry business. You have access to real-time diamond inventory data.

Current Inventory Context: ${inventoryContext}

Your responsibilities:
1. Help customers find the perfect diamond based on their needs and budget
2. Provide expert advice on diamond quality (4Cs: Cut, Color, Clarity, Carat)
3. Explain diamond characteristics and value propositions
4. Suggest diamond pairings for jewelry pieces
5. Answer pricing questions and provide value assessments
6. Help with diamond certification and authenticity questions

Guidelines:
- Be professional, knowledgeable, and helpful
- Use your expertise to educate customers about diamonds
- Reference the current inventory when relevant
- Provide specific recommendations when possible
- If asked about specific stones, mention availability and pricing
- Always prioritize customer satisfaction and education

Remember: You're representing a premium diamond business, so maintain high standards of service and expertise.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      tokens_used: tokensUsed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in diamond-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I apologize, but I'm experiencing technical difficulties. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
