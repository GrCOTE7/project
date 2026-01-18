import { useEffect, useState, useRef } from "react";

/**
 * Custom hook pour détecter les redémarrages du serveur backend
 * Utile pour rafraîchir les données quand le serveur redémarre
 */
export const useServerReload = (onReload) => {
  const [isConnected, setIsConnected] = useState(false);
  const onReloadRef = useRef(onReload);

  // Mettre à jour la ref quand le callback change
  useEffect(() => {
    onReloadRef.current = onReload;
  }, [onReload]);

  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;
    let heartbeatTimeout = null;
    let reconnectDelay = 1000;
    const maxReconnectDelay = 30000;
    let currentServerId = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket("ws://localhost:8000/ws/reload");

        ws.onopen = () => {
          setIsConnected(true);
          reconnectDelay = 1000;
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === "connected") {
            currentServerId = data.server_id;
            if (onReloadRef.current) onReloadRef.current();
          } else if (data.type === "heartbeat") {
            if (currentServerId && data.server_id !== currentServerId) {
              console.log("🔄 Serveur redémarré, mise à jour...");
              currentServerId = data.server_id;
              if (onReloadRef.current) onReloadRef.current();
            }

            clearTimeout(heartbeatTimeout);
            heartbeatTimeout = setTimeout(() => {
              ws?.close();
            }, 10000);
          }
        };

        ws.onerror = (error) => {
          console.error("❌ Erreur WebSocket:", error);
          setIsConnected(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          clearTimeout(heartbeatTimeout);

          reconnectTimeout = setTimeout(() => {
            connectWebSocket();
            reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
          }, reconnectDelay);
        };
      } catch (error) {
        console.error("❌ Erreur connexion WebSocket:", error);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
      clearTimeout(heartbeatTimeout);
    };
  }, []); // Dépendance vide - le WebSocket se connecte UNE SEULE FOIS

  return isConnected;
};
