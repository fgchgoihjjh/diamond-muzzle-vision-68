
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { InventoryTable, Diamond } from "@/components/inventory/InventoryTable";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { fetchDiamonds, updateDiamond, deleteDiamond, markDiamondAsSold } from "@/lib/diamond-api";

export default function InventoryPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [filteredDiamonds, setFilteredDiamonds] = useState<Diamond[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fetchInventoryData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching inventory data from backend...");
      const response = await fetchDiamonds();
      
      if (response.error) {
        setError(response.error);
        toast({
          variant: "destructive",
          title: "Backend Connection Error",
          description: response.error,
        });
      } else if (response.data) {
        console.log("Successfully loaded diamonds:", response.data.length);
        setDiamonds(response.data);
        setFilteredDiamonds(response.data);
        
        // Calculate pagination
        const itemsPerPage = 10;
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
        
        toast({
          title: "Inventory loaded",
          description: `Successfully loaded ${response.data.length} diamonds from backend.`,
        });
      }
    } catch (error) {
      const errorMessage = "Failed to fetch inventory data";
      setError(errorMessage);
      console.error("Failed to fetch inventory data", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchInventoryData();
  }, []);
  
  useEffect(() => {
    // Apply search and filters
    let filtered = diamonds;
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(diamond => 
        diamond.stock_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diamond.shape.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(diamond => 
          diamond[key as keyof Diamond]?.toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });
    
    setFilteredDiamonds(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, filters, diamonds]);
  
  const handleEdit = async (id: string, data: Partial<Diamond>) => {
    try {
      console.log("Editing diamond:", id, data);
      const response = await updateDiamond(id, data);
      
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: response.error,
        });
        return;
      }
      
      // Update local state
      setDiamonds((prev) =>
        prev.map((diamond) => (diamond.id === id ? { ...diamond, ...data } : diamond))
      );
      
      toast({
        title: "Diamond updated",
        description: `Stock #${data.stock_number || ""} has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating diamond:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update diamond. Please try again.",
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      console.log("Deleting diamond:", id);
      const response = await deleteDiamond(id);
      
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: response.error,
        });
        return;
      }
      
      // Update local state
      setDiamonds((prev) => prev.filter((diamond) => diamond.id !== id));
      
      toast({
        title: "Diamond deleted",
        description: "The diamond has been successfully removed from your inventory.",
      });
    } catch (error) {
      console.error("Error deleting diamond:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete diamond. Please try again.",
      });
    }
  };
  
  const handleMarkAsSold = async (id: string) => {
    try {
      console.log("Marking diamond as sold:", id);
      const response = await markDiamondAsSold(id);
      
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: response.error,
        });
        return;
      }
      
      // Update local state
      setDiamonds((prev) =>
        prev.map((diamond) => 
          diamond.id === id ? { ...diamond, status: "Sold" } : diamond
        )
      );
      
      toast({
        title: "Status updated",
        description: "The diamond has been marked as sold successfully.",
      });
    } catch (error) {
      console.error("Error marking diamond as sold:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to mark diamond as sold. Please try again.",
      });
    }
  };
  
  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect above
  };

  const handleExportStockNumbers = () => {
    const stockNumbers = filteredDiamonds.map(d => d.stock_number).join('\n');
    const blob = new Blob([stockNumbers], { type: 'text/plain' });
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
  };

  const handleRefresh = () => {
    fetchInventoryData();
  };

  // Paginate the filtered diamonds
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDiamonds = filteredDiamonds.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Diamond Inventory</h1>
            <p className="text-muted-foreground">
              Manage your diamond inventory ({filteredDiamonds.length} diamonds loaded from backend)
            </p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={handleRefresh} variant="outline" className="flex-1 sm:flex-none" disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
              placeholder="Search by stock number or shape..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        
        <InventoryFilters onFilterChange={handleFilterChange} />
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              <strong>Backend Connection Error:</strong> {error}
            </p>
            <p className="text-red-600 text-xs mt-1">
              Make sure your FastAPI backend at https://api.mazalbot.com is running and accessible.
            </p>
          </div>
        )}
        
        <InventoryTable
          data={paginatedDiamonds}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMarkAsSold={handleMarkAsSold}
          loading={loading}
        />
        
        {filteredDiamonds.length > itemsPerPage && (
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
              
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNum}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </Layout>
  );
}
