import axios, { RawAxiosRequestHeaders } from "axios";

const apiClient = axios.create({
  baseURL: process.env.BACKEND_ADDRESS,
  timeout: 40000, //40 seconds
  headers: {
    "ngrok-skip-browser-warning": "true"
  }
});

export function GET(uri: string, headers: RawAxiosRequestHeaders, params?: any) {
  return apiClient.get(uri, { headers: headers, ...params });
}

export function POST(uri: string, headers: RawAxiosRequestHeaders, data: any, params?: any) {
  return apiClient.post(uri, data, { headers, ...params });
}

export function PUT(uri: string, headers: RawAxiosRequestHeaders, data: any, params?: any) {
  return apiClient.put(uri, data, { headers, ...params });
}

export function PATCH(uri: string, headers: RawAxiosRequestHeaders, data: any, params?: any) {
  return apiClient.patch(uri, data, { headers, ...params });
}

export function DELETE(uri: string, headers: RawAxiosRequestHeaders, params?: any) {
  return apiClient.delete(uri, { headers: headers, ...params });
}
