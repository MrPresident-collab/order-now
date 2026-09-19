# Pedejá Customer App — Integração Supabase

App cliente Pedejá. Supabase (`svutiyvbxcniikensadx`) é a única fonte de verdade.

## Backend apurado (sondagem com publishable key)

- Auth: **email + palavra-passe** e **OTP por email** funcionam. **OTP por SMS está desactivado** (`Unsupported phone provider`) e Google/Apple estão desactivados. Email-OTP para signup novo pode devolver `Signups not allowed for otp`.
- Tabelas confirmadas no schema cache: `profiles`, `customer_profiles`, `businesses`, `products`, `orders`, `order_items`, `payments`, `payment_events`, `delivery_jobs`, `enviar_shipments`, `customer_addresses`, `addresses`, `rider_profiles`, `support_cases`, `support_incidents`, `ledger_journals`.
- Tabelas **não encontradas**: `notifications`, `payment_methods`, `promotions`, `wallets`, `promo_codes`, `referrals` (por isso Carteira/Promoções não mostram dados inventados).
- RPCs existentes mas **sem GRANT para anon** (exigem sessão): `create_customer_order`, `create_customer_address`, `set_default_customer_address`, `remove_customer_address`, `get_customer_orders_history`, `get_customer_order_detail`, `get_customer_enviar_tracking`.
- RPCs **não encontrados** (PGRST202): qualquer variante de `create_customer_enviar_shipment`, `get_customer_profile`, `update_customer_profile`, `list_notifications`, etc.
- Leitura anónima de `businesses`/`products` devolve `42501 permission denied` — o catálogo exige sessão válida e/ou GRANT SELECT adequado no backend.

## Bloqueadores backend (sem mexer em lógica de negócio)

1. `GRANT SELECT ON public.businesses, public.products TO authenticated` (ou política RLS equivalente) para catálogo visível após login.
2. `GRANT EXECUTE` nas 7 RPCs acima ao role `authenticated` (hoje dão `permission denied for function` mesmo com sessão).
3. Criar/expor `create_customer_enviar_shipment(...)` ou documentar o nome real da RPC de Enviar.
4. Confirmar tabelas de perfil suportadas (`customer_profiles` vs `profiles`) e permissões de escrita para Editar Perfil.
5. Sem tabelas de wallet/promoções/notificações expostas — essas telas ficam honestamente vazias.

## Local setup

1. Copia `.env.example` para `.env.local` e preenche `VITE_SUPABASE_PUBLISHABLE_KEY`.
2. `npm install`
3. `npm run dev` (executar a partir de `app/`), `npm run typecheck`, `npm run lint`, `npm run build`.

## Notas de integração

- Sem dados mock em produção: `src/data.ts` só tem `formatKz`.
- Checkout não inventa taxas: mostra subtotal e delega entrega/taxas ao `create_customer_order` (idempotente).
- Tracking/OrderDetail usam `get_customer_order_detail` + Realtime (`orders`, `delivery_jobs`). Sem `setInterval`.
- Enviar: acompanhamento real via `get_customer_enviar_tracking` + Realtime; criação aguarda RPC backend.

