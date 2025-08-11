import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TelemetrySocketService {
  private client?: Client;
  private subject = new Subject<any>();
  stream$ = this.subject.asObservable();

  connect() {
    // Evita múltiples conexiones
    if (this.client?.active || this.client?.connected) {
      console.warn('[WS] Ya hay una conexión activa');
      return;
    }

    this.client = new Client({
      // SockJS hacia el endpoint del back
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      // reconectar si se cae
      reconnectDelay: 3000,
      // heartbeats (opcionales)
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      // silenciar logs de stomp
      debug: () => {}
    });

    this.client.onConnect = () => {
      this.client!.subscribe('/topic/telemetry', (m: IMessage) => {
        try {
          this.subject.next(JSON.parse(m.body));
        } catch {
          this.subject.next(m.body); // por si no es JSON
        }
      });
    };

    this.client.onStompError = frame => {
      console.error('[WS] STOMP error', frame.headers['message'], frame.body);
    };

    this.client.onWebSocketClose = evt => {
      console.warn('[WS] WebSocket closed', evt.reason || evt.code);
    };

    this.client.activate();
  }

  disconnect() {
    // Cierra y limpia para no dejar sockets colgando
    this.client?.deactivate();
    this.client = undefined;
  }
}
