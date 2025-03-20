export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  pay: string;
  safetyScore: 'Low Risk' | 'Medium Risk' | 'High Risk';
  verified: boolean;
}

export interface SafetyTip {
  id: string;
  text: string;
}

export interface Right {
  id: string;
  text: string;
}

export interface Report {
  id: string;
  jobId: string;
  reason: string;
  timestamp: Date;
}