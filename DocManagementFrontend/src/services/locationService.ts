import api from './api';
import { 
  Location, 
  LocationDto, 
  LocationSimpleDto, 
  CreateLocationRequest, 
  UpdateLocationRequest 
} from '@/models/location';

class LocationService {
  private readonly baseUrl = '/Location';

  async getAll(): Promise<LocationDto[]> {
    const response = await api.get<LocationDto[]>(this.baseUrl);
    return response.data;
  }

  async getSimple(): Promise<LocationSimpleDto[]> {
    const response = await api.get<LocationSimpleDto[]>(`${this.baseUrl}/simple`);
    return response.data;
  }

  async getByCode(locationCode: string): Promise<LocationDto> {
    const response = await api.get<LocationDto>(`${this.baseUrl}/${locationCode}`);
    return response.data;
  }

  async create(request: CreateLocationRequest): Promise<LocationDto> {
    const response = await api.post<LocationDto>(this.baseUrl, request);
    return response.data;
  }

  async update(locationCode: string, request: UpdateLocationRequest): Promise<LocationDto> {
    const response = await api.put<LocationDto>(`${this.baseUrl}/${locationCode}`, request);
    return response.data;
  }

  async delete(locationCode: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${locationCode}`);
  }
}

const locationService = new LocationService();
export default locationService; 