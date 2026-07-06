# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: production-verification.spec.ts >> PROD — Verificación Visual de Producción >> PROD-02 — Admin puede acceder al panel de pedidos y ver NICKNAME del cliente
- Location: tests\production-verification.spec.ts:36:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=RUBEN-NICK').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=RUBEN-NICK').first()

```

```yaml
- button "PJ Admin Panel"
- button "Collapse menu"
- navigation:
  - link "Dashboard":
    - /url: /admin
  - link "Reports":
    - /url: /admin/reports
  - link "Orders":
    - /url: /admin/orders
  - link "Products":
    - /url: /admin/products
  - link "Categories":
    - /url: /admin/categories
  - link "Users":
    - /url: /admin/users
  - link "Clients":
    - /url: /admin/clients
  - link "Routes":
    - /url: /admin/routes
  - link "Settings":
    - /url: /admin/settings
- button "Sign Out"
- main:
  - heading "Panel de Pedidos" [level=1]
  - paragraph: Supervisión y control de ventas en tiempo real
  - textbox "Buscar por cliente, email, producto o categoría..."
  - combobox:
    - option "Todos" [selected]
    - option "Pedido"
    - option "En Producción"
    - option "Finalizado"
    - option "En camino"
    - option "En Entrega"
    - option "Entregado"
    - option "Cancelado"
  - text: Desde
  - textbox
  - text: → Hasta
  - textbox
  - table:
    - rowgroup:
      - row "Orden Cliente Estado Repartidor Total Acciones":
        - columnheader "Orden"
        - columnheader "Cliente"
        - columnheader "Estado"
        - columnheader "Repartidor"
        - columnheader "Total"
        - columnheader "Acciones"
    - rowgroup:
      - row "#b36033dc 6/29/2026 Mohamed Abdelhalim mohamed.shadad121@gmail.com Pedido Enviado Esperando asignación $1374.85 Asignar":
        - cell "#b36033dc 6/29/2026"
        - cell "Mohamed Abdelhalim mohamed.shadad121@gmail.com":
          - paragraph: Mohamed Abdelhalim
          - paragraph: mohamed.shadad121@gmail.com
        - cell "Pedido Enviado"
        - cell "Esperando asignación"
        - cell "$1374.85"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#245e234d 6/29/2026 Recep Tasci recep.tsc@gmail.com Pedido Enviado Esperando asignación $1040.00 Asignar":
        - cell "#245e234d 6/29/2026"
        - cell "Recep Tasci recep.tsc@gmail.com":
          - paragraph: Recep Tasci
          - paragraph: recep.tsc@gmail.com
        - cell "Pedido Enviado"
        - cell "Esperando asignación"
        - cell "$1040.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#f4bced99 6/29/2026 Diego Siguenza lamorlaquitabakery@gmail.com Pedido Enviado Esperando asignación $2071.50 Asignar":
        - cell "#f4bced99 6/29/2026"
        - cell "Diego Siguenza lamorlaquitabakery@gmail.com":
          - paragraph: Diego Siguenza
          - paragraph: lamorlaquitabakery@gmail.com
        - cell "Pedido Enviado"
        - cell "Esperando asignación"
        - cell "$2071.50"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#960ac5db 6/29/2026 Moka&co Moka&co@gmail.com Pedido Enviado Esperando asignación $601.35 Asignar":
        - cell "#960ac5db 6/29/2026"
        - cell "Moka&co Moka&co@gmail.com":
          - paragraph: Moka&co
          - paragraph: Moka&co@gmail.com
        - cell "Pedido Enviado"
        - cell "Esperando asignación"
        - cell "$601.35"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#2c9738d4 6/29/2026 HUDA-NICK hudahafidi45@gmail.com Pedido Enviado Esperando asignación $658.60 Asignar":
        - cell "#2c9738d4 6/29/2026"
        - cell "HUDA-NICK hudahafidi45@gmail.com":
          - paragraph: HUDA-NICK
          - paragraph: hudahafidi45@gmail.com
        - cell "Pedido Enviado"
        - cell "Esperando asignación"
        - cell "$658.60"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#8d7ab8ba 6/29/2026 Saad mokaelmave@gmail.com Pedido Enviado Esperando asignación $592.80 Asignar":
        - cell "#8d7ab8ba 6/29/2026"
        - cell "Saad mokaelmave@gmail.com":
          - paragraph: Saad
          - paragraph: mokaelmave@gmail.com
        - cell "Pedido Enviado"
        - cell "Esperando asignación"
        - cell "$592.80"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#db753499 6/29/2026 RANDA-NICK randammri588@gmail.com Pedido Enviado Esperando asignación $1751.03 Asignar":
        - cell "#db753499 6/29/2026"
        - cell "RANDA-NICK randammri588@gmail.com":
          - paragraph: RANDA-NICK
          - paragraph: randammri588@gmail.com
        - cell "Pedido Enviado"
        - cell "Esperando asignación"
        - cell "$1751.03"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#a5642b86 6/29/2026 Adel Abdulla aabdulla309@yahoo.com Pedido Enviado Esperando asignación $1726.30 Asignar":
        - cell "#a5642b86 6/29/2026"
        - cell "Adel Abdulla aabdulla309@yahoo.com":
          - paragraph: Adel Abdulla
          - paragraph: aabdulla309@yahoo.com
        - cell "Pedido Enviado"
        - cell "Esperando asignación"
        - cell "$1726.30"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#7ba8f507 6/29/2026 Sami rimokaandco@gmail.com Pedido Enviado Esperando asignación $1734.00 Asignar":
        - cell "#7ba8f507 6/29/2026"
        - cell "Sami rimokaandco@gmail.com":
          - paragraph: Sami
          - paragraph: rimokaandco@gmail.com
        - cell "Pedido Enviado"
        - cell "Esperando asignación"
        - cell "$1734.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#4d47eb52 6/29/2026 My sweet time Llc mysweettime600@gmail.com Pedido Enviado Esperando asignación $502.25 Asignar":
        - cell "#4d47eb52 6/29/2026"
        - cell "My sweet time Llc mysweettime600@gmail.com":
          - paragraph: My sweet time Llc
          - paragraph: mysweettime600@gmail.com
        - cell "Pedido Enviado"
        - cell "Esperando asignación"
        - cell "$502.25"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#0350b3f4 6/29/2026 THOMAS VONhOLT patsbakeryei@gmail.com Pedido Enviado Esperando asignación $507.00 Asignar":
        - cell "#0350b3f4 6/29/2026"
        - cell "THOMAS VONhOLT patsbakeryei@gmail.com":
          - paragraph: THOMAS VONhOLT
          - paragraph: patsbakeryei@gmail.com
        - cell "Pedido Enviado"
        - cell "Esperando asignación"
        - cell "$507.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#d5245812 6/28/2026 BROOKLYN-NICK bouraneyahia0@gmail.com pending Esperando asignación $617.70 Asignar":
        - cell "#d5245812 6/28/2026"
        - cell "BROOKLYN-NICK bouraneyahia0@gmail.com":
          - paragraph: BROOKLYN-NICK
          - paragraph: bouraneyahia0@gmail.com
        - cell "pending"
        - cell "Esperando asignación"
        - cell "$617.70"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#8edcbcdc 6/27/2026 Madiha Hassani madihahassani62@gmail.com Finalizado Esperando asignación $666.95 Asignar":
        - cell "#8edcbcdc 6/27/2026"
        - cell "Madiha Hassani madihahassani62@gmail.com":
          - paragraph: Madiha Hassani
          - paragraph: madihahassani62@gmail.com
        - cell "Finalizado"
        - cell "Esperando asignación"
        - cell "$666.95"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#612efeb6 6/27/2026 Recep Tasci recep.tsc@gmail.com production Esperando asignación $572.00 Asignar":
        - cell "#612efeb6 6/27/2026"
        - cell "Recep Tasci recep.tsc@gmail.com":
          - paragraph: Recep Tasci
          - paragraph: recep.tsc@gmail.com
        - cell "production"
        - cell "Esperando asignación"
        - cell "$572.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#f6baa29d 6/27/2026 HUDA-NICK hudahafidi45@gmail.com production Esperando asignación $601.25 Asignar":
        - cell "#f6baa29d 6/27/2026"
        - cell "HUDA-NICK hudahafidi45@gmail.com":
          - paragraph: HUDA-NICK
          - paragraph: hudahafidi45@gmail.com
        - cell "production"
        - cell "Esperando asignación"
        - cell "$601.25"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#1d0f715a 6/27/2026 RANDA-NICK randammri588@gmail.com production Esperando asignación $1833.51 Asignar":
        - cell "#1d0f715a 6/27/2026"
        - cell "RANDA-NICK randammri588@gmail.com":
          - paragraph: RANDA-NICK
          - paragraph: randammri588@gmail.com
        - cell "production"
        - cell "Esperando asignación"
        - cell "$1833.51"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#4f9e719a 6/26/2026 MOSTAFA -Fulton mostafa.elattar.gcc@gmail.com production Esperando asignación $1341.25 Asignar":
        - cell "#4f9e719a 6/26/2026"
        - cell "MOSTAFA -Fulton mostafa.elattar.gcc@gmail.com":
          - paragraph: MOSTAFA -Fulton
          - paragraph: mostafa.elattar.gcc@gmail.com
        - cell "production"
        - cell "Esperando asignación"
        - cell "$1341.25"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#126f917c 6/26/2026 Adel Abdulla aabdulla309@yahoo.com delivered Esperando asignación $615.30 Asignar":
        - cell "#126f917c 6/26/2026"
        - cell "Adel Abdulla aabdulla309@yahoo.com":
          - paragraph: Adel Abdulla
          - paragraph: aabdulla309@yahoo.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$615.30"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#b0f0106c 6/26/2026 BROOKLYN-NICK bouraneyahia0@gmail.com delivered Esperando asignación $896.40 Asignar":
        - cell "#b0f0106c 6/26/2026"
        - cell "BROOKLYN-NICK bouraneyahia0@gmail.com":
          - paragraph: BROOKLYN-NICK
          - paragraph: bouraneyahia0@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$896.40"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#41d5417f 6/26/2026 Saad mokaelmave@gmail.com delivered Esperando asignación $745.20 Asignar":
        - cell "#41d5417f 6/26/2026"
        - cell "Saad mokaelmave@gmail.com":
          - paragraph: Saad
          - paragraph: mokaelmave@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$745.20"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#5f0cd794 6/25/2026 Genesis Guzman alohenny@hotmail.con delivered Esperando asignación $1336.00 Asignar":
        - cell "#5f0cd794 6/25/2026"
        - cell "Genesis Guzman alohenny@hotmail.con":
          - paragraph: Genesis Guzman
          - paragraph: alohenny@hotmail.con
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1336.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#b4c89f88 6/25/2026 Pavlovabakery pavlovabakerycafe@gmail.com delivered Esperando asignación $513.50 Asignar":
        - cell "#b4c89f88 6/25/2026"
        - cell "Pavlovabakery pavlovabakerycafe@gmail.com":
          - paragraph: Pavlovabakery
          - paragraph: pavlovabakerycafe@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$513.50"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#058cbbcb 6/25/2026 Moka&co Moka&co@gmail.com delivered Esperando asignación $502.95 Asignar":
        - cell "#058cbbcb 6/25/2026"
        - cell "Moka&co Moka&co@gmail.com":
          - paragraph: Moka&co
          - paragraph: Moka&co@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$502.95"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#bbf9a2ad 6/25/2026 HUDA-NICK hudahafidi45@gmail.com delivered Esperando asignación $839.40 Asignar":
        - cell "#bbf9a2ad 6/25/2026"
        - cell "HUDA-NICK hudahafidi45@gmail.com":
          - paragraph: HUDA-NICK
          - paragraph: hudahafidi45@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$839.40"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#abc51471 6/24/2026 Diego Siguenza lamorlaquitabakery@gmail.com delivered Esperando asignación $2647.85 Asignar":
        - cell "#abc51471 6/24/2026"
        - cell "Diego Siguenza lamorlaquitabakery@gmail.com":
          - paragraph: Diego Siguenza
          - paragraph: lamorlaquitabakery@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$2647.85"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#be5d21c3 6/24/2026 RANDA-NICK randammri588@gmail.com delivered Esperando asignación $1628.40 Asignar":
        - cell "#be5d21c3 6/24/2026"
        - cell "RANDA-NICK randammri588@gmail.com":
          - paragraph: RANDA-NICK
          - paragraph: randammri588@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1628.40"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#837855c5 6/24/2026 Moqa Englewood mokaenglewood@gmail.com delivered Esperando asignación $951.08 Asignar":
        - cell "#837855c5 6/24/2026"
        - cell "Moqa Englewood mokaenglewood@gmail.com":
          - paragraph: Moqa Englewood
          - paragraph: mokaenglewood@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$951.08"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#168f4453 6/24/2026 Adel Abdulla aabdulla309@yahoo.com delivered Esperando asignación $1650.00 Asignar":
        - cell "#168f4453 6/24/2026"
        - cell "Adel Abdulla aabdulla309@yahoo.com":
          - paragraph: Adel Abdulla
          - paragraph: aabdulla309@yahoo.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1650.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#ddc28b69 6/23/2026 My sweet time Llc mysweettime600@gmail.com delivered Esperando asignación $1330.00 Asignar":
        - cell "#ddc28b69 6/23/2026"
        - cell "My sweet time Llc mysweettime600@gmail.com":
          - paragraph: My sweet time Llc
          - paragraph: mysweettime600@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1330.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#a994776a 6/23/2026 Azooma coffee azoomacoffee@gmail.com cancelled Esperando asignación $501.00 Asignar":
        - cell "#a994776a 6/23/2026"
        - cell "Azooma coffee azoomacoffee@gmail.com":
          - paragraph: Azooma coffee
          - paragraph: azoomacoffee@gmail.com
        - cell "cancelled"
        - cell "Esperando asignación"
        - cell "$501.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#6758e4fd 6/23/2026 Recep Tasci recep.tsc@gmail.com delivered Esperando asignación $760.50 Asignar":
        - cell "#6758e4fd 6/23/2026"
        - cell "Recep Tasci recep.tsc@gmail.com":
          - paragraph: Recep Tasci
          - paragraph: recep.tsc@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$760.50"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#71e4783b 6/23/2026 Monica Mena hannahrod440@gmail.com delivered Esperando asignación $500.50 Asignar":
        - cell "#71e4783b 6/23/2026"
        - cell "Monica Mena hannahrod440@gmail.com":
          - paragraph: Monica Mena
          - paragraph: hannahrod440@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$500.50"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#e5b3e598 6/23/2026 Mohamed Abdelhalim mohamed.shadad121@gmail.com delivered Esperando asignación $1218.70 Asignar":
        - cell "#e5b3e598 6/23/2026"
        - cell "Mohamed Abdelhalim mohamed.shadad121@gmail.com":
          - paragraph: Mohamed Abdelhalim
          - paragraph: mohamed.shadad121@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1218.70"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#77c39414 6/23/2026 Madiha Hassani madihahassani62@gmail.com delivered Esperando asignación $727.20 Asignar":
        - cell "#77c39414 6/23/2026"
        - cell "Madiha Hassani madihahassani62@gmail.com":
          - paragraph: Madiha Hassani
          - paragraph: madihahassani62@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$727.20"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#ca1017c9 6/23/2026 MOSTAFA -Fulton mostafa.elattar.gcc@gmail.com delivered Esperando asignación $1020.40 Asignar":
        - cell "#ca1017c9 6/23/2026"
        - cell "MOSTAFA -Fulton mostafa.elattar.gcc@gmail.com":
          - paragraph: MOSTAFA -Fulton
          - paragraph: mostafa.elattar.gcc@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1020.40"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#f75953b0 6/23/2026 BROOKLYN-NICK bouraneyahia0@gmail.com delivered Esperando asignación $673.00 Asignar":
        - cell "#f75953b0 6/23/2026"
        - cell "BROOKLYN-NICK bouraneyahia0@gmail.com":
          - paragraph: BROOKLYN-NICK
          - paragraph: bouraneyahia0@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$673.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#bf3b4e68 6/22/2026 Genesis Guzman alohenny@hotmail.con delivered Esperando asignación $1127.60 Asignar":
        - cell "#bf3b4e68 6/22/2026"
        - cell "Genesis Guzman alohenny@hotmail.con":
          - paragraph: Genesis Guzman
          - paragraph: alohenny@hotmail.con
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1127.60"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#29f1ffaa 6/22/2026 Adel Abdulla aabdulla309@yahoo.com delivered Esperando asignación $1002.45 Asignar":
        - cell "#29f1ffaa 6/22/2026"
        - cell "Adel Abdulla aabdulla309@yahoo.com":
          - paragraph: Adel Abdulla
          - paragraph: aabdulla309@yahoo.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1002.45"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#ffcf642b 6/22/2026 Moka&co zd@gmail.com delivered Esperando asignación $501.05 Asignar":
        - cell "#ffcf642b 6/22/2026"
        - cell "Moka&co zd@gmail.com":
          - paragraph: Moka&co
          - paragraph: zd@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$501.05"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#dc821dda 6/22/2026 HUDA-NICK hudahafidi45@gmail.com delivered Esperando asignación $659.90 Asignar":
        - cell "#dc821dda 6/22/2026"
        - cell "HUDA-NICK hudahafidi45@gmail.com":
          - paragraph: HUDA-NICK
          - paragraph: hudahafidi45@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$659.90"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#8d71743f 6/22/2026 RANDA-NICK randammri588@gmail.com delivered Esperando asignación $1443.54 Asignar":
        - cell "#8d71743f 6/22/2026"
        - cell "RANDA-NICK randammri588@gmail.com":
          - paragraph: RANDA-NICK
          - paragraph: randammri588@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1443.54"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#0f1720e4 6/22/2026 Saad mokaelmave@gmail.com delivered Esperando asignación $580.20 Asignar":
        - cell "#0f1720e4 6/22/2026"
        - cell "Saad mokaelmave@gmail.com":
          - paragraph: Saad
          - paragraph: mokaelmave@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$580.20"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#25761c44 6/22/2026 Pedro García tresamigostaqueria75@gmail.com delivered Esperando asignación $504.00 Asignar":
        - cell "#25761c44 6/22/2026"
        - cell "Pedro García tresamigostaqueria75@gmail.com":
          - paragraph: Pedro García
          - paragraph: tresamigostaqueria75@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$504.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#6c8b5354 6/21/2026 Mohamed Abdelhalim mohamed.shadad121@gmail.com delivered Esperando asignación $1046.20 Asignar":
        - cell "#6c8b5354 6/21/2026"
        - cell "Mohamed Abdelhalim mohamed.shadad121@gmail.com":
          - paragraph: Mohamed Abdelhalim
          - paragraph: mohamed.shadad121@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1046.20"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#0ac6de31 6/21/2026 Diego Siguenza lamorlaquitabakery@gmail.com delivered Esperando asignación $2404.40 Asignar":
        - cell "#0ac6de31 6/21/2026"
        - cell "Diego Siguenza lamorlaquitabakery@gmail.com":
          - paragraph: Diego Siguenza
          - paragraph: lamorlaquitabakery@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$2404.40"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#57541d3f 6/20/2026 Recep Tasci recep.tsc@gmail.com cancelled Esperando asignación $533.00 Asignar":
        - cell "#57541d3f 6/20/2026"
        - cell "Recep Tasci recep.tsc@gmail.com":
          - paragraph: Recep Tasci
          - paragraph: recep.tsc@gmail.com
        - cell "cancelled"
        - cell "Esperando asignación"
        - cell "$533.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#9cf5e479 6/20/2026 Adel Abdulla aabdulla309@yahoo.com delivered Esperando asignación $937.30 Asignar":
        - cell "#9cf5e479 6/20/2026"
        - cell "Adel Abdulla aabdulla309@yahoo.com":
          - paragraph: Adel Abdulla
          - paragraph: aabdulla309@yahoo.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$937.30"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#96bdeb80 6/20/2026 HUDA-NICK hudahafidi45@gmail.com delivered Esperando asignación $576.10 Asignar":
        - cell "#96bdeb80 6/20/2026"
        - cell "HUDA-NICK hudahafidi45@gmail.com":
          - paragraph: HUDA-NICK
          - paragraph: hudahafidi45@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$576.10"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#e5c49ae4 6/20/2026 Moka&co zr@gmail.com delivered Esperando asignación $503.20 Asignar":
        - cell "#e5c49ae4 6/20/2026"
        - cell "Moka&co zr@gmail.com":
          - paragraph: Moka&co
          - paragraph: zr@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$503.20"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#2986f908 6/20/2026 RANDA-NICK randammri588@gmail.com delivered Esperando asignación $1735.82 Asignar":
        - cell "#2986f908 6/20/2026"
        - cell "RANDA-NICK randammri588@gmail.com":
          - paragraph: RANDA-NICK
          - paragraph: randammri588@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1735.82"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#088699f1 6/19/2026 BROOKLYN-NICK bouraneyahia0@gmail.com delivered Esperando asignación $967.40 Asignar":
        - cell "#088699f1 6/19/2026"
        - cell "BROOKLYN-NICK bouraneyahia0@gmail.com":
          - paragraph: BROOKLYN-NICK
          - paragraph: bouraneyahia0@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$967.40"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#2a980145 6/18/2026 Pavlovabakery pavlovabakerycafe@gmail.com delivered Esperando asignación $572.00 Asignar":
        - cell "#2a980145 6/18/2026"
        - cell "Pavlovabakery pavlovabakerycafe@gmail.com":
          - paragraph: Pavlovabakery
          - paragraph: pavlovabakerycafe@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$572.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#7613828c 6/18/2026 MOSTAFA -Fulton mostafa.elattar.gcc@gmail.com delivered Esperando asignación $943.00 Asignar":
        - cell "#7613828c 6/18/2026"
        - cell "MOSTAFA -Fulton mostafa.elattar.gcc@gmail.com":
          - paragraph: MOSTAFA -Fulton
          - paragraph: mostafa.elattar.gcc@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$943.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#cb152f99 6/18/2026 Adel Abdulla aabdulla309@yahoo.com delivered Esperando asignación $996.30 Asignar":
        - cell "#cb152f99 6/18/2026"
        - cell "Adel Abdulla aabdulla309@yahoo.com":
          - paragraph: Adel Abdulla
          - paragraph: aabdulla309@yahoo.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$996.30"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#86a78dab 6/18/2026 Melinna Guthr hello@apinchofsprinkles.com delivered Esperando asignación $500.30 Asignar":
        - cell "#86a78dab 6/18/2026"
        - cell "Melinna Guthr hello@apinchofsprinkles.com":
          - paragraph: Melinna Guthr
          - paragraph: hello@apinchofsprinkles.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$500.30"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#b4d1e6a5 6/18/2026 Saad mokaelmave@gmail.com delivered Esperando asignación $533.20 Asignar":
        - cell "#b4d1e6a5 6/18/2026"
        - cell "Saad mokaelmave@gmail.com":
          - paragraph: Saad
          - paragraph: mokaelmave@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$533.20"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#ea09ae38 6/18/2026 HUDA-NICK hudahafidi45@gmail.com delivered Esperando asignación $556.90 Asignar":
        - cell "#ea09ae38 6/18/2026"
        - cell "HUDA-NICK hudahafidi45@gmail.com":
          - paragraph: HUDA-NICK
          - paragraph: hudahafidi45@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$556.90"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#4ade8223 6/18/2026 Moka&co saman@gmail.com delivered Esperando asignación $504.50 Asignar":
        - cell "#4ade8223 6/18/2026"
        - cell "Moka&co saman@gmail.com":
          - paragraph: Moka&co
          - paragraph: saman@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$504.50"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#330c9b51 6/17/2026 Disbel disbel_ddqm@hotmail.com delivered Esperando asignación $915.50 Asignar":
        - cell "#330c9b51 6/17/2026"
        - cell "Disbel disbel_ddqm@hotmail.com":
          - paragraph: Disbel
          - paragraph: disbel_ddqm@hotmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$915.50"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#67c077bb 6/17/2026 THOMAS VONhOLT patsbakeryei@gmail.com delivered Esperando asignación $510.00 Asignar":
        - cell "#67c077bb 6/17/2026"
        - cell "THOMAS VONhOLT patsbakeryei@gmail.com":
          - paragraph: THOMAS VONhOLT
          - paragraph: patsbakeryei@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$510.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#78e7d64f 6/17/2026 Hannah Rodriguez hrodriguez@queensmetro.com delivered Esperando asignación $500.50 Asignar":
        - cell "#78e7d64f 6/17/2026"
        - cell "Hannah Rodriguez hrodriguez@queensmetro.com":
          - paragraph: Hannah Rodriguez
          - paragraph: hrodriguez@queensmetro.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$500.50"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#7c8408af 6/17/2026 Moqa Englewood mokaenglewood@gmail.com delivered Esperando asignación $801.48 Asignar":
        - cell "#7c8408af 6/17/2026"
        - cell "Moqa Englewood mokaenglewood@gmail.com":
          - paragraph: Moqa Englewood
          - paragraph: mokaenglewood@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$801.48"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#390962df 6/17/2026 BROOKLYN-NICK bouraneyahia0@gmail.com delivered Esperando asignación $668.55 Asignar":
        - cell "#390962df 6/17/2026"
        - cell "BROOKLYN-NICK bouraneyahia0@gmail.com":
          - paragraph: BROOKLYN-NICK
          - paragraph: bouraneyahia0@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$668.55"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#2598189c 6/17/2026 Madiha Hassani madihahassani62@gmail.com delivered Esperando asignación $695.95 Asignar":
        - cell "#2598189c 6/17/2026"
        - cell "Madiha Hassani madihahassani62@gmail.com":
          - paragraph: Madiha Hassani
          - paragraph: madihahassani62@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$695.95"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#9ee10540 6/17/2026 Recep Tasci recep.tsc@gmail.com delivered Esperando asignación $500.50 Asignar":
        - cell "#9ee10540 6/17/2026"
        - cell "Recep Tasci recep.tsc@gmail.com":
          - paragraph: Recep Tasci
          - paragraph: recep.tsc@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$500.50"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#e76ba2cf 6/17/2026 RANDA-NICK randammri588@gmail.com delivered Esperando asignación $974.46 Asignar":
        - cell "#e76ba2cf 6/17/2026"
        - cell "RANDA-NICK randammri588@gmail.com":
          - paragraph: RANDA-NICK
          - paragraph: randammri588@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$974.46"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#8d2cc399 6/17/2026 Guerino Zambrano pastrylife2582@gmail.com delivered Esperando asignación $500.50 Asignar":
        - cell "#8d2cc399 6/17/2026"
        - cell "Guerino Zambrano pastrylife2582@gmail.com":
          - paragraph: Guerino Zambrano
          - paragraph: pastrylife2582@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$500.50"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#1fa17048 6/17/2026 Mohamed Abdelhalim mohamed.shadad121@gmail.com delivered Esperando asignación $1087.45 Asignar":
        - cell "#1fa17048 6/17/2026"
        - cell "Mohamed Abdelhalim mohamed.shadad121@gmail.com":
          - paragraph: Mohamed Abdelhalim
          - paragraph: mohamed.shadad121@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1087.45"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#b50ddbd5 6/16/2026 Diego Siguenza lamorlaquitabakery@gmail.com delivered Esperando asignación $2902.40 Asignar":
        - cell "#b50ddbd5 6/16/2026"
        - cell "Diego Siguenza lamorlaquitabakery@gmail.com":
          - paragraph: Diego Siguenza
          - paragraph: lamorlaquitabakery@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$2902.40"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#89186dde 6/16/2026 Sami rimokaandco@gmail.com delivered Esperando asignación $1929.10 Asignar":
        - cell "#89186dde 6/16/2026"
        - cell "Sami rimokaandco@gmail.com":
          - paragraph: Sami
          - paragraph: rimokaandco@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1929.10"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#01a24c19 6/16/2026 Genesis Guzman alohenny@hotmail.con delivered Esperando asignación $821.60 Asignar":
        - cell "#01a24c19 6/16/2026"
        - cell "Genesis Guzman alohenny@hotmail.con":
          - paragraph: Genesis Guzman
          - paragraph: alohenny@hotmail.con
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$821.60"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#675c76f2 6/15/2026 Cristiano cristiano@salesgild.com delivered Esperando asignación $544.00 Asignar":
        - cell "#675c76f2 6/15/2026"
        - cell "Cristiano cristiano@salesgild.com":
          - paragraph: Cristiano
          - paragraph: cristiano@salesgild.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$544.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#ee2ed00d 6/15/2026 Melinna Guthr hello@apinchofsprinkles.com delivered Esperando asignación $807.75 Asignar":
        - cell "#ee2ed00d 6/15/2026"
        - cell "Melinna Guthr hello@apinchofsprinkles.com":
          - paragraph: Melinna Guthr
          - paragraph: hello@apinchofsprinkles.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$807.75"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#7040aaad 6/15/2026 Adel Abdulla aabdulla309@yahoo.com delivered Esperando asignación $894.60 Asignar":
        - cell "#7040aaad 6/15/2026"
        - cell "Adel Abdulla aabdulla309@yahoo.com":
          - paragraph: Adel Abdulla
          - paragraph: aabdulla309@yahoo.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$894.60"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#112e1313 6/15/2026 RANDA-NICK randammri588@gmail.com delivered Esperando asignación $944.35 Asignar":
        - cell "#112e1313 6/15/2026"
        - cell "RANDA-NICK randammri588@gmail.com":
          - paragraph: RANDA-NICK
          - paragraph: randammri588@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$944.35"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#9f2780ba 6/15/2026 Moka&co sama89@gmail.com delivered Esperando asignación $500.70 Asignar":
        - cell "#9f2780ba 6/15/2026"
        - cell "Moka&co sama89@gmail.com":
          - paragraph: Moka&co
          - paragraph: sama89@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$500.70"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#f40f20c6 6/15/2026 Saad mokaelmave@gmail.com delivered Esperando asignación $501.30 Asignar":
        - cell "#f40f20c6 6/15/2026"
        - cell "Saad mokaelmave@gmail.com":
          - paragraph: Saad
          - paragraph: mokaelmave@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$501.30"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#6547a4b8 6/15/2026 HUDA-NICK hudahafidi45@gmail.com delivered Esperando asignación $651.20 Asignar":
        - cell "#6547a4b8 6/15/2026"
        - cell "HUDA-NICK hudahafidi45@gmail.com":
          - paragraph: HUDA-NICK
          - paragraph: hudahafidi45@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$651.20"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#c9310eb4 6/13/2026 Mohamed Abdelhalim mohamed.shadad121@gmail.com delivered Esperando asignación $552.65 Asignar":
        - cell "#c9310eb4 6/13/2026"
        - cell "Mohamed Abdelhalim mohamed.shadad121@gmail.com":
          - paragraph: Mohamed Abdelhalim
          - paragraph: mohamed.shadad121@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$552.65"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#67a702f4 6/13/2026 Adel Abdulla aabdulla309@yahoo.com delivered Esperando asignación $1424.20 Asignar":
        - cell "#67a702f4 6/13/2026"
        - cell "Adel Abdulla aabdulla309@yahoo.com":
          - paragraph: Adel Abdulla
          - paragraph: aabdulla309@yahoo.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1424.20"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#84a750c3 6/13/2026 Madiha Hassani madihahassani62@gmail.com delivered Esperando asignación $502.40 Asignar":
        - cell "#84a750c3 6/13/2026"
        - cell "Madiha Hassani madihahassani62@gmail.com":
          - paragraph: Madiha Hassani
          - paragraph: madihahassani62@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$502.40"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#c7e54cbd 6/13/2026 Sami rimokaandco@gmail.com delivered Esperando asignación $1585.10 Asignar":
        - cell "#c7e54cbd 6/13/2026"
        - cell "Sami rimokaandco@gmail.com":
          - paragraph: Sami
          - paragraph: rimokaandco@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1585.10"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#dac95c65 6/13/2026 BROOKLYN-NICK bouraneyahia0@gmail.com delivered Esperando asignación $702.00 Asignar":
        - cell "#dac95c65 6/13/2026"
        - cell "BROOKLYN-NICK bouraneyahia0@gmail.com":
          - paragraph: BROOKLYN-NICK
          - paragraph: bouraneyahia0@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$702.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#19cd30f0 6/13/2026 HUDA-NICK hudahafidi45@gmail.com ready Esperando asignación $736.30 Asignar":
        - cell "#19cd30f0 6/13/2026"
        - cell "HUDA-NICK hudahafidi45@gmail.com":
          - paragraph: HUDA-NICK
          - paragraph: hudahafidi45@gmail.com
        - cell "ready"
        - cell "Esperando asignación"
        - cell "$736.30"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#62f0129e 6/12/2026 Pavlovabakery pavlovabakerycafe@gmail.com ready Esperando asignación $663.00 Asignar":
        - cell "#62f0129e 6/12/2026"
        - cell "Pavlovabakery pavlovabakerycafe@gmail.com":
          - paragraph: Pavlovabakery
          - paragraph: pavlovabakerycafe@gmail.com
        - cell "ready"
        - cell "Esperando asignación"
        - cell "$663.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#8722a790 6/12/2026 RANDA-NICK randammri588@gmail.com delivered Esperando asignación $1455.51 Asignar":
        - cell "#8722a790 6/12/2026"
        - cell "RANDA-NICK randammri588@gmail.com":
          - paragraph: RANDA-NICK
          - paragraph: randammri588@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1455.51"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#c6d48590 6/11/2026 Saad mokaelmave@gmail.com delivered Esperando asignación $518.50 Asignar":
        - cell "#c6d48590 6/11/2026"
        - cell "Saad mokaelmave@gmail.com":
          - paragraph: Saad
          - paragraph: mokaelmave@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$518.50"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#246d411a 6/11/2026 BROOKLYN-NICK bouraneyahia0@gmail.com delivered Esperando asignación $783.10 Asignar":
        - cell "#246d411a 6/11/2026"
        - cell "BROOKLYN-NICK bouraneyahia0@gmail.com":
          - paragraph: BROOKLYN-NICK
          - paragraph: bouraneyahia0@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$783.10"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#588ebb3d 6/11/2026 MOSTAFA -Fulton mostafa.elattar.gcc@gmail.com delivered Esperando asignación $851.20 Asignar":
        - cell "#588ebb3d 6/11/2026"
        - cell "MOSTAFA -Fulton mostafa.elattar.gcc@gmail.com":
          - paragraph: MOSTAFA -Fulton
          - paragraph: mostafa.elattar.gcc@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$851.20"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#eaca4f5a 6/11/2026 HUDA-NICK hudahafidi45@gmail.com delivered Esperando asignación $904.45 Asignar":
        - cell "#eaca4f5a 6/11/2026"
        - cell "HUDA-NICK hudahafidi45@gmail.com":
          - paragraph: HUDA-NICK
          - paragraph: hudahafidi45@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$904.45"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#5394dac1 6/11/2026 Adel Abdulla aabdulla309@yahoo.com delivered Esperando asignación $994.15 Asignar":
        - cell "#5394dac1 6/11/2026"
        - cell "Adel Abdulla aabdulla309@yahoo.com":
          - paragraph: Adel Abdulla
          - paragraph: aabdulla309@yahoo.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$994.15"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#30d5a01d 6/11/2026 Sami rimokaandco@gmail.com delivered Esperando asignación $2035.95 Asignar":
        - cell "#30d5a01d 6/11/2026"
        - cell "Sami rimokaandco@gmail.com":
          - paragraph: Sami
          - paragraph: rimokaandco@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$2035.95"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#01a4a49a 6/11/2026 Diego Siguenza lamorlaquitabakery@gmail.com delivered Esperando asignación $3088.35 Asignar":
        - cell "#01a4a49a 6/11/2026"
        - cell "Diego Siguenza lamorlaquitabakery@gmail.com":
          - paragraph: Diego Siguenza
          - paragraph: lamorlaquitabakery@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$3088.35"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#e7927f94 6/11/2026 Mohamed Abdelhalim mohamed.shadad121@gmail.com delivered Esperando asignación $811.30 Asignar":
        - cell "#e7927f94 6/11/2026"
        - cell "Mohamed Abdelhalim mohamed.shadad121@gmail.com":
          - paragraph: Mohamed Abdelhalim
          - paragraph: mohamed.shadad121@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$811.30"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#e3e3e4d6 6/10/2026 Genesis Guzman alohenny@hotmail.con delivered Esperando asignación $682.60 Asignar":
        - cell "#e3e3e4d6 6/10/2026"
        - cell "Genesis Guzman alohenny@hotmail.con":
          - paragraph: Genesis Guzman
          - paragraph: alohenny@hotmail.con
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$682.60"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#72a4cfc7 6/10/2026 Moqa Englewood mokaenglewood@gmail.com delivered Esperando asignación $706.88 Asignar":
        - cell "#72a4cfc7 6/10/2026"
        - cell "Moqa Englewood mokaenglewood@gmail.com":
          - paragraph: Moqa Englewood
          - paragraph: mokaenglewood@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$706.88"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#f158664c 6/10/2026 Pedro García tresamigostaqueria75@gmail.com delivered Esperando asignación $501.50 Asignar":
        - cell "#f158664c 6/10/2026"
        - cell "Pedro García tresamigostaqueria75@gmail.com":
          - paragraph: Pedro García
          - paragraph: tresamigostaqueria75@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$501.50"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#5023d310 6/10/2026 Madiha Hassani madihahassani62@gmail.com delivered Esperando asignación $669.00 Asignar":
        - cell "#5023d310 6/10/2026"
        - cell "Madiha Hassani madihahassani62@gmail.com":
          - paragraph: Madiha Hassani
          - paragraph: madihahassani62@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$669.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#0792c203 6/10/2026 RANDA-NICK randammri588@gmail.com delivered Esperando asignación $1121.79 Asignar":
        - cell "#0792c203 6/10/2026"
        - cell "RANDA-NICK randammri588@gmail.com":
          - paragraph: RANDA-NICK
          - paragraph: randammri588@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$1121.79"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
      - row "#8a804d9a 6/10/2026 Monica Mena hannahrod440@gmail.com delivered Esperando asignación $520.00 Asignar":
        - cell "#8a804d9a 6/10/2026"
        - cell "Monica Mena hannahrod440@gmail.com":
          - paragraph: Monica Mena
          - paragraph: hannahrod440@gmail.com
        - cell "delivered"
        - cell "Esperando asignación"
        - cell "$520.00"
        - cell "Asignar":
          - button "Ver detalles"
          - button "Asignar"
