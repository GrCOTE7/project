import { useEffect } from "react";

/**
 * Ce composant surveille le backend et recharge la page entière
 * en cas de redémarrage du serveur.
 * À n'utiliser qu'en développement.
 */
const BackendWatcher = () => {
  useEffect(() => {
    let ws = null;
    let currentServerId = null;
    let reconnectTimeout = null;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/reload`;

      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "connected") {
          if (currentServerId && currentServerId !== data.server_id) {
            // Le serveur a redémarré (ID différent) -> Reload complet !
            window.location.reload();
          }
          currentServerId = data.server_id;
        } else if (data.type === "heartbeat") {
          if (currentServerId && data.server_id !== currentServerId) {
            window.location.reload();
          }
        }
      };

      ws.onclose = () => {
        // En cas de coupure (le serveur descend), on tente de se reconnecter
        reconnectTimeout = setTimeout(connect, 1000);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  return null; // Ce composant est invisible
};

export default BackendWatcher;
