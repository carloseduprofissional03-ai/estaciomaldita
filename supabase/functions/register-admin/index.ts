// Backend function: register-admin
// Cria a conta de moderador (e-mail/senha + perfil role=admin)
// somente para quem possui o código de convite (secreto ADMIN_INVITE_CODE).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { full_name, email, password, invite_code } = await req.json();

    const invite = Deno.env.get("ADMIN_INVITE_CODE") ?? "";
    if (!invite_code || invite_code !== invite) {
      return new Response(
        JSON.stringify({ error: "Código de convite inválido." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Informe um e-mail válido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!full_name || full_name.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Informe o nome completo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!password || password.length < 8) {
      return new Response(
        JSON.stringify({ error: "A senha precisa ter ao menos 8 caracteres." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceKey) {
      throw new Error("Configuração de serviço ausente no servidor.");
    }
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name.trim() },
    });
    if (createError) {
      const message = createError.status === 422 || createError.code === "user_already_exists"
        ? "Este e-mail já possui uma conta. Faça login ou use outro e-mail."
        : createError.message;
      return new Response(
        JSON.stringify({ error: message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userId = created.user?.id;
    if (!userId) {
      throw new Error("Não foi possível criar a conta.");
    }

    const { error: profileError } = await admin
      .from("profiles")
      .upsert(
        { id: userId, full_name: full_name.trim(), role: "admin" },
        { onConflict: "id" },
      );
    if (profileError) {
      console.error("register-admin: erro ao gravar perfil", profileError);
      return new Response(
        JSON.stringify({ error: "Erro ao preparar a conta. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("register-admin: erro inesperado", err);
    return new Response(
      JSON.stringify({ error: "Erro no servidor. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
