
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Edit, 
  Trash2, 
  Search,
  Plus,
  Upload,
  CheckCircle2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { fetchDiamonds, updateDiamond, deleteDiamond, markDiamondAsSold, uploadDiamondCSV } from "@/lib/diamond-api";
import { Diamond } from "@/types/diamond";

interface DiamondFormData {
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

export function DiamondManagement() {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiamond, setSelectedDiamond] = useState<Diamond | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const { toast } = useToast();

  const diamondForm = useForm<DiamondFormData>({
    defaultValues: {
      stock_number: "",
      shape: "Round",
      carat: 0,
      color: "D",
      clarity: "FL",
      cut: "Excellent",
      price: 0,
    },
  });

  const filteredDiamonds = diamonds.filter(diamond =>
    diamond.stock_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diamond.shape.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diamond.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diamond.clarity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadDiamonds();
  }, []);

  const loadDiamonds = async () => {
    setLoading(true);
    try {
      const response = await fetchDiamonds();
      if (response.data) {
        setDiamonds(response.data);
      } else if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading diamonds:', error);
      toast({
        title: "Error",
        description: "Failed to load diamonds",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditDiamond = (diamond: Diamond) => {
    setSelectedDiamond(diamond);
    diamondForm.reset({
      stock_number: diamond.stock_number,
      shape: diamond.shape,
      carat: diamond.carat,
      color: diamond.color,
      clarity: diamond.clarity,
      cut: diamond.cut,
      price: diamond.price,
      lab: diamond.lab || "",
      certificate_number: diamond.certificate_number || "",
      measurements: diamond.measurements || "",
      depth: diamond.depth || 0,
      table: diamond.table || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteDiamond = (diamond: Diamond) => {
    setSelectedDiamond(diamond);
    setIsDeleteDialogOpen(true);
  };

  const handleMarkAsSold = async (diamond: Diamond) => {
    try {
      const response = await markDiamondAsSold(diamond.id);
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Diamond marked as sold",
        });
        loadDiamonds();
      }
    } catch (error) {
      console.error('Error marking diamond as sold:', error);
      toast({
        title: "Error",
        description: "Failed to mark diamond as sold",
        variant: "destructive",
      });
    }
  };

  const onEditSubmit = async (data: DiamondFormData) => {
    if (!selectedDiamond) return;

    try {
      const response = await updateDiamond(selectedDiamond.id, data);
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Diamond updated successfully",
        });
        setIsEditDialogOpen(false);
        loadDiamonds();
      }
    } catch (error) {
      console.error('Error updating diamond:', error);
      toast({
        title: "Error",
        description: "Failed to update diamond",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedDiamond) return;

    try {
      const response = await deleteDiamond(selectedDiamond.id);
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Diamond deleted successfully",
        });
        setIsDeleteDialogOpen(false);
        loadDiamonds();
      }
    } catch (error) {
      console.error('Error deleting diamond:', error);
      toast({
        title: "Error",
        description: "Failed to delete diamond",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    try {
      const response = await uploadDiamondCSV(uploadFile);
      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "CSV uploaded successfully",
        });
        setIsUploadDialogOpen(false);
        setUploadFile(null);
        loadDiamonds();
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast({
        title: "Error",
        description: "Failed to upload CSV",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diamond Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Diamond Inventory</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your diamond inventory
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Diamond
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search diamonds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stock #</TableHead>
                    <TableHead>Shape</TableHead>
                    <TableHead>Carat</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Clarity</TableHead>
                    <TableHead>Cut</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDiamonds.map((diamond) => (
                    <TableRow key={diamond.id}>
                      <TableCell className="font-medium">
                        {diamond.stock_number}
                      </TableCell>
                      <TableCell>{diamond.shape}</TableCell>
                      <TableCell>{diamond.carat}</TableCell>
                      <TableCell>{diamond.color}</TableCell>
                      <TableCell>{diamond.clarity}</TableCell>
                      <TableCell>{diamond.cut}</TableCell>
                      <TableCell>${diamond.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={diamond.status === 'Available' ? 'default' : 'secondary'}>
                          {diamond.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditDiamond(diamond)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          {diamond.status === 'Available' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsSold(diamond)}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteDiamond(diamond)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDiamonds.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No diamonds found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Diamond Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Diamond</DialogTitle>
          </DialogHeader>
          <Form {...diamondForm}>
            <form onSubmit={diamondForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={diamondForm.control}
                  name="stock_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Number</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={diamondForm.control}
                  name="shape"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shape</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={diamondForm.control}
                  name="carat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carat</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={diamondForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={diamondForm.control}
                  name="clarity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clarity</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={diamondForm.control}
                  name="cut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cut</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={diamondForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={diamondForm.control}
                  name="lab"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lab</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Upload CSV Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Diamond CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload a CSV file with diamond inventory data
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleFileUpload} disabled={!uploadFile}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Diamond</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete diamond {selectedDiamond?.stock_number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
