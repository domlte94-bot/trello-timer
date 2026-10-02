# Power-Up "Timer" para Trello

Play / pausa en cada tarjeta para ver cuánto tiempo te tomó. Sin reportes.

## Instalar

1. Crea un repositorio nuevo en GitHub, por ejemplo `trello-timer`, y sube todo el contenido de esta carpeta.
2. **Settings → Pages → Branch: main / root → Save**. Tendrás una URL como
   `https://TU-USUARIO.github.io/trello-timer/`.
3. En https://trello.com/power-ups/admin crea un **New Power-Up** en el mismo Workspace del tablero.
4. **Iframe connector URL**: pega la URL del paso 2.
5. Si pide callback URL de OAuth, pon la misma URL (no se usa).
6. **Capabilities**: activa `card-buttons`, `card-badges` y `card-detail-badges`.
7. En el tablero: **Power-Ups → Agregar Power-Ups → Custom → Timer**.

## Uso

- Arriba de la tarjeta abierta: **Time** (tiempo acumulado, verde con ● mientras corre)
  y **▶ Start / ⏸ Pause**.
- Clic en **Time** o en el botón **Timer**: sumar 15 min / 1 hora, restar 15 min, o reiniciar a 0.
- En el frente de la tarjeta se ve el tiempo total.
- Cada persona tiene su propio tiempo en cada tarjeta. Sigue contando aunque cierres Trello,
  hasta que le des Pause.
