import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { NOTIFICATION_CONFIG } from '../config/notifications.config';

class SignalRService {
  private connection: HubConnection | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async startConnection(volunteerId: string, token: string): Promise<HubConnection> {
    if (this.connection && this.connection.state === 'Connected') {
      console.log('🔗 SignalR already connected');
      return this.connection;
    }

    if (this.isConnecting) {
      console.log('⏳ SignalR connection already in progress');
      await this.waitForConnection();
      return this.connection!;
    }

    this.isConnecting = true;

    try {
      console.log('🚀 Starting SignalR connection for volunteerId:', volunteerId);

      this.connection = new HubConnectionBuilder()
        .withUrl(NOTIFICATION_CONFIG.SIGNALR.HUB_URL, {
          accessTokenFactory: () => token,
          withCredentials: true
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            console.log(`🔄 SignalR reconnect attempt ${retryContext.previousRetryCount + 1}`);
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          }
        })
        .configureLogging(LogLevel[NOTIFICATION_CONFIG.SIGNALR.LOG_LEVEL as keyof typeof LogLevel])
        .build();

      // הגדרת event handlers
      this.setupEventHandlers();

      await this.connection.start();
      
      console.log('✅ SignalR Connected successfully');
      this.reconnectAttempts = 0;
      this.isConnecting = false;

      // הודעה לשרת על חיבור המתנדב
      try {
        if (this.connection && this.connection.state === 'Connected') {
          await this.connection.invoke('OnVolunteerConnected', volunteerId);
          console.log('📡 Notified server about volunteer connection');
        } else {
          console.warn('⚠️ Cannot notify server - connection not ready');
        }
      } catch (invokeError) {
        console.warn('⚠️ Could not notify server about connection:', invokeError);
      }

      return this.connection;

    } catch (error) {
      console.error('❌ Failed to start SignalR connection:', error);
      this.isConnecting = false;
      this.reconnectAttempts++;

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        console.log(`🔄 Will retry connection in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.startConnection(volunteerId, token);
      } else {
        console.error('💀 Max reconnection attempts reached. Giving up.');
        throw error;
      }
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    this.connection.onclose((error) => {
      console.log('❌ SignalR Connection closed:', error);
      this.isConnecting = false;
    });

    this.connection.onreconnecting((error) => {
      console.log('🔄 SignalR Reconnecting:', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('✅ SignalR Reconnected with connectionId:', connectionId);
      this.reconnectAttempts = 0;
    });
  }

  private async waitForConnection(): Promise<void> {
    const maxWait = 10000; // 10 seconds
    const startTime = Date.now();

    while (this.isConnecting && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  onCallAssigned(callback: (callDetails: any) => void) {
    if (this.connection) {
      console.log('🎧 Setting up CallAssigned listener');
      
      // מאזין לשם הנכון של האירוע (lowercase)
      this.connection.on('callassigned', (callDetails) => {
        console.log('📡 Raw callassigned event received:', callDetails);
        callback(callDetails);
      });

      // בואו נוסיף מאזינים לאירועים אחרים שהשרת אולי שולח
      this.connection.on('CallAssigned', (callDetails) => {
        console.log('📡 CallAssigned event received:', callDetails);
        callback(callDetails);
      });

      this.connection.on('NewEmergencyCall', (callDetails) => {
        console.log('📡 NewEmergencyCall event received:', callDetails);
        callback(callDetails);
      });

      this.connection.on('CallCreated', (callDetails) => {
        console.log('📡 CallCreated event received:', callDetails);
        callback(callDetails);
      });

      // מאזין כללי לכל האירועים
      this.connection.onclose((error) => {
        console.log('🔌 Connection closed:', error);
      });

    } else {
      console.warn('⚠️ Cannot set up CallAssigned listener - no connection');
    }
  }

  async stopConnection() {
    if (this.connection) {
      console.log('🔌 Stopping SignalR connection');
      await this.connection.stop();
      this.connection = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }

  getConnectionState(): string {
    return this.connection?.state || 'Disconnected';
  }

  isConnected(): boolean {
    return this.connection?.state === 'Connected';
  }

  // פונקציה לבדיקת החיבור ושליחת בדיקה לשרת
  async testConnection(): Promise<void> {
    if (this.connection && this.connection.state === 'Connected') {
      try {
        console.log('🧪 Testing SignalR connection...');
        // במקום TestConnection נקרא לפונקציה שקיימת בשרת
        await this.connection.invoke('OnVolunteerConnected', 2);
        console.log('✅ Connection test successful');
      } catch (error) {
        console.error('❌ Connection test failed:', error);
      }
    } else {
      console.warn('⚠️ Cannot test connection - not connected');
    }
  }

  // פונקציה לקבלת מידע על החיבור
  getConnectionInfo(): any {
    if (this.connection) {
      return {
        state: this.connection.state,
        connectionId: this.connection.connectionId,
        isConnected: this.connection.state === 'Connected'
      };
    }
    return { state: 'No Connection', connectionId: null, isConnected: false };
  }
}

// Singleton instance
export const signalRService = new SignalRService();
