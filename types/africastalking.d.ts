declare module "africastalking" {
  interface AfricasTalkingConfig {
    apiKey: string;
    username: string;
  }

  interface SMSSendOptions {
    to: string[];
    message: string;
    from?: string;
    enqueue?: boolean;
  }

  interface SMSRecipient {
    number: string;
    status: string;
    statusCode: number;
    cost: string;
    messageId: string;
  }

  interface SMSSendResult {
    SMSMessageData: {
      Message: string;
      Recipients: SMSRecipient[];
    };
  }

  interface SMSClient {
    send(options: SMSSendOptions): Promise<SMSSendResult>;
  }

  interface AfricasTalkingClient {
    SMS: SMSClient;
  }

  function AfricasTalking(config: AfricasTalkingConfig): AfricasTalkingClient;

  export = AfricasTalking;
}
