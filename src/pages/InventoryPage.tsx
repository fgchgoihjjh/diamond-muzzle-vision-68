
import { useEffect, useState } from "react";
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

export default function InventoryPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, we would call the actual API with filters and pagination
        // const response = await api.get<Diamond[]>(`/inventory?page=${currentPage}&...`);
        
        // For demo purposes, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock diamonds
        const shapes = ["Round", "Princess", "Cushion", "Emerald", "Oval", "Pear"];
        const colors = ["D", "E", "F", "G", "H", "I"];
        const clarities = ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"];
        const cuts = ["Excellent", "Very Good", "Good"];
        const statuses = ["Available", "Reserved", "Sold"];
        
        // Include the reference stock numbers provided by the user
        const referenceStockNumbers = ["A426-051B", "A399-109B", "C307DA-620A"];
        
        const mockDiamonds: Diamond[] = Array.from({ length: 10 }).map((_, i) => ({
          id: `d-${i + 1}`,
          stockNumber: i < 3 ? referenceStockNumbers[i] : `D${10000 + i}`,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          carat: parseFloat((0.5 + Math.random() * 4).toFixed(2)),
          color: colors[Math.floor(Math.random() * colors.length)],
          clarity: clarities[Math.floor(Math.random() * clarities.length)],
          cut: cuts[Math.floor(Math.random() * cuts.length)],
          price: Math.floor(3000 + Math.random() * 50000),
          status: statuses[Math.floor(Math.random() * statuses.length)],
        }));
        
        setDiamonds(mockDiamonds);
        setTotalPages(5);
      } catch (error) {
        console.error("Failed to fetch inventory data", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch inventory data.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentPage, filters]);
  
  const handleEdit = (id: string, data: Partial<Diamond>) => {
    setDiamonds((prev) =>
      prev.map((diamond) => (diamond.id === id ? { ...diamond, ...data } : diamond))
    );
    
    toast({
      title: "Diamond updated",
      description: `Stock #${data.stockNumber || ""} has been updated.`,
    });
  };
  
  const handleDelete = (id: string) => {
    setDiamonds((prev) => prev.filter((diamond) => diamond.id !== id));
    
    toast({
      title: "Diamond deleted",
      description: "The diamond has been removed from your inventory.",
    });
  };
  
  const handleMarkAsSold = (id: string) => {
    setDiamonds((prev) =>
      prev.map((diamond) => 
        diamond.id === id ? { ...diamond, status: "Sold" } : diamond
      )
    );
    
    toast({
      title: "Status updated",
      description: "The diamond has been marked as sold.",
    });
  };
  
  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would update the filters or call a search API endpoint
    console.log("Searching for:", searchQuery);
    
    // Simple client-side filtering for the demo
    if (searchQuery.trim()) {
      const filtered = diamonds.filter(diamond => 
        diamond.stockNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        setDiamonds(filtered);
      } else {
        toast({
          title: "No results",
          description: `No diamonds found with stock number containing "${searchQuery}"`,
        });
      }
    }
  };

  const handleExportStockNumbers = () => {
    const stockNumbers = diamonds.map(d => d.stockNumber).join('\n');
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
          data={diamonds}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMarkAsSold={handleMarkAsSold}
          loading={loading}
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
            
            {Array.from({ length: totalPages }).map((_, i) => (
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
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Layout>
  );
}
