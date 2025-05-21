
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { InventoryTable, Diamond } from "@/components/inventory/InventoryTable";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface InventoryResponse {
  items: Diamond[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

export default function InventoryPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch inventory data with filters and pagination
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', currentPage, pageSize, filters, searchQuery],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('page_size', pageSize.toString());
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      // Add all filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      const response = await api.get<InventoryResponse>(`/inventory?${params.toString()}`);
      if (response.error) throw new Error(response.error);
      return response.data || { items: [], total: 0, page: 1, totalPages: 1, pageSize };
    }
  });

  // Mutation for updating diamond
  const updateDiamondMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Diamond> }) => {
      return await api.put(`/inventory/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Diamond updated",
        description: "The diamond has been updated successfully.",
      });
    }
  });

  // Mutation for deleting diamond
  const deleteDiamondMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Diamond deleted",
        description: "The diamond has been removed from your inventory.",
      });
    }
  });

  // Mutation for marking diamond as sold
  const markAsSoldMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.put(`/inventory/${id}/status`, { status: "Sold" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Status updated",
        description: "The diamond has been marked as sold.",
      });
    }
  });

  // Handle edit diamond
  const handleEdit = (id: string, diamondData: Partial<Diamond>) => {
    updateDiamondMutation.mutate({ id, data: diamondData });
  };
  
  // Handle delete diamond
  const handleDelete = (id: string) => {
    deleteDiamondMutation.mutate(id);
  };
  
  // Handle mark as sold
  const handleMarkAsSold = (id: string) => {
    markAsSoldMutation.mutate(id);
  };
  
  // Handle filter change
  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // The query will be automatically refreshed due to the dependency array
  };

  // Handle export stock numbers
  const handleExportStockNumbers = async () => {
    try {
      const response = await api.get<{ stockNumbers: string }>('/inventory/export-stock-numbers');
      
      if (response.error) throw new Error(response.error);
      
      if (response.data?.stockNumbers) {
        const blob = new Blob([response.data.stockNumbers], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diamond-stock-numbers.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export complete",
          description: "Stock numbers have been exported to a text file.",
        });
      }
    } catch (error) {
      console.error("Export failed", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting the stock numbers.",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="text-muted-foreground">
              Manage your diamond inventory
            </p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={handleExportStockNumbers} variant="outline" className="flex-1 sm:flex-none">
              <FileText className="mr-2 h-4 w-4" />
              Export Stock#
            </Button>
            <Button className="flex-1 sm:flex-none">
              <Plus className="mr-2 h-4 w-4" />
              Add Diamond
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by stock number..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        
        <InventoryFilters onFilterChange={handleFilterChange} />
        
        <InventoryTable
          data={data?.items || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMarkAsSold={handleMarkAsSold}
          loading={isLoading}
        />
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
              />
            </PaginationItem>
            
            {Array.from({ length: data?.totalPages || 1 }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (data?.totalPages && currentPage < data.totalPages) 
                    setCurrentPage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Layout>
  );
}
