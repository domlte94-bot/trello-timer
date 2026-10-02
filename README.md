# Power-Up "Timer & Proofs" para Trello

Versiones de proof (v1, v2, v3…) con su estado, archivo, notas y el tiempo de cada una.
Arriba se ve el total sumando todas las versiones.

## Instalar / actualizar

Si ya tienes el Timer instalado: sube **todo** el contenido de esta carpeta a tu repo
`trello-timer` (reemplazando lo anterior) y en el admin del Power-Up →
**Capabilities** activa también **card-back-section**. Recarga Trello.

Si es nuevo: repo en GitHub → Settings → Pages (main / root) → en trello.com/power-ups/admin
crea el Power-Up con esa URL como **Iframe connector URL** → Capabilities: `card-back-section`,
`card-buttons`, `card-badges`, `card-detail-badges` → en el tablero, Power-Ups → Custom.

## Uso

- Sección **Proofs & time** dentro de la tarjeta: total, versión actual y botón **Start / Pause**.
- El timer siempre corre en la **última versión**. Al crear una versión nueva, se pausa la anterior.
- **Escribir el tiempo a mano:** lápiz de la versión → "Time spent on this version"
  (1:30, 1h 30m, 90m o 1.5h) o los botones +15m / +30m / +1h.
- Estados: In progress, Sent to client, Changes requested, Approved.
- Archivo del proof: link de SharePoint o elegirlo de los adjuntos de la tarjeta.
- En el frente de la tarjeta: "v3 · Approved" con color y el tiempo total.

Todo es compartido: el equipo ve las mismas versiones y el mismo total.
Si tenías tiempo en el timer anterior, aparece como **v1** automáticamente.
