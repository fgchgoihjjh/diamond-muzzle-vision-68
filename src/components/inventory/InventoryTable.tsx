
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Diamond } from "@/types/diamond";

interface InventoryTableProps {
  data: Diamond[];
  onEdit: (id: string, data: Partial<Diamond>) => void;
  onDelete: (id: string) => void;
  onMarkAsSold: (id: string) => void;
  loading?: boolean;
}

export function InventoryTable({
  data,
  onEdit,
  onDelete,
  onMarkAsSold,
  loading = false,
}: InventoryTableProps) {
  const [editingDiamond, setEditingDiamond] = useState<Diamond | null>(null);
  const [formData, setFormData] = useState<Partial<Diamond>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleEdit = (diamond: Diamond) => {
    setEditingDiamond(diamond);
    setFormData(diamond);
    setIsDialogOpen(true);
  };
  
  const handleSave = () => {
    if (editingDiamond) {
      onEdit(editingDiamond.id, formData);
      setIsDialogOpen(false);
    }
  };
  
  const handleChange = (field: keyof Diamond, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-4 h-10">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] font-bold">Stock #</TableHead>
              <TableHead>Shape</TableHead>
              <TableHead className="text-right">Carat</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Clarity</TableHead>
              <TableHead>Cut</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  {loading ? "Loading diamonds..." : "No diamonds found in inventory."}
                </TableCell>
              </TableRow>
            ) : (
              data.map((diamond) => (
                <TableRow key={diamond.id}>
                  <TableCell className="font-mono text-sm font-bold">{diamond.stock_number}</TableCell>
                  <TableCell>{diamond.shape}</TableCell>
                  <TableCell className="text-right">{diamond.carat.toFixed(2)}</TableCell>
                  <TableCell>{diamond.color}</TableCell>
                  <TableCell>{diamond.clarity}</TableCell>
                  <TableCell>{diamond.cut}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${diamond.price.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      diamond.status === "Available" 
                        ? "bg-green-100 text-green-800" 
                        : diamond.status === "Reserved" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {diamond.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(diamond)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMarkAsSold(diamond.id)}>
                          <Check className="mr-2 h-4 w-4" />
                          Mark as Sold
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(diamond.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Diamond</DialogTitle>
            <DialogDescription>
              Make changes to the diamond record below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockNumber" className="font-medium">Stock #</Label>
                <Input
                  id="stockNumber"
                  value={formData.stock_number || ""}
                  onChange={(e) => handleChange("stock_number", e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shape">Shape</Label>
                <Input
                  id="shape"
                  value={formData.shape || ""}
                  onChange={(e) => handleChange("shape", e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carat">Carat</Label>
                <Input
                  id="carat"
                  type="number"
                  step="0.01"
                  value={formData.carat || ""}
                  onChange={(e) => handleChange("carat", parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color || ""}
                  onChange={(e) => handleChange("color", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clarity">Clarity</Label>
                <Input
                  id="clarity"
                  value={formData.clarity || ""}
                  onChange={(e) => handleChange("clarity", e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cut">Cut</Label>
                <Input
                  id="cut"
                  value={formData.cut || ""}
                  onChange={(e) => handleChange("cut", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => handleChange("price", parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Export the Diamond type for backward compatibility
export type { Diamond };
