
import { useCallback } from 'react';
import { Diamond } from '@/types/diamond';
import { 
  fetchDiamonds, 
  updateDiamond, 
  deleteDiamond, 
  markDiamondAsSold, 
  uploadDiamondCSV, 
  createDiamond 
} from '@/lib/diamond-api';

interface CreateDiamondRequest {
  stock_number: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  lab?: string;
  certificate_number?: string;
  measurements?: string;
  depth?: number;
  table?: number;
}

interface UpdateDiamondRequest extends Partial<CreateDiamondRequest> {}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export function useDiamondsApi() {
  const getDiamonds = useCallback(async (): Promise<Diamond[]> => {
    const response = await fetchDiamonds();
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }, []);

  const addDiamond = useCallback(async (diamondData: CreateDiamondRequest): Promise<Diamond> => {
    const response = await createDiamond(diamondData);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }, []);

  const editDiamond = useCallback(async (id: string, diamondData: UpdateDiamondRequest): Promise<Diamond> => {
    const response = await updateDiamond(id, diamondData);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }, []);

  const removeDiamond = useCallback(async (id: string): Promise<void> => {
    const response = await deleteDiamond(id);
    if (response.error) {
      throw new Error(response.error);
    }
  }, []);

  const markAsSold = useCallback(async (id: string): Promise<Diamond> => {
    const response = await markDiamondAsSold(id);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }, []);

  const uploadCSV = useCallback(async (file: File): Promise<any> => {
    const response = await uploadDiamondCSV(file);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  }, []);

  return {
    getDiamonds,
    addDiamond,
    editDiamond,
    removeDiamond,
    markAsSold,
    uploadCSV,
  };
}