- alert
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | const FRONTEND_URL = 'http://localhost:3000';
  4   | const ADMIN_EMAIL = 'admin@test.com';
  5   | const ADMIN_PASS = '123123';
  6   | const CLIENT_EMAIL = 'rubendarioc@gmail.com';
  7   | const CLIENT_PASS = 'Sebas1007.';
  8   | const CLIENT_NICKNAME = 'RUBEN-NICK';
  9   | 
  10  | async function loginAs(page: Page, email: string, pass: string) {
  11  |   await page.goto(`${FRONTEND_URL}/auth/login`);
  12  |   await page.locator('input[type="text"]').fill(email);
  13  |   await page.locator('input[type="password"]').fill(pass);
  14  |   await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Iniciar Sesión")');
  15  | }
  16  | 
  17  | test.describe('PROD — Verificación Visual de Producción', () => {
  18  | 
  19  |   test('PROD-01 — Cliente puede iniciar sesión y ver su catálogo', async ({ page }) => {
  20  |     await loginAs(page, CLIENT_EMAIL, CLIENT_PASS);
  21  |     await page.waitForTimeout(3000);
  22  | 
  23  |     // Should NOT be redirected to admin/delivery/produccion
  24  |     const url = page.url();
  25  |     expect(url).not.toContain('/admin');
  26  |     expect(url).not.toContain('/delivery');
  27  |     expect(url).not.toContain('/produccion');
  28  | 
  29  |     // Should land at home or catalog
  30  |     await page.screenshot({ path: 'test-results/prod-01-client-login.png', fullPage: true });
  31  | 
  32  |     // No mandatory password change modal should block them
  33  |     await expect(page.locator('text=Cambio de contraseña obligatorio')).not.toBeVisible();
  34  |   });
  35  | 
  36  |   test('PROD-02 — Admin puede acceder al panel de pedidos y ver NICKNAME del cliente', async ({ page }) => {
  37  |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  38  |     await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  39  | 
  40  |     await page.goto(`${FRONTEND_URL}/admin/orders`);
  41  |     await page.waitForTimeout(3000);
  42  | 
  43  |     await page.screenshot({ path: 'test-results/prod-02-admin-orders.png', fullPage: true });
  44  | 
  45  |     // The nickname RUBEN-NICK should appear in the orders list
> 46  |     await expect(page.locator(`text=${CLIENT_NICKNAME}`).first()).toBeVisible({ timeout: 10000 });
      |                                                                   ^ Error: expect(locator).toBeVisible() failed
  47  |   });
  48  | 
  49  |   test('PROD-03 — Admin puede ver listado de clientes con NICKNAME (Nombre Real)', async ({ page }) => {
  50  |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  51  |     await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  52  | 
  53  |     await page.goto(`${FRONTEND_URL}/admin/clients`);
  54  |     await page.waitForTimeout(3000);
  55  |     await page.locator('input[placeholder*="Buscar por nombre"]').fill(CLIENT_EMAIL);
  56  |     await page.waitForTimeout(1000);
  57  | 
  58  |     await page.screenshot({ path: 'test-results/prod-03-admin-clients.png', fullPage: true });
  59  | 
  60  |     // Nickname formatted as NICK (Name) should be visible
  61  |     await expect(page.locator(`text=${CLIENT_NICKNAME}`).first()).toBeVisible({ timeout: 10000 });
  62  |   });
  63  | 
  64  |   test('PROD-04 — Admin puede generar reporte y encabezados de columna muestran NICKNAME', async ({ page }) => {
  65  |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  66  |     await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  67  | 
  68  |     await page.goto(`${FRONTEND_URL}/admin/reports`);
  69  |     await page.waitForTimeout(2000);
  70  | 
  71  |     // Set report type to daily and click generate
  72  |     await page.locator('select').first().selectOption('daily');
  73  |     await page.waitForTimeout(500);
  74  | 
  75  |     // Click generate button
  76  |     await page.click('button:has-text("Generar")');
  77  |     await page.waitForTimeout(4000);
  78  | 
  79  |     await page.screenshot({ path: 'test-results/prod-04-admin-reports.png', fullPage: true });
  80  | 
  81  |     // The page should load without error
  82  |     await expect(page.locator('h1:has-text("Reportes Generales")')).toBeVisible();
  83  |   });
  84  | 
  85  |   test('PROD-05 — Buscador de clientes en reportes filtra y muestra por NICKNAME', async ({ page }) => {
  86  |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  87  |     await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  88  | 
  89  |     await page.goto(`${FRONTEND_URL}/admin/reports`);
  90  |     await page.waitForTimeout(2000);
  91  | 
  92  |     // Switch to specific-client view
  93  |     await page.locator('select').nth(1).selectOption('specific-client');
  94  |     await page.waitForTimeout(500);
  95  | 
  96  |     // Search by nickname
  97  |     await page.locator('input[placeholder*="Buscar cliente"]').fill(CLIENT_NICKNAME);
  98  |     await page.waitForTimeout(1000);
  99  | 
  100 |     await page.screenshot({ path: 'test-results/prod-05-reports-nickname-search.png', fullPage: true });
  101 | 
  102 |     // The dropdown should show the client by NICKNAME
  103 |     await expect(page.locator(`text=${CLIENT_NICKNAME}`).first()).toBeVisible({ timeout: 5000 });
  104 |   });
  105 | 
  106 |   test('PROD-06 — Delivery staff puede acceder a su panel y ver cambio de contraseña', async ({ page }) => {
  107 |     await loginAs(page, 'user2@test.com', '123132');
  108 |     await page.waitForTimeout(3000);
  109 | 
  110 |     await page.goto(`${FRONTEND_URL}/delivery/settings`);
  111 |     await page.waitForTimeout(2000);
  112 | 
  113 |     await page.screenshot({ path: 'test-results/prod-06-delivery-settings.png', fullPage: true });
  114 | 
  115 |     // Security section must be visible
  116 |     await expect(page.locator('text=Seguridad de la Cuenta')).toBeVisible({ timeout: 8000 });
  117 |   });
  118 | 
  119 | });
  120 | 
```