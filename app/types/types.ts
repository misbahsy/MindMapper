export interface NodeData {
  id: string;
  label: string;
  children?: NodeData[];
  details?: string | string[];
}

export interface ApiResponse {
  session_id: string;
  outputs: {
    inputs: {
      input_value: string;
    };
    outputs: {
      results: {
        message: {
          text: string;
          [key: string]: any;
        };
      };
      artifacts: {
        message: string;
        [key: string]: any;
      };
      outputs: {
        message: {
          message: {
            text: string;
            [key: string]: any;
          };
          type: string;
        };
      };
      logs: {
        message: any[];
      };
      messages: {
        message: string;
        sender: string;
        sender_name: string;
        session_id: string;
        stream_url: null;
        component_id: string;
        files: any[];
        type: string;
      }[];
      timedelta: null;
      duration: null;
      component_display_name: string;
      component_id: string;
      used_frozen_result: boolean;
    }[];
  }[];
} 