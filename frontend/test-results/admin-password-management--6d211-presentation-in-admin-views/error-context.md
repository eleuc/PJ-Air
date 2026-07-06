# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-password-management.spec.ts >> TASK-08-19 — Password Management E2E Flow >> TASK-08-21 — Client nickname presentation in admin views
- Location: tests\admin-password-management.spec.ts:184:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=RUBEN-NICK').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
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
  91  | 
  92  |     await loginAs(page, RUBEN_EMAIL, RUBEN_CURRENT_PASS);
  93  |     await page.waitForTimeout(3000);
  94  | 
  95  |     // Access directly without modal
  96  |     await expect(page.locator('text=Cambio de contraseña obligatorio')).not.toBeVisible();
  97  |   });
  98  | 
  99  |   test('3.6 — Admin can create new staff user from /admin/users', async ({ page }) => {
  100 |     const uniqueEmail = `staff-${Date.now()}@test.com`;
  101 | 
  102 |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  103 |     await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  104 | 
  105 |     await page.goto(`${FRONTEND_URL}/admin/users`);
  106 |     await page.waitForTimeout(2000);
  107 | 
  108 |     await page.click('button:has-text("Nuevo Usuario")');
  109 |     await page.waitForTimeout(500);
  110 | 
  111 |     await page.locator('input[type="text"]').nth(1).fill('New Staff Member');
  112 |     await page.locator('input[type="email"]').fill(uniqueEmail);
  113 |     await page.locator('input[type="password"]').fill('StaffPassword123!');
  114 |     await page.locator('select').nth(1).selectOption('delivery');
  115 |     await page.click('button:has-text("Crear Usuario")');
  116 | 
  117 |     await expect(page.locator('text=Usuario Staff creado')).toBeVisible();
  118 |     await page.waitForTimeout(2000);
  119 | 
  120 |     // Verify it is on the list
  121 |     await page.locator('input[placeholder*="Buscar"]').fill(uniqueEmail);
  122 |     await page.waitForTimeout(1000);
  123 |     await expect(page.locator(`text=${uniqueEmail}`)).toBeVisible();
  124 |   });
  125 | 
  126 |   test('3.7 — Admin cannot reset password for another admin', async ({ page }) => {
  127 |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  128 |     await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  129 | 
  130 |     await page.goto(`${FRONTEND_URL}/admin/users`);
  131 |     await page.waitForTimeout(2000);
  132 | 
  133 |     // Search or find another admin
  134 |     await page.locator('input[placeholder*="Buscar"]').fill('admin@test.com');
  135 |     await page.waitForTimeout(1000);
  136 | 
  137 |     // Click admin row
  138 |     const adminRow = page.locator('tr').filter({ hasText: 'admin@test.com' }).first();
  139 |     await adminRow.click();
  140 |     await page.waitForTimeout(1000);
  141 | 
  142 |     // Restablecer Contraseña button should NOT be visible
  143 |     const btn = page.locator('button:has-text("Restablecer Contraseña")');
  144 |     await expect(btn).not.toBeVisible();
  145 |   });
  146 | 
  147 |   test('TASK-08-20 — Staff autogestionado password change (delivery)', async ({ page }) => {
  148 |     // Login as delivery staff
  149 |     await loginAs(page, 'user2@test.com', '123132');
  150 |     await page.waitForTimeout(3000);
  151 |     
  152 |     // Go to settings page
  153 |     await page.goto(`${FRONTEND_URL}/delivery/settings`);
  154 |     await page.waitForTimeout(2000);
  155 | 
  156 |     // Verify Key/Seguridad section is visible
  157 |     await expect(page.locator('text=Seguridad de la Cuenta')).toBeVisible();
  158 | 
  159 |     // Fill password form
  160 |     await page.locator('input[placeholder="••••••••"]').nth(0).fill('123132');
  161 |     await page.locator('input[placeholder="••••••••"]').nth(1).fill('NewDelivery123!');
  162 |     await page.locator('input[placeholder="••••••••"]').nth(2).fill('NewDelivery123!');
  163 |     await page.click('button:has-text("Actualizar Contraseña")');
  164 | 
  165 |     await expect(page.locator('text=Contraseña actualizada con éxito')).toBeVisible({ timeout: 10000 });
  166 |     await page.waitForTimeout(2000);
  167 | 
  168 |     // Logout and verify new password works
  169 |     await page.context().clearCookies();
  170 |     await page.evaluate(() => localStorage.clear());
  171 |     await loginAs(page, 'user2@test.com', 'NewDelivery123!');
  172 |     await page.waitForTimeout(3000);
  173 |     
  174 |     // Switch back to original password for test idempotency
  175 |     await page.goto(`${FRONTEND_URL}/delivery/settings`);
  176 |     await page.waitForTimeout(2000);
  177 |     await page.locator('input[placeholder="••••••••"]').nth(0).fill('NewDelivery123!');
  178 |     await page.locator('input[placeholder="••••••••"]').nth(1).fill('123132');
  179 |     await page.locator('input[placeholder="••••••••"]').nth(2).fill('123132');
  180 |     await page.click('button:has-text("Actualizar Contraseña")');
  181 |     await expect(page.locator('text=Contraseña actualizada con éxito')).toBeVisible();
  182 |   });
  183 | 
  184 |   test('TASK-08-21 — Client nickname presentation in admin views', async ({ page }) => {
  185 |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  186 |     await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  187 | 
  188 |     // 1. Check orders view shows RUBEN-NICK
  189 |     await page.goto(`${FRONTEND_URL}/admin/orders`);
  190 |     await page.waitForTimeout(3000);
> 191 |     await expect(page.locator('text=RUBEN-NICK').first()).toBeVisible();
      |                                                           ^ Error: expect(locator).toBeVisible() failed
  192 | 
  193 |     // 2. Check clients view shows RUBEN-NICK (Ruben Dario)
  194 |     await page.goto(`${FRONTEND_URL}/admin/clients`);
  195 |     await page.waitForTimeout(3000);
  196 |     await page.locator('input[placeholder*="Buscar por nombre"]').fill(RUBEN_EMAIL);
  197 |     await page.waitForTimeout(1000);
  198 |     await expect(page.locator('text=RUBEN-NICK (Ruben Dario)').first()).toBeVisible();
  199 |   });
  200 | });
  201 | 
```